import React from 'react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { useAuth } from '../contexts/AuthContext';
import useTheme from '../hooks/useTheme';
import { Settings as SettingsIcon, User, Shield, Bell, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { currentUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <DesktopLayoutWrapper>
            <SEO title="Settings | SoulThread" />
            <div className="min-h-screen bg-gray-50 pb-24 pt-6">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-8">
                        <SettingsIcon className="w-8 h-8 text-gray-900" />
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    </div>

                    <div className="space-y-6">
                        
                        {/* Profile Section */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-500" /> Account & Profile
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-900">Personal Information</p>
                                        <p className="text-sm text-gray-500">Update your name and email</p>
                                    </div>
                                    <button className="text-sm font-bold text-black hover:text-gray-600">Edit</button>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <p className="font-medium text-gray-900">Emergency Contact</p>
                                        <p className="text-sm text-gray-500">Add trusted contacts</p>
                                    </div>
                                    <button className="text-sm font-bold text-black hover:text-gray-600">Manage</button>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Moon className="w-5 h-5 text-gray-500" /> Preferences
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-900">Dark Mode</p>
                                        <p className="text-sm text-gray-500">Adjust the visual theme</p>
                                    </div>
                                    <button 
                                        onClick={toggleTheme}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-black' : 'bg-gray-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isDarkMode ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <p className="font-medium text-gray-900">Notifications</p>
                                        <p className="text-sm text-gray-500">Manage alerts and reminders</p>
                                    </div>
                                    <button className="text-sm font-bold text-black hover:text-gray-600">Configure</button>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-gray-500" /> Security
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-900">Password</p>
                                        <p className="text-sm text-gray-500">Change your security credentials</p>
                                    </div>
                                    <button className="text-sm font-bold text-black hover:text-gray-600">Update</button>
                                </div>
                                <div className="flex justify-between items-center py-2 mt-4">
                                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-bold hover:text-red-700 transition-colors">
                                        <LogOut className="w-5 h-5" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
