/**
 * SoulThread Category Architecture
 *
 * These are the canonical categories for all posts on SoulThread.
 * - Users do NOT manually select categories (Phase 2: AI auto-categorization).
 * - The `slug` is the stable Firestore document ID.
 * - The `id` field matches the slug for easy cross-reference.
 *
 * Usage:
 *   import { CATEGORIES, getCategoryBySlug } from './categories';
 */

export const CATEGORIES = [
    {
        id: 'healing-recovery-stories',
        slug: 'healing-recovery-stories',
        name: 'Healing & Recovery Stories',
        description: 'Personal journeys of overcoming mental health challenges, trauma, addiction recovery, grief, and transformation.',
        icon: 'HeartPulse',
        color: '#3d8b7f',
        colorSoft: '#eef6f5',
        order: 1,
        isActive: true,
        aiKeywords: ['recovery', 'healing', 'trauma', 'overcome', 'journey', 'survived', 'getting better', 'therapy helped', 'growth'],
    },
    {
        id: 'mind-psychology',
        slug: 'mind-psychology',
        name: 'Mind & Psychology',
        description: 'Insights into mental health conditions, psychological concepts, therapy approaches, and neuroscience.',
        icon: 'Brain',
        color: '#6366f1',
        colorSoft: '#eef2ff',
        order: 2,
        isActive: true,
        aiKeywords: ['anxiety', 'depression', 'OCD', 'ADHD', 'therapy', 'psychology', 'cognitive', 'mental health', 'disorder', 'diagnosis'],
    },
    {
        id: 'awareness-social-education',
        slug: 'awareness-social-education',
        name: 'Awareness & Social Education',
        description: 'Breaking stigma, raising awareness about mental health issues, and educating communities on social and emotional well-being.',
        icon: 'Volume2',
        color: '#f59e0b',
        colorSoft: '#fffbeb',
        order: 3,
        isActive: true,
        aiKeywords: ['stigma', 'awareness', 'mental health day', 'educate', 'society', 'community', 'break the silence', 'normalize'],
    },
    {
        id: 'practical-healing-tools',
        slug: 'practical-healing-tools',
        name: 'Practical Healing Tools',
        description: 'Actionable techniques — breathwork, journaling prompts, mindfulness practices, grounding exercises, and daily habits for well-being.',
        icon: 'Wrench',
        color: '#10b981',
        colorSoft: '#ecfdf5',
        order: 4,
        isActive: true,
        aiKeywords: ['breathwork', 'journaling', 'mindfulness', 'grounding', 'meditation', 'habit', 'technique', 'exercise', 'practice', 'tip'],
    },
    {
        id: 'inspiration-inner-growth',
        slug: 'inspiration-inner-growth',
        name: 'Inspiration & Inner Growth',
        description: 'Motivational stories, wisdom, quotes, and reflections that spark hope, resilience, and personal development.',
        icon: 'Sparkles',
        color: '#f97316',
        colorSoft: '#fff7ed',
        order: 5,
        isActive: true,
        aiKeywords: ['motivated', 'inspired', 'quote', 'growth', 'resilience', 'hope', 'strength', 'wisdom', 'believe', 'journey'],
    },
    {
        id: 'lgbtq',
        slug: 'lgbtq',
        name: 'LGBTQ+',
        description: 'A safe space for LGBTQ+ mental health experiences, identity journeys, coming out stories, and community support.',
        icon: 'Rainbow',
        color: '#ec4899',
        colorSoft: '#fdf2f8',
        order: 6,
        isActive: true,
        aiKeywords: ['lgbtq', 'gay', 'lesbian', 'bisexual', 'transgender', 'queer', 'non-binary', 'coming out', 'pride', 'identity'],
    },
    {
        id: 'parenthood',
        slug: 'parenthood',
        name: 'Parenthood',
        description: 'Mental health in the context of parenting — postpartum experiences, parenting anxiety, raising emotionally healthy children, and family dynamics.',
        icon: 'Users',
        color: '#8b5cf6',
        colorSoft: '#f5f3ff',
        order: 7,
        isActive: true,
        aiKeywords: ['parenting', 'mother', 'father', 'child', 'postpartum', 'family', 'kids', 'baby', 'parental', 'raising children'],
    },
    {
        id: 'senior-citizen',
        slug: 'senior-citizen',
        name: 'Senior Citizen Love & Issues',
        description: 'Mental health, loneliness, life transitions, grief, and wisdom from and for senior citizens and their caregivers.',
        icon: 'Heart',
        color: '#64748b',
        colorSoft: '#f8fafc',
        order: 8,
        isActive: true,
        aiKeywords: ['elderly', 'senior', 'aging', 'loneliness', 'retirement', 'grandparent', 'caregiver', 'old age', 'life review'],
    },
    {
        id: 'intimacy',
        slug: 'intimacy',
        name: 'Intimacy',
        description: 'Emotional and physical intimacy, relationship health, boundaries, vulnerability, attachment styles, and building deep connections.',
        icon: 'Flame',
        color: '#dc2626',
        colorSoft: '#fef2f2',
        order: 9,
        isActive: true,
        aiKeywords: ['intimacy', 'relationship', 'love', 'partner', 'vulnerability', 'attachment', 'connection', 'trust', 'boundaries', 'romance'],
    },
];

/** Get a category object by its slug/id */
export function getCategoryBySlug(slug) {
    return CATEGORIES.find(c => c.slug === slug) || null;
}

/** Get all active categories in display order */
export function getActiveCategories() {
    return CATEGORIES.filter(c => c.isActive).sort((a, b) => a.order - b.order);
}

/** Map from slug → category (for fast lookup in FeedItem) */
export const CATEGORY_MAP = Object.fromEntries(
    CATEGORIES.map(c => [c.slug, c])
);
