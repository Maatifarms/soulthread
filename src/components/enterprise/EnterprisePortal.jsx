import React, { useState } from 'react';

/**
 * EnterprisePortal.jsx — Enterprise Wellness Portal (Task 91)
 *
 * A specialized portal for Universities, Corporations, NGOs to manage their members.
 * Supports SSO provisioning, aggregated insights, and private group governance.
 */

const EnterprisePortal = () => {
    const [activeTab, setActiveTab] = useState('insights');

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.logo}>SoulThread Enterprise</div>
                <div style={styles.orgInfo}>
                    <div style={styles.orgBadge}>Global Tech Corp</div>
                    <div style={styles.orgTier}>Tier: Premium Partner</div>
                </div>
                <nav style={styles.nav}>
                    <button style={activeTab === 'insights' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('insights')}>Insights</button>
                    <button style={activeTab === 'members' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('members')}>Member Access (SSO)</button>
                    <button style={activeTab === 'groups' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('groups')}>Private Groups</button>
                    <button style={activeTab === 'settings' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('settings')}>Integration & Settings</button>
                </nav>
            </div>

            <div style={styles.main}>
                <div style={styles.header}>
                    <h2>Enterprise Dashboard</h2>
                    <button style={styles.primaryBtn}>Export Compliance Report</button>
                </div>

                {activeTab === 'insights' && (
                    <div style={styles.content}>
                        <div style={styles.alertCard}>
                            <strong>Strict Anonymity Enforced:</strong> Individual user data is never shared. All metrics are aggregated across minimum batches of 50 users to ensure complete privacy compliance.
                        </div>
                        <div style={styles.grid}>
                            <div style={styles.card}>
                                <h3>Total Enrolled</h3>
                                <div style={styles.metric}>4,120</div>
                                <div style={styles.subtext}>Active this week: 84%</div>
                            </div>
                            <div style={styles.card}>
                                <h3>Organization Stress Index</h3>
                                <div style={styles.metric}>Medium-High</div>
                                <div style={styles.subtext}>Trending up 12% from last month</div>
                            </div>
                            <div style={styles.card}>
                                <h3>Crisis Interventions</h3>
                                <div style={styles.metric}>4</div>
                                <div style={styles.subtext}>Handled safely by SoulThread AI & Clinicians</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div style={styles.content}>
                        <h3>SSO & Access Management</h3>
                        <p>Configure Google Workspace or Microsoft Azure AD to securely onboard your organization.</p>
                        <div style={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4>Google Workspace Integration</h4>
                                    <p style={styles.subtext}>Status: Active</p>
                                </div>
                                <button style={styles.outlineBtn}>Manage Domains</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', background: 'var(--color-background)', color: 'var(--color-text-primary)', fontFamily: 'system-ui' },
    sidebar: { width: '280px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column' },
    logo: { fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '32px' },
    orgInfo: { padding: '16px', background: 'var(--color-background)', borderRadius: '12px', marginBottom: '32px' },
    orgBadge: { fontWeight: 'bold', fontSize: '15px' },
    orgTier: { fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px' },
    tab: { padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', borderRadius: '8px', fontWeight: '600' },
    activeTab: { padding: '12px 16px', textAlign: 'left', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: 'none', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' },
    main: { flex: 1, padding: '48px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    primaryBtn: { background: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    outlineBtn: { background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    content: { display: 'flex', flexDirection: 'column', gap: '24px' },
    alertCard: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '8px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' },
    card: { background: 'var(--color-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    metric: { fontSize: '36px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '12px 0' },
    subtext: { fontSize: '13px', color: 'var(--color-text-secondary)' }
};

export default EnterprisePortal;
