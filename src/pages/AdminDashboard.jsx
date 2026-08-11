import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { ShieldCheck, Check, X, AlertTriangle, FileText, Settings, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('approvals'); // approvals | fulfillments | moderation
    
    const [pendingGuides, setPendingGuides] = useState([]);
    const [manualFulfillments, setManualFulfillments] = useState([]);
    const [flaggedPosts, setFlaggedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            if (activeTab === 'approvals') {
                const q = query(collection(db, 'guides'), where('verified', '==', false));
                const snap = await getDocs(q);
                const guides = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // guides is publicly readable, so contact email isn't stored there —
                // pull it from the applicant's own users/{uid} doc for this admin-only view.
                const withEmails = await Promise.all(guides.map(async (g) => {
                    try {
                        const userSnap = await getDoc(doc(db, 'users', g.id));
                        return { ...g, email: userSnap.exists() ? userSnap.data().email : null };
                    } catch {
                        return { ...g, email: null };
                    }
                }));
                setPendingGuides(withEmails);
            } else if (activeTab === 'fulfillments') {
                const q = query(collection(db, 'orders'), where('needsManualFulfillment', '==', true));
                const snap = await getDocs(q);
                setManualFulfillments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } else if (activeTab === 'moderation') {
                const q = query(collection(db, 'posts'), where('isFlagged', '==', true));
                const snap = await getDocs(q);
                setFlaggedPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // -- Guide Approvals --
    const approveGuide = async (id) => {
        if (!window.confirm('Approve this guide? They will be listed publicly.')) return;
        try {
            await updateDoc(doc(db, 'guides', id), { verified: true });
            fetchData();
        } catch (err) {
            alert('Error approving guide: ' + err.message);
        }
    };

    const rejectGuide = async (id) => {
        if (!window.confirm('Reject and remove this application?')) return;
        try {
            await updateDoc(doc(db, 'guides', id), { verified: 'rejected' });
            fetchData();
        } catch (err) {
            alert('Error rejecting guide: ' + err.message);
        }
    };

    // -- Order Fulfillments --
    const resolveFulfillment = async (id) => {
        if (!window.confirm('Mark this order as manually fulfilled?')) return;
        try {
            await updateDoc(doc(db, 'orders', id), { needsManualFulfillment: false });
            fetchData();
        } catch (err) {
            alert('Error resolving fulfillment: ' + err.message);
        }
    };

    // -- Moderation --
    const dismissFlag = async (id) => {
        if (!window.confirm('Dismiss this flag? The post will remain visible.')) return;
        try {
            await updateDoc(doc(db, 'posts', id), { isFlagged: false });
            fetchData();
        } catch (err) {
            alert('Error dismissing flag: ' + err.message);
        }
    };

    const deleteFlaggedPost = async (id) => {
        if (!window.confirm('Delete this post permanently?')) return;
        try {
            await deleteDoc(doc(db, 'posts', id));
            fetchData();
        } catch (err) {
            alert('Error deleting post: ' + err.message);
        }
    };

    return (
        <DesktopLayoutWrapper>
            <SEO title="Admin Platform | SoulThread" />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Settings size={32} color="var(--color-primary)" />
                    <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Platform Administration</h1>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                    <button 
                        onClick={() => setActiveTab('approvals')}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'approvals' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'approvals' ? 'white' : 'var(--color-text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Guide Approvals
                    </button>
                    <button 
                        onClick={() => setActiveTab('fulfillments')}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'fulfillments' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'fulfillments' ? 'white' : 'var(--color-text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Manual Fulfillments
                    </button>
                    <button 
                        onClick={() => setActiveTab('moderation')}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'moderation' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'moderation' ? 'white' : 'var(--color-text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Moderation
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                        <AlertTriangle size={32} color="#dc2626" style={{ marginBottom: '12px' }} />
                        <p style={{ color: '#991b1b', fontSize: '1.1rem', margin: '0 0 16px 0' }}>Couldn't load this data. Please try again.</p>
                        <button onClick={fetchData} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                            Retry
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Approvals Tab */}
                        {activeTab === 'approvals' && (
                            pendingGuides.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>No pending guide applications.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {pendingGuides.map(guide => (
                                        <div key={guide.id} style={{ padding: '24px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>{guide.name}</h3>
                                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '12px' }}>
                                                        <div><strong>Email:</strong> {guide.email || 'Not provided'}</div>
                                                        <div><strong>Title:</strong> {guide.title || guide.degree || 'Clinical Psychologist'}</div>
                                                        <div><strong>Experience:</strong> {guide.experience || 'Not specified'}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button onClick={() => approveGuide(guide.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-success)', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Check size={16} /> Approve
                                                    </button>
                                                    <button onClick={() => rejectGuide(guide.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-error)', background: 'transparent', color: 'var(--color-error)', fontWeight: 'bold', cursor: 'pointer' }}>
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Fulfillments Tab */}
                        {activeTab === 'fulfillments' && (
                            manualFulfillments.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>No pending manual fulfillments.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {manualFulfillments.map(order => (
                                        <div key={order.id} style={{ padding: '24px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>Order: {order.id}</h3>
                                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                                        <div><strong>Amount:</strong> {order.currency} {order.amount}</div>
                                                        <div><strong>Status:</strong> {order.status}</div>
                                                        <div><strong>Missing:</strong> {order.kind === 'session' ? 'Guide ID or Slot' : 'Plan Details'}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => resolveFulfillment(order.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                                    Mark Resolved
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Moderation Tab */}
                        {activeTab === 'moderation' && (
                            flaggedPosts.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>No flagged posts requiring moderation.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {flaggedPosts.map(post => (
                                        <div key={post.id} style={{ padding: '24px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                        <AlertTriangle size={20} color="#dc2626" />
                                                        <h3 style={{ margin: 0, color: '#991b1b' }}>Flagged Post</h3>
                                                    </div>
                                                    <p style={{ color: '#7f1d1d', margin: '0 0 12px 0', fontStyle: 'italic' }}>"{post.content}"</p>
                                                    <div style={{ color: '#991b1b', fontSize: '0.85rem' }}>
                                                        By: {post.authorName} ({post.authorId})
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button onClick={() => dismissFlag(post.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer' }}>
                                                        Dismiss Flag
                                                    </button>
                                                    <button onClick={() => deleteFlaggedPost(post.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Trash2 size={16} /> Delete Post
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </DesktopLayoutWrapper>
    );
};

export default AdminDashboard;
