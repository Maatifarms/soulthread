import React from 'react';

/**
 * PartnershipNetwork.jsx — Global Mental Health Partnership Network (Task 119)
 *
 * A collaborative interface for NGOs, Universities, and Health Agencies 
 * to coordinate cross-platform wellness initiatives.
 */

const PartnershipNetwork = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Partnership Network</h1>
                <p>Coordinating global mental health infrastructure with trusted institutions.</p>
            </div>

            <div style={styles.partnerList}>
                <div style={styles.partnerCard}>
                    <div style={styles.meta}>
                        <h3 style={{ margin: 0 }}>WHO Wellness Initiative</h3>
                        <span style={styles.badge}>Strategic Partner</span>
                    </div>
                    <p style={styles.desc}>Co-developing the "Public Health Sentinel" predictive protocols.</p>
                    <div style={styles.actions}>
                        <button style={styles.btn}>Shared Research</button>
                        <button style={styles.btn}>Active Campaigns</button>
                    </div>
                </div>

                <div style={styles.partnerCard}>
                    <div style={styles.meta}>
                        <h3 style={{ margin: 0 }}>Standard University</h3>
                        <span style={styles.badge}>Verified Campus</span>
                    </div>
                    <p style={styles.desc}>Deploying campus-support modes and accredited peer-listening credits.</p>
                    <div style={styles.actions}>
                        <button style={styles.btn}>Student Metrics</button>
                        <button style={styles.btn}>Admin Liaison</button>
                    </div>
                </div>
            </div>

            <button style={styles.primaryBtn}>+ Proposal for New Partnership</button>
        </div>
    );
};

const styles = {
    container: { padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui' },
    header: { marginBottom: '40px' },
    partnerList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    partnerCard: { background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    badge: { background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
    desc: { fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' },
    actions: { display: 'flex', gap: '12px' },
    btn: { background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-primary)' },
    primaryBtn: { marginTop: '32px', width: '100%', padding: '16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};

export default PartnershipNetwork;
