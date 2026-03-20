
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync('g:/soulthread/soulthread-admin.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function verifySeeding() {
    const BOT_ID = 'heart_shadows_bot';
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.where('authorId', '==', BOT_ID).get();
    
    console.log(`🔍 Verification Results:`);
    console.log(`------------------------`);
    console.log(`Bot ID: ${BOT_ID}`);
    console.log(`Expected Posts: 50`);
    console.log(`Found Posts: ${snapshot.size}`);

    if (snapshot.size >= 50) {
        console.log(`✅ SUCCESS: All posts for HeartShadows are now live.`);
    } else {
        console.log(`❌ FAILURE: Only ${snapshot.size}/50 posts found.`);
    }

    if (snapshot.size > 0) {
        console.log(`\nSample Content:`);
        console.log(`"${snapshot.docs[0].data().content.substring(0, 100)}..."`);
    }
}

verifySeeding().catch(console.error);
