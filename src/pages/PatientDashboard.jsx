import React from 'react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import DashboardGreeting from '../components/dashboard/DashboardGreeting';
import UpcomingSessionWidget from '../components/dashboard/UpcomingSessionWidget';
import MoodCheckInWidget from '../components/dashboard/MoodCheckInWidget';
import PrivateJournalWidget from '../components/dashboard/PrivateJournalWidget';

export default function PatientDashboard() {

    return (
        <DesktopLayoutWrapper>
            <SEO title="Sanctuary | SoulThread" />
            <div className="min-h-screen bg-[#fafafa] pb-24 pt-6">
                <div className="max-w-3xl mx-auto px-4 space-y-8">
                    
                    {/* The Greeting & Breathing Visual */}
                    <DashboardGreeting />

                    {/* The Next Session (Trust/Commitment) */}
                    <UpcomingSessionWidget />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Daily Engagement: Mood Check-in */}
                        <MoodCheckInWidget />
                        
                        {/* Private Reflection */}
                        <PrivateJournalWidget />
                    </div>

                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
