import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ArrowLeft, Video, PhoneCall, FileText, Activity, Users, Send, CheckCircle2, ChevronRight, Clock, Plus, Share2, ClipboardList, PenTool } from 'lucide-react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';

// Extracted outside the render cycle to prevent unnecessary recreations
const getEventIcon = (type) => {
    switch(type) {
        case 'assessment': return <ClipboardList className="w-5 h-5 text-purple-600" aria-hidden="true" />;
        case 'session': return <Video className="w-5 h-5 text-indigo-600" aria-hidden="true" />;
        case 'journal_shared': return <PenTool className="w-5 h-5 text-green-600" aria-hidden="true" />;
        case 'mood_update': return <Activity className="w-5 h-5 text-orange-600" aria-hidden="true" />;
        case 'community_join': return <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />;
        default: return <FileText className="w-5 h-5 text-gray-600" aria-hidden="true" />;
    }
};

export default function PatientTimeline() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Parse optional bookingId from the calendar URL transition
    const searchParams = new URLSearchParams(location.search);
    const bookingId = searchParams.get('bookingId');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patient, setPatient] = useState(null);
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [nextSessionDate, setNextSessionDate] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);

                // users/{patientId} and timeline/{eventId} are both otherwise owner-only
                // (patient profile carries email/phone/age/gender; timeline is personal
                // wellness/journey data) — this callable verifies a real booking links
                // this guide to this patient before returning anything, same reasoning
                // as getPatientProfileForGuide used elsewhere in the guide app.
                const getWorkspace = httpsCallable(functions, 'getPatientWorkspaceForGuide');
                const result = await getWorkspace({ patientId });
                const data = result.data;

                // The callable already throws permission-denied (caught below) if no
                // booking links this guide to this patient at all — reaching here with
                // no displayName means the patient's profile doc itself is gone.
                if (!data.displayName) {
                    throw new Error("Patient not found.");
                }

                // Real bookings only — scoped to bookings between this guide and this
                // patient specifically (the callable never returns bookings with other
                // guides). `date`/`type` never existed on real booking docs; real fields
                // are scheduledStartTime and sessionType.
                const now = new Date();
                const bookingEvents = data.bookings
                    .filter(b => b.status === 'completed')
                    .map(b => ({
                        id: b.id,
                        type: 'session',
                        title: b.sessionType === 'assessment' ? 'Clinical Assessment' : 'Therapy Session',
                        date: b.scheduledStartTime,
                        notes: b.clinicalNotes || 'No notes available.'
                    }));

                const upcoming = data.bookings
                    .filter(b => b.scheduledStartTime && new Date(b.scheduledStartTime) > now && !b.status?.startsWith('cancelled_'))
                    .sort((a, b) => new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime));

                const tlEvents = data.timelineEvents.map(t => ({ ...t }));

                const fetchedEvents = [...bookingEvents, ...tlEvents].sort((a, b) => new Date(b.date) - new Date(a.date));

                if (isMounted) {
                    setPatient({
                        name: data.displayName || 'Unknown Patient',
                        preferredName: data.displayName?.split(' ')[0] || 'Unknown',
                        age: data.age || 'Unknown',
                        language: data.language || 'Unknown',
                        goals: data.goals?.length > 0 ? data.goals : ['General Wellbeing'],
                        // No real field backs risk indicators or circle membership on the
                        // guide-visible profile subset — left empty rather than fabricated.
                        riskIndicators: [],
                        circles: [],
                        carePlanProgress: 0,
                        lastMood: 'No data yet',
                        lastJournal: 'Journals are private to the patient'
                    });
                    setTimelineEvents(fetchedEvents);
                    setNextSessionDate(upcoming[0]?.scheduledStartTime || null);
                }
            } catch (err) {
                console.error("Timeline error:", err);
                if (isMounted) setError("Failed to load patient workspace.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [patientId]);

    if (error) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50" role="alert">
                    <div className="text-center text-red-600">
                        <p className="font-bold">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (loading) {
        return (
            <DesktopLayoutWrapper hideNav>
                <div className="min-h-screen flex items-center justify-center bg-gray-50" aria-busy="true" aria-live="polite">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" aria-hidden="true"></div>
                        <p className="text-gray-500 font-bold">Loading Patient Workspace...</p>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title={`Workspace: ${patient?.preferredName || 'Patient'} | Professional OS`} />
            <div className="min-h-screen bg-[#fafafa] flex flex-col">
                
                {/* TOP BAR: Identity & Emergency Actions */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16 flex items-center justify-between px-6" role="banner">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold" aria-hidden="true">
                                {patient.preferredName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 leading-tight">
                                    {patient.name} <span className="text-gray-400 font-normal">({patient.preferredName})</span>
                                </h1>
                            </div>
                            <Badge variant="success" className="ml-2">Active Care</Badge>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {nextSessionDate && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full" aria-label="Next session timing">
                                <Clock className="w-4 h-4 text-orange-600" aria-hidden="true" />
                                <span className="text-xs font-bold text-orange-800">
                                    Next Session: {new Date(nextSessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hidden sm:flex" aria-label="Initiate Crisis Protocol">
                            <PhoneCall className="w-4 h-4 mr-2" aria-hidden="true" /> Crisis Protocol
                        </Button>
                    </div>
                </header>

                {/* 3-COLUMN LAYOUT */}
                <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-6">
                    
                    {/* LEFT SIDEBAR: Patient Summary */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                        <Card className="border-gray-200 p-5">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Demographics</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Age</p>
                                    <p className="font-medium text-gray-900">{patient.age} years old</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Primary Language</p>
                                    <p className="font-medium text-gray-900">{patient.language}</p>
                                </div>
                            </div>

                            <hr className="my-5 border-gray-100" />

                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Clinical Base</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5">Primary Goals</p>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.goals.map((g, i) => <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700">{g}</Badge>)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5">Risk Indicators</p>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.riskIndicators.map((r, i) => <Badge key={i} className="bg-orange-100 text-orange-800 border-orange-200">{r}</Badge>)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5">Ecosystem</p>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.circles.map((c, i) => <Badge key={i} className="bg-blue-50 text-blue-700 border-blue-200">{c} Circle</Badge>)}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* MAIN WORKSPACE: Factual Insights & Chronological Journey */}
                    <main className="flex-1 space-y-6" role="main">
                        
                        {/* Factual Clinical Insights (NO AI) */}
                        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label="Clinical Insights Summary">
                            <Card className="p-4 bg-white border-gray-200">
                                <h3 className="text-xs text-gray-500 mb-1 font-normal">Care Plan Progress</h3>
                                <p className="text-2xl font-black text-indigo-600">{patient.carePlanProgress}%</p>
                            </Card>
                            <Card className="p-4 bg-white border-gray-200">
                                <h3 className="text-xs text-gray-500 mb-1 font-normal">Last Mood</h3>
                                <p className="text-lg font-bold text-orange-600">{patient.lastMood}</p>
                            </Card>
                            <Card className="p-4 bg-white border-gray-200">
                                <h3 className="text-xs text-gray-500 mb-1 font-normal">Shared Journal</h3>
                                <p className="text-lg font-bold text-gray-900">{patient.lastJournal}</p>
                            </Card>
                            <Card className="p-4 bg-white border-gray-200">
                                <h3 className="text-xs text-gray-500 mb-1 font-normal">Assessment Due</h3>
                                <p className="text-lg font-bold text-green-600">None</p>
                            </Card>
                        </section>

                        {/* The Unified Timeline */}
                        <section aria-labelledby="timeline-heading">
                            <Card className="p-6 border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 id="timeline-heading" className="text-lg font-bold text-gray-900">Chronological Journey</h2>
                                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1" aria-label="Data source">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" aria-hidden="true" /> Factual Data Only
                                    </div>
                                </div>

                                <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 pb-4" role="list">
                                    {timelineEvents.map((event) => (
                                        <article key={event.id} className="relative" role="listitem">
                                            <div className="absolute -left-[35px] top-0.5 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center">
                                                {getEventIcon(event.type)}
                                            </div>
                                            <div 
                                                className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-white hover:border-gray-300 transition-colors cursor-pointer group"
                                                tabIndex={0}
                                                aria-label={`Event: ${event.title} on ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                                                    <time dateTime={event.date} className="text-xs font-medium text-gray-400">
                                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </time>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">{event.notes}</p>
                                                
                                                {event.score && (
                                                    <div className="mt-3 inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm" aria-label={`Score: ${event.score}`}>
                                                        <span className="text-gray-500">Score:</span>
                                                        <span className="font-bold text-purple-700">{event.score}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </Card>
                        </section>

                    </main>

                    {/* RIGHT SIDEBAR: Quick Actions (Contextual Modals) */}
                    <aside className="w-full lg:w-64 flex-shrink-0" aria-label="Quick Actions">
                        <Card className="border-gray-200 p-4 sticky top-24">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <Button variant="primary" className="w-full justify-start py-3" aria-label="Add Clinical Note">
                                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Add Clinical Note
                                </Button>
                                <Button variant="outline" className="w-full justify-start py-3 bg-white" aria-label="Assign Care Plan">
                                    <ClipboardList className="w-4 h-4 mr-2" aria-hidden="true" /> Assign Care Plan
                                </Button>
                                <Button variant="outline" className="w-full justify-start py-3 bg-white" aria-label="Share Resource">
                                    <Share2 className="w-4 h-4 mr-2" aria-hidden="true" /> Share Resource
                                </Button>
                                <Button variant="outline" className="w-full justify-start py-3 bg-white" aria-label="Send Message">
                                    <Send className="w-4 h-4 mr-2" aria-hidden="true" /> Send Message
                                </Button>
                            </div>
                            
                            <hr className="my-5 border-gray-100" />
                            
                            <Button 
                                variant="secondary" 
                                className={`w-full justify-start py-3 ${bookingId ? 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100' : 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed'}`}
                                aria-label="Start Session Now"
                                onClick={() => {
                                    if (bookingId) {
                                        navigate(`/session/${bookingId}`);
                                    }
                                }}
                                disabled={!bookingId}
                            >
                                <Video className="w-4 h-4 mr-2" aria-hidden="true" /> {bookingId ? 'Start Session Now' : 'No Active Booking'}
                            </Button>
                        </Card>
                    </aside>

                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
