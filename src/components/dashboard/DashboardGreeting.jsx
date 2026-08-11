import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

// Every line here is either a real derived fact or an honest generic line —
// no fabricated streaks, circle activity, or session reminders (that's what
// UpcomingSessionWidget/Circles are for; duplicating a guess here isn't worth it).
export default function DashboardGreeting() {
    const { currentUser } = useAuth();
    const [journalStatus, setJournalStatus] = useState(null); // null = loading
    const [journalError, setJournalError] = useState(false);

    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const firstName = currentUser?.displayName?.split(' ')[0] || 'there';

    useEffect(() => {
        if (!currentUser) return;
        const fetchLastJournalEntry = async () => {
            try {
                const q = query(
                    collection(db, 'journals'),
                    where('userId', '==', currentUser.uid),
                    orderBy('createdAt', 'desc'),
                    limit(1)
                );
                const snap = await getDocs(q);
                if (snap.empty) {
                    setJournalStatus({ type: 'none' });
                    return;
                }
                const lastEntry = snap.docs[0].data();
                const lastDate = lastEntry.createdAt?.toDate ? lastEntry.createdAt.toDate() : new Date(lastEntry.createdAt);
                const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                setJournalStatus({ type: 'has-entry', daysSince });
            } catch (err) {
                console.error('Failed to load journal status for greeting:', err);
                setJournalError(true);
            }
        };
        fetchLastJournalEntry();
    }, [currentUser]);

    const journalLine = (() => {
        if (journalError) return null;
        if (journalStatus === null) return null; // still loading — say nothing rather than guess
        if (journalStatus.type === 'none') return "You haven't started your journal yet — writing even a few lines can help.";
        if (journalStatus.daysSince === 0) return "You've already journaled today.";
        if (journalStatus.daysSince === 1) return "It's been a day since your last journal entry.";
        return `It's been ${journalStatus.daysSince} days since your last journal entry.`;
    })();

    return (
        <div className="bg-transparent pt-4 pb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">
                {greeting}, {firstName}.
            </h1>

            {journalLine && (
                <p className="text-xl font-medium text-gray-600 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {journalLine}
                </p>
            )}
        </div>
    );
}
