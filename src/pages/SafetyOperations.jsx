import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

/**
 * SafetyOperations.jsx — Community Safety Operations Toolkit (Task 38)
 *
 * Exposes a Live Moderation Queue with Bulk Actions and Automated Risk Scoring
 * designed exclusively for admin/moderator workflows.
 */

const SafetyOperations = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(new Set());

    useEffect(() => {
        loadQueue();
    }, []);

    const loadQueue = async () => {
        setLoading(true);
        try {
            // Load pending reports grouped by severity
            const q = query(collection(db, 'reports'), where('status', '==', 'pending'));
            const snap = await getDocs(q);

            // Artificial Risk Scoring (0-100) based on category weight
            const riskMapped = snap.docs.map(doc => {
                const data = doc.data();
                let score = 20;
                if (data.category === 'Self-harm encouragement') score = 95;
                if (data.category === 'Hate speech or bias') score = 85;
                if (data.category === 'Harassment or bullying') score = 70;

                return { id: doc.id, ...data, riskScore: score };
            });

            // Sort highest risk first
            riskMapped.sort((a, b) => b.riskScore - a.riskScore);
            setQueue(riskMapped);
        } catch (e) {
            console.error("Queue load failed", e);
        }
        setLoading(false);
    };

    const toggleSelection = (id) => {
        const next = new Set(selectedItems);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedItems(next);
    };

    const handleBulkAction = async (action) => {
        if (selectedItems.size === 0) return;
        const confirmMsg = `Are you sure you want to execute [${action}] on ${selectedItems.size} items?`;
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            for (let reportId of selectedItems) {
                const report = queue.find(q => q.id === reportId);

                if (action === 'dismiss') {
                    await deleteDoc(doc(db, 'reports', reportId));
                } else if (action === 'delete_content') {
                    if (report.targetType === 'post') await deleteDoc(doc(db, 'posts', report.targetId));
                    await updateDoc(doc(db, 'reports', reportId), { status: 'resolved_deleted' });
                } else if (action === 'suspend_user') {
                    await updateDoc(doc(db, 'users', report.targetId), { isSuspended: true });
                    await updateDoc(doc(db, 'reports', reportId), { status: 'resolved_suspended' });
                }
            }
            alert(`Bulk action [${action}] succeeded.`);
            setSelectedItems(new Set());
            loadQueue();
        } catch (e) {
            alert("Bulk action failed.");
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0 }}>Safety Operations Live Queue</h1>
                <div style={styles.toolbar}>
                    <button onClick={() => handleBulkAction('dismiss')} style={styles.btnSecondary} disabled={selectedItems.size === 0}>Dismiss Selected</button>
                    <button onClick={() => handleBulkAction('delete_content')} style={styles.btnWarning} disabled={selectedItems.size === 0}>Delete Content</button>
                    <button onClick={() => handleBulkAction('suspend_user')} style={styles.btnDanger} disabled={selectedItems.size === 0}>Suspend Users</button>
                </div>
            </div>

            {loading ? <p>Syncing live feed...</p> : (
                <div style={styles.grid}>
                    {queue.length === 0 ? <p>Queue is totally clear! 🌿</p> : queue.map(item => (
                        <div key={item.id} style={{ ...styles.card, borderLeftColor: getRiskColor(item.riskScore) }}>
                            <div style={styles.cardHeader}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => toggleSelection(item.id)}
                                        style={styles.checkbox}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>{item.category}</span>
                                </div>
                                <span style={{ ...styles.riskBadge, background: getRiskColor(item.riskScore), color: 'white' }}>
                                    Risk: {item.riskScore}
                                </span>
                            </div>

                            <div style={styles.cardBody}>
                                <p><strong>Target Type:</strong> {item.targetType}</p>
                                <p><strong>Target ID:</strong> {item.targetId}</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Report ID: {item.id}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getRiskColor = (score) => {
    if (score >= 90) return '#ef4444'; // Red critical
    if (score >= 70) return '#f97316'; // Orange warning
    return '#fbbf24'; // Yellow attention
};

const styles = {
    container: { padding: '32px', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' },
    toolbar: { display: 'flex', gap: '12px' },
    btnSecondary: { padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer', background: 'var(--color-surface)', color: 'var(--color-text-primary)' },
    btnWarning: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#f97316', color: 'white', fontWeight: 'bold' },
    btnDanger: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#dc2626', color: 'white', fontWeight: 'bold' },
    grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: { background: 'var(--color-surface)', padding: '16px', borderRadius: '12px', borderLeft: '6px solid', boxShadow: 'var(--shadow-sm)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
    riskBadge: { padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
    cardBody: { fontSize: '14px', lineHeight: '1.6' }
};

export default SafetyOperations;
