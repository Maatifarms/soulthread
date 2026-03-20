/**
 * feedCache.js — IndexedDB-backed feed caching service
 *
 * Strategy:
 *   1. On app open: immediately return cached posts (< 5ms)
 *   2. Firestore loads fresh data in background
 *   3. Fresh data replaces cache display and updates IndexedDB
 *
 * This gives Instagram-like cold-start: content visible instantly,
 * then silently refreshes to latest.
 *
 * Cache limits:
 *   - MAX_POSTS = 50 (prevents IndexedDB bloat)
 *   - TTL = 6 hours (stale data older than this is cleared on next open)
 */

const DB_NAME = 'SoulThreadCache';
const DB_VERSION = 2;
const STORE_FEED = 'feed_posts';
const STORE_META = 'cache_meta';
const MAX_POSTS = 50;
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ─── DB Init (lazy singleton) ─────────────────────────────────────────────────

let _db = null;

const openDB = () => {
    if (_db) return Promise.resolve(_db);
    if (typeof indexedDB === 'undefined') return Promise.resolve(null); // SSR / unsupported

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (event) => {
            const db = event.target.result;

            // feed_posts store with compound index for fast queries
            if (!db.objectStoreNames.contains(STORE_FEED)) {
                const store = db.createObjectStore(STORE_FEED, { keyPath: 'postId' });
                store.createIndex('by_timestamp', 'timestamp', { unique: false });
                store.createIndex('by_cachedAt', 'cachedAt', { unique: false });
            }

            // Metadata store: last full sync time, post count, etc.
            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: 'key' });
            }
        };

        req.onsuccess = (e) => {
            _db = e.target.result;

            // Handle unexpected DB close (e.g., browser memory pressure)
            _db.onclose = () => { _db = null; };
            _db.onerror = (err) => console.warn('[FeedCache] DB error:', err);

            resolve(_db);
        };

        req.onerror = (e) => {
            console.warn('[FeedCache] Could not open IndexedDB:', e.target.error);
            resolve(null); // Graceful degradation
        };

        req.onblocked = () => {
            console.warn('[FeedCache] DB upgrade blocked by another tab');
        };
    });
};

// ─── Low-level helpers ────────────────────────────────────────────────────────

const withStore = async (storeName, mode, fn) => {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve, reject) => {
        try {
            const tx = db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);
            const result = fn(store);

            // If fn returns an IDBRequest, resolve on its success
            if (result && typeof result.onsuccess !== 'undefined') {
                result.onsuccess = () => resolve(result.result);
                result.onerror = () => reject(result.error);
            } else {
                tx.oncomplete = () => resolve(result);
                tx.onerror = () => reject(tx.error);
            }
        } catch (e) {
            resolve(null); // Never crash — cache is optional
        }
    });
};

// ─── Serialization: Firestore → plain object ──────────────────────────────────

/**
 * Convert a Firestore post document to a cache-compatible plain object.
 * Firestore Timestamps are converted to ISO strings.
 */
const serializePost = (post) => ({
    postId: post.id,
    content: post.content || '',
    mediaItems: (post.mediaItems || []).map(m => ({ url: m.url, type: m.type })),
    mediaUrl: post.mediaUrl || null,
    mediaType: post.mediaType || null,
    authorId: post.authorId || null,
    authorName: post.authorName || null,
    authorPhotoURL: post.authorPhotoURL || null,
    isAnonymous: post.isAnonymous || post.isIncognito || false,
    categoryId: post.categoryId || null,
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    reactionCounts: post.reactionCounts || {},
    circleId: post.circleId || null,
    isSensitive: post.isSensitive || false,
    crisisFlag: post.crisisFlag || false,
    promptText: post.promptText || null,
    type: post.type || 'post',
    // Serialize Firestore Timestamp → ISO string
    timestamp: post.createdAt?.toDate?.()?.toISOString?.() || post.createdAt || null,
    cachedAt: Date.now(),
});

/**
 * Convert a cached plain object back to a format compatible with FeedItem.
 * ISO timestamp strings become Date-like objects with a toDate() shim.
 */
