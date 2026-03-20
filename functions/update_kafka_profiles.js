'use strict';
/**
 * Update Kafka user profiles with richer bios
 * Run: node functions/update_kafka_profiles.js
 */
const admin = require('firebase-admin');

admin.initializeApp({
    projectId: 'soulthread-15a72',
    credential: admin.credential.applicationDefault(),
});

const db   = admin.firestore();
const auth = admin.auth();

const PROFILES = [
  {
    email: 'kafkasoch@soulthread.in',
    username: 'KafkaSoch',
    displayName: 'KafkaSoch',
    bio: `"मैं लिखता हूँ क्योंकि जीना उतना सरल नहीं था।"\n\n— Kafka की नज़र से अस्तित्व, अकेलापन और अर्थ की तलाश। 30 दार्शनिक हिंदी पोस्ट्स।`,
    photoURL: 'https://api.dicebear.com/7.x/personas/svg?seed=KafkaSoch&backgroundColor=0a0a0a',
    coverTheme: 'kafka-philosophy',
    postCount: 30,
  },
  {
    email: 'kafkametamorph@soulthread.in',
    username: 'KafkaMetamorph',
    displayName: 'KafkaMetamorph',
    bio: `"एक दिन उठकर पाया — मैं वो नहीं रहा जो था।"\n\n— The Metamorphosis से प्रेरित। रूपांतरण, अकेलापन और परिवार की अस्वीकृति पर 30 दार्शनिक हिंदी पोस्ट्स।`,
    photoURL: 'https://api.dicebear.com/7.x/personas/svg?seed=KafkaMetamorph&backgroundColor=0d0d0d',
    coverTheme: 'kafka-metamorphosis',
    postCount: 30,
  }
];

async function main() {
  console.log('\n🖤  Updating Kafka user profiles...\n');

  for (const p of PROFILES) {
    try {
      const user = await auth.getUserByEmail(p.email);
      const uid = user.uid;

      // Update Auth display name & photo
      await auth.updateUser(uid, {
        displayName: p.displayName,
        photoURL: p.photoURL,
      });

      // Update Firestore profile
      await db.collection('users').doc(uid).set({
        displayName: p.displayName,
        username: p.username.toLowerCase(),
        email: p.email,
        bio: p.bio,
        photoURL: p.photoURL,
        role: 'user',
        isIncognito: false,
        isAnonymous: false,
        coverTheme: p.coverTheme,
        postStyle: 'text',            // signals profile to default to list view
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`✅ Updated: ${p.username} (${uid})`);
      console.log(`   Profile: https://soulthread.in/profile/${uid}\n`);
    } catch (err) {
      console.error(`❌ Failed for ${p.email}:`, err.message);
    }
  }

  console.log('🎉 Both profiles updated!');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
