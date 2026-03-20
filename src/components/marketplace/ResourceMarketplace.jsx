import React from 'react';

/**
 * ResourceMarketplace.jsx — Mental Health Resource Marketplace (Task 97)
 *
 * Monetizable, moderated grid scaling high-quality curated wellness resources.
 * Only Verified Practitioners can publish to this storefront.
 */

const MockResources = [
    { title: "Cognitive Processing Workbook", author: "Dr. L. Myers", type: "PDF / Workbook", price: "$14.99", rating: "4.9" },
    { title: "Somatic Healing Audio Series", author: "Institute for Mind/Body", type: "Audio Course", price: "$29.00", rating: "4.8" },
    { title: "Anxiety First-Aid Kit", author: "Verified NGO", type: "Interactive Toolkit", price: "Free", rating: "5.0" }
];

const ResourceMarketplace = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: '0 0 8px' }}>SoulThread Resource Market</h1>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Clinically reviewed books, courses, and toolkits curated for your journey.</p>
            </div>

            <div style={styles.grid}>
                {MockResources.map((item, i) => (
                    <div key={i} style={styles.card}>
                        <div style={styles.cardVisual}>{item.type.split(' ')[0]}</div>
                        <div style={styles.cardContent}>
                            <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{item.title}</h3>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>by <b>{item.author}</b> ✅</div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: item.price === 'Free' ? '#10b981' : 'var(--color-text-primary)' }}>{item.price}</span>
                                    <span style={{ fontSize: '12px', marginLeft: '8px', color: '#fbbf24' }}>★ {item.rating}</span>
                                </div>
                                <button style={styles.buyBtn}>{item.price === 'Free' ? 'Get' : 'Buy'}</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui', color: 'var(--color-text-primary)' },
    header: { marginBottom: '32px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
    card: { background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
    cardVisual: { height: '140px', background: 'linear-gradient(45deg, var(--color-primary-light), #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)' },
    cardContent: { padding: '20px' },
    buyBtn: { background: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }
};

export default ResourceMarketplace;
