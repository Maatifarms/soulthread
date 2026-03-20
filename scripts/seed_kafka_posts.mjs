/**
 * SoulThread — Kafka Philosophical Posts Seeder
 * Creates a KafkaSoch user profile and publishes 30 philosophical Hindi posts.
 *
 * Run with:  node scripts/seed_kafka_posts.mjs
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ── Firebase config ────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBcpOg9-ZKbEDkPGI3hHlrvekwh4PPHrCY",
  authDomain: "soulthread-15a72.firebaseapp.com",
  projectId: "soulthread-15a72",
  storageBucket: "soulthread-15a72.firebasestorage.app",
  messagingSenderId: "813685915255",
  appId: "1:813685915255:web:553165fc25cc38f5121072",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── Kafka user config ──────────────────────────────────────────────────────
const KAFKA_EMAIL = "kafkasoch@soulthread.in";
const KAFKA_PASS = "Kafka@Soch2024";
const KAFKA_USERNAME = "KafkaSoch";
const KAFKA_BIO = "अस्तित्व के प्रश्नों में खोया एक लेखक। — Kafka की नज़र से दुनिया को देखता हूँ।";
const KAFKA_AVATAR = "https://api.dicebear.com/7.x/personas/svg?seed=KafkaSoch&backgroundColor=1a1a1a&clothingColor=2d2d2d";

// ── 30 Kafka-inspired Hindi posts ─────────────────────────────────────────
const POSTS = [
  // 1-10 — Kafka's Struggle (Father, isolation, anxiety)
  {
    content: `पिता की नज़रों में\nमैं हमेशा अधूरा था —\nऔर शायद यही मेरी\nसबसे बड़ी पहचान बन गई।`,
    number: "1/30",
  },
  {
    content: `जब हर दरवाज़ा बंद हो\nतो इंसान खुद से\nशुरू करता है —\nएक नई, अकेली दुनिया।`,
    number: "2/30",
  },
  {
    content: `डर वो नहीं जो\nबाहर से आता है —\nडर वो है जो\nहम खुद के भीतर पालते हैं।`,
    number: "3/30",
  },
  {
    content: `समाज एक भूलभुलैया है\nजिसमें हर मोड़ पर\nएक अनजान नियम\nआपका रास्ता रोकता है।`,
    number: "4/30",
  },
  {
    content: `मैंने लिखा —\nक्योंकि जीना\nउतना आसान नहीं था\nजितना शब्द थे।`,
    number: "5/30",
  },
  {
    content: `पिता का साया\nइतना गहरा था\nकि मैंने खुद को\nउसी छाँव में ढूँढा।`,
    number: "6/30",
  },
  {
    content: `नींद में भी\nवही सवाल आता है —\n"तुम क्या हो?"\nजवाब अब भी नहीं मिला।`,
    number: "7/30",
  },
  {
    content: `अकेलापन कोई\nसज़ा नहीं है —\nयह उन लोगों का\nस्वाभाविक घर है\nजो बहुत गहरा सोचते हैं।`,
    number: "8/30",
  },
  {
    content: `जो व्यवस्था\nहमें चलाती है\nवही हमें\nतोड़ती भी है।`,
    number: "9/30",
  },
  {
    content: `मैंने अपनी\nकहानियाँ जला देने\nको कहा था —\nशायद मुझे पता था\nसच कितना असहनीय होता है।`,
    number: "10/30",
  },

  // 11-20 — Existential Realization (absurdity, identity, systems)
  {
    content: `एक सुबह उठो\nऔर पाओ कि\nतुम कुछ और हो —\nयही अस्तित्व की\nसबसे बड़ी सच्चाई है।`,
    number: "11/30",
  },
  {
    content: `नौकरशाही एक जाल है\nजिसमें हर धागा\nकिसी को दिखता है\nपर कोई किनारा नहीं।`,
    number: "12/30",
  },
  {
    content: `पहचान वो नहीं\nजो दूसरे देते हैं —\nपहचान वो है\nजो दर्पण में\nअकेले दिखती है।`,
    number: "13/30",
  },
  {
    content: `जीवन का कोई\nअर्थ नहीं —\nयह खोज ही\nशायद सबसे बड़ा अर्थ है।`,
    number: "14/30",
  },
  {
    content: `हम सब किसी\nन किसी परीक्षा में\nफँसे हैं —\nजिसके नियम\nहमें कभी नहीं बताए गए।`,
    number: "15/30",
  },
  {
    content: `समझ में न आने वाला\nयह संसार —\nशायद समझने के लिए\nबना ही नहीं था।`,
    number: "16/30",
  },
  {
    content: `मैं हर रोज़\nकुछ नया होता हूँ\nऔर हर रात\nकुछ पुराना खो देता हूँ।`,
    number: "17/30",
  },
  {
    content: `वो दरवाज़ा\nहमेशा खुला था —\nपर पहरेदार ने\nकभी आगे बढ़ने नहीं दिया।`,
    number: "18/30",
  },
  {
    content: `जब कोई\nतुम्हें नहीं समझता\nतो लिखो —\nकागज़ कभी\nजज नहीं करता।`,
    number: "19/30",
  },
  {
    content: `अपराधबोध वही है\nजो बिना किसी\nअपराध के\nआत्मा पर बैठ जाता है।`,
    number: "20/30",
  },

  // 21-30 — Acceptance (suffering, meaning, loneliness of thinkers)
  {
    content: `तकलीफ़ सार्वभौमिक है —\nहर इंसान की\nएक अलग भाषा में\nवही दर्द है।`,
    number: "21/30",
  },
  {
    content: `असफलता कोई\nअंत नहीं —\nयह उन सवालों की\nशुरुआत है\nजो हम टालते रहे।`,
    number: "22/30",
  },
  {
    content: `जो सोचते हैं\nवो अकेले होते हैं —\nयह उनकी\nसज़ा नहीं, उनका\nसम्मान है।`,
    number: "23/30",
  },
  {
    content: `खुद से लड़ना\nसबसे लंबी लड़ाई है —\nऔर उसमें\nहार भी खुद की होती है\nजीत भी।`,
    number: "24/30",
  },
  {
    content: `हर अधूरी\nकहानी में एक\nपूरा सच छिपा है —\nबस उसे\nपढ़ने की हिम्मत चाहिए।`,
    number: "25/30",
  },
  {
    content: `समाज से\nटूटकर भी\nइंसान कुछ बनता है —\nशायद वही\nजो वो सच में था।`,
    number: "26/30",
  },
  {
    content: `दर्द को\nनाम देना\nउसे थोड़ा\nहल्का कर देता है —\nइसीलिए लिखता हूँ।`,
    number: "27/30",
  },
  {
    content: `अर्थ खोजना\nज़रूरी नहीं —\nज़रूरी है\nउस खोज में\nईमानदार रहना।`,
    number: "28/30",
  },
  {
    content: `जिंदगी एक\nबंद कमरे जैसी है —\nहवा आती है\nदरारों से\nपर दरवाज़ा कहाँ है, पता नहीं।`,
    number: "29/30",
  },
  {
    content: `अंत में सिर्फ\nयही बचता है —\nतुमने जो\nमहसूस किया\nवो झूठ नहीं था।`,
    number: "30/30",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
/** Create or sign-in the Kafka user, return the uid */
async function ensureKafkaUser() {
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, KAFKA_EMAIL, KAFKA_PASS);
    uid = cred.user.uid;
    console.log("✅ Created new Firebase Auth user:", uid);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, KAFKA_EMAIL, KAFKA_PASS);
      uid = cred.user.uid;
      console.log("ℹ️  User already exists, signed in:", uid);
    } else {
      throw err;
    }
  }

  // Update display name & photo
  await updateProfile(auth.currentUser, {
    displayName: KAFKA_USERNAME,
    photoURL: KAFKA_AVATAR,
  });

  // Write / merge Firestore user document
  await setDoc(
    doc(db, "users", uid),
    {
      displayName: KAFKA_USERNAME,
      username: KAFKA_USERNAME.toLowerCase(),
      email: KAFKA_EMAIL,
      bio: KAFKA_BIO,
      photoURL: KAFKA_AVATAR,
      role: "user",
      isIncognito: false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("✅ Firestore user profile written.");
  return uid;
}

/** Publish a single post to Firestore */
async function publishPost(uid, postData, index) {
  // Stagger timestamps so posts appear in order (newest = post 30)
  // Each post is 5 minutes apart; post 1 is oldest.
  const BASE_MS = Date.now() - (30 - index) * 5 * 60 * 1000;
  const createdAt = Timestamp.fromMillis(BASE_MS);

  const docRef = await addDoc(collection(db, "posts"), {
    content: postData.content + `\n\n${postData.number}`,
    authorId: uid,
    authorName: KAFKA_USERNAME,
    authorPhoto: KAFKA_AVATAR,
    categoryId: "inspiration-inner-growth",
    categoryName: "Inspiration & Inner Growth",
    createdAt,
    likes: 0,
    comments: 0,
    // Visual style metadata (rendered by SoulThread's FeedItem if supported)
    style: {
      background: "#000000",
      color: "#ffffff",
      textAlign: "center",
      fontFamily: "serif",
    },
    isSensitive: false,
    isAnonymous: false,
    postNumber: index + 1,
    totalPosts: 30,
    seriesId: null,   // NOT a series — individual posts only
  });
  return docRef.id;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🖤  SoulThread — Kafka Philosophical Posts Seeder");
  console.log("=".repeat(50));

  const uid = await ensureKafkaUser();

  console.log(`\n📝 Publishing ${POSTS.length} posts as ${KAFKA_USERNAME}...\n`);

  for (let i = 0; i < POSTS.length; i++) {
    const postId = await publishPost(uid, POSTS[i], i);
    console.log(`  ✅ [${POSTS[i].number}] → ${postId}`);
  }

  console.log("\n🎉 All 30 Kafka posts published successfully!");
  console.log("=".repeat(50));
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
