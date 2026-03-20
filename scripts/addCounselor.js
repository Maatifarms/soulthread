



// Script to add a user as a counselor by email
// Run this in your browser console while logged into Firebase Console or use Firebase Admin SDK

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// This script grants counselor access to ojharupesh.25@gmail.com

const addCounselorByEmail = async (email) => {
    const db = getFirestore();

    try {
        // Step 1: Find user by email in the 'users' collection
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error(`No user found with email: ${email}`);
            console.log('The user needs to sign up first at https://soulthread.in/signup');
            return;
        }

        // Get the user's UID
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        console.log(`Found user: ${userData.displayName || 'Unknown'} (UID: ${userId})`);

        // Step 2: Create/Update document in 'psychologists' collection
        const psychologistRef = doc(db, 'psychologists', userId);

        await setDoc(psychologistRef, {
            name: userData.displayName || 'Counselor',
            email: email,
            bio: 'Professional counselor at SoulThread',
            experience: 'Licensed mental health professional',
            availability: [],
            isCalendarOpen: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('✅ Successfully granted counselor access!');
        console.log(`User can now access: https://soulthread.in/counselor-dashboard`);

        // Step 3: Update user role in 'users' collection
        await setDoc(doc(db, 'users', userId), {
            role: 'psychologist'
        }, { merge: true });

        console.log('✅ Updated user role to psychologist');

        return userId;

    } catch (error) {
        console.error('Error adding counselor:', error);
        throw error;
    }
};

// Execute for ojharupesh.25@gmail.com
addCounselorByEmail('ojharupesh.25@gmail.com')
    .then(uid => {
        console.log('Done! UID:', uid);
    })
    .catch(err => {
        console.error('Failed:', err);
    });
