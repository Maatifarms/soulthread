import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from '../components/common/Skeleton';

const ModerationQueue = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'posts'),
                where('requiresModeratorAttention', '==', true),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Moderation Queue Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleAction = async (postId, action, data = {}) => {
        setActioningId(postId);
        try {
            const postRef = doc(db, 'posts', postId);

            if (action === 'approve') {
                await updateDoc(postRef, {
                    requiresModeratorAttention: false,
                    needsReview: false,
                    approvedBy: currentUser.uid,
                    approvedAt: serverTimestamp()
                });
            } else if (action === 'recategorize') {
                await updateDoc(postRef, {
                    categoryId: data.categoryId,
                    requiresModeratorAttention: false,
                    needsReview: false,
                    correctedBy: currentUser.uid,
                    correctedAt: serverTimestamp()
                });
                // Log correction (Audit)
                await addDoc(collection(db, 'classification_audit_logs'), {
                    storyId: postId,
                    correctedCategory: data.categoryId,
                    correctedBy: currentUser.uid,
                    timestamp: serverTimestamp()
                });
            }

            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            console.error("Moderation Action Error:", err);
            alert("Action failed. Check console.");
        } finally {
            setActioningId(null);
        }
    };

    if (loading && posts.length === 0) return <Skeleton count={3} height="150px" style={{ marginBottom: '20px' }} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Safety & Review Queue ({posts.length})</h3>
                <button onClick={fetchQueue} className="btn-ghost" style={{ fontSize: '12px' }}>Refresh</button>
            </div>

            {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-surface-2)', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>The sanctuary is safe. No posts require attention! 🌿</p>
                </div>
            )}

            {posts.map(post => (
                <div key={post.id} style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '20px',
                    position: 'relative'
                }}>
                    {/* Flags */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {post.crisisFlag && (
                            <span style={{
                                padding: '4px 10px', background: '#fee2e2', color: '#dc2626',
                                borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                                border: '1px solid #fecaca'
                            }}>
                                ⚠️ CRISIS RISK ({Math.round(post.selfHarmRiskScore * 100)}%)
                            </span>
                        )}
                        {post.confidenceScore < 0.7 && (
                            <span style={{
                                padding: '4px 10px', background: '#fef3c7', color: '#d97706',
                                borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                                border: '1px solid #fde68a'
                            }}>
                                🤖 LOW CONFIDENCE ({Math.round(post.confidenceScore * 100)}%)
                            </span>
                        )}
                        {post.isIncognito && (
                            <span style={{ padding: '4px 10px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                                🕵️ INCOGNITO
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                            Content:
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-primary)' }}>
                            {post.content}
                        </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            Author ID: <code style={{ color: 'var(--color-primary)' }}>{post.authorId}</code>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                disabled={actioningId === post.id}
                                onClick={() => handleAction(post.id, 'approve')}
                                className="btn-primary"
                                style={{ fontSize: '12px', padding: '6px 14px' }}
                            >
                                {actioningId === post.id ? 'Processing...' : 'Approve & Clear'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ModerationQueue;
