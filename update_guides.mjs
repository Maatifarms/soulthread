import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcpOg9-ZKbEDkPGI3hHlrvekwh4PPHrCY",
  authDomain: "soulthread-15a72.firebaseapp.com",
  projectId: "soulthread-15a72",
  storageBucket: "soulthread-15a72.firebasestorage.app",
  messagingSenderId: "813685915255",
  appId: "1:813685915255:web:553165fc25cc38f5121072",
  measurementId: "G-S96ZQPBJLJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const guides = [
  { email: "anchalmaurya406@gmail.com", password: "Passsoul@1" },
  { email: "bhavyajha.bhu@gmail.com", password: "Passsoul@1" }
];

async function updateGuides() {
  for (const guide of guides) {
    try {
      console.log(`Signing in ${guide.email}...`);
      const userCredential = await signInWithEmailAndPassword(auth, guide.email, guide.password);
      const user = userCredential.user;
      
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        await updateDoc(userRef, {
          role: "guide",
          isVerified: true
        });
        console.log(`Updated role for ${guide.email} (${user.uid})`);
      } else {
        await setDoc(userRef, {
          email: guide.email,
          name: guide.email.split('@')[0],
          role: "guide",
          photoURL: "",
          createdAt: serverTimestamp(),
          about: "Professional Psychologist",
          languages: ["English", "Hindi"],
          specialization: "Therapy",
          sessionRate: 500,
          experience: "5+ years",
          isVerified: true
        });
        console.log(`Created document and set role for ${guide.email} (${user.uid})`);
      }
    } catch (error) {
      console.error(`Error updating ${guide.email}:`, error);
    }
  }
  process.exit(0);
}

updateGuides();
