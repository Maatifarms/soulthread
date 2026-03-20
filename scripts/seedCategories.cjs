/**
 * SoulThread — Firestore Category Seed Script
 *
 * Seeds the `categories` collection with all 9 SoulThread categories.
 * Uses the slug as the document ID for stable lookups.
 *
 * Run once (or re-run safely — it uses set() with merge):
 *   node scripts/seedCategories.cjs
 *
 * Requirements:
 *   npm install firebase-admin
 *   Place your serviceAccountKey.json in the project root.
 */

const admin = require('firebase-admin');
const path = require('path');

// ── Firebase Admin init ────────────────────────────────
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

let serviceAccount;
try {
    serviceAccount = require(serviceAccountPath);
} catch (e) {
    console.error('❌ serviceAccountKey.json not found at project root.');
    console.error('   Download it from Firebase Console → Project Settings → Service accounts');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── Category Data ──────────────────────────────────────
const CATEGORIES = [
    {
        id: 'healing-recovery-stories',
        slug: 'healing-recovery-stories',
        name: 'Healing & Recovery Stories',
        description: 'Personal journeys of overcoming mental health challenges, trauma, addiction recovery, grief, and transformation.',
        icon: '🌱',
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
        icon: '🧠',
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
        icon: '📢',
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
        description: 'Actionable techniques — breathwork, journaling prompts, mindfulness practices, grounding exercises, and daily habits.',
        icon: '🛠️',
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
        icon: '✨',
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
        icon: '🏳️‍🌈',
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
        description: 'Mental health in the context of parenting — postpartum experiences, parenting anxiety, raising emotionally healthy children.',
        icon: '👨‍👩‍👧',
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
        icon: '🤍',
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
        description: 'Emotional and physical intimacy, relationship health, boundaries, vulnerability, attachment styles, and deep connections.',
        icon: '💛',
        color: '#dc2626',
        colorSoft: '#fef2f2',
        order: 9,
        isActive: true,
        aiKeywords: ['intimacy', 'relationship', 'love', 'partner', 'vulnerability', 'attachment', 'connection', 'trust', 'boundaries', 'romance'],
    },
];

// ── Seed Function ──────────────────────────────────────
async function seedCategories() {
    console.log('🌱 Seeding SoulThread categories to Firestore...\n');

    const batch = db.batch();
    const collectionRef = db.collection('categories');

    for (const cat of CATEGORIES) {
        const docRef = collectionRef.doc(cat.slug); // slug = document ID
        batch.set(docRef, {
            ...cat,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            postCount: 0,  // Will be incremented by AI categorization
        }, { merge: true }); // merge: safe to re-run
        console.log(`  ✅ Queued: [${cat.order}] ${cat.icon} ${cat.name} (${cat.slug})`);
    }

    await batch.commit();

    console.log(`\n✨ Done! ${CATEGORIES.length} categories seeded to Firestore.`);
    console.log('\n📋 Collection: categories');
    console.log('📌 Document IDs: (slug used as ID for stable references)\n');
    CATEGORIES.forEach(c => console.log(`   ${c.slug}`));
    console.log('\n🔜 Next phase: AI auto-categorization will populate the `categoryId` field on each post document.\n');

    process.exit(0);
}

seedCategories().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
