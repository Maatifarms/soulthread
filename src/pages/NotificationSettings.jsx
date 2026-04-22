import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const NotificationSettings = () => {
    const { currentUser } = useAuth();
    const [settings, setSettings] = useState({
        postLikes: true,
        postComments: true,
        replies: true,
        newFollowers: true,
        announcements: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        muteConversations: false
    });
    const [emailDigest, setEmailDigest] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const loadSettings = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.notificationPrefs) {
                        setSettings(prev => ({ ...prev, ...data.notificationPrefs }));
                    }
                    if (typeof data.emailDigest === 'boolean') {
                        setEmailDigest(data.emailDigest);
                    }
                }
            } catch (err) {
                console.error("Failed to load notification settings", err);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, [currentUser]);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                notificationPrefs: settings,
                emailDigest,           // top-level field — queried by weekly digest function
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error("Failed to save settings", err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={styles.container}>Loading preferences...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Notification Preferences</h1>
            <p style={styles.description}>Stay connected, but on your own terms. Control exactly what alerts you receive.</p>

            <div style={styles.section}>
                <h3>Interactive Alerts</h3>
                <div style={styles.toggleRow}>
                    <span>Likes on your posts</span>
                    <input type="checkbox" checked={settings.postLikes} onChange={(e) => handleChange('postLikes', e.target.checked)} />
                </div>
                <div style={styles.toggleRow}>
                    <span>New comments</span>
                    <input type="checkbox" checked={settings.postComments} onChange={(e) => handleChange('postComments', e.target.checked)} />
                </div>
                <div style={styles.toggleRow}>
                    <span>Replies to your comments</span>
                    <input type="checkbox" checked={settings.replies} onChange={(e) => handleChange('replies', e.target.checked)} />
                </div>
            </div>

            <div style={styles.section}>
                <h3>Community & Growth</h3>
                <div style={styles.toggleRow}>
                    <span>New Followers</span>
                    <input type="checkbox" checked={settings.newFollowers} onChange={(e) => handleChange('newFollowers', e.target.checked)} />
                </div>
                <div style={styles.toggleRow}>
                    <span>SoulThread Announcements</span>
                    <input type="checkbox" checked={settings.announcements} onChange={(e) => handleChange('announcements', e.target.checked)} />
                </div>
            </div>

            <div style={styles.section}>
                <h3>Email Preferences</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
                    Sent to your account email. Unsubscribe any time.
                </p>
                <div style={styles.toggleRow}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Weekly Digest</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            Top posts from your community, every Sunday morning
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={emailDigest}
                        onChange={(e) => setEmailDigest(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                </div>
            </div>

            <div style={styles.section}>
                <h3>Focus & Privacy</h3>
                <div style={styles.toggleRow}>
                    <span>Mute All Chat Conversations</span>
                    <input type="checkbox" checked={settings.muteConversations} onChange={(e) => handleChange('muteConversations', e.target.checked)} />
                </div>
                <div style={styles.toggleRow}>
                    <span>Enable Quiet Hours</span>
                    <input type="checkbox" checked={settings.quietHoursEnabled} onChange={(e) => handleChange('quietHoursEnabled', e.target.checked)} />
                </div>

                {settings.quietHoursEnabled && (
                    <div style={styles.timeRow}>
                        <label>From: <input type="time" value={settings.quietHoursStart} onChange={(e) => handleChange('quietHoursStart', e.target.value)} /></label>
                        <label>To: <input type="time" value={settings.quietHoursEnd} onChange={(e) => handleChange('quietHoursEnd', e.target.value)} /></label>
                    </div>
                )}
            </div>

            <button onClick={handleSave} disabled={saving} style={{
                ...styles.saveBtn,
                background: saved ? '#16a34a' : 'var(--color-primary)',
                transition: 'background 0.3s ease'
            }}>
                {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Preferences'}
            </button>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '600px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { fontSize: '24px', marginBottom: '8px' },
    description: { color: 'var(--color-text-secondary)', marginBottom: '32px' },
    section: { background: 'var(--color-surface)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--color-border)' },
    toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0', fontSize: '15px' },
    timeRow: { display: 'flex', gap: '16px', marginTop: '16px', padding: '12px', background: 'var(--color-background)', borderRadius: '8px' },
    saveBtn: { width: '100%', padding: '16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: 1 }
};

export default NotificationSettings;
