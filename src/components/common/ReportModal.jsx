import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';

const REPORT_CATEGORIES = [
    "Harassment or bullying",
    "Hate speech or bias",
    "Self-harm encouragement",
    "Spam or misleading",
    "Inappropriate content"
];

const ReportModal = ({ targetId, targetType = 'post', onClose }) => {
    const { currentUser } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!selectedCategory || !currentUser) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'reports'), {
                targetId,
                targetType,
                category: selectedCategory,
                reportedBy: currentUser.uid,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setSuccess(true);
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error("Failed to submit report.", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {success ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <CheckCircle size={48} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                        <h3>Report Submitted</h3>
                        <p>Our moderation team is reviewing this case.</p>
                    </div>
                ) : (
                    <>
                        <h2 style={styles.header}>Report {targetType}</h2>
                        <p style={styles.desc}>Why are you reporting this? In SoulThread, community safety is our paramount concern.</p>

                        <div style={styles.options}>
                            {REPORT_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        ...styles.optionBtn,
                                        borderColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                                        background: selectedCategory === cat ? 'rgba(139, 169, 137, 0.1)' : 'transparent'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div style={styles.actions}>
                            <button onClick={onClose} style={styles.cancelBtn} disabled={isSubmitting}>Cancel</button>
                            <button
                                onClick={handleSubmit}
                                style={styles.submitBtn}
                                disabled={!selectedCategory || isSubmitting}
                            >
                                {isSubmitting ? 'Reporting...' : 'Submit Report'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'var(--color-surface)', borderRadius: '16px', padding: '24px', width: '90%', maxWidth: '400px', color: 'var(--color-text-primary)' },
    header: { marginTop: 0, fontSize: '20px' },
    desc: { fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' },
    options: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' },
    optionBtn: { padding: '12px', borderRadius: '8px', border: '1px solid', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-primary)' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    cancelBtn: { padding: '8px 16px', borderRadius: '24px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' },
    submitBtn: { padding: '8px 16px', borderRadius: '24px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
};

export default ReportModal;