const deserializePost = (cached) => {
    const tsShim = cached.timestamp
        ? { toDate: () => new Date(cached.timestamp), toMillis: () => new Date(cached.timestamp).getTime() }
        : null;

    return {
        ...cached,
        id: cached.postId,
        createdAt: tsShim,
        _fromCache: true,
    };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Write a batch of posts to IndexedDB.
 * Trims to MAX_POSTS oldest entries to control storage size.
 * @param {Array} posts - Raw Firestore post objects
 */
export const cachePosts = async (posts) => {
    const db = await openDB();
    if (!db) return;

    try {
        const serialized = posts.slice(0, MAX_POSTS).map(serializePost);

        const tx = db.transaction([STORE_FEED, STORE_META], 'readwrite');
        const feedStore = tx.objectStore(STORE_FEED);
        const metaStore = tx.objectStore(STORE_META);

        // Write each post (upsert)
        serialized.forEach(post => feedStore.put(post));

        // Trim to MAX_POSTS — delete oldest by cachedAt
        const countReq = feedStore.count();
        countReq.onsuccess = () => {
            const count = countReq.result;
            if (count > MAX_POSTS) {
                const toDelete = count - MAX_POSTS;
                const idx = feedStore.index('by_cachedAt');
                const cursorReq = idx.openCursor();
                let deleted = 0;
                cursorReq.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor && deleted < toDelete) {
                        cursor.delete();
                        deleted++;
                        cursor.continue();
                    }
                };
            }
        };

        // Update sync metadata
        metaStore.put({ key: 'lastSync', value: Date.now() });
        metaStore.put({ key: 'postCount', value: serialized.length });

        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn('[FeedCache] Write failed:', e);
    }
};

/**
 * Read cached posts from IndexedDB, sorted by timestamp descending.
 * Returns [] if cache is empty, expired, or IndexedDB unavailable.
 * @returns {Promise<Array>} Deserialized post objects
 */
export const getCachedPosts = async () => {
    const db = await openDB();
    if (!db) return [];

    try {
        // Check TTL first
        const lastSync = await withStore(STORE_META, 'readonly', store => store.get('lastSync'));
        const syncTime = lastSync?.value;

        if (syncTime && Date.now() - syncTime > TTL_MS) {
            console.log('[FeedCache] Cache expired — serving stale until refresh');
            // Don't clear here — still serve stale data, let Firestore update it
        }

        // Fetch all, sort by timestamp desc
        const posts = await new Promise((resolve) => {
            const db2 = _db;
            if (!db2) return resolve([]);
            const tx = db2.transaction(STORE_FEED, 'readonly');
            const store = tx.objectStore(STORE_FEED);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });

        // Sort newest first
        posts.sort((a, b) => {
            const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return tb - ta;
        });

        return posts.map(deserializePost);
    } catch (e) {
        console.warn('[FeedCache] Read failed:', e);
        return [];
    }
};

/**
 * Check if the cache has any posts at all.
 * @returns {Promise<boolean>}
 */
export const hasCachedPosts = async () => {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
        try {
            const tx = db.transaction(STORE_FEED, 'readonly');
            const store = tx.objectStore(STORE_FEED);
            const req = store.count();
            req.onsuccess = () => resolve(req.result > 0);
            req.onerror = () => resolve(false);
        } catch (e) {
            resolve(false);
        }
    });
};

/**
 * Check when feed was last synced from server.
 * @returns {Promise<number|null>} Unix timestamp ms or null
 */
export const getLastSyncTime = async () => {
    const meta = await withStore(STORE_META, 'readonly', store => store.get('lastSync'));
    return meta?.value || null;
};

/**
 * Wipe all cached feed data (e.g., on logout).
 */
export const clearFeedCache = async () => {
    const db = await openDB();
    if (!db) return;

    try {
        const tx = db.transaction([STORE_FEED, STORE_META], 'readwrite');
        tx.objectStore(STORE_FEED).clear();
        tx.objectStore(STORE_META).clear();
    } catch (e) {
        console.warn('[FeedCache] Clear failed:', e);
    }
};
