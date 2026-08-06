import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Landing from './Landing';
import PatientDashboard from './PatientDashboard';
import SEO from '../components/common/SEO';
import { Capacitor } from '@capacitor/core';

const isNativeApp = Capacitor.isNativePlatform();

export default function Home() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Landing />;
    }

    return <PatientDashboard />;
}
