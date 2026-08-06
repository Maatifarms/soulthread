import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, addDays, subDays, startOfWeek, addDays as addDaysToDate } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, XCircle, Plus } from 'lucide-react';

export default function GuideCalendar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('day'); // Default to day for simplicity
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [cancellationsCount, setCancellationsCount] = useState(0);

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchCalendarData = async () => {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const q = query(
                collection(db, 'bookings'),
                where('guideId', '==', currentUser.uid),
                where('date', '==', dateStr)
            );
            
            try {
                const snap = await getDocs(q);
                const fetchedApps = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        patientId: data.patientId || null,
                        patientName: data.userName || 'Unknown',
                        time: data.startTime || '09:00 AM', // Expects HH:MM AM/PM
                        duration: data.duration || 45,
                        status: data.status || 'confirmed',
                        type: data.type || 'session'
                    };
                });
                setAppointments(fetchedApps);
                
                // For MVP triage counts, we calculate client side from a broader query, 
                // but here we'll just query global waitlist/cancelled for this guide
                const triageQ = query(
                    collection(db, 'bookings'),
                    where('guideId', '==', currentUser.uid),
                    where('status', 'in', ['waitlist', 'cancelled'])
                );
                const triageSnap = await getDocs(triageQ);
                let wCount = 0;
                let cCount = 0;
                triageSnap.docs.forEach(doc => {
                    if(doc.data().status === 'waitlist') wCount++;
                    if(doc.data().status === 'cancelled') cCount++;
                });
                setWaitlistCount(wCount);
                setCancellationsCount(cCount);
            } catch (err) {
                console.error("Failed to fetch calendar", err);
            }
        };
        fetchCalendarData();
    }, [currentUser, currentDate]);

    const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
    const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));

    const renderTimeSlots = () => {
        const slots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
        return slots.map(slot => (
            <div key={slot} className="flex border-b border-gray-100 min-h-[80px]">
                <div className="w-24 border-r border-gray-100 p-2 text-xs font-medium text-gray-400 text-right shrink-0">
                    {slot}
                </div>
                <div className="flex-1 relative p-1">
                    {/* Render matching appointments */}
                    {appointments.filter(app => app.time === slot).map(app => (
                        <div key={app.id} 
                             onClick={() => {
                                 if (app.patientId) {
                                     navigate(`/patients/${app.patientId}?bookingId=${app.id}`);
                                 }
                             }}
                             className={`p-3 rounded-lg border-l-4 shadow-sm w-full md:w-3/4 absolute z-10 ${
                            app.status === 'blocked' ? 'bg-gray-100 border-gray-300' :
                            app.status === 'waitlist' ? 'bg-orange-50 border-orange-400' :
                            'bg-indigo-50 border-indigo-500 cursor-pointer hover:shadow-md'
                        }`}>
                            <div className="flex justify-between items-start">
                                <span className={`font-bold text-sm ${app.status === 'blocked' ? 'text-gray-500' : 'text-gray-900'}`}>{app.patientName}</span>
                                {app.status === 'waitlist' && <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-[10px] py-0 border-none">Waitlist</Badge>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {app.duration}m</span>
                                {app.type !== 'break' && <span className="capitalize text-indigo-600">• {app.type}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <DesktopLayoutWrapper hideNav>
            <SEO title="Smart Calendar | Professional OS" />
            <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row">
                
                {/* Left Sidebar (Mini Calendar & Triage) */}
                <div className="w-full md:w-72 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 flex-shrink-0">
                    <div>
                        <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700 justify-center">
                            <Plus className="w-4 h-4 mr-2" /> New Appointment
                        </Button>
                    </div>

                    {/* Mini Calendar Visual (Mocked) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h3>
                            <div className="flex gap-1">
                                <button onClick={handlePrevDay} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={handleNextDay} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            <div className="text-gray-400 font-bold">Su</div>
                            <div className="text-gray-400 font-bold">Mo</div>
                            <div className="text-gray-400 font-bold">Tu</div>
                            <div className="text-gray-400 font-bold">We</div>
                            <div className="text-gray-400 font-bold">Th</div>
                            <div className="text-gray-400 font-bold">Fr</div>
                            <div className="text-gray-400 font-bold">Sa</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {/* Render a simple week based on currentDate */}
                            {Array.from({length: 7}).map((_, i) => {
                                const dayDate = addDaysToDate(startOfWeek(currentDate), i);
                                const isSelected = format(dayDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                                return (
                                    <div key={i} 
                                        onClick={() => setCurrentDate(dayDate)}
                                        className={`p-1.5 rounded-full cursor-pointer ${isSelected ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                                        {format(dayDate, 'd')}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Triage / Management Center */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Triage Center</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 text-sm font-medium hover:bg-orange-100 transition-colors">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Waitlist</span>
                                <Badge className="bg-orange-200 text-orange-900 border-none">{waitlistCount}</Badge>
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-sm font-medium hover:bg-red-100 transition-colors">
                                <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Cancellations</span>
                                <Badge className="bg-red-200 text-red-900 border-none">{cancellationsCount}</Badge>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Calendar View */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Header Controls */}
                    <header className="h-20 border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-gray-900">{format(currentDate, 'EEEE, MMM d')}</h2>
                            {format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-bold">Today</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'day' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setViewMode('day')}>Day</button>
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setViewMode('week')}>Week</button>
                            <button className={`px-4 py-1.5 text-sm font-bold rounded-md ${viewMode === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setViewMode('month')}>Month</button>
                        </div>
                    </header>

                    {/* Schedule Grid */}
                    <div className="flex-1 overflow-y-auto bg-gray-50">
                        <div className="bg-white min-h-full">
                            {renderTimeSlots()}
                        </div>
                    </div>
                </div>

            </div>
        </DesktopLayoutWrapper>
    );
}
