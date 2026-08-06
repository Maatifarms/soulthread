import React from 'react';
import AdminLayout from './AdminLayout';
import { Card } from '../../components/common/Card';
import { Users, UserCog, Activity, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ExecutiveDashboard() {
    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black text-white">Executive Dashboard</h2>
                        <p className="text-gray-400 mt-1">Platform metrics and realtime health overview.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Last updated:</span>
                        <span className="font-bold text-gray-300">Just now</span>
                    </div>
                </div>

                {/* Macro Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#141419] border-[#22222a] p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg"><Users className="w-5 h-5 text-indigo-400" /></div>
                            <span className="text-xs font-bold text-green-400 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +12%</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">1.2M</h3>
                        <p className="text-sm text-gray-400">Total Active Patients</p>
                    </Card>

                    <Card className="bg-[#141419] border-[#22222a] p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg"><UserCog className="w-5 h-5 text-blue-400" /></div>
                            <span className="text-xs font-bold text-green-400 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +5%</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">14,502</h3>
                        <p className="text-sm text-gray-400">Verified Professionals</p>
                    </Card>

                    <Card className="bg-[#141419] border-[#22222a] p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg"><Activity className="w-5 h-5 text-purple-400" /></div>
                            <span className="text-xs font-bold text-gray-500 flex items-center">Today</span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">8,492</h3>
                        <p className="text-sm text-gray-400">Sessions Completed</p>
                    </Card>

                    <Card className="bg-red-500/10 border-red-500/30 p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg"><ShieldAlert className="w-5 h-5 text-red-400" /></div>
                            <span className="text-xs font-bold text-red-400 flex items-center animate-pulse">Action Required</span>
                        </div>
                        <h3 className="text-3xl font-black text-red-400 mb-1">14</h3>
                        <p className="text-sm text-red-500/70">Crisis Escalations</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Platform Health feed */}
                    <div className="lg:col-span-2">
                        <Card className="bg-[#141419] border-[#22222a] p-6 min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white">Event Bus Realtime Feed</h3>
                                <div className="text-xs text-gray-500 px-3 py-1 bg-[#22222a] rounded-full">Listening to platform_events...</div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0a0a0f] border border-[#22222a]">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-gray-200">PAYMENT_RECEIVED</span>
                                            <span className="text-xs text-gray-500">2s ago</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Stripe hook triggered for Booking #B-9921</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0a0a0f] border border-[#22222a]">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-gray-200">CARE_PLAN_CREATED</span>
                                            <span className="text-xs text-gray-500">45s ago</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Expert #E-41 assigned protocol to Patient #P-001</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-red-900/10 border border-red-500/20">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-bold text-red-400">JITSI_ROOM_FAILED</span>
                                            <span className="text-xs text-red-500/70">2m ago</span>
                                        </div>
                                        <p className="text-xs text-red-400 mt-1">Timeout allocating media bridge for Session #B-8832</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Pending Approvals */}
                    <div className="space-y-6">
                        <Card className="bg-[#141419] border-[#22222a] p-6">
                            <h3 className="font-bold text-white mb-4">Pending KYC Approvals</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded bg-[#0a0a0f] border border-[#22222a]">
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">Dr. Aarav Mehta</div>
                                        <div className="text-xs text-gray-500">Cardiology</div>
                                    </div>
                                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">Review</button>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded bg-[#0a0a0f] border border-[#22222a]">
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">Dr. Sarah Jenkins</div>
                                        <div className="text-xs text-gray-500">Clinical Psychology</div>
                                    </div>
                                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">Review</button>
                                </div>
                            </div>
                            <button className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-white transition-colors">View All 42 Applications</button>
                        </Card>

                        <Card className="bg-[#141419] border-[#22222a] p-6 border-l-4 border-l-orange-500">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                <h3 className="font-bold text-white">System Alert</h3>
                            </div>
                            <p className="text-sm text-gray-400">Stripe Webhook latency is currently degrading (Avg 2.4s). Billing team has been notified.</p>
                        </Card>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
