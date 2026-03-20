/**
 * SoulThread — Kafka Philosophical Posts Admin Seeder
 * Uses Firebase Admin SDK (bypasses Firestore security rules).
 *
 * Run with:  node functions/seed_kafka_admin.js
 * Requires:  firebase-admin already installed in functions/node_modules
 */

'use strict';

const admin = require('firebase-admin');

// Init with app default credentials (picks up firebase CLI token automatically)
admin.initializeApp({
    projectId: 'soulthread-15a72',
    credential: admin.credential.applicationDefault(),
});

const auth = admin.auth();
const db = admin.firestore();

// ── Kafka user config ──────────────────────────────────────────────────────
const KAFKA_EMAIL    = 'kafkasoch@soulthread.in';
const KAFKA_PASS     = 'Kafka@Soch2024';
const KAFKA_USERNAME = 'KafkaSoch';
const KAFKA_BIO      = 'अस्तित्व के प्रश्नों में खोया एक लेखक। — Kafka की नज़र से दुनिया को देखता हूँ।';
const KAFKA_AVATAR   = 'https://api.dicebear.com/7.x/personas/svg?seed=KafkaSoch&backgroundColor=1a1a1a&clothingColor=2d2d2d';

// ── 30 Kafka-inspired Hindi posts ─────────────────────────────────────────
const POSTS = [
  // Phase 1 (1–10): Kafka's Struggle — father, isolation, anxiety, bureaucracy
  {
    content: 'पिता की नज़रों में\nमैं हमेशा अधूरा था —\nऔर शायद यही मेरी\nसबसे बड़ी पहचान बन गई।',
    number: '1/30',
  },
  {
    content: 'जब हर दरवाज़ा बंद हो\nतो इंसान खुद से\nशुरू करता है —\nएक नई, अकेली दुनिया।',
    number: '2/30',
  },
  {
    content: 'डर वो नहीं जो\nबाहर से आता है —\nडर वो है जो\nहम खुद के भीतर पालते हैं।',
    number: '3/30',
  },
  {
    content: 'समाज एक भूलभुलैया है\nजिसमें हर मोड़ पर\nएक अनजान नियम\nआपका रास्ता रोकता है।',
    number: '4/30',
  },
  {
    content: 'मैंने लिखा —\nक्योंकि जीना\nउतना आसान नहीं था\nजितना शब्द थे।',
    number: '5/30',
  },
  {
    content: 'पिता का साया\nइतना गहरा था\nकि मैंने खुद को\nउसी छाँव में ढूँढा।',
    number: '6/30',
  },
  {
    content: 'नींद में भी\nवही सवाल आता है —\n"तुम क्या हो?"\nजवाब अब भी नहीं मिला।',
    number: '7/30',
  },
  {
    content: 'अकेलापन कोई\nसज़ा नहीं है —\nयह उन लोगों का\nस्वाभाविक घर है\nजो बहुत गहरा सोचते हैं।',
    number: '8/30',
  },
  {
    content: 'जो व्यवस्था\nहमें चलाती है\nवही हमें\nतोड़ती भी है।',
    number: '9/30',
  },
  {
    content: 'मैंने अपनी\nकहानियाँ जला देने\nको कहा था —\nशायद मुझे पता था\nसच कितना असहनीय होता है।',
    number: '10/30',
  },

  // Phase 2 (11–20): Existential Realization — absurdity, identity, systems
  {
    content: 'एक सुबह उठो\nऔर पाओ कि\nतुम कुछ और हो —\nयही अस्तित्व की\nसबसे बड़ी सच्चाई है।',
    number: '11/30',
  },
  {
    content: 'नौकरशाही एक जाल है\nजिसमें हर धागा\nकिसी को दिखता है\nपर कोई किनारा नहीं।',
    number: '12/30',
  },
  {
    content: 'पहचान वो नहीं\nजो दूसरे देते हैं —\nपहचान वो है\nजो दर्पण में\nअकेले दिखती है।',
    number: '13/30',
  },
  {
    content: 'जीवन का कोई\nअर्थ नहीं —\nयह खोज ही\nशायद सबसे बड़ा अर्थ है।',
    number: '14/30',
  },
  {
    content: 'हम सब किसी\nन किसी परीक्षा में\nफँसे हैं —\nजिसके नियम\nहमें कभी नहीं बताए गए।',
    number: '15/30',
  },
  {
    content: 'समझ में न आने वाला\nयह संसार —\nशायद समझने के लिए\nबना ही नहीं था।',
    number: '16/30',
  },
  {
    content: 'मैं हर रोज़\nकुछ नया होता हूँ\nऔर हर रात\nकुछ पुराना खो देता हूँ।',
    number: '17/30',
  },
  {
    content: 'वो दरवाज़ा\nहमेशा खुला था —\nपर पहरेदार ने\nकभी आगे बढ़ने नहीं दिया।',
    number: '18/30',
  },
  {
    content: 'जब कोई\nतुम्हें नहीं समझता\nतो लिखो —\nकागज़ कभी\nजज नहीं करता।',
    number: '19/30',
  },
  {
    content: 'अपराधबोध वही है\nजो बिना किसी\nअपराध के\nआत्मा पर बैठ जाता है।',
    number: '20/30',
  },

  // Phase 3 (21–30): Acceptance — suffering, meaning, loneliness of thinkers
  {
    content: 'तकलीफ़ सार्वभौमिक है —\nहर इंसान की\nएक अलग भाषा में\nवही दर्द है।',
    number: '21/30',
  },
  {
    content: 'असफलता कोई\nअंत नहीं —\nयह उन सवालों की\nशुरुआत है\nजो हम टालते रहे।',
    number: '22/30',
  },
  {
    content: 'जो सोचते हैं\nवो अकेले होते हैं —\nयह उनकी\nसज़ा नहीं, उनका\nसम्मान है।',
    number: '23/30',
  },
  {
    content: 'खुद से लड़ना\nसबसे लंबी लड़ाई है —\nऔर उसमें\nहार भी खुद की होती है\nजीत भी।',
    number: '24/30',
  },
  {
    content: 'हर अधूरी\nकहानी में एक\nपूरा सच छिपा है —\nबस उसे\nपढ़ने की हिम्मत चाहिए।',
    number: '25/30',
  },
  {
    content: 'समाज से\nटूटकर भी\nइंसान कुछ बनता है —\nशायद वही\nजो वो सच में था।',
    number: '26/30',
  },
  {
    content: 'दर्द को\nनाम देना\nउसे थोड़ा\nहल्का कर देता है —\nइसीलिए लिखता हूँ।',
    number: '27/30',
  },
  {
    content: 'अर्थ खोजना\nज़रूरी नहीं —\nज़रूरी है\nउस खोज में\nईमानदार रहना।',
    number: '28/30',
  },
  {
    content: 'जिंदगी एक\nबंद कमरे जैसी है —\nहवा आती है\nदरारों से\nपर दरवाज़ा कहाँ है, पता नहीं।',
    number: '29/30',
  },
  {
    content: 'अंत में सिर्फ\nयही बचता है —\nतुमने जो\nमहसूस किया\nवो झूठ नहीं था।',
    number: '30/30',
  },
];

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🖤  SoulThread — Kafka Admin Seeder (firebase-admin)');
  console.log('='.repeat(55));

  // ── Step 1: Create / get Firebase Auth user ──────────────────────────────
  let uid;
  try {
    const existing = await auth.getUserByEmail(KAFKA_EMAIL);
    uid = existing.uid;
    console.log('ℹ️  Auth user already exists:', uid);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: KAFKA_EMAIL,
        password: KAFKA_PASS,
        displayName: KAFKA_USERNAME,
        photoURL: KAFKA_AVATAR,
        emailVerified: true,
      });
      uid = newUser.uid;
      console.log('✅ Created Auth user:', uid);
    } else {
      throw err;
    }
  }

  // Update display name & photo always (idempotent)
  await auth.updateUser(uid, {
    displayName: KAFKA_USERNAME,
    photoURL: KAFKA_AVATAR,
    emailVerified: true,
  });

  // ── Step 2: Write Firestore user profile ─────────────────────────────────
  await db.collection('users').doc(uid).set(
    {
      displayName: KAFKA_USERNAME,
      username: KAFKA_USERNAME.toLowerCase(),
      email: KAFKA_EMAIL,
      bio: KAFKA_BIO,
      photoURL: KAFKA_AVATAR,
      role: 'user',
      isIncognito: false,
      isAnonymous: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log('✅ Firestore user profile written for uid:', uid);

  // ── Step 3: Publish 30 posts ──────────────────────────────────────────────
  console.log(`\n📝 Publishing ${POSTS.length} posts as ${KAFKA_USERNAME}...\n`);

  const now = Date.now();

  for (let i = 0; i < POSTS.length; i++) {
    const postData = POSTS[i];
    // Stagger timestamps: post 1 is oldest (≈2.5hrs ago), post 30 is newest
    const offsetMs = (POSTS.length - 1 - i) * 5 * 60 * 1000;
    const createdAt = admin.firestore.Timestamp.fromMillis(now - offsetMs);

    const fullContent = postData.content + '\n\n' + postData.number;

    const docRef = await db.collection('posts').add({
      content: fullContent,
      authorId: uid,
      authorName: KAFKA_USERNAME,
      authorPhoto: KAFKA_AVATAR,
      categoryId: 'inspiration-inner-growth',
      categoryName: 'Inspiration & Inner Growth',
      createdAt,
      likes: 0,
      likeCount: 0,
      commentsCount: 0,
      reactionCounts: {},
      style: {
        background: '#000000',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'serif',
      },
      isSensitive: false,
      isAnonymous: false,
      circleId: null,
      postNumber: i + 1,
      totalPosts: 30,
      seriesId: null,
    });

    console.log(`  ✅ [${postData.number}] → ${docRef.id}`);
  }

  console.log('\n🎉 All 30 Kafka posts published successfully!');
  console.log('='.repeat(55));
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message || err);
  process.exit(1);
});
