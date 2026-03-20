// Basic moderation service for SoulThread
// Filters out harmful content (suicide, bullying) and enforces positive comments.

const SENSITIVE_KEYWORDS = [
    // Self-harm / Suicide
    'suicide', 'kill myself', 'end my life', 'want to die', 'cutting myself', 'hang myself', 'overdose',
    'hate my life', 'better off dead', 'slash my', 'jump off',

    // Bullying / Harassment / Hate
    'stupid', 'idiot', 'ugly', 'fat', 'loser', 'hate you', 'kill yourself', 'die', 'dumb',
    'retard', 'useless', 'pathetic', 'trash', 'scum', 'disgusting', 'bitch', 'bastard',
    'fuck', 'shit', 'asshole',

    // Hindi Abuse / Slang
    'madarchod', 'bahenchod', 'bhenchod', 'mc', 'bc', 'bkl', 'mkc',
    'randi', 'rand', 'chineal', 'chinal', 'rndi',
    'bakchod', 'bakchodi',
    'land', 'lund', 'lnd', 'lauda', 'loda',
    'chutiya', 'kutta', 'kamine', 'harami', 'kamina',
    'bhosdike', 'bsdk', 'bhosda',
    'gaand', 'gand', 'choot', 'chut',
    'suar', 'bhadwa', 'bhadwe',

    // Marathi
    'zavadya', 'lavda', 'gandu', 'chinal', 'bhosdichya', 'aizavadya',

    // Bengali
    'bokachoda', 'bara', 'bal', 'magir', 'bhatar', 'pod', 'gud', 'khanki', 'shala',

    // Punjabi
    'fudu', 'kanjar', 'lan', 'penchod', 'bund', 'kutiya', 'khoti', 'kanjari',

    // Tamil
    'thevidia', 'thevidiya', 'punda', 'pundai', 'poolu', 'othu', 'ommale', 'sunni', 'mayiru',

    // Telugu
    'lanja', 'dengu', 'modda', 'puku', 'sulli', 'erripuka', 'lanjakodaka',

    // Kannada
    'sule', 'buli', 'bewarsi', 'randi', 'hogi', 'keyya',

    // Malayalam
    'poori', 'myre', 'maire', 'kundanu', 'poorimone', 'thedi',

    // Gujarati
    'ghelo', 'loda', 'chodi'
];

const SENSITIVE_TOPICS = [
    'blood', 'injury', 'scar', 'needle', 'hospital', 'trauma', 'abuse',
    'panic attack', 'anxiety', 'depression', 'eating disorder', 'trigger',
    'sad', 'crying', 'death', 'loss', 'grief'
];

export const moderateContent = (text, type = 'post') => {
    if (!text) return { safe: true, isSensitive: false };

    const lowerText = text.toLowerCase();

    // Check if it contains sensitive keywords or topics
    const hasSensitiveKeyword = SENSITIVE_KEYWORDS.some(word => lowerText.includes(word));
    const hasSensitiveTopic = SENSITIVE_TOPICS.some(word => lowerText.includes(word));

    return {
        safe: true, // Always safe to post now
        isSensitive: hasSensitiveKeyword || hasSensitiveTopic
    };
};

export const analyzeQuality = (text) => {
    if (!text) return { valid: false, message: "Please share something with us." };

    // 1. Length Check - DISABLED (Allowing short expressions/greetings)
    /*
    if (text.length < 25) {
        return {
            valid: false,
            message: "SoulThread is about sharing journeys. Could you elaborate a bit more on your story or feelings?"
        };
    }
    */

    // 2. Generic Greeting Filter - DISABLED (Allowing simple connections)
    /*
    const lower = text.toLowerCase().trim();
    if (['hello', 'hi', 'hey', 'test', 'good morning', 'good night'].includes(lower.replace(/[^\w\s]/g, ''))) { // strip punctuation
        return {
            valid: false,
            message: "We'd love to hear more than just a greeting! How are you feeling today?"
        };
    }
    */

    // 3. Gibberish Check (Relaxed - only catch extremely long repeated patterns)
    if (/(.)\1{10,}/.test(text)) {
        return {
            valid: false,
            message: "This looks like it might be a typo. Could you double-check your post?"
        };
    }

    return { valid: true };
};

export const detectKeywords = (text) => {
    // Keywords that aren't BANNED but might require a "Sensitive Content" blur
    const SENSITIVE_TOPICS = [
        'blood', 'injury', 'scar', 'needle', 'hospital', 'trauma', 'abuse',
        'panic attack', 'anxiety', 'depression', 'eating disorder', 'trigger',
        'sad', 'crying', 'death', 'loss', 'grief'
    ];

    const lower = text.toLowerCase();
    const found = SENSITIVE_TOPICS.filter(word => lower.includes(word));
    return found.length > 0;
};
