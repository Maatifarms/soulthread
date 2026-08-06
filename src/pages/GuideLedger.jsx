import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Wallet, TrendingUp, Download, ArrowUpRight, CheckCircle2, History } from 'lucide-react';

export default function GuideLedger() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        pendingPayout: 0,
        thisMonth: 0,
        lastMonth: 0
    });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchLedgerData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch recent transactions (limit to 100 for MVP safety)
                const paymentsQ = query(
                    collection(db, 'payments'),
                    where('guideId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc'),
                    limit(100)
                );
                const pSnap = await getDocs(paymentsQ);

                let pending = 0;
                let currentM = 0;
                let lastM = 0;
                
                const now = new Date();
                const currentMonthIndex = now.getMonth();
                const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
                const currentYear = now.getFullYear();
                const lastMonthYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;

                // Process transactions and gather unique patient IDs for concurrent fetch
                const uniquePatientIds = new Set();
                const rawTx = pSnap.docs.map(d => {
                    const data = d.data();
                    if (data.patientId) uniquePatientIds.add(data.patientId);
                    
                    // Aggregate stats
                    const amt = data.amount || 0;
                    if (data.status === 'pending_payout') pending += amt;
                    
                    if (data.createdAt) {
                        // Assuming createdAt is ISO string or Firestore Timestamp
                        const dDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                        if (dDate.getMonth() === currentMonthIndex && dDate.getFullYear() === currentYear && data.status !== 'refunded') {
                            currentM += amt;
                        }
                        if (dDate.getMonth() === lastMonthIndex && dDate.getFullYear() === lastMonthYear && data.status !== 'refunded') {
                            lastM += amt;
                        }
                    }

                    return {
                        id: d.id,
                        patientId: data.patientId,
                        amount: amt,
                        status: data.status || 'completed',
                        type: data.type || 'Consultation',
                        date: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toLocaleDateString() : new Date(data.createdAt).toLocaleDateString()) : 'Unknown'
                    };
                });

                // Hydrate patient demographics concurrently
                const patientCache = {};
                await Promise.all(Array.from(uniquePatientIds).map(async (pId) => {
                    const uSnap = await getDoc(doc(db, 'users', pId));
                    patientCache[pId] = uSnap.exists() ? uSnap.data().displayName : 'Unknown Patient';
                }));

                const hydratedTx = rawTx.map(tx => ({
                    ...tx,
                    patient: patientCache[tx.patientId] || 'Unknown Patient'
                }));

                setStats({
                    pendingPayout: pending,
                    thisMonth: currentM,
                    lastMonth: lastM
                });
                
                setTransactions(hydratedTx);

            } catch (err) {
                console.error("Ledger Fetch Error:", err);
                setError("Unable to securely load financial data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchLedgerData();
    }, [currentUser]);

    if (loading) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold">Securely loading ledger...</p>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (error) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <Card className="max-w-md w-full p-8 text-center border-red-200 bg-red-50">
                        <History className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Data Integrity Error</h2>
                        <p className="text-sm text-gray-600">{error}</p>
                    </Card>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Ledger & Payments | Professional OS" />
            <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row">
                
                {/* Left Sidebar (Overview) */}
                <div className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 flex-shrink-0">
                    <h2 className="text-xl font-black text-gray-900 mb-2">Ledger & Payments</h2>
                    
                    <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-none text-white p-5 shadow-lg relative overflow-hidden">
                        <Wallet className="absolute top-0 right-0 w-32 h-32 text-indigo-700/30 -mt-4 -mr-4" />
                        <div className="relative z-10">
                            <p className="text-indigo-200 text-sm font-medium mb-1">Available for Payout</p>
                            <h3 className="text-4xl font-black mb-4">₹{stats.pendingPayout.toLocaleString()}</h3>
                            <Button variant="secondary" className="w-full bg-white text-indigo-900 border-none hover:bg-gray-100">Withdraw Funds</Button>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">This Month</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-900">₹{stats.thisMonth.toLocaleString()}</span>
                                <Badge variant="success" className="bg-green-100 text-green-700 border-none"><TrendingUp className="w-3 h-3 mr-1 inline" /> +18%</Badge>
                            </div>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-xl">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Last Month</p>
                            <span className="text-lg font-bold text-gray-600">₹{stats.lastMonth.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content (Transactions) */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                            <p className="text-sm text-gray-500">All successful payments and refunds.</p>
                        </div>
                        <Button variant="outline" className="bg-white">
                            <Download className="w-4 h-4 mr-2" /> Download Statement
                        </Button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="p-4 font-bold">Transaction</th>
                                    <th className="p-4 font-bold">Patient</th>
                                    <th className="p-4 font-bold hidden md:table-cell">Type</th>
                                    <th className="p-4 font-bold">Amount</th>
                                    <th className="p-4 font-bold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-500">
                                            <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="font-medium text-gray-600">No transactions found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map(trx => (
                                        <tr key={trx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 text-sm truncate max-w-[120px]" title={trx.id}>{trx.id}</div>
                                                <div className="text-xs text-gray-500">{trx.date}</div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-gray-700">{trx.patient}</td>
                                            <td className="p-4 hidden md:table-cell text-sm text-gray-500">{trx.type}</td>
                                            <td className={`p-4 text-sm font-bold ${trx.status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                ₹{trx.amount.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                {trx.status === 'completed' ? (
                                                    <Badge variant="success" className="bg-green-100 text-green-700 border-none">Completed</Badge>
                                                ) : trx.status === 'pending_payout' ? (
                                                    <Badge variant="warning" className="bg-orange-100 text-orange-700 border-none">Pending Payout</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none capitalize">{trx.status}</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DesktopLayoutWrapper>
    );
}
