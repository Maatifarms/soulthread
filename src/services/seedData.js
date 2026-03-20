import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const seedPsychologists = async () => {
    const psychologists = [
        {
            name: "Rahul Singh",
            experience: "2 years",
            bio: "Specializing in anxiety and stress management for young professionals.",
            photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
            availability: [
                { day: "Monday", slots: ["10:00 AM", "02:00 PM", "04:00 PM"] },
                { day: "Wednesday", slots: ["11:00 AM", "03:00 PM"] }
            ]
        },
        {
            name: "Dishari Biswas",
            experience: "2 years",
            bio: "Expert in relationship counseling and emotional wellness.",
            photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dishari",
            availability: [
                { day: "Tuesday", slots: ["09:00 AM", "01:00 PM"] },
                { day: "Thursday", slots: ["12:00 PM", "05:00 PM"] }
            ]
        }
    ];

    const colRef = collection(db, "psychologists");

    for (const psych of psychologists) {
        // Check if exists to prevent duplicates
        const q = query(colRef, where("name", "==", psych.name));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            await addDoc(colRef, psych);
            console.log(`Seeded ${psych.name}`);
        } else {
            console.log(`${psych.name} already exists`);
        }
    }
};

export const seedTestCounsellor = async (auth, createUserWithEmailAndPassword) => {
    const counsellor = {
        email: "ojharupesh.25@gmail.com",
        password: "Passsoul@1",
        name: "Test Counsellor (Rupesh)",
        bio: "Specializing in emotional wellness and stress management.",
        experience: "5+ Years"
    };

    try {
        console.log("Attempting to create test counsellor...");
        let userId;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, counsellor.email, counsellor.password);
            userId = userCredential.user.uid;
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where("email", "==", counsellor.email));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) userId = snapshot.docs[0].id;
            } else { throw error; }
        }

        if (userId) {
            const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");

            // 1. Create User Document
            await setDoc(doc(db, 'users', userId), {
                email: counsellor.email,
                displayName: counsellor.name,
                role: 'psychologist',
                isAdmin: false,
                photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=GuideRupesh`,
                createdAt: serverTimestamp()
            }, { merge: true });

            // 2. Create Psychologist Document
            const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            await setDoc(doc(db, 'psychologists', userId), {
                id: userId,
                name: counsellor.name,
                email: counsellor.email,
                bio: counsellor.bio,
                experience: counsellor.experience,
                isCalendarOpen: true,
                availability: DAYS.map(day => ({ day, slots: ["10:00 AM", "12:00 PM", "04:00 PM"] })),
                photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=GuideRupesh`
            }, { merge: true });

            console.log("✅ Test Counsellor logic executed for:", counsellor.email);
        }
    } catch (e) {
        console.error("Test Counsellor seeding failed:", e.message);
    }
};

export const seedAdmins = async (auth, createUserWithEmailAndPassword) => {
    const admins = [
        { email: "anchalmaurya406@gmail.com", password: "Passsoul@1", name: "Anchal Maurya" },
        { email: "bhavyajha.bhu@gmail.com", password: "Passsoul@1", name: "Bhavya Jha" },
        { email: "rupesh2510@gmail.com", password: "Passsoul@1", name: "Rupesh Admin" }
    ];

    for (const admin of admins) {
        try {
            console.log(`Attempting to create admin: ${admin.email}`);

            let userId;
            try {
                // Attempt to create user
                const userCredential = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
                userId = userCredential.user.uid;
                console.log(`Created new Admin User: ${admin.email}`);
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`User ${admin.email} already exists. Updating role...`);
                    // We need to find the UID if we can't login, but we can't query Auth from client without being admin sdk.
                    // However, we can try to query the 'users' collection by email if we store email there.
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where("email", "==", admin.email));
                    const snapshot = await getDocs(q);

                    if (!snapshot.empty) {
                        userId = snapshot.docs[0].id;
                    } else {
                        console.error(`Could not find Firestore doc for existing user ${admin.email}. They might need to sign in first.`);
                        continue;
                    }
                } else {
                    throw error;
                }
            }

            if (userId) {
                // Create/Update Firestore Doc
                // Note: We use setDoc with merge to ensure we don't overwrite other fields if updating
                const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
                await setDoc(doc(db, 'users', userId), {
                    email: admin.email,
                    displayName: admin.name,
                    role: 'admin',
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.name.replace(' ', '')}`,
                    createdAt: serverTimestamp(),
                    isIncognito: false
                }, { merge: true });
                console.log(`Promoted ${admin.email} to ADMIN.`);
            }

        } catch (e) {
            console.error(`Failed to process ${admin.email}:`, e.message);
        }
    }
    alert("Admin seeding process complete. Check console for details.");
};
