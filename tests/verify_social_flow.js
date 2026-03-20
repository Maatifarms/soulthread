import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, arrayUnion } from "firebase/firestore";

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

async function runTest() {
    console.log("🚀 Starting Rigorous Social Flow Test...");

    try {
        // 1. Create User A (Sender)
        const emailA = `sender_${Date.now()}@test.com`;
        console.log(`Creating User A: ${emailA}`);
        const userACred = await createUserWithEmailAndPassword(auth, emailA, "password123");
        const uidA = userACred.user.uid;

        // Setup User A Doc (Self-Setup)
        await setDoc(doc(db, "users", uidA), {
            uid: uidA, displayName: "Sender A", email: emailA, role: 'user'
        });
        console.log("✅ User A Created & Setup");

        // 2. Create User B (Recipient)
        const emailB = `recipient_${Date.now()}@test.com`;
        console.log(`Creating User B: ${emailB}`);
        // Sign out A first
        await signOut(auth);
        const userBCred = await createUserWithEmailAndPassword(auth, emailB, "password123");
        const uidB = userBCred.user.uid;

        // Setup User B Doc
        await setDoc(doc(db, "users", uidB), {
            uid: uidB, displayName: "Recipient B", email: emailB, role: 'user', pendingRequests: []
        });
        console.log("✅ User B Created & Setup");

        // 3. User A Connects to User B
        console.log("🔄 Switching back to User A to attempt connection...");
        await signOut(auth);
        await signInWithEmailAndPassword(auth, emailA, "password123");

        console.log(`Attempting to write to users/${uidB} (Recipient's Doc)...`);

        // THE CRITICAL TEST: Does the rule allow A to update B's pendingRequests?
        const recipientRef = doc(db, "users", uidB);
        await setDoc(recipientRef, {
            pendingRequests: arrayUnion(uidA)
        }, { merge: true });

        console.log("✅ SUCCESS: Connection Request Sent! Rule Fix Verified.");
        process.exit(0);

    } catch (error) {
        console.error("❌ FAILURE: Operation Blocked by Rules or Error.");
        console.error(error.code, error.message);
        process.exit(1);
    }
}

runTest();
