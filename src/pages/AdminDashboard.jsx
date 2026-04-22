import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import GrowthOutreach from '../components/admin/GrowthOutreach';
import { 
    LayoutDashboard, 
    Share2, 
    RefreshCcw, 
    BarChart3, 
    ShieldAlert, 
    CreditCard,
    DollarSign,
    Users,
    ArrowUpRight
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [reports, setReports] = useState([]);
    const [payments, setPayments] = useState([]);
    const [revenueStats, setRevenueStats] = useState({ gmv: 0, net: 0, subCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Moderation Reports
            const qRep = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
            const snapRep = await getDocs(qRep);
            setReports(snapRep.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Revenue Data
            const qPay = query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(50));
            const snapPay = await getDocs(qPay);
            const payData = snapPay.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayments(payData);

            // Detailed Bookings (for commissions)
            const qBook = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(50));
            const snapBook = await getDocs(qBook);
            const bookData = snapBook.docs.map(doc => doc.data());

            // Calculate Metrics
            let gmv = 0;
            let net = 0;
            
            payData.forEach(p => {
                gmv += Number(p.amount) || 0;
                // If it's a platform product (Series or Sub), net = 100%
                if (p.productId === 'soul_basic' || p.productId === 'soul_pro') {
                    net += Number(p.amount);
                }
            });

            // Add Marketplace Commissions (20% of GMV)
            bookData.forEach(b => {
                if (b.status === 'confirmed') {
                    net += (b.platformCommission || 0);
                }
            });

            setRevenueStats({
                gmv: gmv,
                net: net,
                subCount: payData.filter(p => p.productId === 'soul_pro').length
            });

        } catch (error) {
            console.error("Failed to load admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reportId, targetId, action) => {
        try {
            if (action === 'dismiss') {
                await deleteDoc(doc(db, 'reports', reportId));
            } else if (action === 'suspend_user') {
                await updateDoc(doc(db, 'users', targetId), { isSuspended: true });
                await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
            } else if (action === 'delete_post') {
                await deleteDoc(doc(db, 'posts', targetId));
                await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
            }
            alert("Action executed successfully.");
            loadData(); // Refresh
        } catch (error) {
            alert("Moderation action failed.");
            console.error(error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div>
                    <h1 style={styles.header}>Sanctuary Control</h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600' }}>Executive Oversight & Intelligence</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        style={{ ...styles.btnTab, background: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-surface)', border: activeTab === 'overview' ? 'none' : '1px solid var(--color-border)', color: activeTab === 'overview' ? 'white' : 'var(--color-text-primary)' }}
                    >
                        <LayoutDashboard size={18} />
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('outreach')} 
                        style={{ ...styles.btnTab, background: activeTab === 'outreach' ? 'var(--color-primary)' : 'var(--color-surface)', border: activeTab === 'outreach' ? 'none' : '1px solid var(--color-border)', color: activeTab === 'outreach' ? 'white' : 'var(--color-text-primary)' }}
                    >
                        <Share2 size={18} />
                        Social Intelligence
                    </button>
                    <button onClick={loadData} style={styles.btnRefresh}>
                        <RefreshCcw size={18} />
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Revenue Overview Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ padding: '8px', background: 'var(--color-primary-soft)', borderRadius: '8px', color: 'var(--color-primary)' }}>
                            <BarChart3 size={20} />
                        </div>
                        <h2 style={styles.sectionTitle}>Financial Performance</h2>
                    </div>
                    
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--color-background)', padding: '10px', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                                    <DollarSign size={20} />
                                </div>
                                <ArrowUpRight size={20} style={{ color: '#10b981' }} />
                            </div>
                            <h3 style={styles.statLabel}>Gross Merchandise Value</h3>
                            <p style={styles.statValue}>₹{revenueStats.gmv.toLocaleString()}</p>
                            <span style={styles.statNote}>Cumulative transaction volume</span>
                        </div>
                        
                        <div style={{...styles.statCard, borderTop: '4px solid var(--color-primary)'}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--color-primary-soft)', padding: '10px', borderRadius: '12px', color: 'var(--color-primary)' }}>
                                    <BarChart3 size={20} />
                                </div>
                            </div>
                            <h3 style={styles.statLabel}>Net Platform Revenue</h3>
                            <p style={{...styles.statValue, color: 'var(--color-primary)'}}>₹{revenueStats.net.toLocaleString()}</p>
                            <span style={styles.statNote}>Direct earnings & commissions</span>
                        </div>
                        
                        <div style={styles.statCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ background: 'var(--color-background)', padding: '10px', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                                    <Users size={20} />
                                </div>
                            </div>
                            <h3 style={styles.statLabel}>Elite Subscribers</h3>
                            <p style={styles.statValue}>{revenueStats.subCount}</p>
                            <span style={styles.statNote}>Active Soul Pro members</span>
                        </div>
                    </div>

                    <div style={styles.dashboardGrid}>
                        {/* Moderation Section */}
                        <div style={styles.mainCol}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <ShieldAlert size={20} color="#ef4444" />
                                <h3 style={styles.subsectionTitle}>Integrity Reports</h3>
                            </div>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-background)' }}>
                                            <th style={{ padding: '16px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Entity</th>
                                            <th style={{ padding: '16px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category</th>
                                            <th style={{ padding: '16px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                                            <th style={{ padding: '16px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Orchestration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((report) => (
                                            <tr key={report.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '16px 20px', fontWeight: '700' }}>{report.targetType}</td>
                                                <td style={{ padding: '16px 20px' }}>{report.category}</td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{ ...styles.tag, background: report.status === 'resolved' ? '#dcfce7' : '#fee2e2', color: report.status === 'resolved' ? '#166534' : '#991b1b' }}>
                                                        {report.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={styles.actionRow}>
                                                        <button onClick={() => handleAction(report.id, report.targetId, 'dismiss')} style={styles.btnDismiss}>Archive</button>
                                                        {report.targetType === 'post' && (
                                                            <button onClick={() => handleAction(report.id, report.targetId, 'delete_post')} style={styles.btnDanger}>Execute Deletion</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Payments Section */}
                        <div style={styles.sideCol}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <CreditCard size={20} color="var(--color-primary)" />
                                <h3 style={styles.subsectionTitle}>Audit Log</h3>
                            </div>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-background)' }}>
                                            <th style={{ padding: '16px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Origin</th>
                                            <th style={{ padding: '16px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fiat</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((pay) => (
                                            <tr key={pay.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{pay.userEmail?.split('@')[0]}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{pay.productId?.replace('_', ' ')}</div>
                                                </td>
                                                <td style={{ padding: '16px 20px', fontWeight: '900', color: 'var(--color-primary)' }}>₹{pay.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'outreach' && <GrowthOutreach />}
        </div>
    );
};

const styles = {
    container: { padding: '40px 24px', maxWidth: '1440px', margin: '0 auto', color: 'var(--color-text-primary)' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' },
    header: { fontSize: '32px', fontWeight: '950', fontFamily: 'var(--font-primary)', margin: 0, letterSpacing: '-0.04em' },
    btnRefresh: { padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' },
    btnTab: { padding: '12px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' },
    sectionTitle: { fontSize: '16px', fontWeight: '900', color: 'var(--color-text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '60px' },
    statCard: { background: 'var(--color-surface)', padding: '32px', borderRadius: '28px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column' },
    statLabel: { fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' },
    statValue: { fontSize: '42px', fontWeight: '950', margin: '0 0 8px 0', fontFamily: 'var(--font-primary)', letterSpacing: '-0.04em' },
    statNote: { fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '650', opacity: 0.8 },
    dashboardGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' },
    subsectionTitle: { fontSize: '18px', fontWeight: '900', margin: 0, letterSpacing: '-0.01em' },
    tableContainer: { background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tag: { padding: '6px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' },
    actionRow: { display: 'flex', gap: '10px' },
    btnDismiss: { padding: '8px 16px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' },
    btnDanger: { padding: '8px 16px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }
};

export default AdminDashboard;

