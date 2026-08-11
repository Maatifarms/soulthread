// ═══════════════════════════════════════════════════════
// SoulThread + NEHA — Unified Issue Category System
// Used by: feed, create post, moderation, Soul Guide matching
// ═══════════════════════════════════════════════════════

// icon: a lucide-react icon key, not an emoji — CreatePost.jsx (the only
// consumer) maps this to a real <Icon> component. Kept as a plain string
// here so this config stays framework-agnostic (no JSX import needed).
export const ISSUE_CATEGORIES = {
  mental_health: {
    id: 'mental_health',
    label: 'Mental wellness',
    label_hi: 'मानसिक स्वास्थ्य',
    icon: 'brain',
    color: '#0d9488',
    colorSoft: 'rgba(13,148,136,0.12)',
    borderColor: 'rgba(13,148,136,0.30)',
    subCategories: [
      'Anxiety', 'Depression', 'Panic attacks',
      'OCD', 'PTSD', 'Loneliness', 'Self-worth',
      'Grief', 'Burnout', 'Sleep issues'
    ],
    subCategories_hi: [
      'चिंता', 'अवसाद', 'पैनिक अटैक',
      'ओसीडी', 'PTSD', 'अकेलापन', 'आत्मसम्मान',
      'दुख', 'बर्नआउट', 'नींद की समस्या'
    ],
    guideSpecializations: ['anxiety', 'depression', 'trauma', 'CBT', 'mindfulness']
  },

  relationships: {
    id: 'relationships',
    label: 'Relationships',
    label_hi: 'रिश्ते',
    icon: 'heart',
    color: '#8b5cf6',
    colorSoft: 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(139,92,246,0.30)',
    subCategories: [
      'Family conflict', 'Romantic relationship',
      'Friendship', 'Divorce or separation',
      'Trust issues', 'Toxic relationship',
      'Long distance', 'Parenting stress'
    ],
    subCategories_hi: [
      'पारिवारिक विवाद', 'प्रेम संबंध',
      'दोस्ती', 'तलाक या अलगाव',
      'भरोसे की समस्या', 'ज़हरीला रिश्ता',
      'लंबी दूरी', 'पेरेंटिंग तनाव'
    ],
    guideSpecializations: ['couples therapy', 'family therapy', 'attachment']
  },

  caretaker: {
    id: 'caretaker',
    label: 'Caretaker support',
    label_hi: 'देखभाल करने वाले',
    icon: 'caretaker',
    color: '#0ea5e9',
    colorSoft: 'rgba(14,165,233,0.12)',
    borderColor: 'rgba(14,165,233,0.30)',
    subCategories: [
      'Caretaker exhaustion', 'Hospital stress',
      'Medical confusion', 'Financial burden of illness',
      'Emotional toll', 'Watching someone suffer',
      'End of life care', 'Recovery support'
    ],
    subCategories_hi: [
      'देखभाल की थकान', 'अस्पताल का तनाव',
      'दवाइयों की उलझन', 'बीमारी का आर्थिक बोझ',
      'भावनात्मक थकान', 'किसी को तकलीफ में देखना',
      'जीवन के अंत की देखभाल', 'रिकवरी सहयोग'
    ],
    guideSpecializations: ['caregiver burnout', 'palliative care', 'grief']
  },

  financial: {
    id: 'financial',
    label: 'Financial stress',
    label_hi: 'आर्थिक तनाव',
    icon: 'financial',
    color: '#f59e0b',
    colorSoft: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.30)',
    subCategories: [
      'Debt', 'Job loss', 'Medical bills',
      'Family financial pressure', 'Business failure',
      'Poverty stress', 'Loan burden',
      'Unable to provide for family'
    ],
    subCategories_hi: [
      'कर्ज', 'नौकरी जाना', 'मेडिकल बिल',
      'परिवार का आर्थिक दबाव', 'व्यापार में नुकसान',
      'गरीबी का तनाव', 'लोन का बोझ',
      'परिवार की ज़रूरतें पूरी न कर पाना'
    ],
    guideSpecializations: ['stress management', 'financial therapy', 'CBT']
  },

  career: {
    id: 'career',
    label: 'Career and purpose',
    label_hi: 'करियर और मकसद',
    icon: 'career',
    color: '#ec4899',
    colorSoft: 'rgba(236,72,153,0.12)',
    borderColor: 'rgba(236,72,153,0.30)',
    subCategories: [
      'Job stress', 'Unemployment', 'Feeling purposeless',
      'Work life balance', 'Toxic workplace',
      'Career change confusion', 'Exam pressure',
      'Academic failure', 'Competition pressure'
    ],
    subCategories_hi: [
      'काम का तनाव', 'बेरोज़गारी', 'जीवन में उद्देश्य नहीं',
      'काम और जीवन का संतुलन', 'ज़हरीला कार्यस्थल',
      'करियर बदलने की उलझन', 'परीक्षा का दबाव',
      'पढ़ाई में असफलता', 'प्रतिस्पर्धा का दबाव'
    ],
    guideSpecializations: ['career counseling', 'life coaching', 'stress']
  },

  physical_health: {
    id: 'physical_health',
    label: 'Physical health',
    label_hi: 'शारीरिक स्वास्थ्य',
    icon: 'physical_health',
    color: '#22c55e',
    colorSoft: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.30)',
    subCategories: [
      'Chronic illness', 'Post surgery recovery',
      'Disability', 'Chronic pain',
      'Sleep disorders', 'Digestive issues',
      'Heart disease', 'Diabetes management',
      'Cancer support', 'Kidney disease'
    ],
    subCategories_hi: [
      'पुरानी बीमारी', 'ऑपरेशन के बाद रिकवरी',
      'विकलांगता', 'लगातार दर्द',
      'नींद की बीमारी', 'पेट की समस्या',
      'हृदय रोग', 'डायबिटीज़ प्रबंधन',
      'कैंसर सहयोग', 'किडनी रोग'
    ],
    guideSpecializations: ['chronic illness', 'pain management', 'health psychology']
  }
};

// Ordered list for display
export const CATEGORY_LIST = Object.values(ISSUE_CATEGORIES);

// Get category config by id
export function getCategoryConfig(categoryId) {
  return ISSUE_CATEGORIES[categoryId] || ISSUE_CATEGORIES.mental_health;
}

// Get display label based on language
export function getCategoryLabel(categoryId, language = 'en') {
  const cat = getCategoryConfig(categoryId);
  return language === 'hi' ? cat.label_hi : cat.label;
}

// Get subcategories based on language
export function getSubCategories(categoryId, language = 'en') {
  const cat = getCategoryConfig(categoryId);
  return language === 'hi' ? cat.subCategories_hi : cat.subCategories;
}
