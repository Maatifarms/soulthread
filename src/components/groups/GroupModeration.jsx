import React, { useState } from 'react';

/**
 * GroupModeration.jsx — Group Moderation System (Task 72)
 *
 * Exposes a control panel for Trusted Group Moderators. 
 * Handles post approval queues, muting toxic users, and managing pinned guidelines.
 */

const MockQueue = [
    { id: 'mq1', user: 'anon_421', text: 'Does anyone else feel completely trapped?', aiScore: 0.12, status: 'pending' },
    { id: 'mq2', user: 'anon_99', text: 'Buy cheap crypto here!', aiScore: 0.98, status: 'flagged_ai' }
];

const GroupModeration = ({ groupId = 'anx_01' }) => {
    const [queue, setQueue] = useState(MockQueue);
    const [mutedUsers, setMutedUsers] = useState(['anon_77', 'toxic_user22']);

    const handleAction = (postId, action) => {
        // e.g. Approve or Reject post from the Mod Queue
        console.log(`[Moderation] ${action.toUpperCase()} post ${postId}`);
        setQueue(prev => prev.filter(q => q.id !== postId));

        if (action === 'approve') {
            // Push to public group feed
        } else if (action === 'reject') {
            // Delete payload silently
        }
    };

    const handleMute = (username) => {
        console.log(`[Moderation] Muted user ${username} for 24h.`);
        setMutedUsers(prev => [...prev, username]);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Moderator Control Room</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                    Protect the sanctuary. AI pre-scans all group submissions.
                </p>
            </div>

            <div style={styles.section}>
                <h3 style={styles.title}>Post Approval Queue</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Posts flagged by AI filters require manual review.</p>

                {queue.length === 0 ? (
                    <div style={styles.emptyState}>Queue is clean. Great job! 🌱</div>
                ) : (
                    <div style={styles.list}>
                        {queue.map(q => (
                            <div key={q.id} style={styles.queueItem}>
                                <div style={styles.queueMeta}>
                                    <span style={{ fontWeight: 'bold' }}>{q.user}</span>
                                    <span style={{
                                        color: q.aiScore > 0.8 ? '#ef4444' : '#10b981',
                                        fontSize: '11px', fontWeight: 'bold'
                                    }}>
                                        AI Risk: {(q.aiScore * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p style={styles.queueText}>{q.text}</p>
                                <div style={styles.queueActions}>
                                    <button onClick={() => handleAction(q.id, 'reject')} style={styles.rejectBtn}>Delete & Warn</button>
                                    <button onClick={() => handleAction(q.id, 'approve')} style={styles.approveBtn}>Approve Post</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={styles.section}>
                <h3 style={styles.title}>Manage Pinned Guidelines</h3>
                <textarea
                    style={styles.textArea}
                    defaultValue={"1. No medical advice.\n2. Be kind and respectful.\n3. Keep matters strictly private."}
                />
                <button style={styles.saveBtn}>Update Group Rules</button>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' },
    section: { background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)', marginBottom: '20px' },
    title: { margin: '0 0 8px', fontSize: '18px' },
    emptyState: { padding: '32px', textAlign: 'center', background: 'var(--color-background)', borderRadius: '12px', marginTop: '16px' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
    queueItem: { padding: '16px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px' },
    queueMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' },
    queueText: { margin: '0 0 16px', fontSize: '15px' },
    queueActions: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
    rejectBtn: { padding: '8px 16px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    approveBtn: { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    textArea: { width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)' },
    saveBtn: { marginTop: '12px', padding: '10px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default GroupModeration;
