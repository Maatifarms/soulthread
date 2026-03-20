
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccountPath = 'g:/soulthread/soulthread-admin.json';
if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ Key missing. Seeding must be done before verification.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function verifyPoverty() {
    const BOT_ID = 'gully_voices_bot';
    const snapshot = await db.collection('posts').where('authorId', '==', BOT_ID).get();
    
    console.log(`🔍 Poverty Seeding Check:`);
    console.log(`Found: ${snapshot.size}/50 posts`);
    
    if (snapshot.size > 0) {
        console.log(`Latest Story: "${snapshot.docs[0].data().content.substring(0, 100)}..."`);
    }
}

verifyPoverty().catch(console.error);
