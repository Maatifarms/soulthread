import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Wallet, TrendingUp, TrendingDown, Download, History } from 'lucide-react';

// Matches functions/finance/LedgerService.js's real commission split — same
// rate, kept in sync manually since the frontend can't import server code.
const COMMISSION_RATE = 0.20;

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
                // `payments` and `ledger_entries` are both real, correctly-designed
                // collections (functions/finance/) — but nothing currently writes to
                // either, since the live booking flow is test-mode with no real payment
                // gateway call anywhere (client or server). Computing directly from real
                // bookings instead, same reasoning as the care_relationships fix: use
                // the data source that's actually populated.
                //
                // Bookings don't store the price paid at booking time (no `amount`
                // field exists on any real booking doc) — using the guide's *current*
                // sessionRate as each booking's amount. This is real data, not a
                // hardcoded placeholder, but it's an approximation: if a guide changes
                // their rate, past bookings are priced at today's rate, not what was
                // actually charged then. Flagged to the user; a real fix would store
                // amountPaid on the booking at creation time, which touches shared
                // booking-creation code beyond this page's scope.
                const guideSnap = await getDoc(doc(db, 'guides', currentUser.uid));
                const sessionRate = guideSnap.exists() ? (guideSnap.data().sessionRate || 0) : 0;

                const bQuery = query(collection(db, 'bookings'), where('guideId', '==', currentUser.uid));
                const bSnap = await getDocs(bQuery);
                // A handful of real bookings predate the current schema entirely (a legacy
                // `date`+`slot` string pair instead of `scheduledStartTime`, non-real status
                // values like "pending") — confirmed live, at least one exists in production
                // from 2026-07-22. GuideDashboard/GuideCalendar naturally skip these (their
                // queries filter on scheduledStartTime, which these docs don't have), but this
                // query has no such filter. Skip them explicitly rather than show "Invalid
                // Date" — not worth teaching this page to parse a schema nothing else uses.
                const allBookings = bSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(b => b.scheduledStartTime);

                // Only bookings that actually reached a real, paid state count as revenue.
                // requested/awaiting_payment/payment_failed never became real sessions.
                const NON_REVENUE_STATUSES = ['requested', 'accepted', 'rejected', 'awaiting_payment', 'payment_failed'];
                const revenueBookings = allBookings.filter(b => b.status && !NON_REVENUE_STATUSES.includes(b.status));

                const getPatientProfile = httpsCallable(functions, 'getPatientProfileForGuide');
                const now = new Date();
                const currentMonthIndex = now.getMonth();
                const currentYear = now.getFullYear();
                const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
                const lastMonthYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;

                let pending = 0, currentM = 0, lastM = 0;

                const hydratedTx = await Promise.all(revenueBookings.map(async (b) => {
                    const isRefunded = b.status.startsWith('cancelled_');
                    const gross = sessionRate;
                    const commission = Math.round(gross * COMMISSION_RATE * 100) / 100;
                    const net = gross - commission;

                    const start = b.scheduledStartTime?.toDate ? b.scheduledStartTime.toDate() : new Date(b.scheduledStartTime);

                    if (!isRefunded) {
                        // No real settlement/payout system runs yet either (same dormant-
                        // system situation) — every real, non-refunded booking's net
                        // earnings are honestly "pending payout" forever under the current
                        // architecture, not fabricated as already paid out.
                        pending += net;
                        if (start.getMonth() === currentMonthIndex && start.getFullYear() === currentYear) currentM += net;
                        if (start.getMonth() === lastMonthIndex && start.getFullYear() === lastMonthYear) lastM += net;
                    }

                    let patientName = 'Patient';
                    if (b.userId) {
                        try {
                            const result = await getPatientProfile({ patientId: b.userId });
                            if (result.data?.displayName) patientName = result.data.displayName;
                        } catch {
                            // Keep the fallback name.
                        }
                    }

                    return {
                        id: b.id,
                        patient: patientName,
                        amount: net,
                        status: isRefunded ? 'refunded' : 'pending_payout',
                        type: b.sessionType || 'video',
                        date: start.toLocaleDateString()
                    };
                }));

                hydratedTx.sort((a, b) => new Date(b.date) - new Date(a.date));

                setStats({ pendingPayout: pending, thisMonth: currentM, lastMonth: lastM });
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

    // Real month-over-month change — hidden rather than shown as 0%/NaN% when
    // there's no last-month baseline to compare against.
    const monthChangePct = stats.lastMonth > 0
        ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)
        : null;

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
                            <p className="text-indigo-200 text-sm font-medium mb-1">Pending Payout</p>
                            <h3 className="text-4xl font-black mb-4">₹{stats.pendingPayout.toLocaleString()}</h3>
                            <Button variant="secondary" className="w-full bg-white text-indigo-900 border-none hover:bg-gray-100" disabled>
                                Withdraw Funds (Coming Soon)
                            </Button>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">This Month</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-900">₹{stats.thisMonth.toLocaleString()}</span>
                                {monthChangePct !== null && (
                                    <Badge variant={monthChangePct >= 0 ? 'success' : 'danger'} className={monthChangePct >= 0 ? 'bg-green-100 text-green-700 border-none' : 'bg-red-100 text-red-700 border-none'}>
                                        {monthChangePct >= 0 ? <TrendingUp className="w-3 h-3 mr-1 inline" /> : <TrendingDown className="w-3 h-3 mr-1 inline" />}
                                        {monthChangePct >= 0 ? '+' : ''}{monthChangePct}%
                                    </Badge>
                                )}
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
                            <p className="text-sm text-gray-500">All sessions and refunds.</p>
                        </div>
                        <Button variant="outline" className="bg-white" disabled>
                            <Download className="w-4 h-4 mr-2" /> Download Statement (Coming Soon)
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
                                            <td className="p-4 hidden md:table-cell text-sm text-gray-500 capitalize">{trx.type}</td>
                                            <td className={`p-4 text-sm font-bold ${trx.status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                ₹{trx.amount.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                {trx.status === 'pending_payout' ? (
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
