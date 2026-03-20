import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * FeedbackForm.jsx — User Feedback Collection System (Task 32)
 *
 * Plugs directly into a custom 'feedback' collection, categorized 
 * by Bug, Feature Request, or General Rating.
 */

const FeedbackForm = ({ onClose }) => {
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                rating,
                category,
                comment,
                os: navigator.userAgent, // Include device context
                timestamp: serverTimestamp()
            });
            setSuccess(true);
            setTimeout(onClose, 2500);
        } catch (error) {
            console.error("Feedback failed:", error);
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {success ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <h2>Thank you! 🌿</h2>
                        <p>Your feedback helps us grow a better SoulThread.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Share your thoughts</h2>

                        <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>How is your experience?</p>
                            <div style={styles.ratingRow}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setRating(num)}
                                        style={{ ...styles.starBtn, color: num <= rating ? '#fbbf24' : '#e5e7eb' }}
                                    >★</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>What is this about?</p>
                            <select value={category} onChange={e => setCategory(e.target.value)} required style={styles.select}>
                                <option value="" disabled>Select category...</option>
                                <option value="bug">Report a Bug / Glitch</option>
                                <option value="feature">Suggest a Feature</option>
                                <option value="general">General Feedback</option>
                                <option value="content">Content Policy</option>
                            </select>
                        </div>

                        <div>
                            <textarea
                                placeholder="Give us the details..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows="4"
                                required
                                style={styles.textarea}
                            />
                        </div>

                        <div style={styles.actions}>
                            <button type="button" onClick={onClose} style={styles.cancelBtn} disabled={submitting}>Cancel</button>
                            <button type="submit" style={styles.submitBtn} disabled={!rating || !category || submitting}>
                                {submitting ? 'Sending...' : 'Send Feedback'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 },
    modal: { background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-lg)' },
    ratingRow: { display: 'flex', gap: '8px' },
    starBtn: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', padding: 0, transition: 'color 0.2s' },
    select: { padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', fontSize: '14px' },
    textarea: { padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)', resize: 'none', fontSize: '14px', boxSizing: 'border-box' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
    cancelBtn: { padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' },
    submitBtn: { padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default FeedbackForm;
