import React from 'react';
import DesktopLeftSidebar from './DesktopLeftSidebar';
import DesktopSidebar from './DesktopSidebar';

import { Capacitor } from '@capacitor/core';

const DesktopLayoutWrapper = ({ children, hideRightSidebar = false, wide = false }) => {
    const isNativeApp = Capacitor.isNativePlatform();

    if (isNativeApp) {
        return (
            <div className="native-feed-container">
                <div className="feed-column">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: wide ? '1200px' : 'var(--max-width-feed)',
            margin: '20px auto',
            padding: '0 16px'
        }}>
            {children}
        </div>
    );
};

export default DesktopLayoutWrapper;
