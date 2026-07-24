const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}

async function updateGuides() {
  const db = admin.firestore();
  const auth = admin.auth();
  
  const guides = [
    { uid: '1TnCDFNl7YeVk3jt74VVWcHE2632', email: 'rupesh2510@gmail.com', name: 'Rupesh', setPassword: false },
    { uid: 'GShM0tWH7rTiBxLL5eh8deekNyO2', email: 'bhavyajha.bhu@gmail.com', name: 'Bhavya', setPassword: true },
    { uid: 'tyNj30OWCVTICCcMG1UGSpebttV2', email: 'anchalmaurya406@gmail.com', name: 'Anchal', setPassword: true }
  ];

  for (const guide of guides) {
    if (guide.setPassword) {
      await auth.updateUser(guide.uid, { password: 'Passsoul@1' });
      console.log(`Updated password for ${guide.email}`);
    }
    
    await db.collection('users').doc(guide.uid).set({
      role: 'guide',
      displayName: guide.name,
      email: guide.email
    }, { merge: true });
    
    await db.collection('guides').doc(guide.uid).set({
      name: guide.name,
      email: guide.email,
      bio: 'Professional guide at SoulThread',
      experience: 'Licensed emotional well-being professional',
      availability: [],
      isCalendarOpen: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`Updated Firestore for ${guide.email}`);
  }
  
  console.log('ALL DONE');
  process.exit(0);
}

updateGuides().catch(console.error);
