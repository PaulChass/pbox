#!/usr/bin/env bash
# Deploy PBOX on the production server (run as root):
#
#   git -C /var/www/pbox-git pull --ff-only && bash /var/www/pbox-git/deploy/deploy.sh
#
# Safe to run again: the one-time migration only runs while /var/www/pbox is
# still a plain folder (before it becomes a link to this git checkout).
set -euo pipefail

REPO=/var/www/pbox-git                # git checkout of PaulChass/pbox
LIVE=/var/www/pbox                    # path pm2 runs (server.js) - becomes a symlink
UPLOADS=/var/www/pbox-uploads         # user files, kept outside the code folder
FRONT=/var/www/amplify-react          # frontend repo, served from build/ by Apache
APACHE_CONF=/etc/apache2/sites-enabled/balldontlie.conf
PM2_APP=server                        # pm2 process running $LIVE/server.js
STAMP=$(date +%Y%m%d-%H%M%S)

say() { printf '\n=== %s\n' "$*"; }

say "1. Update code"
git -C "$REPO" pull --ff-only
git -C "$REPO" log -1 --oneline

# ---------------------------------------------------------------------------
# One-time migration: plain /var/www/pbox folder -> symlink to the git checkout
# ---------------------------------------------------------------------------
if [ ! -L "$LIVE" ]; then
  OLD="$LIVE-old-$STAMP"
  say "2. One-time migration (old folder will be kept as $OLD)"

  tar czf "/root/pbox-code-backup-$STAMP.tgz" --exclude=node_modules --exclude=uploads -C /var/www pbox
  echo "code backup: /root/pbox-code-backup-$STAMP.tgz"

  # Production-only code edits (Aug 2024) that never reached GitHub: keep them.
  for f in models/Folder.js utils/utils.js controllers/syncController.js routes/sync.js \
           sync/fileOperations.js sync/sync.js sync/watcher.js \
           tests/auth.test.js tests/folder.test.js robots.txt; do
    cp "$LIVE/$f" "$REPO/backend/$f"
  done
  if ! git -C "$REPO" diff --quiet || [ -n "$(git -C "$REPO" status --porcelain backend/robots.txt)" ]; then
    git -C "$REPO" config user.name  "Paul Chasseuil"
    git -C "$REPO" config user.email "paulchasseuil@hotmail.fr"
    git -C "$REPO" add backend
    git -C "$REPO" commit -q -m "chore: bring production-only server edits into the repo

