import { initializeApp } from "firebase/app";
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
const db = getFirestore(app);

async function main() {
  const guides = [
    { uid: '1TnCDFNl7YeVk3jt74VVWcHE2632', email: 'rupesh2510@gmail.com', name: 'Rupesh' },
    { uid: 'GShM0tWH7rTiBxLL5eh8deekNyO2', email: 'bhavyajha.bhu@gmail.com', name: 'Bhavya' },
    { uid: 'tyNj30OWCVTICCcMG1UGSpebttV2', email: 'anchalmaurya406@gmail.com', name: 'Anchal' }
  ];

  for (const g of guides) {
    await setDoc(doc(db, "users", g.uid), {
      role: "guide",
      displayName: g.name,
      email: g.email
    }, { merge: true });

    await setDoc(doc(db, "guides", g.uid), {
      name: g.name,
      email: g.email,
      bio: "Professional guide at SoulThread",
      experience: "Licensed emotional well-being professional",
      availability: [],
      isCalendarOpen: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`Updated Firestore for ${g.email}`);
  }

  console.log("All done");
  process.exit(0);
}

main();
