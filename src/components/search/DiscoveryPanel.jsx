import React, { useState, useEffect } from 'react';
import { getTrendingTopics } from '../../services/searchService';
import { db } from '../../services/firebase';

/**
 * DiscoveryPanel.jsx — In-App Search Discovery Enhancement (Task 29)
 * Highlights Trending Hashtags, Recommended Topics, and Active Conversations globally.
 */

const DiscoveryPanel = ({ onTagClick }) => {
    const [trendingTags, setTrendingTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTrends = async () => {
            setLoading(true);
            try {
                const tags = await getTrendingTopics(db);
                setTrendingTags(tags);
            } catch (e) {
                console.error("Failed Discovery Load:", e);
            }
            setLoading(false);
        };
        loadTrends();
    }, []);

    if (loading) return <div style={styles.loader}>Exploring the community pulse...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Trending on SoulThread 🔥</h2>

            <div style={styles.section}>
                <h3 style={styles.subHeader}>Top Hashtags</h3>
                <div style={styles.tagsGrid}>
                    {trendingTags.length > 0 ? trendingTags.map(t => (
                        <button key={t.tag} onClick={() => onTagClick(t.tag)} style={styles.tagBtn}>
                            {t.tag} <span style={styles.tagCount}>({t.count})</span>
                        </button>
                    )) : <p style={styles.empty}>No trending topics currently.</p>}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subHeader}>Suggested Topics</h3>
                <div style={styles.topicsList}>
                    <div style={styles.topicCard} onClick={() => onTagClick('Anxiety Management')}>
                        <span style={styles.topicIcon}>🌿</span>
                        <div style={styles.topicInfo}>
                            <h4 style={{ margin: 0 }}>Anxiety Management</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Community driven tips</p>
                        </div>
                    </div>
                    <div style={styles.topicCard} onClick={() => onTagClick('Mindfulness Practices')}>
                        <span style={styles.topicIcon}>🧘‍♀️</span>
                        <div style={styles.topicInfo}>
                            <h4 style={{ margin: 0 }}>Mindfulness Practices</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Meditation & Grounding</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '16px', background: 'var(--color-surface)', borderRadius: '12px', margin: '16px 0', border: '1px solid var(--color-border)' },
    header: { fontSize: '18px', margin: '0 0 16px 0', color: 'var(--color-text-primary)' },
    subHeader: { fontSize: '14px', margin: '0 0 8px 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    section: { marginBottom: '24px' },
    tagsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    tagBtn: { background: 'rgba(139, 169, 137, 0.1)', border: '1px solid var(--color-primary)', borderRadius: '20px', padding: '6px 12px', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    tagCount: { fontSize: '11px', color: 'var(--color-text-muted)' },
    topicsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    topicCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.2s', ':hover': { background: 'var(--color-background)' } },
    topicIcon: { fontSize: '24px' },
    topicInfo: { display: 'flex', flexDirection: 'column' },
    empty: { fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic' },
    loader: { textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }
};

export default DiscoveryPanel;
