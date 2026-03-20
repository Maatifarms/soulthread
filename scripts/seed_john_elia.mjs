/**
 * SoulThread — John Elia Poetry Seeder
 * Creates the John Elia profile and publishes 12 classical Hindi poetic posts.
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

// Firebase config (matches existing project config)
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

const ELIA_EMAIL = "johnelia@soulthread.in";
const ELIA_PASS = "JohnElia@Legacy2024";
const ELIA_USERNAME = "John_Elia_Sahib";
const ELIA_DISPLAY = "John Elia Sahib";
const ELIA_BIO = "शायर, दार्शनिक और बेचैन रूह। ज़िंदगी के ग़मों को शब्दों में पिरोने वाला एक मुसाफ़िर।";
const ELIA_AVATAR = "https://api.dicebear.com/7.x/personas/svg?seed=JohnElia&backgroundColor=1a1a1a";

const POSTS = [
  {
    content: `अब तो जी टूट कर भी गुज़र जाए\nज़िन्दगी से कोई शिकायत नहीं\nजिसके ग़म में सबको माफ़ कर दिया\nअब किसी से कोई शिकायत नहीं`,
  },
  {
    content: `तुम जब आओगी तो खोया हुआ पाओगी मुझे\nमेरी तन्हाई में ख़्वाबों के सिवा कुछ भी नहीं\nमेरे कमरे को सजाने की तमन्ना है तुम्हें\nमेरे कमरे में किताबों के सिवा कुछ भी नहीं`,
  },
  {
    content: `इन किताबों ने बड़ा जुल्म किया है मुझ पर\nइनमें एक रमज़ है जिस रमज़ का मारा हुआ ज़हन\nमस्त-ए-इशारा-ए-अनजाम नहीं हो सकता\nज़िन्दगी में कभी आराम नहीं हो सकता`,
  },
  {
    content: `वो जो न आने वाला है न उससे हमको मतलब था\nआने वालों से क्या मतलब आते हैं आते होंगे\nयारो कुछ तो हाल सुनाओ उसकी कयामत बाहों का\nवो जो सिमटते होंगे उनमें वो तो मर जाते होंगे`,
  },
  {
    content: `मैं भी बहुत अजीब हूँ इतना अजीब हूँ कि बस\nखुद को तबाह कर लिया और मलाल भी नहीं\nक्या सितम है कि हम लोग मर जाएंगे\nमेरी अक्ल-ओ-होश की सब हालतें ही धूप हैं`,
  },
  {
    content: `मुस्कुराए हम उससे मिलते वक्त\nरोना पड़ता अगर खुशी होती\nदिल में जिसका निशान भी न रहा\nक्यों न चेहरों पे अब वो रंग खिलें`,
  },
  {
    content: `तुम हकीकत नहीं हो हसरत हो\nजो मिले ख़्वाब में वो दौलत हो\nतुम हो खुशबू के ख़त की खुशबू\nऔर कितने ही बेमुरव्वत हो`,
  },
  {
    content: `ये मुझे चैन क्यूँ नहीं पड़ता\nएक ही शख्स था जहान में क्या\nअब मैं सारे जहाँ में हूँ बदनाम\nक्या तुम अब भी मुझको जानती हो क्या`,
  },
  {
    content: `वो बोलते क्यों नहीं मेरे हक़ में\nआबले पड़ गए ज़बान में क्या\nशाम ही से दुकान-ए-दिल है बंद\nनहीं नुकसान क्या दुकान में क्या`,
  },
  {
    content: `कितने ज़ालिम हैं जो ये कहते हैं\nतोड़ लो फूल फूल छोड़ो मत\nबागवान हम तो इस ख़याल के हैं\nदेख लो फूल फूल छोड़ो मत`,
  },
  {
    content: `सोचता हूँ कि तेरी याद आख़िर\nअब किस रात भर जगाती है\nक्या सितम है कि गौर करने पर\nतेरी याद भी अब नहीं आती है`,
  },
  {
    content: `ज़ुर्म के तसव्वुर में अगर ये ख़त लिखे तुमने\nफिर तो मेरी राय में ज़ुर्म ही किया तुमने\nगर ख़याल आने पर उससे डर गई हो तुम\nतो अपनी बेख़याली में ही तुम झूम लिया करो`,
  }
];

async function run() {
  console.log("🖋️ Seeding John Elia Profile and Posts...");
  
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, ELIA_EMAIL, ELIA_PASS);
    uid = cred.user.uid;
    console.log("✅ Created new Auth user:", uid);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, ELIA_EMAIL, ELIA_PASS);
        uid = cred.user.uid;
        console.log("ℹ️ User already exists, signed in:", uid);
    } else {
        throw err;
    }
  }

  await updateProfile(auth.currentUser, { displayName: ELIA_DISPLAY, photoURL: ELIA_AVATAR });
  await setDoc(doc(db, "users", uid), {
    displayName: ELIA_DISPLAY,
    username: ELIA_USERNAME.toLowerCase(),
    email: ELIA_EMAIL,
    bio: ELIA_BIO,
    photoURL: ELIA_AVATAR,
    role: "user",
    createdAt: serverTimestamp(),
  }, { merge: true });

  console.log(`📝 Publishing ${POSTS.length} posts...`);

  for (let i = 0; i < POSTS.length; i++) {
    const time = Timestamp.fromMillis(Date.now() - (POSTS.length - i) * 3600000); // 1 hour apart
    await addDoc(collection(db, "posts"), {
      content: POSTS[i].content + "\n\n— जॉन एलिया",
      authorId: uid,
      authorName: ELIA_DISPLAY,
      authorPhoto: ELIA_AVATAR,
      categoryId: "healing",
      categoryName: "Healing",
      createdAt: time,
      likes: 0,
      comments: 0,
      style: { 
        background: "#000000", 
        color: "#ffffff", 
        textAlign: "center", 
        fontFamily: "serif",
        padding: "30px",
        borderRadius: "20px"
      }
    });
    console.log(`  ✅ Post ${i+1} published.`);
  }
  console.log("\n🎉 All John Elia posts published successfully!");
  process.exit(0);
}

run().catch(console.error);
