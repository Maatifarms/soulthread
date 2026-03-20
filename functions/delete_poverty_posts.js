/**
 * delete_poverty_posts.js
 * Run with: node functions/delete_poverty_posts.js
 * Deletes all posts by confession_truth_bot (poverty-themed seeded content)
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function deletePovertyPosts() {
    console.log('🔍 Searching for poverty posts by confession_truth_bot...');

    const snapshot = await db.collection('posts')
        .where('authorId', '==', 'confession_truth_bot')
        .get();

    if (snapshot.empty) {
        console.log('✅ No posts found for confession_truth_bot. Already cleaned up!');
        process.exit(0);
    }

    console.log(`🗑️  Found ${snapshot.size} posts to delete...`);

    // Delete in batches of 500 (Firestore limit)
    const batchSize = 400;
    const docs = snapshot.docs;
    let deleted = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = docs.slice(i, i + batchSize);
        chunk.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        deleted += chunk.length;
        console.log(`  ✓ Deleted ${deleted}/${docs.length} posts`);
    }

    console.log(`\n✅ Done! Deleted all ${deleted} poverty posts from the feed.`);
    process.exit(0);
}

deletePovertyPosts().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
