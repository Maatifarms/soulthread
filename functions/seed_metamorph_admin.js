'use strict';

/**
 * SoulThread — KafkaMetamorph Posts Admin Seeder
 * Inspired by Franz Kafka's "The Metamorphosis"
 *
 * Run with:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\acer\AppData\Roaming\firebase\rupesh2510_gmail_com_application_default_credentials.json"
 *   node seed_metamorph_admin.js
 */

const admin = require('firebase-admin');

admin.initializeApp({
    projectId: 'soulthread-15a72',
    credential: admin.credential.applicationDefault(),
});

const auth = admin.auth();
const db   = admin.firestore();

// ── User config ─────────────────────────────────────────────────────────────
const EMAIL    = 'kafkametamorph@soulthread.in';
const PASS     = 'Kafka@Morph2024';
const USERNAME = 'KafkaMetamorph';
const BIO      = 'एक दिन अचानक जाग कर पाया — मैं वो नहीं रहा जो था। — The Metamorphosis की छाँव में।';
const AVATAR   = 'https://api.dicebear.com/7.x/personas/svg?seed=KafkaMetamorph&backgroundColor=0d0d0d&clothingColor=1a1a1a';

// ── 30 posts — three-phase progression ──────────────────────────────────────
// Phase 1 (1–10):  Confusion, identity loss, transformation
// Phase 2 (11–20): Isolation, family rejection, silent suffering
// Phase 3 (21–30): Acceptance, philosophical reflection, existential peace
const POSTS = [
  {
    content: `एक दिन अचानक\nतुम खुद को पहचानना बंद कर देते हो।\n\nआईने में चेहरा वही रहता है,\nपर अंदर कोई और जन्म ले चुका होता है।`,
    number: '1/30',
  },
  {
    content: `रूपांतरण कोई घटना नहीं —\nयह एक धीमी, खामोश प्रक्रिया है\nजो तब पूरी होती है\nजब कोई देख नहीं रहा होता।`,
    number: '2/30',
  },
  {
    content: `सुबह उठकर लगा —\nमैं वही हूँ, पर मेरे होने का अर्थ\nरात में ही कहीं\nखो गया।`,
    number: '3/30',
  },
  {
    content: `जब तुम बदलते हो\nतो दुनिया नहीं बदलती —\nसिर्फ तुम्हारे लिए\nदरवाज़े बंद होने लगते हैं।`,
    number: '4/30',
  },
  {
    content: `सबसे बड़ा डर\nयह नहीं कि दुनिया तुम्हें नहीं समझेगी —\nसबसे बड़ा डर यह है\nकि तुम खुद को नहीं समझ पाओगे।`,
    number: '5/30',
  },
  {
    content: `पहचान एक पतला धागा है —\nएक झटके में टूट सकती है।\nफिर पूरी ज़िंदगी\nउसे जोड़ने में बीत जाती है।`,
    number: '6/30',
  },
  {
    content: `मैं अजनबी नहीं था दुनिया में —\nमैं अजनबी था खुद अपने घर में।\nयह दूरी सबसे\nज़्यादा चुभती है।`,
    number: '7/30',
  },
  {
    content: `जब कोई तुम्हें\nपहले जैसा नहीं देखता\nतो तुम खुद भी सोचने लगते हो —\nशायद मैं सच में बदल गया।`,
    number: '8/30',
  },
  {
    content: `हर इंसान\nएक बार किसी सुबह उठकर\nपाता है —\nकि वो कुछ और हो गया है।`,
    number: '9/30',
  },
  {
    content: `रूप बदल जाए\nतो क्या आत्मा भी बदलती है?\nया आत्मा वही रहती है\nऔर दुनिया उसे नया नाम दे देती है?`,
    number: '10/30',
  },

  // Phase 2 — Isolation, family rejection, silent suffering
  {
    content: `जब तक मैं कमाता था\nमैं परिवार था।\n\nजब टूट गया,\nमैं सिर्फ एक बोझ बन गया।`,
    number: '11/30',
  },
  {
    content: `घर वही था,\nलोग वही थे —\nपर अब उनकी आँखों में\nमेरी जगह नहीं थी।`,
    number: '12/30',
  },
  {
    content: `प्रेम की परीक्षा\nसुख में नहीं होती —\nवो तब होती है\nजब तुम काम के नहीं रहते।`,
    number: '13/30',
  },
  {
    content: `चुप्पी भी एक भाषा है —\nजो तब बोली जाती है\nजब दर्द के लिए\nकोई शब्द नहीं बचते।`,
    number: '14/30',
  },
  {
    content: `मैं वहाँ था\nपर जैसे था ही नहीं।\nदिखना और देखा जाना —\nदो अलग बातें हैं।`,
    number: '15/30',
  },
  {
    content: `जो उपयोगी नहीं\nवो प्रिय कैसे हो सकता है —\nयह सवाल मैंने नहीं पूछा,\nपर ज़िंदगी ने जवाब दे दिया।`,
    number: '16/30',
  },
  {
    content: `अदृश्य होना\nमृत्यु से भी कठिन है —\nक्योंकि मृत्यु में\nकम से कम एक बार याद किया जाता है।`,
    number: '17/30',
  },
  {
    content: `जो दरवाज़ा\nकभी मेरे लिए खुलता था\nअब उसी के पीछे से\nमेरी साँसें सुनी जाती थीं।`,
    number: '18/30',
  },
  {
    content: `परिवार भी\nएक समाज होता है —\nजो कमज़ोर को\nहौले-हौले बाहर कर देता है।`,
    number: '19/30',
  },
  {
    content: `सबसे गहरा अकेलापन\nभीड़ में नहीं —\nअपने ही घर में\nपराया महसूस होना है।`,
    number: '20/30',
  },

  // Phase 3 — Acceptance, philosophical reflection, existential peace
  {
    content: `इंसान की क़ीमत\nउसकी उपयोगिता में नहीं —\nपर दुनिया ने\nयह बात कभी नहीं मानी।`,
    number: '21/30',
  },
  {
    content: `कभी-कभी छोड़ देना\nहार नहीं होती —\nयह उन लोगों की शांति है\nजो बहुत थक चुके होते हैं।`,
    number: '22/30',
  },
  {
    content: `जो टूटा है\nवो बेकार नहीं —\nटूटी हुई चीज़ों में\nएक अलग रोशनी होती है।`,
    number: '23/30',
  },
  {
    content: `मैंने जब मुक्ति को समझा\nतो पाया —\nमुक्ति बाहर से नहीं\nभीतर से आती है।`,
    number: '24/30',
  },
  {
    content: `जिस शरीर को\nदुनिया ने नकारा —\nउसमें भी\nएक आत्मा रहती थी।`,
    number: '25/30',
  },
  {
    content: `अस्तित्व का अर्थ\nदूसरों की स्वीकृति नहीं —\nपर यह जानने में\nपूरी उम्र लग जाती है।`,
    number: '26/30',
  },
  {
    content: `जीवन की विडंबना यह है —\nजो सबसे ज़्यादा महसूस करते हैं,\nवही सबसे ज़्यादा\nनज़रअंदाज़ किए जाते हैं।`,
    number: '27/30',
  },
  {
    content: `बदलाव से डरो मत —\nडरो उस जड़ता से\nजो तुम्हें वही रखती है\nजहाँ तुम्हें नहीं रहना चाहिए।`,
    number: '28/30',
  },
  {
    content: `अंत में इंसान को\nबस यही समझ आता है —\nजो था, वो था।\nजो है, वो काफ़ी है।`,
    number: '29/30',
  },
  {
    content: `काया बदल जाए\nतो भी आत्मा की\nएक आवाज़ होती है —\nजो हमेशा सच बोलती है।`,
    number: '30/30',
  },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🪲  SoulThread — KafkaMetamorph Seeder (The Metamorphosis)');
  console.log('='.repeat(58));

  // Step 1: Create / get Auth user
  let uid;
  try {
    const existing = await auth.getUserByEmail(EMAIL);
    uid = existing.uid;
    console.log('ℹ️  Auth user already exists:', uid);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: EMAIL,
        password: PASS,
        displayName: USERNAME,
        photoURL: AVATAR,
        emailVerified: true,
      });
      uid = newUser.uid;
      console.log('✅ Created Auth user:', uid);
    } else throw err;
  }

  await auth.updateUser(uid, {
    displayName: USERNAME,
    photoURL: AVATAR,
    emailVerified: true,
  });

  // Step 2: Write Firestore user profile
  await db.collection('users').doc(uid).set(
    {
      displayName: USERNAME,
      username: USERNAME.toLowerCase(),
      email: EMAIL,
      bio: BIO,
      photoURL: AVATAR,
      role: 'user',
      isIncognito: false,
      isAnonymous: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log('✅ Firestore user profile written. UID:', uid);

  // Step 3: Publish 30 posts
  console.log(`\n📝 Publishing ${POSTS.length} posts as ${USERNAME}...\n`);

  const now = Date.now();

  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    // Post 1 is oldest (≈2.5 hrs ago), post 30 is newest — 5 min apart
    const offsetMs = (POSTS.length - 1 - i) * 5 * 60 * 1000;
    const createdAt = admin.firestore.Timestamp.fromMillis(now - offsetMs);

    const ref = await db.collection('posts').add({
      content: p.content + '\n\n' + p.number,
      authorId: uid,
      authorName: USERNAME,
      authorPhoto: AVATAR,
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

    console.log(`  ✅ [${p.number}] → ${ref.id}`);
  }

  console.log('\n🎉 All 30 Metamorphosis posts published successfully!');
  console.log('='.repeat(58));
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message || err);
  process.exit(1);
});
