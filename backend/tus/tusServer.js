/**
 * Resumable, chunked uploads (tus protocol, https://tus.io).
 *
 * The browser sends each file in small PATCH requests. If one fails (network
 * blip, proxy timeout, laptop sleep, page reload) only that piece is resent and
 * the upload resumes from the last byte the server stored.
 *
 * In-progress uploads live in uploads/.tus/<id>. When the last byte arrives the
 * file is moved to uploads/<folderId>/<filename> and a File row is created,
 * exactly like the old multer endpoint did.
 */
const path = require('path');
const fs = require('fs');
const { Server } = require('@tus/server');
const { FileStore } = require('@tus/file-store');

const TUS_PATH = '/api/tus';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const httpError = (status_code, message) => {
    const err = new Error(message);
    err.status_code = status_code;
    err.body = `${message}\n`;
    return err;
};

// Validate the metadata sent by the client and return safe values.
const parseMetadata = (metadata = {}) => {
    const folderId = String(metadata.folderId ?? '');
    if (!/^\d+$/.test(folderId)) {
        throw httpError(400, 'Missing or invalid folderId');
    }
    const fileName = path.basename(String(metadata.filename ?? ''));
    if (!fileName || fileName === '.' || fileName === '..') {
        throw httpError(400, 'Missing or invalid filename');
    }
    return { folderId, fileName };
};

/**
 * @param {object} opts
 * @param {string} opts.uploadsDir  Root uploads directory (uploads/<folderId>/<file>).
 * @param {object} opts.FileModel   Sequelize File model (injectable for tests).
 * @param {number} [opts.maxSize]   Optional max file size in bytes.
 */
const createTusServer = ({ uploadsDir, FileModel, maxSize }) => {
    const tusDir = path.join(uploadsDir, '.tus');
    const datastore = new FileStore({
        directory: tusDir,
        // Unfinished uploads older than this are removed by cleanUpExpiredUploads().
        expirationPeriodInMilliseconds: ONE_DAY_MS,
    });

    const alreadyExists = async (fileName, folderId) =>
        Boolean(await FileModel.findOne({ where: { name: fileName, folder_id: folderId } })) ||
        fs.existsSync(path.join(uploadsDir, folderId, fileName));

    const server = new Server({
        path: TUS_PATH,
        datastore,
        // Location header "tus/<id>", relative to the endpoint the client
        // POSTed to (".../api/tus"). The browser resolves it to
        // ".../api/tus/<id>" whatever the public prefix is (e.g.
        // https://balldontlie.fr/pbox/api) and whether or not a proxy
        // terminates HTTPS, without trusting X-Forwarded-* headers.
        generateUrl: (req, { id }) => `tus/${id}`,
        ...(maxSize ? { maxSize } : {}),

        // Reject duplicates *before* any byte is sent, instead of after a
        // multi-GB transfer like the old endpoint.
        async onUploadCreate(req, res, upload) {
            const { folderId, fileName } = parseMetadata(upload.metadata);
            if (await alreadyExists(fileName, folderId)) {
                throw httpError(409, 'File already exists');
            }
            return res;
        },

        async onUploadFinish(req, res, upload) {
            const { folderId, fileName } = parseMetadata(upload.metadata);
            const tmpPath = upload.storage?.path || path.join(tusDir, upload.id);

            // Another upload with the same name may have finished meanwhile.
            if (await alreadyExists(fileName, folderId)) {
                await fs.promises.rm(tmpPath, { force: true });
                await fs.promises.rm(`${tmpPath}.json`, { force: true });
                throw httpError(409, 'File already exists');
            }

            const folderDir = path.join(uploadsDir, folderId);
            const finalPath = path.join(folderDir, fileName);
            await fs.promises.mkdir(folderDir, { recursive: true });
            await fs.promises.rename(tmpPath, finalPath); // same disk: instant
            await fs.promises.rm(`${tmpPath}.json`, { force: true });

            await FileModel.create({
                name: fileName,
                path: finalPath,
                folder_id: Number(folderId),
                size: upload.size,
            });
            return res;
        },
    });

    return { server, datastore };
};

// Remove abandoned partial uploads once an hour.
const scheduleCleanup = (server) => {
    const timer = setInterval(() => {
        server.cleanUpExpiredUploads()
            .then((n) => n && console.log(`tus: removed ${n} expired upload(s)`))
            .catch((err) => console.error('tus: cleanup failed', err));
    }, 60 * 60 * 1000);
    timer.unref();
    return timer;
};

module.exports = { createTusServer, scheduleCleanup, TUS_PATH };
