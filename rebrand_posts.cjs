
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Load service account (using the user's environment variable or path if known, 
// but here I'll try to find any existing config or just use the project ID)
const serviceAccount = JSON.parse(fs.readFileSync('g:/soulthread/soulthread-admin.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function rebrandPosts(botId) {
    console.log(`🚀 Rebranding posts for bot: ${botId}...`);
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.where('authorId', '==', botId).get();

    if (snapshot.empty) {
        console.log(`❌ No posts found for ${botId}.`);
        return;
    }

    console.log(`Found ${snapshot.size} posts. Updating...`);
    
    let updated = 0;
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
            isIncognito: false,
            authorIsAnonymous: false
        });
        updated++;
    });

    await batch.commit();
    console.log(`✅ Successfully updated ${updated} posts for ${botId}.`);
}

async function main() {
    try {
        await rebrandPosts('confession_truth_bot');
        await rebrandPosts('corporate_diary_india_bot');
    } catch (error) {
        console.error('❌ Error during rebranding:', error);
    }
}

main();
