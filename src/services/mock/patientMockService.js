export const MOCK_TIMELINE_EVENTS = [
    { id: 1, type: 'assessment', date: '2026-10-12T10:00:00Z', title: 'Completed PHQ-9', score: 14, notes: 'Moderate anxiety indicated. No immediate crisis risk.', factual: true },
    { id: 2, type: 'session', date: '2026-10-15T14:00:00Z', title: 'Session 1: Discovery', notes: 'Explored workplace triggers. Assigned sleep hygiene care plan.', factual: true },
    { id: 3, type: 'journal_shared', date: '2026-10-17T09:30:00Z', title: 'Patient Shared Journal Entry', notes: '"Tried the deep breathing. It felt strange but helped a bit before bed."', factual: true },
    { id: 4, type: 'mood_update', date: '2026-10-18T18:00:00Z', title: 'Mood Check-in: Overwhelmed', notes: 'Logged after a team meeting.', factual: true },
    { id: 5, type: 'community_join', date: '2026-10-19T11:00:00Z', title: 'Joined Healing Circle', notes: 'Anxiety Management Circle', factual: true },
];

export const fetchPatientProfile = async (patientId) => {
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ 
                id: patientId, 
                name: 'Alex Johnson', 
                preferredName: 'Alex',
                age: 28,
                language: 'English',
                goals: ['Feel less anxious at work', 'Sleep better'],
                riskIndicators: ['High Stress Environment'],
                circles: ['Anxiety Management'],
                nextSession: '2026-10-22T15:00:00Z',
                carePlanProgress: 60,
                lastMood: 'Overwhelmed',
                lastJournal: '3 days ago'
            });
        }, 800);
    });
};
