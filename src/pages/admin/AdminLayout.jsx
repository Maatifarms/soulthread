import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut, Search, Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/common/SEO';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();

    // Only /admin/dashboard (ExecutiveDashboard) actually exists as a route.
    // This sidebar previously listed 9 more sections (Professional Mgmt,
    // Patient Management, Community Moderation, Clinical Content, Healthcare
    // Operations, Organization Mgmt, Support Center, Platform Health,
    // Configuration) that were never built or routed — clicking any of them
    // hit the app's catch-all NotFound route. Removed rather than stubbed:
    // per CLAUDE.md's priority order, the admin surface beyond what's live
    // today is explicitly paused, and empty stub pages would just be a
    // different flavor of the same "implies a feature that doesn't exist"
    // problem this whole pass has been fixing.
    const navigation = [
        { name: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ];

    const adminInitials = (currentUser?.displayName || currentUser?.email || 'A')
        .trim().charAt(0).toUpperCase();
    const adminName = currentUser?.displayName || currentUser?.email || 'Admin';

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-gray-200 flex">
            <SEO title="SoulThread Admin OS" />

            {/* Sidebar */}
            <div className="w-64 bg-[#141419] border-r border-[#22222a] flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-[#22222a]">
                    <h1 className="text-xl font-black text-white tracking-tight">
                        SoulThread <span className="text-indigo-500">OS</span>
                    </h1>
                </div>

                <div className="p-4 flex items-center gap-3 border-b border-[#22222a] bg-[#1a1a20]">
                    <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                        {adminInitials}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{adminName}</div>
                        <div className="text-xs text-indigo-400">Admin</div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    isActive 
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                                    : 'text-gray-400 hover:bg-[#22222a] hover:text-gray-200'
                                }`}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#22222a]">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0a0f]">
                {/* Top Header */}
                <header className="h-16 border-b border-[#22222a] bg-[#0a0a0f] flex items-center justify-between px-8 shrink-0">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Global Search (Patients, Doctors, Orgs)..." 
                            className="w-full pl-10 pr-4 py-2 bg-[#141419] border border-[#22222a] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-bold text-gray-400">All Systems Operational</span>
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0f]"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
