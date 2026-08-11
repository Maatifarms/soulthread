import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import {
    format, addDays, subDays, startOfWeek, addDays as addDaysToDate,
    startOfMonth, addMonths, subMonths, isSameDay, isSameMonth
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChevronLeft, ChevronRight, Clock, XCircle, Plus } from 'lucide-react';

// Business-hours row range shown in Day/Week grid views. Appointments are
// matched by hour, not by an exact formatted-string match — the original day
// view matched `app.time === '10:00 AM'` literally, so a booking at 10:15
// simply never rendered anywhere. Grouping by hour (with the real time shown
// inside the card) fixes that for all three views at once.
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export default function GuideCalendar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [cancellationsCount, setCancellationsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const fetchCalendarData = async () => {
            setLoading(true);
            setError(false);

            // Real bookings store `scheduledStartTime` (a Firestore Timestamp), never a
            // separate `date`/`startTime` pair. Range depends on the active view — all
            // three still hit the same guideId+scheduledStartTime composite index.
            let rangeStart, rangeEnd;
            if (viewMode === 'week') {
                rangeStart = startOfWeek(currentDate);
                rangeStart.setHours(0, 0, 0, 0);
                rangeEnd = addDaysToDate(rangeStart, 7);
            } else if (viewMode === 'month') {
                rangeStart = startOfMonth(currentDate);
                rangeStart.setHours(0, 0, 0, 0);
                rangeEnd = startOfMonth(addMonths(currentDate, 1));
            } else {
                rangeStart = new Date(currentDate);
                rangeStart.setHours(0, 0, 0, 0);
                rangeEnd = addDaysToDate(rangeStart, 1);
            }

            const q = query(
                collection(db, 'bookings'),
                where('guideId', '==', currentUser.uid),
                where('scheduledStartTime', '>=', rangeStart),
                where('scheduledStartTime', '<', rangeEnd)
            );

            try {
                const snap = await getDocs(q);
                const getPatientProfile = httpsCallable(functions, 'getPatientProfileForGuide');
                const fetchedApps = await Promise.all(snap.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const start = data.scheduledStartTime?.toDate ? data.scheduledStartTime.toDate() : new Date(data.scheduledStartTime);

                    // Patient profile docs aren't guide-readable directly (email/phone/age/
                    // gender live there) — this goes through a callable that checks a real
                    // booking links this guide to this patient before returning the name.
                    let patientName = 'Unknown';
                    if (data.userId) {
                        try {
                            const result = await getPatientProfile({ patientId: data.userId });
                            if (result.data?.displayName) patientName = result.data.displayName;
                        } catch {
                            // Keep the fallback name — a lookup failure shouldn't break the calendar.
                        }
                    }

                    return {
                        id: docSnap.id,
                        patientId: data.userId || null,
                        patientName,
                        startDate: start,
                        time: format(start, 'h:mm a'),
                        duration: data.sessionDurationMins || 50,
                        status: data.status || 'confirmed',
                        type: data.sessionType || 'video'
                    };
                }));
                // Cancelled bookings still fall in this range but don't belong on the
                // working calendar — same "hide inactive statuses" idea SessionsManager
                // uses on the patient side.
                setAppointments(fetchedApps.filter(a => !a.status.startsWith('cancelled_')));

                // Real cancellation statuses — global count, not scoped to the visible range.
                const cancelQ = query(
                    collection(db, 'bookings'),
                    where('guideId', '==', currentUser.uid),
                    where('status', 'in', ['cancelled_by_user', 'cancelled_by_guide', 'cancelled_by_admin'])
                );
                const cancelSnap = await getDocs(cancelQ);
                setCancellationsCount(cancelSnap.size);
            } catch (err) {
                console.error("Failed to fetch calendar", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchCalendarData();
    }, [currentUser, currentDate, viewMode]);

    const handlePrev = () => {
        if (viewMode === 'week') setCurrentDate(prev => subDays(prev, 7));
        else if (viewMode === 'month') setCurrentDate(prev => subMonths(prev, 1));
        else setCurrentDate(prev => subDays(prev, 1));
    };
    const handleNext = () => {
        if (viewMode === 'week') setCurrentDate(prev => addDaysToDate(prev, 7));
        else if (viewMode === 'month') setCurrentDate(prev => addMonths(prev, 1));
        else setCurrentDate(prev => addDays(prev, 1));
    };

    const goToPatient = (app) => {
        if (app.patientId) navigate(`/patients/${app.patientId}?bookingId=${app.id}`);
    };

    const renderDayView = () => (
        HOURS.map(hour => {
            const slotLabel = format(new Date(2000, 0, 1, hour), 'hh:00 a');
            const slotApps = appointments.filter(app => app.startDate.getHours() === hour);
            return (
                <div key={hour} className="flex border-b border-gray-100 min-h-[80px]">
                    <div className="w-24 border-r border-gray-100 p-2 text-xs font-medium text-gray-400 text-right shrink-0">
                        {slotLabel}
                    </div>
                    <div className="flex-1 relative p-1 space-y-1">
                        {slotApps.map(app => (
                            <div key={app.id}
                                 onClick={() => goToPatient(app)}
                                 className="p-3 rounded-lg border-l-4 shadow-sm w-full md:w-3/4 bg-indigo-50 border-indigo-500 cursor-pointer hover:shadow-md">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-sm text-gray-900">{app.patientName}</span>
                                    <span className="text-xs font-medium text-gray-400">{app.time}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.duration}m</span>
                                    <span className="capitalize text-indigo-600">• {app.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })
    );

    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate);
        const days = Array.from({ length: 7 }).map((_, i) => addDaysToDate(weekStart, i));
        return (
            <div className="flex flex-col min-w-[800px]">
                <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="w-16 shrink-0" />
                    {days.map(d => (
                        <div key={d.toISOString()} className={`flex-1 text-center py-2 border-l border-gray-100 ${isSameDay(d, new Date()) ? 'bg-indigo-50' : ''}`}>
                            <div className="text-xs font-bold text-gray-400 uppercase">{format(d, 'EEE')}</div>
                            <div className="text-sm font-bold text-gray-900">{format(d, 'd')}</div>
                        </div>
                    ))}
                </div>
                {HOURS.map(hour => (
                    <div key={hour} className="flex border-b border-gray-100 min-h-[70px]">
                        <div className="w-16 shrink-0 border-r border-gray-100 p-1 text-[10px] font-medium text-gray-400 text-right">
                            {format(new Date(2000, 0, 1, hour), 'hh a')}
                        </div>
                        {days.map(d => {
                            const cellApps = appointments.filter(app => isSameDay(app.startDate, d) && app.startDate.getHours() === hour);
                            return (
                                <div key={d.toISOString()} className="flex-1 border-l border-gray-100 p-1 space-y-1">
                                    {cellApps.map(app => (
                                        <div key={app.id}
                                             onClick={() => goToPatient(app)}
                                             className="p-1.5 rounded-md bg-indigo-50 border-l-2 border-indigo-500 cursor-pointer hover:shadow-sm text-left">
                                            <p className="text-[11px] font-bold text-gray-900 truncate">{app.patientName}</p>
                                            <p className="text-[10px] text-gray-500">{app.time}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const gridStart = startOfWeek(monthStart);
        // Always 6 full weeks — the standard, simplest-to-reason-about month grid.
        // Cells outside the current month are still rendered (dimmed) so the
        // calendar layout never shifts height between months.
        const days = Array.from({ length: 42 }).map((_, i) => addDaysToDate(gridStart, i));

        return (
            <div>
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-center py-2 text-xs font-bold text-gray-400 uppercase">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map(d => {
                        const dayApps = appointments.filter(app => isSameDay(app.startDate, d));
                        const inMonth = isSameMonth(d, currentDate);
                        return (
                            <div key={d.toISOString()}
                                 onClick={() => { setCurrentDate(d); setViewMode('day'); }}
                                 className={`min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 ${!inMonth ? 'bg-gray-50/50' : ''}`}>
                                <div className={`text-xs font-bold mb-1 ${isSameDay(d, new Date()) ? 'text-indigo-600' : inMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                                    {format(d, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayApps.slice(0, 2).map(app => (
                                        <div key={app.id} className="text-[10px] font-medium text-indigo-700 bg-indigo-50 rounded px-1.5 py-0.5 truncate">
                                            {app.time} {app.patientName}
                                        </div>
                                    ))}
                                    {dayApps.length > 2 && (
                                        <div className="text-[10px] font-bold text-gray-400">+{dayApps.length - 2} more</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const headerLabel = viewMode === 'week'
        ? `${format(startOfWeek(currentDate), 'MMM d')} – ${format(addDaysToDate(startOfWeek(currentDate), 6), 'MMM d')}`
        : viewMode === 'month'
        ? format(currentDate, 'MMMM yyyy')
        : format(currentDate, 'EEEE, MMM d');

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Smart Calendar | Professional OS" />
            <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row">

                {/* Left Sidebar (Mini Calendar & Triage) */}
                <div className="w-full md:w-72 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 flex-shrink-0">
                    <div>
                        <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700 justify-center" disabled title="Coming soon">
                            <Plus className="w-4 h-4 mr-2" /> New Appointment (Coming Soon)
                        </Button>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h3>
                            <div className="flex gap-1">
                                <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-gray-400 font-bold">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {Array.from({length: 7}).map((_, i) => {
                                const dayDate = addDaysToDate(startOfWeek(currentDate), i);
                                const isSelected = isSameDay(dayDate, currentDate);
                                return (
                                    <div key={i}
                                        onClick={() => { setCurrentDate(dayDate); if (viewMode === 'month') setViewMode('day'); }}
                                        className={`p-1.5 rounded-full cursor-pointer ${isSelected ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                                        {format(dayDate, 'd')}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Triage Center</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-sm font-medium hover:bg-red-100 transition-colors">
                                <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Cancellations</span>
                                <Badge className="bg-red-200 text-red-900 border-none">{cancellationsCount}</Badge>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Calendar View */}
                <div className="flex-1 flex flex-col bg-white">
                    <header className="min-h-20 border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-gray-900">{headerLabel}</h2>
                            {isSameDay(currentDate, new Date()) && viewMode === 'day' && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-bold">Today</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'day' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setViewMode('day')}>Day</button>
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setViewMode('week')}>Week</button>
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setViewMode('month')}>Month</button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto bg-gray-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-24">
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                                    <p className="text-gray-500 font-bold text-sm">Loading schedule...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                                <XCircle className="w-10 h-10 text-red-400 mb-3" />
                                <p className="text-gray-700 font-bold">Couldn't load your schedule.</p>
                                <p className="text-gray-500 text-sm">Please try refreshing the page.</p>
                            </div>
                        ) : (
                            <div className="bg-white min-h-full">
                                {viewMode === 'day' && renderDayView()}
                                {viewMode === 'week' && renderWeekView()}
                                {viewMode === 'month' && renderMonthView()}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DesktopLayoutWrapper>
    );
}
