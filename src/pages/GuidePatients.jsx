import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Search, ChevronRight, User, AlertCircle } from 'lucide-react';

export default function GuidePatients() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const fetchPatientRoster = async () => {
            setLoading(true);
            setError(false);
            try {
                // `care_relationships` was a "materialized view" collection nothing ever
                // wrote to — no Cloud Function trigger, no Firestore rule, orphaned.
                // Real patient roster comes directly from real bookings instead: every
                // distinct patient this guide has ever had a booking with. Single
                // equality filter (guideId only) — auto-indexed, no composite index
                // needed, matches the same "avoid new indexes" approach used on the
                // patient side (SessionsManager.jsx sorts client-side for the same reason).
                const bQuery = query(collection(db, 'bookings'), where('guideId', '==', currentUser.uid));
                const bSnap = await getDocs(bQuery);
                // A few real bookings predate the current schema (legacy `date`+`slot`
                // strings instead of scheduledStartTime, confirmed live) — skip rather
                // than let them produce "Invalid Date" downstream. Same fix as GuideLedger.jsx.
                const bookings = bSnap.docs
                    .map(d => d.data())
                    .filter(b => b.scheduledStartTime && !b.status?.startsWith('cancelled_'));

                const byPatient = new Map();
                for (const b of bookings) {
                    if (!b.userId) continue;
                    if (!byPatient.has(b.userId)) byPatient.set(b.userId, []);
                    byPatient.get(b.userId).push(b);
                }

                const getPatientProfile = httpsCallable(functions, 'getPatientProfileForGuide');
                const now = new Date();
                const finalRoster = await Promise.all(Array.from(byPatient.entries()).map(async ([patientId, patientBookings]) => {
                    let name = 'Patient';
                    try {
                        const result = await getPatientProfile({ patientId });
                        if (result.data?.displayName) name = result.data.displayName;
                    } catch {
                        // Keep the fallback name — a lookup failure shouldn't break the roster.
                    }

                    const toDate = (b) => b.scheduledStartTime?.toDate ? b.scheduledStartTime.toDate() : new Date(b.scheduledStartTime);
                    const past = patientBookings.filter(b => toDate(b) < now).sort((a, b) => toDate(b) - toDate(a));
                    const future = patientBookings.filter(b => toDate(b) >= now).sort((a, b) => toDate(a) - toDate(b));

                    return {
                        id: patientId,
                        name,
                        lastSession: past[0] ? toDate(past[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never',
                        nextSession: future[0] ? toDate(future[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
                        sessionCount: patientBookings.length
                    };
                }));

                finalRoster.sort((a, b) => a.name.localeCompare(b.name));
                setPatients(finalRoster);
            } catch (err) {
                console.error("Failed to load roster", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientRoster();
    }, [currentUser]);

    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold">Loading Patient Roster...</p>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (error) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Couldn't load your patient roster</h3>
                    <p className="text-gray-500">Please try refreshing the page.</p>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Patient Roster | Professional OS" />
            <div className="min-h-screen bg-[#fafafa] p-6 md:p-10">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-gray-900">Patient Roster</h1>
                        <p className="text-sm text-gray-500">{patients.length} patient{patients.length === 1 ? '' : 's'} you've had a session with.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-md mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patients by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-500 shadow-sm"
                        />
                    </div>

                    {/* Data Table */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="p-4 font-bold">Patient</th>
                                    <th className="p-4 font-bold hidden md:table-cell">Last Session</th>
                                    <th className="p-4 font-bold hidden md:table-cell">Next Session</th>
                                    <th className="p-4 font-bold">Sessions</th>
                                    <th className="p-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map(patient => (
                                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{patient.name}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-sm text-gray-600">{patient.lastSession}</td>
                                        <td className="p-4 hidden md:table-cell text-sm text-gray-600">{patient.nextSession || 'Not Scheduled'}</td>
                                        <td className="p-4 text-sm text-gray-600">{patient.sessionCount}</td>
                                        <td className="p-4 text-right">
                                            <Button variant="outline" size="sm" className="bg-white" onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}>
                                                View 360° <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredPatients.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="font-bold text-gray-900">{patients.length === 0 ? "No patients yet." : "No patients found."}</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
