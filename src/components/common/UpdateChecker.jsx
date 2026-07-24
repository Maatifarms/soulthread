import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const APP_VERSION = "3.0.0"; // Current version of this build

export default function UpdateChecker({ children }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Only check for updates if running on native Android
    if (Capacitor.isNativePlatform()) {
      fetch('https://soulthread.in/version.json?t=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
          if (data && data.latest && data.latest !== APP_VERSION) {
            // Simple string comparison (e.g. "3.1.0" !== "3.0.0")
            // In a real app, you'd use semver to check if it's strictly greater
            setUpdateAvailable(true);
          }
        })
        .catch(err => console.error("Update check failed:", err));
    }
  }, []);

  if (updateAvailable) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, 
        backgroundColor: '#FDFAF7', display: 'flex', 
        flexDirection: 'column', justifyContent: 'center', 
        alignItems: 'center', padding: '24px', textAlign: 'center'
      }}>
        <h1 style={{ color: '#0d9488', marginBottom: '16px' }}>Update Required</h1>
        <p style={{ marginBottom: '24px', color: '#555' }}>
          A new version of SoulThread is available. Please update to continue using the app.
        </p>
        <a 
          href="https://soulthread.in/soulthread.apk" 
          download 
          style={{
            backgroundColor: '#0d9488', color: 'white', padding: '12px 24px',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
          }}
        >
          Download Update
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
