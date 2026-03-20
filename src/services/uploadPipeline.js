/**
 * uploadPipeline.js — Background Media Upload Pipeline
 *
 * Pipeline stages:
 *   1. Select → Preview
 *   2. Compress (Canvas/WebP for images; metadata capture for video)
 *   3. Upload to Firebase Storage with progress events
 *   4. Store metadata to Firestore
 *   5. Retry on transient failures (max 3 attempts with exponential back-off)
 *
 * Usage:
 *   const job = createUploadJob(file, { path, onProgress, onComplete, onError });
 *   job.start();
 *   job.cancel(); // cancel in-flight upload
 */

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { compressImageFile, generateVideoThumbnail, getVideoMeta, formatFileSize } from './mediaUtils';

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.82;   // WebP quality
const MAX_FILE_SIZE_MB = 50;     // 50 MB max for any media
const MAX_RETRIES = 3;

// ── Upload Job Factory ─────────────────────────────────────────────────────────
/**
 * @typedef {Object} UploadJob
 * @property {string}   id           - Unique job identifier
 * @property {File}     file         - Original file
 * @property {'idle'|'compressing'|'uploading'|'done'|'error'|'cancelled'} status
 * @property {number}   progress     - 0–100
 * @property {string|null} url       - Final download URL after success
 * @property {Blob|null} thumbnail   - Video thumbnail Blob (video only)
 * @property {Function} start        - Begin the pipeline
 * @property {Function} cancel       - Cancel in-flight upload
 */

export function createUploadJob(file, {
    path,
    onProgress = () => { },
    onComplete = () => { },
    onError = () => { },
} = {}) {
    let uploadTask = null;
    let cancelled = false;
    let retryCount = 0;

    const job = {
        id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        status: 'idle',
        progress: 0,
        url: null,
        thumbnail: null,

        start: async function () {
            if (cancelled) return;
            job.status = 'compressing';
            onProgress({ status: 'compressing', progress: 0, job });

            // ── Validate size ──────────────────────────────────────────────
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                const err = new Error(`File too large. Max ${MAX_FILE_SIZE_MB} MB.`);
                _handleError(err);
                return;
            }

            try {
                let uploadFile = file;
                let thumbnail = null;

                // ── Image compression ──────────────────────────────────────
                if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                    uploadFile = await compressImageFile(file, {
                        maxWidth: MAX_IMAGE_WIDTH,
                        maxHeight: MAX_IMAGE_HEIGHT,
                        quality: IMAGE_QUALITY,
                    });
                    console.log(
                        `[Upload] Image compressed: ${formatFileSize(file.size)} → ${formatFileSize(uploadFile.size)}`
                    );
                }

                // ── Video thumbnail ────────────────────────────────────────
                if (file.type.startsWith('video/')) {
                    try {
                        thumbnail = await generateVideoThumbnail(file, 1.5, 0.75);
                        job.thumbnail = thumbnail;
                    } catch (e) {
                        console.warn('[Upload] Thumbnail generation failed:', e.message);
                    }
                }

                if (cancelled) return;
                job.status = 'uploading';
                onProgress({ status: 'uploading', progress: 0, job });

                await _upload(uploadFile, path);

            } catch (err) {
                _handleError(err);
            }
        },

        cancel: function () {
            cancelled = true;
            if (uploadTask) {
                try { uploadTask.cancel(); } catch (_) { }
            }
            job.status = 'cancelled';
            onProgress({ status: 'cancelled', progress: job.progress, job });
        },
    };

    // ── Internal upload with retry ─────────────────────────────────────────────
    async function _upload(uploadFile, storagePath) {
        return new Promise((resolve, reject) => {
            if (cancelled) return;

            const storageRef = ref(storage, storagePath || `uploads/${Date.now()}_${uploadFile.name}`);
            uploadTask = uploadBytesResumable(storageRef, uploadFile, {
                contentType: uploadFile.type,
                cacheControl: 'public, max-age=31536000',
            });

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    if (cancelled) return;
                    const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    job.progress = pct;
                    onProgress({ status: 'uploading', progress: pct, job });
                },
                async (err) => {
                    if (cancelled || err.code === 'storage/canceled') return;
                    if (retryCount < MAX_RETRIES) {
                        retryCount++;
                        const delay = Math.pow(2, retryCount) * 500;
                        console.warn(`[Upload] Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms`);
                        await _sleep(delay);
                        try { await _upload(uploadFile, storagePath); resolve(); }
                        catch (retryErr) { reject(retryErr); }
                    } else {
                        reject(err);
                    }
                },
                async () => {
                    try {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        job.url = url;
                        job.status = 'done';
                        job.progress = 100;
                        onProgress({ status: 'done', progress: 100, job });
                        onComplete({ url, thumbnail: job.thumbnail, job });
                        resolve(url);
                    } catch (e) {
                        reject(e);
                    }
                }
            );
        });
    }

    function _handleError(err) {
        if (cancelled) return;
        job.status = 'error';
        console.error('[Upload] Pipeline error:', err);
        onError({ error: err, job });
    }

    return job;
}

// ── Queue Manager (for multiple simultaneous uploads) ──────────────────────────
const _queue = new Map();  // jobId → job

export function enqueueUpload(file, options) {
    const job = createUploadJob(file, options);
    _queue.set(job.id, job);
    job.start().finally(() => {
        // Auto-clean completed/failed jobs after 30s
        setTimeout(() => _queue.delete(job.id), 30_000);
    });
    return job;
}

export function cancelUpload(jobId) {
    const job = _queue.get(jobId);
    if (job) job.cancel();
}

export function getActiveJobs() {
    return Array.from(_queue.values()).filter(j => j.status === 'uploading' || j.status === 'compressing');
}

// ── Upload progress bar component helper ──────────────────────────────────────
/**
 * Returns a React-friendly progress state object from a job.
 */
export function jobToProgressState(job) {
    return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        fileName: job.file?.name || '',
        fileSize: job.file ? formatFileSize(job.file.size) : '',
        url: job.url,
    };
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
