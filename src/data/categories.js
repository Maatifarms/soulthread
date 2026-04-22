export const CATEGORIES = [
    { id: 'general', label: 'General', icon: 'PenLine', legacyAliases: ['General', 'General-Discussion'] },
    { id: 'healing', label: 'Healing', icon: 'HeartPulse', legacyAliases: ['Healing', 'healing-recovery-stories'] },
    { id: 'anxiety', label: 'Anxiety', icon: 'Wind', legacyAliases: ['Anxiety', 'anxiety-care-bot', 'stress'] },
    { id: 'relationships', label: 'Relationships', icon: 'Users', legacyAliases: ['Relationships', 'Relationship-Advice'] },
    { id: 'mindset', label: 'Mindset', icon: 'Brain', legacyAliases: ['Mindset', 'Mental-Health'] },
    { id: 'growth', label: 'Growth', icon: 'Sprout', legacyAliases: ['Growth', 'Personal-Growth'] },
    { id: 'focus', label: 'Focus', icon: 'Target', legacyAliases: ['Focus', 'Productivity'] },
    { id: 'spirituality', label: 'Spirituality', icon: 'Sparkles', legacyAliases: ['Spirituality', 'Faith'] },
    { id: 'motivation', label: 'Motivation', icon: 'Zap', legacyAliases: ['Motivation', 'Daily-Inspiration'] },
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
}, {});
