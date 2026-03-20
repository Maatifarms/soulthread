/**
 * aiModeration.js — Multi-layer AI Content Safety System
 *
 * Layers:
 *   1. Fast client-side keyword + regex scan (< 1ms)
 *   2. Risk scoring (Low / Medium / High)
 *   3. Crisis signal detection with resource trigger
 *
 * Risk levels:
 *   LOW    → allow, log silently
 *   MEDIUM → warn user with empathetic message
 *   HIGH   → block content, send to moderation queue
 *
 * Crisis detection → shows crisis resources UI
 */

// ── Crisis signals ─────────────────────────────────────────────────────────────
const CRISIS_PATTERNS = [
    /\b(want|going|plan|decided|decided)\s+to\s+(kill|end|take)\s+(my|myself|my life|their life)\b/i,
    /\b(suicid(e|al|ing)|suicide attempt|self.harm|cutting myself|hurt myself)\b/i,
    /\b(don.?t want to (live|be alive|exist)|life isn.?t worth|no reason to live)\b/i,
    /\b(goodbye (forever|cruel world)|this is my last|final message)\b/i,
    /\b(overdos(e|ing)|hanging myself|jump(ing)? off)\b/i,
    /\b(nobody (cares|would miss)|better off (without me|dead))\b/i,
];

// ── Harassment / hate speech ───────────────────────────────────────────────────
const HATE_PATTERNS = [
    /\b(kill yourself|kys)\b/i,
    /\b(rape|molest)\b/i,
];

// ── HIGH-risk block words (abuse, slurs, extreme profanity) ───────────────────
const HIGH_RISK_WORDS = new Set([
    'madarchod', 'bhenchod', 'bahenchod', 'bhosdike', 'bsdk',
    'chutiya', 'bakchod', 'randi', 'lund', 'choot', 'gaand',
    'bokachoda', 'khanki', 'thevidia', 'pundai', 'lanja', 'dengu',
    'sule', 'asshole', 'motherfucker', 'cunt',
]);

// ── MEDIUM-risk words (profanity / aggression) ─────────────────────────────────
const MEDIUM_RISK_WORDS = new Set([
    'fuck', 'shit', 'bitch', 'bastard', 'stupid idiot', 'hate you',
    'die', 'trash', 'useless', 'pathetic', 'idiot', 'kutta', 'harami',
    'bakchodi', 'kamina', 'kamine',
]);

// ── Sensitive topics (LOW risk, log only) ─────────────────────────────────────
const SENSITIVE_TOPICS = [
    'depression', 'anxiety', 'panic attack', 'trauma', 'abuse',
    'eating disorder', 'grief', 'loss', 'sad', 'crying', 'hospital',
];

// ── Crisis resources ───────────────────────────────────────────────────────────
export const CRISIS_RESOURCES = {
    headline: '💙 We care about you',
    message:
        'It sounds like you might be going through something really difficult. ' +
        'You\'re not alone — please reach out to someone who can help.',
    resources: [
        { name: 'iCall India', number: '9152987821', url: 'https://icallhelpline.org' },
        { name: 'Vandrevala Foundation', number: '1860-2662-345', url: 'https://www.vandrevalafoundation.com' },
        { name: 'SNEHI Helpline', number: '044-24640050', url: null },
        { name: 'International Crisis', number: null, url: 'https://findahelpline.com' },
    ],
};

// ── Main moderation function ───────────────────────────────────────────────────
/**
 * Moderate text content.
 *
 * @param {string} text
 * @param {'post'|'comment'|'bio'} [context='post']
 * @returns {{
 *   allowed: boolean,
 *   riskLevel: 'none'|'low'|'medium'|'high',
 *   isCrisis: boolean,
 *   reason: string|null,
 *   matchedTerms: string[],
 *   crisisResources: object|null,
 *   moderationAction: 'allow'|'warn'|'block'|'crisis'
 * }}
 */
