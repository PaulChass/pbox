const chokidar = require('chokidar');
const path = require('path');
const {  deleteFileOnServer } = require('./fileOperations');
const config = require('./config');

function startWatcher() {
  const watcher = chokidar.watch(config.directory, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    depth: 99,
  });

  watcher
    .on('unlink', filePath => {
      const relativePath = path.relative(config.directory, filePath);
      console.log(`File deleted locally: ${relativePath}`);
      const fileName = path.basename(filePath);
      deleteFileOnServer(fileName);
    })
    .on('error', error => {
      console.error('Watcher error:', error);
    });

  console.log('Watcher started');
}

module.exports = {
  startWatcher,
};