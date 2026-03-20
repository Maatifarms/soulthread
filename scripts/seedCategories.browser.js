/**
 * SoulThread — Browser-Executable Category Seed
 * 
 * HOW TO USE:
 * 1. Open https://soulthread.in in your browser
 * 2. Log in as admin
 * 3. Open DevTools Console (F12 → Console tab)
 * 4. Paste this ENTIRE script and press Enter
 * 5. Wait for "✅ Done! 9 categories seeded." message
 * 
 * This is a one-time setup. Safe to re-run (uses setDoc with merge).
 */

(async () => {
    const { getFirestore, doc, setDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');

    // Get the existing Firestore instance from the app
    const db = window.__soulthread_db || getFirestore();

    const CATEGORIES = [
        { id: 'healing-recovery-stories', name: 'Healing & Recovery Stories', icon: '🌱', color: '#3d8b7f', colorSoft: '#eef6f5', order: 1, description: 'Personal journeys of overcoming mental health challenges, trauma, addiction recovery, grief, and transformation.', aiKeywords: ['recovery', 'healing', 'trauma', 'overcome', 'journey', 'survived', 'getting better', 'therapy helped', 'growth'] },
        { id: 'mind-psychology', name: 'Mind & Psychology', icon: '🧠', color: '#6366f1', colorSoft: '#eef2ff', order: 2, description: 'Insights into mental health conditions, psychological concepts, therapy approaches, and neuroscience.', aiKeywords: ['anxiety', 'depression', 'OCD', 'ADHD', 'therapy', 'psychology', 'cognitive', 'mental health', 'disorder', 'diagnosis'] },
        { id: 'awareness-social-education', name: 'Awareness & Social Education', icon: '📢', color: '#f59e0b', colorSoft: '#fffbeb', order: 3, description: 'Breaking stigma, raising awareness about mental health issues, and educating communities.', aiKeywords: ['stigma', 'awareness', 'mental health day', 'educate', 'society', 'community', 'break the silence', 'normalize'] },
        { id: 'practical-healing-tools', name: 'Practical Healing Tools', icon: '🛠️', color: '#10b981', colorSoft: '#ecfdf5', order: 4, description: 'Actionable techniques — breathwork, journaling prompts, mindfulness practices, grounding exercises.', aiKeywords: ['breathwork', 'journaling', 'mindfulness', 'grounding', 'meditation', 'habit', 'technique', 'exercise', 'practice', 'tip'] },
        { id: 'inspiration-inner-growth', name: 'Inspiration & Inner Growth', icon: '✨', color: '#f97316', colorSoft: '#fff7ed', order: 5, description: 'Motivational stories, wisdom, quotes, and reflections that spark hope, resilience, and personal development.', aiKeywords: ['motivated', 'inspired', 'quote', 'growth', 'resilience', 'hope', 'strength', 'wisdom', 'believe', 'journey'] },
        { id: 'lgbtq', name: 'LGBTQ+', icon: '🏳️‍🌈', color: '#ec4899', colorSoft: '#fdf2f8', order: 6, description: 'A safe space for LGBTQ+ mental health experiences, identity journeys, coming out stories, and community support.', aiKeywords: ['lgbtq', 'gay', 'lesbian', 'bisexual', 'transgender', 'queer', 'non-binary', 'coming out', 'pride', 'identity'] },
        { id: 'parenthood', name: 'Parenthood', icon: '👨‍👩‍👧', color: '#8b5cf6', colorSoft: '#f5f3ff', order: 7, description: 'Mental health in the context of parenting — postpartum experiences, parenting anxiety, raising emotionally healthy children.', aiKeywords: ['parenting', 'mother', 'father', 'child', 'postpartum', 'family', 'kids', 'baby', 'parental', 'raising children'] },
        { id: 'senior-citizen', name: 'Senior Citizen Love & Issues', icon: '🤍', color: '#64748b', colorSoft: '#f8fafc', order: 8, description: 'Mental health, loneliness, life transitions, grief, and wisdom from and for senior citizens and their caregivers.', aiKeywords: ['elderly', 'senior', 'aging', 'loneliness', 'retirement', 'grandparent', 'caregiver', 'old age', 'life review'] },
        { id: 'intimacy', name: 'Intimacy', icon: '💛', color: '#dc2626', colorSoft: '#fef2f2', order: 9, description: 'Emotional and physical intimacy, relationship health, boundaries, vulnerability, attachment styles, and deep connections.', aiKeywords: ['intimacy', 'relationship', 'love', 'partner', 'vulnerability', 'attachment', 'connection', 'trust', 'boundaries', 'romance'] },
    ];

    console.log('🌱 Seeding SoulThread categories...\n');

    for (const cat of CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), {
            ...cat,
            slug: cat.id,
            isActive: true,
            postCount: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }, { merge: true });
        console.log(`✅ ${cat.order}. ${cat.icon} ${cat.name}`);
    }

    console.log('\n🎉 Done! 9 categories seeded to Firestore "categories" collection.');
    console.log('📌 Each category uses its slug as the document ID.');
    console.log('🔜 Phase 2: AI will auto-populate categoryId on posts.\n');
})();
