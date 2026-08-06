import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';

export default function DashboardGreeting() {
    const { currentUser } = useAuth();
    
    // Greeting logic based on time
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const firstName = currentUser?.displayName?.split(' ')[0] || 'Rupesh';

    return (
        <div className="bg-transparent pt-4 pb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">
                {greeting}, {firstName}.
            </h1>
            
            <div className="space-y-5 text-xl font-medium text-gray-600 leading-relaxed max-w-2xl">
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                    You haven't written in your journal for <span className="text-gray-900 font-bold">5 days</span>.
                </p>
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                    Your <span className="text-gray-900 font-bold">Anxiety Circle</span> has a new discussion.
                </p>
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                    Your psychologist shared a <span className="text-indigo-600 font-bold cursor-pointer hover:underline">breathing exercise</span>.
                </p>
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-400">
                    Your mood has <span className="text-green-600 font-bold">improved</span> compared to last month.
                </p>
                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
                    Your next session is <span className="text-gray-900 font-bold">tomorrow</span>.
                </p>
                
                <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700">
                    <p className="text-gray-900 font-bold mb-4">Would you like to prepare for it?</p>
                    <div className="flex gap-4">
                        <Button variant="primary" className="shadow-md">Yes, review my journal</Button>
                        <Button variant="outline" className="border-gray-300">Not right now</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
