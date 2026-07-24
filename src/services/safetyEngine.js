// ═══════════════════════════════════════════════════════
// SoulThread Safety Engine v1
// Runs 100% on-device — no API, no internet
// Three layers: crisis detection, risk scoring, moderation
// ═══════════════════════════════════════════════════════

// ─── LAYER 1: CRISIS PATTERNS ───────────────────────────
// Immediate danger — highest priority
const CRISIS_PATTERNS = {
  suicide: {
    keywords: [
      // English
      'want to die', 'end my life', 'kill myself', 'suicide',
      'take my own life', 'no reason to live', 'better off dead',
      'cannot go on', 'cant go on', "can't go on", 'goodbye forever',
      'nobody would miss me', 'everyone would be better without me',
      'planning to end', 'ending it all', 'final goodbye',
      // Hindi
      'मरना चाहता हूं', 'मरना चाहती हूं', 'जीना नहीं चाहता',
      'जीना नहीं चाहती', 'खुद को खत्म', 'जिंदगी खत्म करना',
      'आत्महत्या', 'जीवन समाप्त', 'सब खत्म करना चाहता',
      'मर जाना चाहता', 'दुनिया छोड़ना चाहता'
    ],
    weight: 10,
    requiresImmediate: true
  },
  self_harm: {
    keywords: [
      'hurt myself', 'hurting myself', 'cutting myself', 'cut myself',
      'burning myself', 'harming myself', 'self harm', 'selfharm',
      'खुद को नुकसान', 'खुद को चोट', 'खुद को काटना'
    ],
    weight: 9,
    requiresImmediate: true
  },
  immediate_danger: {
    keywords: [
      'going to do it tonight', 'going to do it today',
      'have the pills ready', 'have a knife', 'have a rope',
      'this is my last', 'last message', 'last post',
      'already took pills', 'already hurt myself',
      'आज रात करूंगा', 'आज करूंगा', 'यह मेरा आखिरी'
    ],
    weight: 10,
    requiresImmediate: true
  }
};

// ─── LAYER 2: RISK PATTERNS ─────────────────────────────
// High distress — needs support but not immediate crisis
const RISK_PATTERNS = {
  severe_distress: {
    keywords: [
      'cannot take it anymore', "can't take it anymore", 'cant take it',
      'at my limit', 'breaking point', 'falling apart',
      'completely lost', 'no hope', 'hopeless', 'helpless',
      'worthless', 'useless', 'burden to everyone', 'burden to family',
      'nobody cares', 'no one cares', 'all alone', 'completely alone',
      'टूट गया', 'टूट गई', 'बिल्कुल अकेला', 'कोई उम्मीद नहीं',
      'किसी को परवाह नहीं', 'बेकार हूं', 'बोझ हूं'
    ],
    weight: 6
  },
  moderate_distress: {
    keywords: [
      'struggling so much', 'really struggling', 'crying every day',
      'cannot sleep', "can't sleep", 'not eating', 'stopped eating',
      'lost all motivation', 'given up', 'what is the point',
      'why bother', 'so tired of everything', 'exhausted from life',
      'बहुत थक गया', 'रो रहा हूं', 'नींद नहीं आती',
      'खाना नहीं खाता', 'हार मान ली'
    ],
    weight: 4
  }
};

// ─── LAYER 3: MODERATION PATTERNS ───────────────────────
const MODERATION_PATTERNS = {
  hate_speech: {
    // Keep this list internal — not showing full list in prompt
    // Includes slurs, dehumanizing language, targeted harassment
    patterns: [
      /\b(hate|kill|destroy)\s+(all\s+)?(muslims?|hindus?|christians?|sikhs?|dalits?)\b/gi,
      /\b(go\s+back\s+to\s+pakistan|go\s+back\s+to\s+india)\b/gi
    ],
    weight: 8
  },
  personal_info: {
    patterns: [
      /\b\d{10}\b/g,                          // Indian phone numbers
      /\b[6-9]\d{9}\b/g,                      // Mobile numbers starting 6-9
      /\b[A-Z]{5}\d{4}[A-Z]\b/g,             // PAN card
      /\b\d{4}\s?\d{4}\s?\d{4}\b/g,          // Aadhaar number
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g  // Email
    ],
    weight: 3,
    warnOnly: true  // Don't block, just warn user
  },
  spam: {
    patterns: [
      /(.)\1{5,}/g,           // Repeated characters: aaaaaaa
      /[A-Z]{10,}/g,          // All caps blocks
      /(https?:\/\/[^\s]+)/g  // URLs
    ],
    weight: 2
  }
};

