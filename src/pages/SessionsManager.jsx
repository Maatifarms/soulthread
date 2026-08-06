import React from 'react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Calendar, Video, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SessionsManager() {
    return (
        <DesktopLayoutWrapper>
            <SEO title="My Sessions | SoulThread" />
            <div className="min-h-screen bg-gray-50 pb-24 pt-6">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">My Sessions</h1>
                    
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No session history yet</h3>
                        <p className="text-gray-500 mb-6 max-w-sm">When you book sessions with our psychologists, your upcoming and past appointments will appear here.</p>
                        <Link to="/experts" className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                            Browse Psychologists
                        </Link>
                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