Sync-client changes (utils, syncController, routes/sync, sync/*), Folder
model table-name casing and robots.txt, copied from /var/www/pbox.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
    git -C "$REPO" push -q origin HEAD
    echo "committed + pushed production-only edits"
  fi

  # Secrets / machine-specific config: copy, and tell git to leave them alone.
  cp "$LIVE/.env" "$REPO/backend/.env"
  cp "$LIVE/config/db.js" "$REPO/backend/config/db.js"
  cp "$LIVE/sync/config.js" "$REPO/backend/sync/config.js"
  git -C "$REPO" update-index --skip-worktree backend/config/db.js backend/sync/config.js

  # User files: move (same disk, instant) to a data folder, link it back.
  if [ ! -e "$UPLOADS" ]; then mv "$LIVE/uploads" "$UPLOADS"; fi
  ln -sfn "$UPLOADS" "$REPO/backend/uploads"

  mv "$LIVE" "$OLD"
  ln -s "$REPO/backend" "$LIVE"
  # Old DB rows store paths like /var/www/pbox/uploads/<id>/<file>: still valid
  # through the two links above.
  echo "$LIVE -> $(readlink "$LIVE"), uploads -> $UPLOADS"
fi

say "3. Backend dependencies"
cd "$REPO/backend"
npm ci --omit=dev --no-audit --no-fund

say "4. Database: Files.size must hold files > 2 GB"
BACKUP_FILE="/root/pbox-files-table-$STAMP.json" node - <<'JS'
const sequelize = require('./config/db');
(async () => {
  const [cols] = await sequelize.query(
    "SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Files' AND COLUMN_NAME = 'size'");
  const type = cols[0] && cols[0].DATA_TYPE;
  console.log('Files.size is', type);
  if (type && type !== 'bigint') {
    const [rows] = await sequelize.query('SELECT * FROM Files');
    require('fs').writeFileSync(process.env.BACKUP_FILE, JSON.stringify(rows));
    console.log(`backup of ${rows.length} rows: ${process.env.BACKUP_FILE}`);
    await sequelize.query('ALTER TABLE Files MODIFY size BIGINT NOT NULL');
    console.log('-> changed to BIGINT');
  }
  await sequelize.close();
})().catch((e) => { console.error(e); process.exit(1); });
JS

say "5. Apache: CORS headers for tus + longer proxy timeout"
if ! grep -q 'Tus-Resumable' "$APACHE_CONF"; then
  cp "$APACHE_CONF" "/root/balldontlie.conf.bak-$STAMP"
  sed -i \
    -e 's#ProxyTimeout 10#ProxyTimeout 300#' \
    -e 's#ProxyPass /pbox http://127.0.0.1:5000 retry=3 timeout=10#ProxyPass /pbox http://127.0.0.1:5000 retry=3 timeout=300#' \
    -e 's#Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE, PATCH"#Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE, PATCH, HEAD"#' \
    -e 's#^\( *\)Header set Access-Control-Allow-Headers "Content-Type, Authorization"#\1Header set Access-Control-Allow-Headers "Content-Type, Authorization, Tus-Resumable, Upload-Length, Upload-Metadata, Upload-Offset, Upload-Defer-Length, Upload-Concat, X-HTTP-Method-Override, X-Requested-With"\n\1Header set Access-Control-Expose-Headers "Location, Upload-Offset, Upload-Length, Upload-Metadata, Upload-Expires, Tus-Resumable, Tus-Version, Tus-Max-Size, Tus-Extension"#' \
    "$APACHE_CONF"
  if apache2ctl configtest; then
    systemctl reload apache2
    echo "apache reloaded (backup /root/balldontlie.conf.bak-$STAMP)"
  else
    cp "/root/balldontlie.conf.bak-$STAMP" "$APACHE_CONF"
    echo "!! apache config test failed - original restored, apache NOT reloaded"
  fi
else
  echo "already configured"
fi

say "6. Restart backend"
pm2 describe pbox >/dev/null 2>&1 && pm2 delete pbox || true   # duplicate that crash-looped on port 5000
pm2 restart "$PM2_APP" --update-env
pm2 save
sleep 4
pm2 logs "$PM2_APP" --nostream --lines 8

say "7. Frontend"
git -C "$FRONT" pull --ff-only
cd "$FRONT"
npm ci --no-audit --no-fund
npm run build

say "8. Checks"
echo -n "frontend:            "; curl -s -o /dev/null -w '%{http_code}\n' https://pbox.paulchasseuil.fr/
echo -n "tus reachable (400): "; curl -s -o /dev/null -w '%{http_code}\n' -X POST https://balldontlie.fr/pbox/api/tus \
  -H 'Tus-Resumable: 1.0.0' -H 'Upload-Length: 1' -H 'Upload-Metadata: filename dGVzdA=='
echo "tus CORS preflight:"
curl -s -i -X OPTIONS https://balldontlie.fr/pbox/api/tus \
  -H 'Origin: https://pbox.paulchasseuil.fr' -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: tus-resumable,upload-length,upload-metadata' \
  | grep -i -E '^HTTP|^access-control-allow-(origin|headers|methods)'

say "Done"
echo "Rollback if needed: rm $LIVE && mv $LIVE-old-* $LIVE && mv $UPLOADS $LIVE/uploads && pm2 restart $PM2_APP"