// ─── CRISIS RESOURCES ───────────────────────────────────
// Stored in app bundle — works offline
export const CRISIS_RESOURCES = [
  {
    name: 'iCall',
    description: 'Psychological counseling by trained professionals',
    description_hi: 'प्रशिक्षित पेशेवरों द्वारा मनोवैज्ञानिक परामर्श',
    phone: '9152987821',
    hours: 'Mon-Sat, 8am-10pm',
    hours_hi: 'सोम-शनि, सुबह 8 से रात 10 बजे',
    type: 'call'
  },
  {
    name: 'Vandrevala Foundation',
    description: '24/7 mental health helpline',
    description_hi: '24/7 मानसिक स्वास्थ्य हेल्पलाइन',
    phone: '1860-2662-345',
    hours: '24 hours, 7 days',
    hours_hi: '24 घंटे, 7 दिन',
    type: 'call'
  },
  {
    name: 'Snehi',
    description: 'Emotional support and suicide prevention',
    description_hi: 'भावनात्मक सहायता और आत्महत्या रोकथाम',
    phone: '044-24640050',
    hours: 'Daily, 8am-10pm',
    hours_hi: 'प्रतिदिन, सुबह 8 से रात 10 बजे',
    type: 'call'
  },
  {
    name: 'NIMHANS',
    description: 'National Institute of Mental Health',
    description_hi: 'राष्ट्रीय मानसिक स्वास्थ्य संस्थान',
    phone: '080-46110007',
    hours: 'Mon-Sat, 9am-5pm',
    hours_hi: 'सोम-शनि, सुबह 9 से शाम 5 बजे',
    type: 'call'
  }
];

// ─── MAIN ANALYSIS FUNCTION ─────────────────────────────
export function analyzeContent(text) {
  if (!text || text.trim().length < 3) {
    return { riskLevel: 'none', score: 0, flags: [], crisisDetected: false, personalInfoFound: [], hasPersonalInfo: false, hasHateSpeech: false };
  }

  const lower = text.toLowerCase();
  let totalScore = 0;
  const flags = [];
  let crisisDetected = false;
  let requiresImmediate = false;
  const personalInfoFound = [];

  // Check crisis patterns first — highest priority
  for (const [type, pattern] of Object.entries(CRISIS_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        totalScore = Math.max(totalScore, pattern.weight);
        crisisDetected = true;
        requiresImmediate = pattern.requiresImmediate;
        flags.push({ type: 'crisis', subType: type, keyword });
        break; // One match per pattern type is enough
      }
    }
  }

  // Check risk patterns
  if (!crisisDetected) {
    for (const [type, pattern] of Object.entries(RISK_PATTERNS)) {
      for (const keyword of pattern.keywords) {
        if (lower.includes(keyword.toLowerCase())) {
          totalScore = Math.max(totalScore, pattern.weight);
          flags.push({ type: 'risk', subType: type, keyword });
          break;
        }
      }
    }
  }

  // Check moderation patterns
  for (const [type, pattern] of Object.entries(MODERATION_PATTERNS)) {
    if (pattern.patterns) {
      for (const regex of pattern.patterns) {
        regex.lastIndex = 0; // Reset regex state
        if (regex.test(text)) {
          if (type === 'personal_info') {
            // Extract what was found for user warning
            regex.lastIndex = 0;
            const matches = text.match(regex);
            if (matches) personalInfoFound.push(...matches);
          }
          totalScore = Math.max(totalScore, pattern.weight);
          flags.push({ type: 'moderation', subType: type });
        }
      }
    }
  }

  // Determine risk level
  let riskLevel;
  if (crisisDetected || totalScore >= 9) {
    riskLevel = 'crisis';
  } else if (totalScore >= 7) {
    riskLevel = 'high';
  } else if (totalScore >= 4) {
    riskLevel = 'medium';
  } else if (totalScore >= 1) {
    riskLevel = 'low';
  } else {
    riskLevel = 'none';
  }

  return {
    riskLevel,
    score: totalScore,
    flags,
    crisisDetected,
    requiresImmediate,
    personalInfoFound,
    hasPersonalInfo: personalInfoFound.length > 0,
    hasHateSpeech: flags.some(f => f.subType === 'hate_speech')
  };
}

// ─── DEBOUNCED REAL-TIME CHECK ───────────────────────────
// Call this on every keystroke with 800ms debounce
let debounceTimer = null;
export function analyzeContentDebounced(text, callback) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const result = analyzeContent(text);
    callback(result);
  }, 800);
}
