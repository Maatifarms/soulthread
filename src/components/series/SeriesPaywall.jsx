import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './SeriesPaywall.css';

const SeriesPaywall = ({ seriesId, seriesTitle, onUnlock, isProcessing, paymentError }) => {
    const { currentUser } = useAuth();
    const [showFreeUnlock, setShowFreeUnlock] = useState(false);
    const [promptText, setPromptText] = useState('');
    const [isFreeUnlocking, setIsFreeUnlocking] = useState(false);
    const [freeUnlockSuccess, setFreeUnlockSuccess] = useState(false);

    const handleFreeUnlockSubmit = async (e) => {
        e.preventDefault();
        if (!promptText.trim() || !currentUser) return;

        setIsFreeUnlocking(true);
        try {
            await addDoc(collection(db, 'voluntary_unlocks'), {
                uid: currentUser.uid,
                email: currentUser.email || 'anonymous',
                displayName: currentUser.displayName || 'Anonymous Soul',
                seriesId,
                seriesTitle,
                prompt: promptText.trim(),
                createdAt: serverTimestamp()
            });
            
            setFreeUnlockSuccess(true);
            setTimeout(() => {
                onUnlock(true); // Signal to the parent that we are unlocked (free)
            }, 2000);
        } catch (error) {
            console.error("Free unlock failed:", error);
        } finally {
            setIsFreeUnlocking(false);
        }
    };

    return (
        <div className="series-paywall-overlay">
            <div className="paywall-content">
                <div className="lock-icon-container">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="lock-icon"
                    >
                        🔒
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {!showFreeUnlock ? (
                        <motion.div 
                            key="paywall-main"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="paywall-main"
                        >
                            <h3 className="paywall-title">Continue Decoding {seriesTitle}</h3>
                            <p className="paywall-desc">
                                You've reached the half-way point. 
                                Support the sanctuary to unlock the remaining insights.
                            </p>

                            {paymentError && (
                                <p className="payment-error-text">⚠️ {paymentError}</p>
                            )}

                            <div className="paywall-actions">
                                <button
                                    className="btn-pay-unlock"
                                    onClick={() => onUnlock(false)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Connecting...' : 'Full Access — ₹199'}
                                </button>
                                
                                <button 
                                    className="btn-free-unlock-trigger"
                                    onClick={() => setShowFreeUnlock(true)}
                                    disabled={isProcessing}
                                >
                                    Unlock for Free (Voluntary)
                                </button>
                            </div>
                            <p className="secure-hint">Secure payment via Razorpay</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="paywall-free"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="paywall-free-form"
                        >
                            {!freeUnlockSuccess ? (
                                <>
                                    <h3 className="paywall-title">A Simple Ask</h3>
                                    <p className="paywall-desc">
                                        We believe knowledge should be accessible. 
                                        Tell us how this series is helping you, and you can continue for free.
                                    </p>
                                    <form onSubmit={handleFreeUnlockSubmit}>
                                        <textarea
                                            value={promptText}
                                            onChange={(e) => setPromptText(e.target.value)}
                                            placeholder="Your reflection here..."
                                            required
                                            className="free-unlock-textarea"
                                        />
                                        <div className="free-form-actions">
                                            <button 
                                                type="button" 
                                                className="btn-back"
                                                onClick={() => setShowFreeUnlock(false)}
                                            >
                                                Back
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="btn-submit-free"
                                                disabled={isFreeUnlocking || !promptText.trim()}
                                            >
                                                {isFreeUnlocking ? 'Unlocking...' : 'Submit & Continue'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="success-message">
                                    <div className="check-icon">✓</div>
                                    <h3>Sanctuary Unlocked</h3>
                                    <p>Your reflection has been received. You may continue.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SeriesPaywall;
