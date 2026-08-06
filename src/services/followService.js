import {
    doc, getDoc, getDocs, setDoc, deleteDoc, collection,
    query, where, serverTimestamp, arrayUnion, arrayRemove, addDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetch profiles of users following targetUserId
 */
export const getFollowers = async (targetUserId) => {
    if (!targetUserId) return [];
    try {
        const followerUids = new Set();

        // 1. Fetch from subcollection: users/{targetUserId}/followers
        try {
            const followersSubSnap = await getDocs(collection(db, 'users', targetUserId, 'followers'));
            followersSubSnap.forEach(docSnap => {
                followerUids.add(docSnap.id);
            });
        } catch (e) {
            console.warn('[followService] Subcollection followers read warning:', e);
        }

        // 2. Fetch user document to check arrays (followers & connections)
        try {
            const userDocSnap = await getDoc(doc(db, 'users', targetUserId));
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                if (Array.isArray(data.followers)) {
                    data.followers.forEach(uid => followerUids.add(uid));
                }
                if (Array.isArray(data.connections)) {
                    data.connections.forEach(uid => followerUids.add(uid));
                }
            }
        } catch (e) {
            console.warn('[followService] User document read warning:', e);
        }

        followerUids.delete(targetUserId);
        const uidsArray = Array.from(followerUids);
        if (uidsArray.length === 0) return [];

        // 3. Batch fetch profiles from 'users' collection (chunks of 10 for Firestore 'in' query)
        const profiles = [];
        for (let i = 0; i < uidsArray.length; i += 10) {
            const chunk = uidsArray.slice(i, i + 10);
            const q = query(collection(db, 'users'), where('__name__', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(docSnap => {
                profiles.push({ id: docSnap.id, ...docSnap.data() });
            });
        }

        return profiles;
    } catch (error) {
        console.error('[followService] getFollowers error:', error);
        return [];
    }
};

/**
 * Fetch profiles of users followed by targetUserId
 */
export const getFollowing = async (targetUserId) => {
    if (!targetUserId) return [];
    try {
        const followingUids = new Set();

        // 1. Fetch from subcollection: users/{targetUserId}/following
        try {
            const followingSubSnap = await getDocs(collection(db, 'users', targetUserId, 'following'));
            followingSubSnap.forEach(docSnap => {
                followingUids.add(docSnap.id);
            });
        } catch (e) {
            console.warn('[followService] Subcollection following read warning:', e);
        }

        // 2. Fetch user document to check arrays (following & connections)
        try {
            const userDocSnap = await getDoc(doc(db, 'users', targetUserId));
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                if (Array.isArray(data.following)) {
                    data.following.forEach(uid => followingUids.add(uid));
                }
                if (Array.isArray(data.connections)) {
                    data.connections.forEach(uid => followingUids.add(uid));
                }
            }
        } catch (e) {
            console.warn('[followService] User document read warning:', e);
        }

        followingUids.delete(targetUserId);
        const uidsArray = Array.from(followingUids);
        if (uidsArray.length === 0) return [];

        // 3. Batch fetch profiles from 'users' collection
        const profiles = [];
        for (let i = 0; i < uidsArray.length; i += 10) {
            const chunk = uidsArray.slice(i, i + 10);
            const q = query(collection(db, 'users'), where('__name__', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(docSnap => {
                profiles.push({ id: docSnap.id, ...docSnap.data() });
            });
        }

        return profiles;
    } catch (error) {
        console.error('[followService] getFollowing error:', error);
        return [];
    }
};

/**
 * Toggle follow/unfollow status between currentUserId and targetUserId
 */
export const toggleFollowUser = async (currentUserId, targetUserId, isCurrentlyFollowing, currentUserInfo = {}) => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return false;

    const myFollowingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    const targetFollowerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
    const myDocRef = doc(db, 'users', currentUserId);
    const targetDocRef = doc(db, 'users', targetUserId);

    try {
        if (isCurrentlyFollowing) {
            // Unfollow logic
            await deleteDoc(myFollowingRef).catch(() => {});
            await deleteDoc(targetFollowerRef).catch(() => {});

            await setDoc(myDocRef, {
                following: arrayRemove(targetUserId)
            }, { merge: true });

            await setDoc(targetDocRef, {
                followers: arrayRemove(currentUserId)
            }, { merge: true });

            return false;
        } else {
            // Follow logic
            await setDoc(myFollowingRef, {
                targetUserId,
                createdAt: serverTimestamp()
            }, { merge: true });

            await setDoc(targetFollowerRef, {
                followerId: currentUserId,
                createdAt: serverTimestamp()
            }, { merge: true });

            await setDoc(myDocRef, {
                following: arrayUnion(targetUserId)
            }, { merge: true });

            await setDoc(targetDocRef, {
                followers: arrayUnion(currentUserId)
            }, { merge: true });

            // Create Notification
            try {
                const isAnon = currentUserInfo.isIncognito || currentUserInfo.isAnonymous;
                await addDoc(collection(db, 'notifications'), {
                    recipientId: targetUserId,
                    senderId: currentUserId,
                    senderName: isAnon ? 'Someone' : (currentUserInfo.displayName || 'A soul'),
                    senderPhoto: isAnon ? '' : (currentUserInfo.photoURL || ''),
                    type: 'new_follower',
                    message: `${isAnon ? 'Someone' : (currentUserInfo.displayName || 'A soul')} started following your journey.`,
                    read: false,
                    createdAt: serverTimestamp()
                });
            } catch (e) {
                console.warn('[followService] Notification send failed:', e);
            }

            return true;
        }
    } catch (error) {
        console.error('[followService] toggleFollowUser error:', error);
        throw error;
    }
};
