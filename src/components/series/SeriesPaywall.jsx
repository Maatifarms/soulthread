import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import './SeriesPaywall.css';

const SeriesPaywall = ({ seriesId, seriesTitle, onUnlock, isProcessing, paymentError }) => {
    const { currentUser } = useAuth();

    const handleFreeUnlock = async () => {
        if (!currentUser) return;
        try {
            const accessRef = doc(db, 'users', currentUser.uid, 'series_access', seriesId);
            await setDoc(accessRef, {
                accessType: 'voluntary_free',
                grantedAt: serverTimestamp()
            }, { merge: true });
            onUnlock(true); // Signal to the parent that we are unlocked (free)
        } catch (error) {
            console.error("Free unlock failed:", error);
        }
    };

    return (
        <div className="series-paywall">
            <div className="series-paywall-icon">🔒</div>
            <h3 className="series-paywall-title">
                You've reached the halfway point
            </h3>
            <p className="series-paywall-sub">
                Support SoulThread to continue — or unlock free 
                if you genuinely cannot afford it.
            </p>
            
            {paymentError && (
                <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{paymentError}</p>
            )}

            <button 
                className="series-pay-btn"
                onClick={() => onUnlock(false)}
                disabled={isProcessing}
            >
                {isProcessing ? 'Connecting...' : 'Support & Continue — ₹199'}
                {!isProcessing && (
                    <span className="series-pay-sub">
                        One-time for this series
                    </span>
                )}
            </button>
            
            <div className="series-paywall-divider">or</div>
            
            <button 
                className="series-free-btn"
                onClick={handleFreeUnlock}
                disabled={isProcessing}
            >
                I cannot afford this — unlock free
            </button>
            
            <p className="series-paywall-note">
                No questions asked. We believe in access for all.
            </p>
        </div>
    );
};

export default SeriesPaywall;
