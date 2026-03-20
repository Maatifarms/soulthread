import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../common/LoginModal';
import { trackCategoryInteraction } from '../../services/trackingService';
import { motion, AnimatePresence } from 'framer-motion';

const REACTION_TYPES = [
    { label: 'Care', name: 'care', emoji: '❤️' },
    { label: 'Heard', name: 'heard', emoji: '🫂' },
    { label: 'Light', name: 'light', emoji: '✨' },
    { label: 'Solid', name: 'solid', emoji: '💪' },
    { label: 'Deep', name: 'deep', emoji: '🌊' }
];

const Reactions = ({ postId, postAuthorId, initialCounts = {} }) => {
    const { currentUser } = useAuth();
    const [counts, setCounts] = useState(initialCounts);
    const [userReaction, setUserReaction] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        fetchuserReaction();
    }, [postId, currentUser]);

    useEffect(() => {
        if (initialCounts) {
            setCounts(initialCounts);
        }
    }, [initialCounts]);

    const fetchuserReaction = async () => {
        if (currentUser) {
            const userReactionRef = doc(db, 'posts', postId, 'reactions', currentUser.uid);
            const userSnap = await getDoc(userReactionRef);
            if (userSnap.exists()) {
                setUserReaction(userSnap.data().type);
            } else {
                setUserReaction(null);
            }
        } else {
            setUserReaction(null);
        }
    };

    const handleReact = async (type) => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        setShowPicker(false);

        // Optimistic Update
        const prevReaction = userReaction;
        const prevCounts = { ...counts };
        let newCounts = { ...counts };

        if (userReaction === type) {
            // Remove reaction
            setUserReaction(null);
            newCounts[type] = Math.max(0, (newCounts[type] || 0) - 1);
            setCounts(newCounts);

            try {
                const postRef = doc(db, 'posts', postId);
                await deleteDoc(doc(db, 'posts', postId, 'reactions', currentUser.uid));
                await updateDoc(postRef, { reactionCounts: newCounts });
            } catch (e) {
                setUserReaction(prevReaction);
                setCounts(prevCounts);
            }
        } else {
            // Add or Switch
            setUserReaction(type);
            if (prevReaction) {
                newCounts[prevReaction] = Math.max(0, (newCounts[prevReaction] || 0) - 1);
            }
            newCounts[type] = (newCounts[type] || 0) + 1;
            setCounts(newCounts);

            try {
                const postRef = doc(db, 'posts', postId);
                await setDoc(doc(db, 'posts', postId, 'reactions', currentUser.uid), { type, createdAt: serverTimestamp() });
                await updateDoc(postRef, { reactionCounts: newCounts });

                if (postAuthorId && postAuthorId !== currentUser.uid) {
                    const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
                    await addDoc(collection(db, 'notifications'), {
                        recipientId: postAuthorId,
                        senderId: currentUser.uid,
                        senderName: isAnon ? 'Someone' : (currentUser.displayName || 'Anonymous'),
                        senderPhoto: isAnon ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' : currentUser.photoURL,
                        type: 'post_reaction',
                        postId: postId,
                        reactionType: type,
                        read: false,
                        createdAt: serverTimestamp()
                    });
                }
            } catch (e) {
                setUserReaction(prevReaction);
                setCounts(prevCounts);
            }
        }
    };

    const activeEmoji = REACTION_TYPES.find(r => r.name === userReaction)?.emoji;

    return (
        <div style={{ position: 'relative', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Main React Button */}
                <div 
                    onMouseEnter={() => setShowPicker(true)}
                    onMouseLeave={() => setShowPicker(false)}
                    style={{ position: 'relative' }}
                >
                    <button
                        onClick={() => userReaction ? handleReact(userReaction) : setShowPicker(!showPicker)}
                        style={{
                            background: userReaction ? 'var(--color-primary-soft)' : 'var(--color-surface-2)',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '10px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            color: userReaction ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            fontWeight: '800',
                            fontSize: '14px',
                            fontFamily: 'Outfit, sans-serif'
                        }}
                    >
                        {userReaction ? (
                            <span style={{ fontSize: '18px' }}>{activeEmoji}</span>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        )}
                        <span>{userReaction ? REACTION_TYPES.find(r => r.name === userReaction)?.label : 'React'}</span>
                    </button>

                    {/* Facebook-style Picker */}
                    <AnimatePresence>
                        {showPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '0',
                                    marginBottom: '12px',
                                    background: 'var(--color-surface)',
                                    borderRadius: '30px',
                                    padding: '6px',
                                    display: 'flex',
                                    gap: '4px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    border: '1.5px solid var(--color-border)',
                                    zIndex: 100,
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                {REACTION_TYPES.map((reaction, i) => (
                                    <motion.button
                                        key={reaction.name}
                                        whileHover={{ scale: 1.3, y: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleReact(reaction.name)}
                                        style={{
                                            fontSize: '26px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            transition: 'transform 0.2s'
                                        }}
                                        title={reaction.label}
                                    >
                                        {reaction.emoji}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Counter Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {REACTION_TYPES.map(reaction => (
                        counts[reaction.name] > 0 && (
                            <div key={reaction.name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                background: 'var(--color-surface-2)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: 'var(--color-text-secondary)'
                            }}>
                                <span>{reaction.emoji}</span>
                                <span>{counts[reaction.name]}</span>
                            </div>
                        )
                    ))}
                </div>
            </div>
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </div>
    );
};

export default Reactions;
