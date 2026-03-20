import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const AdminDashboard = () => {
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
                <h1 style={styles.header}>Sanctuary Control Center</h1>
                <button onClick={loadData} style={styles.btnRefresh}>↻ Refresh Data</button>
            </div>

            {/* Revenue Overview Section */}
            <h2 style={styles.sectionTitle}>💰 Revenue Overview (Live)</h2>
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <h3 style={styles.statLabel}>Total GMV</h3>
                    <p style={styles.statValue}>₹{revenueStats.gmv.toLocaleString()}</p>
                    <span style={styles.statNote}>Gross value transacted</span>
                </div>
                <div style={{...styles.statCard, borderLeft: '4px solid #22c55e'}}>
                    <h3 style={styles.statLabel}>Platform Revenue</h3>
                    <p style={{...styles.statValue, color: '#22c55e'}}>₹{revenueStats.net.toLocaleString()}</p>
                    <span style={styles.statNote}>Series + Subs + Commissions</span>
                </div>
                <div style={styles.statCard}>
                    <h3 style={styles.statLabel}>Soul Pro Members</h3>
                    <p style={styles.statValue}>{revenueStats.subCount}</p>
                    <span style={styles.statNote}>Active monthly subscribers</span>
                </div>
            </div>

            <div style={styles.dashboardGrid}>
                {/* Moderation Section */}
                <div style={styles.mainCol}>
                    <h3 style={styles.subsectionTitle}>🚩 Active Reports</h3>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td>{report.targetType}</td>
                                        <td>{report.category}</td>
                                        <td>{report.status || 'pending'}</td>
                                        <td>
                                            <div style={styles.actionRow}>
                                                <button onClick={() => handleAction(report.id, report.targetId, 'dismiss')} style={styles.btnDismiss}>Dismiss</button>
                                                {report.targetType === 'post' && (
                                                    <button onClick={() => handleAction(report.id, report.targetId, 'delete_post')} style={styles.btnDanger}>Delete</button>
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
                    <h3 style={styles.subsectionTitle}>💳 Recent Payments</h3>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Product</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((pay) => (
                                    <tr key={pay.id}>
                                        <td style={{ fontSize: '11px' }}>{pay.userEmail?.split('@')[0]}</td>
                                        <td style={{ fontWeight: '800' }}>₹{pay.amount}</td>
                                        <td>
                                            <span style={{...styles.tag, background: pay.productId === 'soul_pro' ? 'var(--color-primary-soft)' : '#f3f4f6'}}>
                                                {pay.productId?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px 24px', maxWidth: '1400px', margin: '0 auto', color: 'var(--color-text-primary)' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    header: { fontSize: '32px', fontWeight: '950', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.03em' },
    btnRefresh: { padding: '10px 20px', background: 'var(--color-primary-soft)', border: 'none', borderRadius: '12px', fontWeight: '850', color: 'var(--color-primary)', cursor: 'pointer' },
    sectionTitle: { fontSize: '18px', fontWeight: '850', marginBottom: '20px', color: 'var(--color-text-secondary)' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '48px' },
    statCard: { background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column' },
    statLabel: { fontSize: '13px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' },
    statValue: { fontSize: '36px', fontWeight: '950', margin: '0 0 4px 0', fontFamily: 'var(--font-display)' },
    statNote: { fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' },
    dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' },
    subsectionTitle: { fontSize: '20px', fontWeight: '900', marginBottom: '20px' },
    tableContainer: { background: 'white', borderRadius: '24px', border: '1px solid var(--color-border)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tag: { padding: '4px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' },
    actionRow: { display: 'flex', gap: '8px' },
    btnDismiss: { padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
    btnDanger: { padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }
};

export default AdminDashboard;
