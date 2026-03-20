/**
 * performanceMonitor.js — App Performance Monitoring & Analytics
 *
 * Tracks:
 *   - App launch time (from mark to first paint)
 *   - Feed load time
 *   - Message delivery latency
 *   - Media upload success/fail rates
 *   - Component render times
 *   - Monthly active session duration
 *
 * Uses:
 *   - Performance.mark / Performance.measure (Web Perf API)
 *   - Firestore for persistent analytics
 *   - sessionStorage for deduplication per session
 * 
 * Designed to be non-blocking and fire-and-forget on all Firestore writes.
 */

// ── In-memory log (capped at 200 events) ──────────────────────────────────────
let _log = [];
const MAX_LOG = 200;

function _pushLog(event) {
    _log.push({ ...event, ts: Date.now() });
    if (_log.length > MAX_LOG) _log.shift();
}

// ── Mark app launch time ───────────────────────────────────────────────────────
const _appStartMs = Date.now();
let _feedLoadMarked = false;

export function markAppLaunch() {
    try {
        performance.mark('app_launch');
        _pushLog({ type: 'app_launch' });
    } catch (_) { }
}

export function measureFeedLoad() {
    if (_feedLoadMarked) return;
    _feedLoadMarked = true;
    try {
        const ms = Date.now() - _appStartMs;
        performance.mark('feed_loaded');
        _pushLog({ type: 'feed_load_ms', value: ms });
        if (ms > 3000) {
            console.warn(`[Perf] Slow feed load: ${ms}ms`);
        }
        return ms;
    } catch (_) { return null; }
}

// ── Message delivery latency ───────────────────────────────────────────────────
const _pendingMessages = new Map(); // tempId → sentAtMs

export function markMessageSent(tempId) {
    _pendingMessages.set(tempId, Date.now());
}

export function markMessageDelivered(tempId) {
    const sentAt = _pendingMessages.get(tempId);
    if (!sentAt) return null;
    const latencyMs = Date.now() - sentAt;
    _pendingMessages.delete(tempId);
    _pushLog({ type: 'msg_latency_ms', value: latencyMs });
    if (latencyMs > 2000) {
        console.warn(`[Perf] Slow message delivery: ${latencyMs}ms`);
    }
    return latencyMs;
}

// ── Upload tracking ────────────────────────────────────────────────────────────
let _uploadStats = { success: 0, fail: 0, totalBytes: 0 };

export function recordUploadSuccess(bytes) {
    _uploadStats.success++;
    _uploadStats.totalBytes += bytes;
    _pushLog({ type: 'upload_success', bytes });
}

export function recordUploadFailure(reason) {
    _uploadStats.fail++;
    _pushLog({ type: 'upload_fail', reason });
}

export function getUploadSuccessRate() {
    const total = _uploadStats.success + _uploadStats.fail;
    if (total === 0) return 100;
    return Math.round((_uploadStats.success / total) * 100);
}

// ── Session duration tracking ─────────────────────────────────────────────────
const _sessionStartMs = Date.now();
let _sessionFlushed = false;

function _getSessionDurationSec() {
    return Math.round((Date.now() - _sessionStartMs) / 1000);
}

// ── Component render timing (use in React effects) ────────────────────────────
const _renderTimers = new Map();

export function startRenderTimer(componentName) {
    _renderTimers.set(componentName, performance.now());
}

export function endRenderTimer(componentName) {
    const start = _renderTimers.get(componentName);
    if (!start) return null;
    const ms = Math.round(performance.now() - start);
    _renderTimers.delete(componentName);
    _pushLog({ type: 'render_ms', component: componentName, value: ms });
    if (ms > 16) {
        console.warn(`[Perf] Slow render: ${componentName} took ${ms}ms (target < 16ms)`);
    }
    return ms;
}

// ── Error / crash logging ──────────────────────────────────────────────────────
export function logError(error, context = 'unknown') {
    _pushLog({ type: 'error', context, message: error?.message || String(error) });
    console.error(`[Perf/Error] [${context}]`, error);
}

// ── Dashboard metrics snapshot ─────────────────────────────────────────────────
export function getMetricsSnapshot() {
    const msgLatencies = _log
        .filter(e => e.type === 'msg_latency_ms')
        .map(e => e.value);
    const renderTimes = _log
        .filter(e => e.type === 'render_ms')
        .map(e => e.value);
    const feedLoads = _log
        .filter(e => e.type === 'feed_load_ms')
        .map(e => e.value);

    return {
        sessionDurationSec: _getSessionDurationSec(),
        feedLoadMs: feedLoads.length > 0 ? Math.min(...feedLoads) : null,
        avgMsgLatencyMs: _avg(msgLatencies),
        maxMsgLatencyMs: msgLatencies.length > 0 ? Math.max(...msgLatencies) : null,
        avgRenderMs: _avg(renderTimes),
        uploadSuccessRate: getUploadSuccessRate(),
        totalUploads: _uploadStats.success + _uploadStats.fail,
        errors: _log.filter(e => e.type === 'error').length,
        eventCount: _log.length,
    };
}

// ── Flush analytics to Firestore ───────────────────────────────────────────────
/**
 * Call this on page unload (beforeunload / visibilitychange to hidden).
 * Only writes once per session.
 */
export async function flushAnalytics(db, { addDoc, collection, serverTimestamp }, userId) {
    if (_sessionFlushed || !db || !userId) return;
    _sessionFlushed = true;

    const snapshot = getMetricsSnapshot();

    try {
        await addDoc(collection(db, 'analytics_sessions'), {
            uid: userId,
            ...snapshot,
            userAgent: navigator.userAgent,
            createdAt: serverTimestamp(),
        });
    } catch (_) { /* non-blocking — analytics loss is acceptable */ }
}

// ── Web Vitals capture (optional integration) ──────────────────────────────────
export function captureWebVitals() {
    try {
        // Capture LCP via PerformanceObserver
        const lcpObs = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            if (lcp) _pushLog({ type: 'lcp_ms', value: Math.round(lcp.startTime) });
        });
        lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });

        // Capture FID
        const fidObs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                _pushLog({ type: 'fid_ms', value: Math.round(entry.processingStart - entry.startTime) });
            }
        });
        fidObs.observe({ type: 'first-input', buffered: true });

        // Capture CLS
        let clsValue = 0;
        const clsObs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) clsValue += entry.value;
            }
        });
        clsObs.observe({ type: 'layout-shift', buffered: true });

        // Report CLS on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                _pushLog({ type: 'cls', value: clsValue });
            }
        });

    } catch (_) { /* PerformanceObserver may not be supported everywhere */ }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function _avg(arr) {
    if (arr.length === 0) return null;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
