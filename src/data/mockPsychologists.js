export const MOCK_PSYCHOLOGISTS = [
    {
        id: 'mock_rupesh',
        name: 'Rupesh Ojha',
        bio: 'Corporate Trainer & Corporate Psychologist with over six years of experience in strategic leadership and organizational wellness. Specialized in professional growth and empathetic leadership.',
        experience: 'Corporate Trainer & Psychologist',
        email: 'rupesh2510@gmail.com',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rupesh',
        availability: [
            { day: 'Today', slots: ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'] },
            { day: 'Tomorrow', slots: ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'] }
        ],
        isMock: true
    },
    {
        id: 'mock2',
        name: 'Dr. Dishari Biswas',
        bio: 'Psychology Postgraduate and Research Scholar specializing in Emotion Regulation and Coping Styles. Gold Medalist (BHU) with deep expertise in stress management.',
        experience: '2 years (Research & Clinical)',
        email: 'dishari.biswasclg@gmail.com',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dishari',
        availability: [
            { day: 'Today', slots: ['11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '6:00 PM'] },
            { day: 'Tomorrow', slots: ['11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '6:00 PM'] }
        ],
        isMock: true
    }
];

export default MOCK_PSYCHOLOGISTS;
