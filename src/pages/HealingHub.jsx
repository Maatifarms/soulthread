import React, { useState } from 'react';

/**
 * HealingHub.jsx — Guided Healing Content Library (Task 65)
 *
 * Exposes a categorized media library containing meditation audio, 
 * breathing exercises, and psychological lessons dynamically recommended.
 */

const CategoryFilters = ['For You', 'Meditation', 'Breathing', 'Anxiety Relief', 'Sleep'];

const ContentLibrary = [
    { id: '1', type: 'audio', duration: '10 min', category: 'Meditation', title: 'Grounding in the Present', author: 'Dr. Aarav Mehta', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop' },
    { id: '2', type: 'video', duration: '5 min', category: 'Breathing', title: 'Box Breathing Exercise', author: 'SoulThread Guide', image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop' },
    { id: '3', type: 'article', duration: '3 min read', category: 'Anxiety Relief', title: 'Understanding Panic Triggers', author: 'Maya Srivastava', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop' },
    { id: '4', type: 'audio', duration: '15 min', category: 'Sleep', title: 'Deep Sleep Frequency', author: 'Therapy Sounds', image: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=600&auto=format&fit=crop' }
];

const HealingHub = () => {
    const [activeCategory, setActiveCategory] = useState('For You');

    const filteredContent = activeCategory === 'For You'
        ? ContentLibrary // Should be hooked to `recommendationEngine` in prod
        : ContentLibrary.filter(c => c.category === activeCategory);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Healing Sanctuary</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                    Curated exercises and lessons to calm your mind and body.
                </p>
            </div>

            <div style={styles.filterScroll}>
                {CategoryFilters.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={activeCategory === cat ? styles.activeFilter : styles.filterBtn}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={styles.grid}>
                {filteredContent.map(item => (
                    <div key={item.id} style={styles.card}>
                        <div style={{ ...styles.cardImg, backgroundImage: `url(${item.image})` }}>
                            <span style={styles.durationBadge}>{item.duration}</span>
                            <span style={styles.typeIcon}>
                                {item.type === 'audio' ? '🎧' : item.type === 'video' ? '▶️' : '📖'}
                            </span>
                        </div>
                        <div style={styles.cardContent}>
                            <span style={styles.categoryTag}>{item.category}</span>
                            <h3 style={{ margin: '8px 0', fontSize: '16px' }}>{item.title}</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>By {item.author}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { marginBottom: '24px' },
    filterScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', scrollbarWidth: 'none' },
    filterBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' },
    activeFilter: { padding: '8px 16px', borderRadius: '20px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { background: 'var(--color-surface)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } },
    cardImg: { height: '160px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    durationBadge: { background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', alignSelf: 'flex-start' },
    typeIcon: { alignSelf: 'flex-end', fontSize: '24px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardContent: { padding: '16px' },
    categoryTag: { fontSize: '11px', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }
};

export default HealingHub;
