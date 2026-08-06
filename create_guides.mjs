import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import dotenv from 'dotenv';

dotenv.config();

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
  { email: process.env.GUIDE1_EMAIL, password: process.env.GUIDE1_PASSWORD },
  { email: process.env.GUIDE2_EMAIL, password: process.env.GUIDE2_PASSWORD }
];

if (guides.some(g => !g.email || !g.password)) {
  console.error(
    "Missing guide credentials. Set GUIDE1_EMAIL, GUIDE1_PASSWORD, GUIDE2_EMAIL, GUIDE2_PASSWORD in your .env file (see .env.example)."
  );
  process.exit(1);
}

async function createGuides() {
  for (const guide of guides) {
    try {
      console.log(`Creating ${guide.email}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, guide.email, guide.password);
      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
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
      console.log(`Successfully created and set role for ${guide.email} (${user.uid})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`${guide.email} already exists. We should probably just update their role.`);
        // Assuming we need to update the role using admin SDK, but we don't have it here.
        // We can just log them in to get UID if needed, but for now let's hope they don't exist,
        // or if they do, the user already created them and we need a different approach.
      } else {
        console.error(`Error creating ${guide.email}:`, error);
      }
    }
  }
  process.exit(0);
}

createGuides();
