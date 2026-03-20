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

async function runFinalQA() {
    console.log("🚀 Starting FINAL QA Verification...");

    try {
        const timestamp = Date.now();
        const emailA = `qa_sender_${timestamp}@test.com`;
        const emailB = `qa_recipient_${timestamp}@test.com`;

        // 1. Create Users
        console.log(`Creating User A: ${emailA}`);
        const userACred = await createUserWithEmailAndPassword(auth, emailA, "password123");
        const uidA = userACred.user.uid;
        await setDoc(doc(db, "users", uidA), { uid: uidA, displayName: "QA Sender", email: emailA, role: 'user', photoURL: "http://test.com/a.jpg" });

        await signOut(auth);
        console.log(`Creating User B: ${emailB}`);
        const userBCred = await createUserWithEmailAndPassword(auth, emailB, "password123");
        const uidB = userBCred.user.uid;
        await setDoc(doc(db, "users", uidB), { uid: uidB, displayName: "QA Recipient", email: emailB, role: 'user', photoURL: "http://test.com/b.jpg", pendingRequests: [] });

        // 2. A sends Request to B
        console.log("🔄 User A sending Request...");
        await signOut(auth);
        await signInWithEmailAndPassword(auth, emailA, "password123");

        await setDoc(doc(db, "users", uidB), { pendingRequests: arrayUnion(uidA) }, { merge: true });

        // Check if B has request
        const bDoc = await getDocs(query(collection(db, "users"), where("uid", "==", uidB)));
        const bData = bDoc.docs[0].data();
        if (bData.pendingRequests.includes(uidA)) {
            console.log("✅ Step 1: Request Logic Verified (Pending Requests array updated)");
        } else {
            throw new Error("Step 1 Failed: Request not received");
        }

        // 3. A sends Message to B (Simulating Chat.jsx)
        console.log("💬 User A sending Message...");
        const chatId = [uidA, uidB].sort().join("_");
        await setDoc(doc(db, 'conversations', chatId), {
            participants: [uidA, uidB],
            lastMessage: "QA Test Message",
            lastMessageAt: serverTimestamp(),
            lastMessageSenderId: uidA,
            read: false // CRITICAL: This drives the badge
        });

        console.log("✅ Step 2: Message Sent with 'read: false'");

        // 4. Verify B sees it as Unread (Simulating Navbar.jsx Listener)
        console.log("🔄 User B checking for unread...");
        await signOut(auth);
        await signInWithEmailAndPassword(auth, emailB, "password123");

        const qMessages = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', uidB),
            where('read', '==', false)
        );
        const snapshot = await getDocs(qMessages);

        const unreadCount = snapshot.docs.filter(doc => doc.data().lastMessageSenderId !== uidB).length;

        if (unreadCount === 1) {
            console.log(`✅ Step 3: Unread Badge Verified! (Count: ${unreadCount})`);
            console.log("   Logic Proof: Navbar will show '1' red badge.");
        } else {
            console.error(`❌ Step 3 Failed: Unread count is ${unreadCount}, expected 1.`);
            process.exit(1);
        }

        console.log("✅ SUCCESS: All Social & Messaging Logic Verified.");
        process.exit(0);

    } catch (error) {
        console.error("❌ FAILURE:", error);
        process.exit(1);
    }
}

runFinalQA();
