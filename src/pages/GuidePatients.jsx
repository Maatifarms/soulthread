import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Search, Filter, AlertCircle, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';

export default function GuidePatients() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // active, archived
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchPatientRoster = async () => {
            setLoading(true);
            try {
                // Query the materialized view instead of unbounded bookings
                const relQ = query(
                    collection(db, 'care_relationships'), 
                    where('guideId', '==', currentUser.uid)
                );
                const relSnap = await getDocs(relQ);
                
                // Fetch all user profiles concurrently (resolves N+1 latency)
                const finalRoster = await Promise.all(relSnap.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const pId = data.patientId;
                    
                    const uSnap = await getDoc(doc(db, 'users', pId));
                    const uData = uSnap.exists() ? uSnap.data() : { displayName: 'Unknown Patient' };

                    // Parse the backend maintained fields or fallback to defaults
                    const lastDate = data.lastSession ? new Date(data.lastSession).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year:'numeric'}) : 'Never';
                    const nextDate = data.nextSession ? new Date(data.nextSession).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year:'numeric'}) : null;

                    return {
                        id: pId,
                        name: uData.displayName || 'Unknown',
                        status: data.status || 'active',
                        lastSession: lastDate,
                        nextSession: nextDate,
                        priority: data.pendingFollowUp ? 'high' : 'normal',
                        pendingFollowUp: !!data.pendingFollowUp
                    };
                }));
                
                setPatients(finalRoster);
            } catch (err) {
                console.error("Failed to load roster", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientRoster();
    }, [currentUser]);

    const filteredPatients = patients.filter(p => p.status === activeTab && p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Patient Roster | Professional OS" />
            <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row">
                
                {/* Left Sidebar (Follow-up Manager) */}
                <div className="w-full md:w-72 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 flex-shrink-0">
                    <h2 className="text-xl font-black text-gray-900">Follow-ups</h2>
                    <p className="text-sm text-gray-500 mb-2">Patients requiring your attention before their next session.</p>

                    <div className="space-y-4">
                        {patients.filter(p => p.pendingFollowUp).map(p => (
                            <Card key={`followup-${p.id}`} className="p-4 border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => navigate(`/patients/${p.id}`)}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Completed Homework</p>
                                    <p className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" /> Next session in 3 days</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Main Content (Roster) */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Patient Roster</h1>
                            <p className="text-sm text-gray-500">Manage {patients.filter(p => p.status === 'active').length} active patients.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${activeTab === 'active' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setActiveTab('active')}>Active</button>
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${activeTab === 'archived' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setActiveTab('archived')}>Archived</button>
                        </div>
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
                                    <th className="p-4 font-bold">Status</th>
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
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{patient.name}</div>
                                                    {patient.priority === 'high' && <Badge variant="secondary" className="bg-red-50 text-red-700 text-[10px] py-0 border-none mt-1">High Priority</Badge>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-sm text-gray-600">{patient.lastSession}</td>
                                        <td className="p-4 hidden md:table-cell text-sm text-gray-600">{patient.nextSession || 'Not Scheduled'}</td>
                                        <td className="p-4">
                                            <Badge variant={patient.status === 'active' ? 'success' : 'secondary'} className="capitalize">{patient.status}</Badge>
                                        </td>
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
                                <h3 className="font-bold text-gray-900">No patients found.</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
