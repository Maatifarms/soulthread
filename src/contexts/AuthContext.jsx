import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    signInWithCredential,
    getRedirectResult,
    GoogleAuthProvider,
    signOut,
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    setPersistence,
    browserLocalPersistence,
    indexedDBLocalPersistence
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, getDoc, addDoc, collection, onSnapshot, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import ComplianceModal from '../components/auth/ComplianceModal';

const TERMS_VERSION = 2;
const APP_VERSION = '2026-03-20-S1'; // Version bump for stability fix
window.__SOUL_AUTH_VER__ = APP_VERSION;

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const cached = localStorage.getItem('soul_user_cache');
            if (!cached) return null;
            const parsed = JSON.parse(cached);
            return parsed.uid ? parsed : null;
        } catch (e) {
            localStorage.removeItem('soul_user_cache');
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [showCompliance, setShowCompliance] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    // Persistence: Save only essential serializable user data
    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const safeData = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role: currentUser.role,
                isAdmin: currentUser.isAdmin,
                isOwner: currentUser.isOwner,
                acceptedVersion: currentUser.acceptedVersion
            };
            localStorage.setItem('soul_user_cache', JSON.stringify(safeData));
        } else if (currentUser === null && authInitialized) {
            localStorage.removeItem('soul_user_cache');
        }
    }, [currentUser, authInitialized]);

    // ── Phone Auth: Step 1 – Send OTP ──────────────────────────────────────
    async function sendOTP(phoneNumber, recaptchaContainerId) {
        const isNative = typeof window !== 'undefined' &&
            (Capacitor.isNativePlatform() ||
                window.location.protocol === 'capacitor:' ||
                window.location.protocol === 'ionic:');

        try {
            if (isNative) {
                console.log('📱 [Auth] Triggering native phone OTP flow...');
                const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');

                return new Promise((resolve, reject) => {
                    let resolved = false;

                    const codeSent = FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
                        console.log('✅ Native phone code sent:', event.verificationId);
                        setConfirmationResult({ isNative: true, verificationId: event.verificationId });
                        if (!resolved) {
                            resolved = true;
                            resolve({ isNative: true, verificationId: event.verificationId });
                        }
                    });

                    const failed = FirebaseAuthentication.addListener('phoneVerificationFailed', (event) => {
                        console.error('❌ Native phone verification failed:', event.message);
                        if (!resolved) {
                            resolved = true;
                            reject(new Error(event.message));
                        }
                    });

                    FirebaseAuthentication.signInWithPhoneNumber({
                        phoneNumber,
                        skipNativeAuth: false
                    }).catch(error => {
                        console.error('❌ Native sign in failed', error);
                        if (!resolved) {
                            resolved = true;
                            reject(error);
                        }
                    });
                });
            } else {
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                }
                window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
                    size: 'invisible',
                    callback: () => { }
                });
                const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
                setConfirmationResult(result);
                return result;
            }
        } catch (error) {
            console.error('Send OTP failed:', error);
            throw error;
        }
    }

    // ── Phone Auth: Step 2 – Verify OTP ───────────────────────────────────
    async function verifyOTP(otp) {
        if (!confirmationResult) throw new Error('No OTP session. Please request OTP first.');

        const isNative = typeof window !== 'undefined' &&
            (Capacitor.isNativePlatform() ||
                window.location.protocol === 'capacitor:' ||
                window.location.protocol === 'ionic:');

        try {
            let user;
            if (isNative && confirmationResult.isNative) {
                const { PhoneAuthProvider, signInWithCredential } = await import('firebase/auth');
                const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');

                await FirebaseAuthentication.confirmVerificationCode({
                    verificationId: confirmationResult.verificationId,
                    verificationCode: otp
                });

                const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
                const userCredential = await signInWithCredential(auth, credential);
                user = userCredential.user;
            } else {
                const result = await confirmationResult.confirm(otp);
                user = result.user;
            }

            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            return { user, isNewUser: !userSnap.exists() };
        } catch (error) {
            console.error('Verify OTP failed:', error);
            throw error;
        }
    }

    async function createPhoneUserProfile(user, profileData) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            displayName: profileData.name,
            phoneNumber: user.phoneNumber,
            age: profileData.age || null,
            gender: profileData.gender || null,
            bio: profileData.bio || '',
            interests: profileData.interests || [],
            categoryEngagementStats: {},
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            role: 'user',
            isAdmin: false,
            createdAt: new Date().toISOString()
        });
        try {
            await addDoc(collection(db, 'admin_notifications'), {
                type: 'NEW_USER_phone',
                message: `New user via phone: ${profileData.name} (${user.phoneNumber})`,
                createdAt: new Date().toISOString(),
                readBy: []
            });
        } catch (e) { }
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    async function loginWithGoogle() {
        const isNative = typeof window !== 'undefined' &&
            (Capacitor.isNativePlatform() ||
                window.location.protocol === 'capacitor:' ||
                window.location.protocol === 'ionic:');

        try {
            if (isNative) {
                const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
                const webClientId = "813685915255-h8ajgn54lvgp0opp12h74e9b2skq93ei.apps.googleusercontent.com";
                
                const result = await FirebaseAuthentication.signInWithGoogle({
                    scopes: ["email", "profile"],
                    webClientId: webClientId,
                    grantOfflineAccess: true,
                    forceCodeForRefreshToken: true,
                    useCredentialManager: false
                });

                if (!result?.credential?.idToken) {
                    throw new Error("Google identity token missing.");
                }

                const credential = GoogleAuthProvider.credential(result.credential.idToken);
                const finalResult = await signInWithCredential(auth, credential);
                await _saveGoogleUserProfile(finalResult.user);
                return finalResult;
            } else {
                const provider = new GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');
                await signInWithRedirect(auth, provider);
                return;
            }
        } catch (error) {
            console.error("❌ Google Login failed:", error);
            throw error;
        }
    }

    async function _saveGoogleUserProfile(user) {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const adminEmails = ['rupesh2510@gmail.com', 'anchalmaurya406@gmail.com', 'bhavyajha.bhu@gmail.com'];
        const isAdmin = adminEmails.includes(user.email?.toLowerCase());
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName || 'Soul Searcher',
                email: user.email,
                photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                role: isAdmin ? 'admin' : 'user',
                isAdmin: isAdmin,
                createdAt: new Date().toISOString()
            });
        } else if (isAdmin && userSnap.data().role !== 'admin') {
            await updateDoc(userRef, { role: 'admin', isAdmin: true });
        }
    }

    async function loginAnonymously() {
        try {
            const result = await signInAnonymously(auth);
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: result.user.uid,
                    displayName: "Anonymous Soul",
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
                    role: 'user',
                    isAnonymous: true,
                    createdAt: new Date().toISOString()
                });
            }
            return result;
        } catch (error) {
            console.error("Anonymous login failed", error);
            throw error;
        }
    }

    async function signup(email, password, displayName, extras = {}) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const adminEmails = ['rupesh2510@gmail.com', 'anchalmaurya406@gmail.com', 'bhavyajha.bhu@gmail.com'];
            const isAdmin = adminEmails.includes(email.toLowerCase());

            await setDoc(doc(db, "users", result.user.uid), {
                uid: result.user.uid,
                email: email,
                displayName: displayName,
                profession: extras.profession || '',
                place: extras.place || '',
                gender: extras.gender || '',
                photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
                role: isAdmin ? 'admin' : 'user',
                isAdmin: isAdmin,
                createdAt: new Date().toISOString()
            });

            try {
                await sendEmailVerification(result.user);
            } catch (e) { }

            return result;
        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email.trim(), password);
    }

    async function logout() {
        localStorage.removeItem('soul_user_cache');
        return signOut(auth);
    }

    async function requestFCMToken(userId) {
        const doRequest = async () => {
            try {
                if (typeof Notification === 'undefined' || !Notification.requestPermission) return;
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;
                const { getMessaging, getToken } = await import('firebase/messaging');
                const { default: app } = await import('../services/firebase');
                const msgInstance = getMessaging(app);
                const token = await getToken(msgInstance, {
                    vapidKey: 'BPr7sK8-9W7-P0Y-B_mJk0XNqj-P_0-K-v_L-Z_W_J-X-Y-Z'
                });
                if (token) {
                    await updateDoc(doc(db, 'users', userId), {
                        fcmTokens: arrayUnion(token),
                        lastTokenUpdate: serverTimestamp()
                    });
                }
            } catch (e) { }
        };
        setTimeout(doRequest, 5000);
    }

    useEffect(() => {
        const isNative = Capacitor.isNativePlatform();
        
        const initializeAuthSystem = async () => {
            try {
                const persistenceType = (isNative || !('indexedDB' in window)) 
                    ? indexedDBLocalPersistence 
                    : browserLocalPersistence;
                
                await setPersistence(auth, persistenceType);

                if (!isNative) {
                    const result = await getRedirectResult(auth);
                    if (result?.user) {
                        await _saveGoogleUserProfile(result.user);
                    }
                }
            } catch (err) {
                console.error("Auth Init Error:", err);
            }
        };

        initializeAuthSystem();

        let unsubUserDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (unsubUserDoc) {
                unsubUserDoc();
                unsubUserDoc = null;
            }

            if (user) {
                setCurrentUser(user);
                const userRef = doc(db, 'users', user.uid);

                unsubUserDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setCurrentUser(prev => ({
                            ...(prev || {}),
                            ...userData,
                            uid: user.uid,
                            email: user.email,
                            photoURL: userData.photoURL || user.photoURL
                        }));
                        setShowCompliance(userData.acceptedVersion < TERMS_VERSION || !userData.acceptedVersion);
                    } else {
                        _saveGoogleUserProfile(user);
                    }
                    setLoading(false);
                    setAuthInitialized(true);
                }, (err) => {
                    console.error("Profile Snapshot Error:", err);
                    setLoading(false);
                    setAuthInitialized(true);
                });

                requestFCMToken(user.uid);
            } else {
                setCurrentUser(null);
                setLoading(false);
                setAuthInitialized(true);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubUserDoc) unsubUserDoc();
        };
    }, []);

    const value = React.useMemo(() => ({
        currentUser,
        loginWithGoogle,
        loginAnonymously,
        signup,
        login,
        logout,
        resetPassword,
        sendOTP,
        verifyOTP,
        createPhoneUserProfile,
        loading: loading && !authInitialized
    }), [currentUser, loading, authInitialized, confirmationResult]);

    if (loading && !authInitialized && !currentUser) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh',
                background: 'var(--color-background)', gap: '20px'
            }}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '50%', border: '4px solid var(--color-primary-soft)',
                    borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-primary)', fontWeight: '700', fontSize: '14px', letterSpacing: '0.05em' }}>
                    CONNECTING TO SANCTUARY...
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {showCompliance && currentUser && (
                <ComplianceModal
                    user={currentUser}
                    termsVersion={TERMS_VERSION}
                    onAccept={() => setShowCompliance(false)}
                />
            )}
            {children}
        </AuthContext.Provider>
    );
}
