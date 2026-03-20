import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

const CircleMembersModal = ({ circle, onClose }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembers = async () => {
            if (!circle || !circle.memberIds || circle.memberIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const profiles = [];
                const memberIds = circle.memberIds;

                // Fetch in batches of 10 to stay within Firestore limits
                for (let i = 0; i < memberIds.length; i += 10) {
                    const chunk = memberIds.slice(i, i + 10);
                    const q = query(collection(db, 'users'), where('__name__', 'in', chunk));
                    const snap = await getDocs(q);
                    snap.forEach(doc => profiles.push({ id: doc.id, ...doc.data() }));
                }
                setMembers(profiles);
            } catch (err) {
                console.error("Failed to fetch circle members:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();

        // Lock body scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow || 'auto';
        };
    }, [circle]);

    const handleUserClick = (userId) => {
        onClose();
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="circle-members-modal" style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            background: 'var(--color-background)',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 9991, // Higher than navbar
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        color: 'var(--color-text-primary)',
                        display: 'flex'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Circle Members</h3>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' }}>
                    {circle.memberCount || members.length} Souls
                </div>
            </div>

            {/* List Container */}
            <div className="members-container" style={{
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
                maxWidth: '600px',
                margin: '0 auto',
                width: '100%'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
                        Searching for souls...
                    </div>
                ) : members.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '20px', filter: 'grayscale(1)', opacity: 0.5 }}>🫂</div>
                        <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No members yet</p>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', maxWidth: '240px', margin: '0 auto' }}>
                            This circle is waiting for its first souls. Invite your connections to begin the journey.
                        </p>
                    </div>
                ) : (
                    members.map(member => (
                        <div
                            key={member.id}
                            onClick={() => handleUserClick(member.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px',
                                background: 'var(--color-surface)',
                                borderRadius: '16px',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {member.photoURL ? (
                                <img
                                    src={member.photoURL}
                                    alt={member.displayName}
                                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary-soft)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    color: 'var(--color-primary-dark)',
                                    fontSize: '18px'
                                }}>
                                    {member.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '15px' }}>
                                    {member.displayName || 'Anonymous Soul'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                    {member.bio ? (member.bio.substring(0, 40) + (member.bio.length > 40 ? '...' : '')) : 'Walking the path...'}
                                </div>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    ))
                )}
            </div>

            {/* Tablet/Desktop grid enhancement */}
            <style>{`
                @media (min-width: 480px) {
                    .members-container {
                        grid-template-columns: repeat(2, 1fr) !important;
                        max-width: 800px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CircleMembersModal;
