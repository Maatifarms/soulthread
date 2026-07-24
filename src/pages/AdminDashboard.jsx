import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { ShieldCheck, Check, X } from 'lucide-react';

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const [pendingGuides, setPendingGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingGuides();
    }, []);

    const fetchPendingGuides = async () => {
        try {
            const q = query(collection(db, 'guides'), where('verified', '==', false));
            const snap = await getDocs(q);
            setPendingGuides(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Error fetching pending guides:', err);
        } finally {
            setLoading(false);
        }
    };

    const approveGuide = async (id) => {
        if (!window.confirm('Approve this guide? They will be listed publicly.')) return;
        try {
            await updateDoc(doc(db, 'guides', id), { verified: true });
            fetchPendingGuides();
        } catch (err) {
            alert('Error approving guide: ' + err.message);
        }
    };

    const rejectGuide = async (id) => {
        if (!window.confirm('Reject and remove this application?')) return;
        try {
            await updateDoc(doc(db, 'guides', id), { verified: 'rejected' });
            fetchPendingGuides();
        } catch (err) {
            alert('Error rejecting guide: ' + err.message);
        }
    };

    if (loading) return (
        <DesktopLayoutWrapper><div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div></DesktopLayoutWrapper>
    );

    return (
        <DesktopLayoutWrapper>
            <SEO title="Admin Dashboard | SoulThread" />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <ShieldCheck size={32} color="var(--color-primary)" />
                    <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Admin Approvals</h1>
                </div>

                {pendingGuides.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>No pending guide applications.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {pendingGuides.map(guide => (
                            <div key={guide.id} style={{ padding: '24px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>{guide.name}</h3>
                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '12px' }}>
                                            <div><strong>Email:</strong> {guide.email}</div>
                                            <div><strong>Title:</strong> {guide.title}</div>
                                            <div><strong>Experience:</strong> {guide.experience} years</div>
                                            <div><strong>Specialization:</strong> {guide.specialization}</div>
                                            <div><strong>Rate:</strong> ₹{guide.sessionRate}</div>
                                            {guide.rciNumber && <div><strong>RCI:</strong> {guide.rciNumber}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => approveGuide(guide.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-success)', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Check size={16} /> Approve
                                        </button>
                                        <button onClick={() => rejectGuide(guide.id)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-error)', background: 'transparent', color: 'var(--color-error)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <X size={16} /> Reject
                                        </button>
                                    </div>
                                </div>
                                {guide.bio && (
                                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-surface-soft)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        <strong>Bio:</strong> {guide.bio}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DesktopLayoutWrapper>
    );
};

export default AdminDashboard;
