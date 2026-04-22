import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, getDoc, setDoc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../common/LoginModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Handshake, Sparkles, ShieldCheck, Waves, Share2 } from 'lucide-react';

const REACTION_TYPES = [
    { label: 'Care', name: 'care', icon: Heart, color: '#f43f5e' },
    { label: 'Heard', name: 'heard', icon: Handshake, color: '#6366f1' },
    { label: 'Glow', name: 'glow', icon: Sparkles, color: '#f59e0b' },
    { label: 'Solid', name: 'solid', icon: ShieldCheck, color: '#10b981' },
    { label: 'Flow', name: 'flow', icon: Waves, color: '#06b6d4' }
];

const Reactions = ({ postId, postAuthorId, initialCounts = {} }) => {
    const { currentUser } = useAuth();
    const [counts, setCounts] = useState(initialCounts);
    const [userReaction, setUserReaction] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    
    const containerRef = useRef(null);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);

    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            setHasBeenVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setHasBeenVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (hasBeenVisible) {
            fetchUserReaction();
        }
    }, [hasBeenVisible, postId, currentUser]);

    useEffect(() => {
        if (initialCounts) {
            setCounts(initialCounts);
        }
    }, [initialCounts]);

    const fetchUserReaction = async () => {
        if (!currentUser || !postId) return;
        try {
            const userReactionRef = doc(db, 'posts', postId, 'reactions', currentUser.uid);
            const userSnap = await getDoc(userReactionRef);
            if (userSnap.exists()) {
                setUserReaction(userSnap.data().type);
            } else {
                setUserReaction(null);
            }
        } catch (e) {
            console.warn("[Reactions] Silently failed to fetch user reaction.");
        }
    };

    const handleReact = async (type) => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        setShowPicker(false);

        const prevReaction = userReaction;
        const prevCounts = { ...counts };
        let newCounts = { ...counts };

        if (userReaction === type) {
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

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SoulThread Sanctuary',
                    text: 'Someone shared their soul with the circle. Come read and connect.',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        }
    };

    const activeReaction = REACTION_TYPES.find(r => r.name === userReaction);
    const ActiveIcon = activeReaction?.icon || Heart;

    return (
        <div ref={containerRef} style={{ position: 'relative', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            if (userReaction) {
                                handleReact(userReaction);
                            } else {
                                setShowPicker(!showPicker);
                            }
                        }}
                        style={{
                            background: userReaction ? `${activeReaction?.color}15` : 'var(--color-surface-2)',
                            borderRadius: 'var(--radius-full)',
                            padding: '10px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: userReaction ? activeReaction?.color : 'var(--color-text-primary)',
                            fontWeight: '700',
                            fontSize: '14px',
                            border: userReaction ? `1px solid ${activeReaction?.color}30` : '1px solid transparent',
                            boxShadow: userReaction ? `0 4px 12px ${activeReaction?.color}20` : 'none',
                            transition: 'var(--transition-liquid)',
                        }}
                    >
                        <ActiveIcon size={18} fill={userReaction ? activeReaction?.color : 'none'} />
                        <span>{userReaction ? activeReaction?.label : 'Care'}</span>
                    </motion.button>

                    <AnimatePresence>
                        {showPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '0',
                                    marginBottom: '10px',
                                    background: 'var(--glass-bg)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '8px',
                                    display: 'flex',
                                    gap: '8px',
                                    boxShadow: 'var(--luxury-shadow)',
                                    border: '1px solid var(--glass-border)',
                                    zIndex: 100,
                                    backdropFilter: 'var(--glass-blur)',
                                }}
                            >
                                {REACTION_TYPES.map((reaction) => {
                                    const Icon = reaction.icon;
                                    return (
                                        <motion.button
                                            key={reaction.name}
                                            whileHover={{ scale: 1.25, y: -4 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleReact(reaction.name)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                color: reaction.color,
                                                cursor: 'pointer',
                                            }}
                                            title={reaction.label}
                                        >
                                            <Icon size={24} fill="none" />
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                    {REACTION_TYPES.map(reaction => (
                        counts[reaction.name] > 0 && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={reaction.name} 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: 'var(--color-surface)',
                                    padding: '3px 8px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    color: reaction.color,
                                    boxShadow: 'var(--shadow-sm)',
                                    border: `1px solid ${reaction.color}20`,
                                }}
                            >
                                <reaction.icon size={11} fill={reaction.color} />
                                <span>{counts[reaction.name]}</span>
                            </motion.div>
                        )
                    ))}
                </div>
            </div>
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </div>
    );
};

export default Reactions;
