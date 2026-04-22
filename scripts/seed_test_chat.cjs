/**
 * seed_test_chat.cjs
 *
 * Creates two test Firebase Auth users and seeds a realistic chat conversation
 * between them so the Chat UI can be verified end-to-end.
 *
 * Credentials printed at the end — log in with either account on soulthread.in/chat
 *
 * Run once:
 *   node scripts/seed_test_chat.cjs
 *
 * Uses Application Default Credentials (ADC):
 *   gcloud auth application-default login
 *   -- or --
 *   set GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
 */

const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

if (getApps().length === 0) {
    initializeApp({ projectId: 'soulthread-15a72' });
}

const db = getFirestore();
const auth = getAuth();

// ─── Config ───────────────────────────────────────────────────────────────────

const TEST_USER_A = {
    email: 'testuser.a@soulthread.in',
    password: 'TestPass@123',
    displayName: 'Aryan Sharma',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AryanSharma&backgroundColor=b6e3f4',
};

const TEST_USER_B = {
    email: 'testuser.b@soulthread.in',
    password: 'TestPass@123',
    displayName: 'Priya Verma',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVerma&backgroundColor=ffdfbf',
};

// Realistic conversation messages (alternating A → B)
const MESSAGES = [
    { from: 'A', text: "Hey! I just finished reading the Hyperfocus series. It hit differently.", minsAgo: 120 },
    { from: 'B', text: "Right?? Which part stood out to you the most?", minsAgo: 118 },
    { from: 'A', text: "The section on how hyperfocus isn't a superpower, it's a coping mechanism. Never thought of it that way before.", minsAgo: 115 },
    { from: 'B', text: "That one actually made me pause for a few minutes. I had to put my phone down lol", minsAgo: 113 },
    { from: 'A', text: "Same. I sent it to three people immediately.", minsAgo: 110 },
    { from: 'B', text: "Did you see the Lust Decoded series too? It's... a lot.", minsAgo: 90 },
    { from: 'A', text: "Not yet. Should I? Is it good or just provocative?", minsAgo: 87 },
    { from: 'B', text: "It's actually really insightful. About why intimacy fades over time. Very clinical but real.", minsAgo: 85 },
    { from: 'A', text: "Interesting. Adding it to my list. Do you use the daily prompt feature?", minsAgo: 60 },
    { from: 'B', text: "Yeah! I try to write a response every morning. It's become a small ritual now.", minsAgo: 57 },
    { from: 'A', text: "That's nice. I keep forgetting. Maybe I should set a reminder.", minsAgo: 54 },
    { from: 'B', text: "Honestly yes. It helps to start the day with some reflection instead of immediately checking socials.", minsAgo: 51 },
    { from: 'A', text: "True. Okay I'm going to try that starting tomorrow.", minsAgo: 48 },
    { from: 'B', text: "Let me know how it goes! 🙏", minsAgo: 45 },
    { from: 'A', text: "Will do. Thanks for the recommendation.", minsAgo: 10 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateUser(userData) {
    try {
        const existing = await auth.getUserByEmail(userData.email);
        console.log(`  ↩  Reusing existing user: ${userData.email} (uid: ${existing.uid})`);
        return existing;
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            const created = await auth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.displayName,
                photoURL: userData.photoURL,
                emailVerified: true,
            });
            console.log(`  ✓  Created Auth user: ${userData.email} (uid: ${created.uid})`);
            return created;
        }
        throw e;
    }
}

async function upsertUserProfile(uid, userData) {
    const ref = db.collection('users').doc(uid);
    await ref.set({
        uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        username: userData.displayName.replace(/\s+/g, '').toLowerCase(),
        bio: 'SoulThread test account',
        isTest: true,
        createdAt: FieldValue.serverTimestamp(),
        termsAccepted: true,
    }, { merge: true });
    console.log(`  ✓  Upserted Firestore profile for ${userData.displayName}`);
}

function minsAgoTimestamp(mins) {
    return Timestamp.fromMillis(Date.now() - mins * 60 * 1000);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n── SoulThread Chat Seed ─────────────────────────────────────');

    // 1. Create / reuse auth users
    console.log('\n[1/4] Creating Auth users...');
    const userA = await getOrCreateUser(TEST_USER_A);
    const userB = await getOrCreateUser(TEST_USER_B);

    // 2. Upsert Firestore profiles
    console.log('\n[2/4] Upserting Firestore profiles...');
    await upsertUserProfile(userA.uid, TEST_USER_A);
    await upsertUserProfile(userB.uid, TEST_USER_B);

    // 3. Create or reuse conversation doc
    console.log('\n[3/4] Creating conversation...');
    const convoId = [userA.uid, userB.uid].sort().join('_');
    const convoRef = db.collection('conversations').doc(convoId);

    const lastMsg = MESSAGES[MESSAGES.length - 1];
    const lastSenderId = lastMsg.from === 'A' ? userA.uid : userB.uid;

    await convoRef.set({
        participants: [userA.uid, userB.uid],
        participantDetails: {
            [userA.uid]: { displayName: TEST_USER_A.displayName, photoURL: TEST_USER_A.photoURL },
            [userB.uid]: { displayName: TEST_USER_B.displayName, photoURL: TEST_USER_B.photoURL },
        },
        lastMessage: lastMsg.text,
        lastMessageAt: minsAgoTimestamp(lastMsg.minsAgo),
        lastMessageSenderId: lastSenderId,
        read: false,
        typing: {},
        createdAt: FieldValue.serverTimestamp(),
        isTest: true,
    }, { merge: true });
    console.log(`  ✓  Conversation doc: ${convoId}`);

    // 4. Seed messages
    console.log('\n[4/4] Seeding messages...');
    const messagesRef = convoRef.collection('messages');

    // Check if messages already exist
    const existing = await messagesRef.limit(1).get();
    if (!existing.empty) {
        console.log('  ↩  Messages already seeded — skipping to avoid duplicates.');
        console.log('     (Delete the conversation doc + messages subcollection to re-seed)');
    } else {
        const batch = db.batch();
        for (const msg of MESSAGES) {
            const senderId = msg.from === 'A' ? userA.uid : userB.uid;
            const senderName = msg.from === 'A' ? TEST_USER_A.displayName : TEST_USER_B.displayName;
            const msgRef = messagesRef.doc();
            batch.set(msgRef, {
                text: msg.text,
                type: 'text',
                senderId,
                senderName,
                createdAt: minsAgoTimestamp(msg.minsAgo),
                readAt: msg.minsAgo > 20 ? minsAgoTimestamp(msg.minsAgo - 2) : null,
                edited: false,
            });
        }
        await batch.commit();
        console.log(`  ✓  ${MESSAGES.length} messages seeded`);
    }

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────────────────────────');
    console.log('  SEED COMPLETE — Log in with either account to test chat:\n');
    console.log(`  User A: ${TEST_USER_A.email}`);
    console.log(`  User B: ${TEST_USER_B.email}`);
    console.log(`  Password (both): ${TEST_USER_A.password}`);
    console.log(`\n  Chat URL: https://soulthread.in/chat?chat=${convoId}`);
    console.log('─────────────────────────────────────────────────────────────\n');
}

main().catch(err => {
    console.error('\n[ERROR]', err.message);
    process.exit(1);
});
