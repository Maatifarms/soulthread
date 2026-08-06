import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { publishEvent, PlatformEvents } from '../services/EventPublisher';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ArrowLeft, Clock, PhoneCall, Wifi, Video, Mic, MessageSquare, Save, Plus, Share2, ClipboardList, Send, FileText, CheckCircle2 } from 'lucide-react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';

export default function GuideSessionWorkspace() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    
    // Core State
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [wrapUpMode, setWrapUpMode] = useState(false);
    const [showCarePlanModal, setShowCarePlanModal] = useState(false);
    
    // Clinical Notes State
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'offline'

    // Dynamic Patient Context
    const [patientContext, setPatientContext] = useState({
        goals: [],
        carePlan: 'No active care plan',
        moodTrend: 'Stable',
    });
    
    // Timer State
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!bookingId) return;
        const fetchWorkspaceData = async () => {
            try {
                // 1. Fetch Booking
                const bSnap = await getDoc(doc(db, 'bookings', bookingId));
                if (!bSnap.exists()) {
                    setLoading(false);
                    return;
                }
                const bData = { id: bSnap.id, ...bSnap.data() };
                setBooking(bData);
                
                // If there are existing clinical notes, load them
                if (bData.clinicalNotes) {
                    setClinicalNotes(bData.clinicalNotes);
                }

                // 2. Fetch Patient Profile & Clinical Context
                if (bData.patientId) {
                    const pSnap = await getDoc(doc(db, 'users', bData.patientId));
                    let goals = [];
                    if (pSnap.exists() && pSnap.data().goals) {
                        goals = pSnap.data().goals;
                    }

                    // Try to fetch the most recent care plan
                    let carePlanText = 'No active care plan';
                    const cpQuery = query(
                        collection(db, 'carePlans'), 
                        where('patientId', '==', bData.patientId),
                        orderBy('createdAt', 'desc'),
                        limit(1)
                    );
                    const cpSnap = await getDocs(cpQuery);
                    if (!cpSnap.empty) {
                        carePlanText = cpSnap.docs[0].data().title || 'Active Care Plan';
                    }

                    setPatientContext({
                        goals: goals.length > 0 ? goals : ['General Wellness'],
                        carePlan: carePlanText,
                        moodTrend: 'Stable (calculated)'
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error("Workspace error:", err);
                setLoading(false);
            }
        };
        fetchWorkspaceData();
    }, [bookingId]);

    // Timer Logic
    useEffect(() => {
        if (!booking || wrapUpMode) return;
        
        const interval = setInterval(() => {
            // Ideally this syncs with server time or session start time in the DB.
            // For MVP, we use local elapsed time from when the component mounts.
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [booking, wrapUpMode]);

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Autosave Logic
    useEffect(() => {
        if (loading || !bookingId || clinicalNotes.length === 0) return;
        setSaveStatus('saving');
        const timer = setTimeout(async () => {
            try {
                await updateDoc(doc(db, 'bookings', bookingId), {
                    clinicalNotes: clinicalNotes
                });
                setSaveStatus('saved');
            } catch (e) {
                setSaveStatus('offline');
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [clinicalNotes, bookingId, loading]);

    const handleEndSession = () => {
        setWrapUpMode(true);
    };

    const handleFinalize = async () => {
        // Ensure final notes are saved
        await updateDoc(doc(db, 'bookings', bookingId), {
            clinicalNotes: clinicalNotes,
            status: 'completed'
        });

        // Publish to Event Bus
        await publishEvent(PlatformEvents.SESSION_COMPLETED, bookingId, {
            notes: clinicalNotes,
            resourcesShared: [] // Implement actual tracking later
        });
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0f0f11] text-gray-200 overflow-hidden" style={{ maxHeight: '100vh' }}>
            <SEO title={`Live Session: ${booking.userName} | Professional OS`} />
            
            {/* TOP HEADER (Session Command) */}
            <header className="h-16 bg-[#1a1a1e] border-b border-[#2a2a30] flex items-center justify-between px-6 flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#2a2a30] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-bold text-white leading-tight">{booking.userName}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-green-500" /> Excellent</span>
                            <span>•</span>
                            <span>Session 4 of 12</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-red-900/30 border border-red-500/30 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-red-400">{formatTimer(elapsedSeconds)}</span>
                        <span className="text-xs text-red-500/70 ml-1">/ {booking?.duration || 45}:00</span>
                    </div>
                    <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                        <PhoneCall className="w-4 h-4 mr-2" /> Crisis Protocol
                    </Button>
                    {!wrapUpMode && (
                        <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleEndSession}>
                            End Session
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT SIDEBAR (Patient Snapshot) */}
                <div className="w-64 bg-[#141417] border-r border-[#2a2a30] p-4 flex flex-col gap-6 overflow-y-auto hidden lg:flex">
                    <div>
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Clinical Anchor</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1.5">Primary Goals</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {patientContext.goals.map((g, i) => <Badge key={i} className="bg-[#2a2a30] text-gray-300 border-none">{g}</Badge>)}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1.5">Current Care Plan</p>
                                <div className="bg-[#2a2a30] p-2 rounded text-sm text-gray-200">{patientContext.carePlan}</div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1.5">Mood Trend</p>
                                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                                    <AlertTriangle className="w-4 h-4" /> {patientContext.moodTrend}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER DESK (Video + Notes) */}
                <div className="flex-1 flex flex-col relative">
                    
                    {/* Guided Wrap-up Overlay */}
                    {wrapUpMode && (
                        <div className="absolute inset-0 bg-[#0f0f11]/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                            <Card className="w-full max-w-2xl bg-[#1a1a1e] border-[#2a2a30] p-6 shadow-2xl">
                                <h2 className="text-2xl font-bold text-white mb-2">Session Wrap-Up</h2>
                                <p className="text-gray-400 mb-6">Finalize your notes and assign homework before the patient leaves.</p>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between p-4 bg-[#141417] rounded-lg border border-[#2a2a30]">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-indigo-400" />
                                            <span className="font-medium text-gray-200">Finalize Clinical Notes</span>
                                        </div>
                                        {saveStatus === 'saved' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin"></div>}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-[#141417] rounded-lg border border-[#2a2a30]">
                                        <div className="flex items-center gap-3">
                                            <ClipboardList className="w-5 h-5 text-indigo-400" />
                                            <span className="font-medium text-gray-200">Assign Homework / Care Plan</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-[#2a2a30] text-gray-300">Assign</Button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-[#141417] rounded-lg border border-[#2a2a30]">
                                        <div className="flex items-center gap-3">
                                            <Share2 className="w-5 h-5 text-indigo-400" />
                                            <span className="font-medium text-gray-200">Share Resources</span>
                                        </div>
                                        <span className="text-sm text-gray-400">1 PDF Shared</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" className="border-[#2a2a30] text-gray-300" onClick={() => setWrapUpMode(false)}>Cancel Wrap-up</Button>
                                    <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleFinalize}>
                                        Commit to Timeline & Close
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* WebRTC Video Pane */}
                    <div className="flex-1 relative bg-black flex items-center justify-center">
                        {/* Placeholder for video feed (Waiting for WebRTC/Video SDK integration) */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center"></div>
                        <div className="z-10 flex flex-col items-center">
                            <Video className="w-12 h-12 text-gray-700 mb-2" />
                            <p className="text-gray-500 text-sm">Waiting for Video Provider Integration</p>
                        </div>
                        
                        {/* Self View (Picture in Picture) */}
                        <div className="absolute top-4 right-4 w-40 h-28 bg-gray-800 rounded-lg border border-[#2a2a30] overflow-hidden shadow-lg z-10">
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">Camera Off</div>
                        </div>

                        {/* Video Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#1a1a1e]/80 backdrop-blur-md px-6 py-3 rounded-full border border-[#2a2a30] z-10 shadow-2xl">
                            <button className="w-12 h-12 rounded-full bg-[#2a2a30] flex items-center justify-center hover:bg-[#3a3a40] transition-colors"><Mic className="w-5 h-5 text-gray-400" /></button>
                            <button className="w-12 h-12 rounded-full bg-[#2a2a30] flex items-center justify-center hover:bg-[#3a3a40] transition-colors"><Video className="w-5 h-5 text-gray-400" /></button>
                            <button className="w-12 h-12 rounded-full bg-[#2a2a30] flex items-center justify-center hover:bg-[#3a3a40] transition-colors"><MessageSquare className="w-5 h-5 text-gray-400" /></button>
                        </div>
                    </div>

                    {/* Clinical Notepad (Split Horizontal) */}
                    <div className="h-1/3 bg-[#141417] border-t border-[#2a2a30] flex flex-col">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a30] bg-[#1a1a1e]">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-bold text-gray-300">Clinical Notepad</h3>
                                <div className="flex gap-2">
                                    <button className="text-xs px-2 py-1 bg-[#2a2a30] text-gray-400 rounded hover:text-white">SOAP Template</button>
                                    <button className="text-xs px-2 py-1 bg-[#2a2a30] text-gray-400 rounded hover:text-white">Intake Template</button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                {saveStatus === 'saving' && <span className="text-gray-400 flex items-center gap-1"><div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div> Autosaving...</span>}
                                {saveStatus === 'saved' && <span className="text-green-500 flex items-center gap-1"><Save className="w-3 h-3" /> Saved locally</span>}
                            </div>
                        </div>
                        <textarea 
                            value={clinicalNotes}
                            onChange={(e) => setClinicalNotes(e.target.value)}
                            placeholder="Type '/' for templates or start typing... (Only visible to you)"
                            className="flex-1 w-full bg-transparent p-4 text-sm text-gray-200 outline-none resize-none leading-relaxed placeholder-gray-600 font-mono"
                        />
                    </div>
                </div>

                {/* RIGHT SIDEBAR (Quick Clinical Actions) */}
                <div className="w-64 bg-[#1a1a1e] border-l border-[#2a2a30] p-4 flex flex-col gap-4 overflow-y-auto hidden md:flex">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Action Hub</h2>
                    
                    <Button variant="outline" className="w-full justify-start py-3 bg-[#141417] border-[#2a2a30] text-gray-300 hover:bg-[#2a2a30] hover:text-white" onClick={() => setShowCarePlanModal(true)}>
                        <ClipboardList className="w-4 h-4 mr-2" /> Assign Care Plan
                    </Button>
                    <Button variant="outline" className="w-full justify-start py-3 bg-[#141417] border-[#2a2a30] text-gray-300 hover:bg-[#2a2a30] hover:text-white">
                        <FileText className="w-4 h-4 mr-2" /> Assign Assessment
                    </Button>
                    <Button variant="outline" className="w-full justify-start py-3 bg-[#141417] border-[#2a2a30] text-gray-300 hover:bg-[#2a2a30] hover:text-white">
                        <Share2 className="w-4 h-4 mr-2" /> Share Resource
                    </Button>
                    <Button variant="outline" className="w-full justify-start py-3 bg-[#141417] border-[#2a2a30] text-gray-300 hover:bg-[#2a2a30] hover:text-white">
                        <Clock className="w-4 h-4 mr-2" /> Schedule Follow-up
                    </Button>

                    <hr className="border-[#2a2a30] my-2" />

                    <div className="bg-[#141417] p-3 rounded-lg border border-[#2a2a30]">
                        <h3 className="text-xs font-bold text-gray-400 mb-2">Shared This Session</h3>
                        <div className="flex items-center gap-2 text-sm text-indigo-400">
                            <FileText className="w-4 h-4" /> Sleep Hygiene PDF
                        </div>
                    </div>
                </div>

            </div>

            {/* CARE PLAN ASSIGNMENT MODAL */}
            {showCarePlanModal && (
                <div className="absolute inset-0 bg-[#0f0f11]/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-[#1a1a1e] border-[#2a2a30] p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">Assign Care Plan & Homework</h2>
                        <p className="text-sm text-gray-400 mb-6">These tasks will appear directly on the patient's Today's Action Plan widget.</p>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Task Title</label>
                                <input type="text" placeholder="e.g. Box Breathing (5 mins)" className="w-full bg-[#141417] border border-[#2a2a30] rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attach Resource (Optional)</label>
                                <select className="w-full bg-[#141417] border border-[#2a2a30] rounded-lg p-3 text-white outline-none focus:border-indigo-500">
                                    <option>No resource attached</option>
                                    <option>PDF: Understanding Sleep Hygiene</option>
                                    <option>Video: Guided Body Scan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Frequency</label>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 p-2 rounded-lg text-sm font-bold">Daily</button>
                                    <button className="flex-1 bg-[#141417] text-gray-400 border border-[#2a2a30] p-2 rounded-lg text-sm hover:bg-[#2a2a30]">Once</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" className="border-[#2a2a30] text-gray-300" onClick={() => setShowCarePlanModal(false)}>Cancel</Button>
                            <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700" onClick={async () => {
                                await publishEvent(PlatformEvents.HOMEWORK_ASSIGNED, bookingId, { title: 'Box Breathing' });
                                setShowCarePlanModal(false);
                            }}>
                                Assign to Patient
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
