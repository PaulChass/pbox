import * as tus from 'tus-js-client';
import { baseUrl } from './api.js';

// Each PATCH request carries at most this much data. Small enough to stay
// under proxy body limits (Cloudflare free: 100 MB) and to make a retry cheap.
const CHUNK_SIZE = 50 * 1024 * 1024;
// Wait times (ms) between automatic retries of a failed piece.
const RETRY_DELAYS = [0, 1000, 3000, 5000, 10000, 20000, 30000, 60000];

// Fired after uploads so the free-space display can refresh.
export const STORAGE_CHANGED_EVENT = 'pbox:storage-changed';
export const notifyStorageChanged = () => window.dispatchEvent(new Event(STORAGE_CHANGED_EVENT));

/**
 * Upload one file with the tus protocol (chunked + resumable).
 * Resolves when the server has the whole file, rejects with a readable message.
 *
 * @param {File} file
 * @param {number|string} folderId  Destination folder.
 * @param {object} [opts]
 * @param {(bytesUploaded: number, bytesTotal: number) => void} [opts.onProgress]
 * @param {{ current: any }} [opts.uploadRef]  Receives the tus.Upload (to abort it).
 */
export const tusUpload = (file, folderId, { onProgress, uploadRef } = {}) =>
  new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${baseUrl}/tus`,
      chunkSize: CHUNK_SIZE,
      retryDelays: RETRY_DELAYS,
      // Remember the upload URL in localStorage so picking the same file again
      // (after a reload or a crash) resumes instead of starting from 0.
      storeFingerprintForResuming: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        filename: file.name,
        filetype: file.type,
        folderId: String(folderId),
      },
      onProgress: (sent, total) => onProgress?.(sent, total),
      onSuccess: () => resolve(),
      onError: (error) => {
        const status = error.originalResponse?.getStatus?.();
        if (status === 409) reject(new Error(`${file.name}: a file with this name already exists`));
        else reject(new Error(`${file.name}: ${error.message || 'upload failed'}`));
      },
    });
    if (uploadRef) uploadRef.current = upload;

    upload.findPreviousUploads()
      .then((previous) => {
        if (previous.length > 0) upload.resumeFromPreviousUpload(previous[0]);
      })
      .catch(() => { /* no stored uploads: start fresh */ })
      .finally(() => upload.start());
  });