export function moderateText(text, context = 'post') {
    if (!text || typeof text !== 'string') {
        return _result('allow', 'none', false, null, []);
    }

    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    const matched = [];

    // ── 1. Crisis detection (highest priority) ─────────────────────────────
    const isCrisis = CRISIS_PATTERNS.some(pattern => pattern.test(text));
    if (isCrisis) {
        return _result('crisis', 'high', true, 'Potential crisis signal detected', [], CRISIS_RESOURCES);
    }

    // ── 2. Hate speech patterns ────────────────────────────────────────────
    for (const pattern of HATE_PATTERNS) {
        if (pattern.test(text)) {
            matched.push(pattern.source);
            return _result('block', 'high', false,
                'This content contains harmful language and cannot be posted.', matched);
        }
    }

    // ── 3. HIGH-risk keyword scan ──────────────────────────────────────────
    for (const word of words) {
        const clean = word.replace(/[^a-z]/g, '');
        if (HIGH_RISK_WORDS.has(clean)) {
            matched.push(clean);
        }
    }
    if (matched.length > 0) {
        return _result('block', 'high', false,
            'Your post contains language that violates our community guidelines.', matched);
    }

    // ── 4. MEDIUM-risk keyword scan ────────────────────────────────────────
    for (const word of words) {
        const clean = word.replace(/[^a-z]/g, '');
        if (MEDIUM_RISK_WORDS.has(clean)) {
            matched.push(clean);
        }
    }
    if (matched.length > 0) {
        return _result('warn', 'medium', false,
            'Please keep SoulThread a safe, supportive space. Your post may contain language ' +
            'that could feel hurtful to others. Would you like to revise it?', matched);
    }

    // ── 5. Sensitive topic detection (LOW — allow but flag) ────────────────
    const sensitiveMatches = SENSITIVE_TOPICS.filter(t => lower.includes(t));
    if (sensitiveMatches.length > 0) {
        return _result('allow', 'low', false, null, sensitiveMatches);
    }

    return _result('allow', 'none', false, null, []);
}

// ── Image moderation placeholder ───────────────────────────────────────────────
/**
 * Client-side image content check (file type + size only).
 * For full AI image moderation, call a Cloud Function with Google Vision API.
 *
 * @param {File} file
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function moderateImageFile(file) {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_MB = 10;

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { allowed: false, reason: `Unsupported image format. Use JPG, PNG, WebP, or GIF.` };
    }
    if (file.size > MAX_MB * 1024 * 1024) {
        return { allowed: false, reason: `Image is too large. Max size is ${MAX_MB} MB.` };
    }
    return { allowed: true, reason: null };
}

// ── Video moderation placeholder ───────────────────────────────────────────────
/**
 * @param {File} file
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function moderateVideoFile(file) {
    const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const MAX_MB = 100;

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { allowed: false, reason: `Unsupported video format. Use MP4, WebM, or MOV.` };
    }
    if (file.size > MAX_MB * 1024 * 1024) {
        return { allowed: false, reason: `Video is too large. Max size is ${MAX_MB} MB.` };
    }
    return { allowed: true, reason: null };
}

/**
 * Log a moderation event to Firestore (fire-and-forget).
 * @param {object} db - Firestore db instance
 * @param {object} event - { userId, content, riskLevel, action, context }
 */
export async function logModerationEvent(db, { addDoc, collection, serverTimestamp }, event) {
    try {
        if (event.riskLevel === 'none') return; // Don't log clean content
        await addDoc(collection(db, 'moderation_logs'), {
            ...event,
            createdAt: serverTimestamp(),
        });
    } catch (_) { /* non-blocking */ }
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function _result(action, riskLevel, isCrisis, reason, matchedTerms, crisisResources = null) {
    return {
        allowed: action !== 'block',
        riskLevel,
        isCrisis,
        reason,
        matchedTerms,
        crisisResources,
        moderationAction: action,
    };
}
