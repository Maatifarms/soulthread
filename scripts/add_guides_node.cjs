const admin = require("firebase-admin");

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
} catch (e) {
  console.log("No default credentials", e.message);
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

async function createGuide(email, password, displayName) {
  let uid;
  try {
    const user = await auth.getUserByEmail(email);
    uid = user.uid;
    console.log(`User ${email} already exists with UID ${uid}`);
    // Ensure password is correct if we want
    await auth.updateUser(uid, { password, displayName });
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      const user = await auth.createUser({
        email,
        password,
        displayName
      });
      uid = user.uid;
      console.log(`Created user ${email} with UID ${uid}`);
    } else {
      throw e;
    }
  }

  // Set guide doc
  await db.collection("guides").doc(uid).set({
    name: displayName,
    email: email,
    bio: "Professional guide at SoulThread",
    experience: "Licensed emotional well-being professional",
    availability: [],
    isCalendarOpen: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Update user role
  await db.collection("users").doc(uid).set({
    role: "guide",
    displayName: displayName,
    email: email
  }, { merge: true });

  console.log(`Successfully made ${email} a guide.`);
}

async function main() {
  try {
    await createGuide("anchalmaurya406@gmail.com", "Passsoul@1", "Anchal");
    await createGuide("bhavyajha.bhu@gmail.com", "Passsoul@1", "Bhavya");
    await createGuide("rupesh2510@gmail.com", "Passsoul@1", "Rupesh");
    console.log("All done!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
