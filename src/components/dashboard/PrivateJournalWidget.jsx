import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { PenTool, Lock } from 'lucide-react';
import { Button } from '../common/Button';

export default function PrivateJournalWidget() {
    const navigate = useNavigate();

    return (
        <Card className="h-full flex flex-col justify-between bg-gradient-to-br from-indigo-50 to-white border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <PenTool className="w-24 h-24" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-bold text-gray-900">Private Journal</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 max-w-[80%]">
                    Write down your thoughts. This is encrypted and strictly for your own reflection.
                </p>
            </div>

            <div className="relative z-10 flex gap-2">
                <Button variant="primary" className="flex-1 text-sm py-2" onClick={() => navigate('/journal', { state: { autoCompose: true } })}>
                    Write Entry
                </Button>
                <Button variant="outline" className="text-sm py-2 px-3" onClick={() => navigate('/journal')}>
                    View Past
                </Button>
            </div>
        </Card>
    );
}
