import React, { useState } from 'react';
import { ShieldAlert, X, PhoneCall, Globe } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

const CRISIS_PROVIDERS = {
    US: {
        name: 'United States',
        lifeline: '988',
        emergency: '911',
        text: 'Text HOME to 741741'
    },
    IN: {
        name: 'India',
        lifeline: '9152987821',
        emergency: '112',
        text: 'AASRA Crisis Center'
    },
    UK: {
        name: 'United Kingdom',
        lifeline: '111',
        emergency: '999',
        text: 'Text SHOUT to 85258'
    },
    AU: {
        name: 'Australia',
        lifeline: '13 11 14',
        emergency: '000',
        text: 'Lifeline Australia'
    },
    GLOBAL: {
        name: 'Global / Other',
        lifeline: '112',
        emergency: '112',
        text: 'Local Emergency Services'
    }
};

export default function CrisisModal({ onClose }) {
    const [region, setRegion] = useState('US'); // In a real app, this would be auto-detected via IP/Geo
    const provider = CRISIS_PROVIDERS[region];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-red-50 border-red-200 animate-in fade-in zoom-in duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-red-400 hover:text-red-900 transition-colors">
                    <X className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-red-900 mb-2">You are not alone.</h2>
                    <p className="text-red-800 text-sm">If you are in immediate danger or experiencing a crisis, please reach out right away. Free, confidential help is available 24/7.</p>
                </div>

                <div className="flex justify-end mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-100 px-3 py-1.5 rounded-full">
                        <Globe className="w-3 h-3" />
                        <select 
                            value={region} 
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-transparent border-none outline-none cursor-pointer"
                        >
                            {Object.entries(CRISIS_PROVIDERS).map(([key, data]) => (
                                <option key={key} value={key}>{data.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <a href={`tel:${provider.lifeline}`} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-red-100 hover:border-red-300 transition-colors shadow-sm group">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <PhoneCall className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Suicide & Crisis Lifeline</h3>
                            <p className="text-gray-500 text-sm">Call {provider.lifeline}</p>
                            <p className="text-xs text-red-600 font-medium mt-1">{provider.text}</p>
                        </div>
                    </a>
                    <a href={`tel:${provider.emergency}`} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-red-100 hover:border-red-300 transition-colors shadow-sm group">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Emergency Services</h3>
                            <p className="text-gray-500 text-sm">Call {provider.emergency} immediately if you are in physical danger.</p>
                        </div>
                    </a>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="w-full bg-white text-red-900 border-red-200 hover:bg-red-100" onClick={onClose}>
                        Return to Safety
                    </Button>
                </div>
            </Card>
        </div>
    );
}
