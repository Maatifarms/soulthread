import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcpOg9-ZKbEDkPGI3hHlrvekwh4PPHrCY",
  authDomain: "soulthread-15a72.firebaseapp.com",
  projectId: "soulthread-15a72",
  storageBucket: "soulthread-15a72.firebasestorage.app",
  messagingSenderId: "813685915255",
  appId: "1:813685915255:web:553165fc25cc38f5121072"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupGuide(email, password, displayName) {
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    uid = cred.user.uid;
    console.log(`Created user ${email} with UID ${uid}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`${email} already exists. Attempting sign-in...`);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      console.log(`Signed in ${email} with UID ${uid}`);
    } else {
      console.error(`Error for ${email}:`, error);
      return;
    }
  }

  // At this point we are logged in as the user
  console.log(`Writing guide data for ${email}...`);
  await setDoc(doc(db, "guides", uid), {
    name: displayName,
    email: email,
    bio: "Professional guide at SoulThread",
    experience: "Licensed emotional well-being professional",
    availability: [],
    isCalendarOpen: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, { merge: true });

  await setDoc(doc(db, "users", uid), {
    role: "guide",
    displayName: displayName,
    email: email
  }, { merge: true });

  console.log(`Successfully made ${email} a guide.`);
  await signOut(auth);
}

async function main() {
  await setupGuide("anchalmaurya406@gmail.com", "Passsoul@1", "Anchal");
  await setupGuide("bhavyajha.bhu@gmail.com", "Passsoul@1", "Bhavya");
  await setupGuide("rupesh2510@gmail.com", "Passsoul@1", "Rupesh");
  console.log("All done!");
  process.exit(0);
}

main();
