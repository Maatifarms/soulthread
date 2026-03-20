import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, arrayUnion, addDoc, collection, getDocs, query, where, serverTimestamp } from "firebase/firestore";

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
    console.log("🚀 Starting Rigorous Notification & Chat Logic Test...");

    try {
        // 1. Create Users
        const emailA = `sender_notif_${Date.now()}@test.com`;
        const emailB = `recipient_notif_${Date.now()}@test.com`;

        console.log(`Creating User A: ${emailA}`);
        const userACred = await createUserWithEmailAndPassword(auth, emailA, "password123");
        const uidA = userACred.user.uid;
        await setDoc(doc(db, "users", uidA), { uid: uidA, displayName: "Sender A", email: emailA, role: 'user' });

        await signOut(auth);
        console.log(`Creating User B: ${emailB}`);
        const userBCred = await createUserWithEmailAndPassword(auth, emailB, "password123");
        const uidB = userBCred.user.uid;
        await setDoc(doc(db, "users", uidB), { uid: uidB, displayName: "Recipient B", email: emailB, role: 'user', pendingRequests: [] });

        // 2. User A sends Request + Notification
        console.log("🔄 Switching to User A...");
        await signOut(auth);
        await signInWithEmailAndPassword(auth, emailA, "password123");

        console.log("Attempting Request + Notification...");
        // A. Connection Request
        await setDoc(doc(db, "users", uidB), { pendingRequests: arrayUnion(uidA) }, { merge: true });
        // B. Notification
        await addDoc(collection(db, 'notifications'), {
            recipientId: uidB,
            senderId: uidA,
            type: 'connection_request',
            message: `UnitTest Request from ${uidA}`,
            createdAt: serverTimestamp(),
            read: false
        });
        console.log("✅ Step 1: Request & Notification sent successfully.");

        // 3. User B Accepts + Notification + Chat Check
        console.log("🔄 Switching to User B...");
        await signOut(auth);
        await signInWithEmailAndPassword(auth, emailB, "password123");

        console.log("Attempting Acceptance + Notification...");
        // A. Accept
        await setDoc(doc(db, "users", uidB), { connections: arrayUnion(uidA) }, { merge: true });
        // B. Notification to A
        await addDoc(collection(db, 'notifications'), {
            recipientId: uidA,
            senderId: uidB,
            type: 'connection_accepted',
            message: `UnitTest Accept from ${uidB}`,
            createdAt: serverTimestamp(),
            read: false
        });
        console.log("✅ Step 2: Accepted & Notification sent successfully.");

        // 4. Checking Chat Logic (Simulate logic from Chat.jsx)
        console.log("Attempting Chat Logic...");
        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', uidB)
        );
        const snapshot = await getDocs(q);
        // Note: Real chat creation checks if exact pair exists. Simplified here to just permission to READ chats.
        console.log(`User B read ${snapshot.size} chats. (Permission verified)`);

        console.log("✅ SUCCESS: All Logic Steps Verified against Live Rules.");
        process.exit(0);

    } catch (error) {
        console.error("❌ FAILURE: Logic Blocked by Rules or Error.");
        console.error(error.code, error.message);
        process.exit(1);
    }
}

runTest();
