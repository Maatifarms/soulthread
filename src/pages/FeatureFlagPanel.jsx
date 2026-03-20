import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * FeatureFlagPanel.jsx — Global Feature Flag Control Panel (Task 39)
 *
 * Centralized dashboard for Admins to live-toggle application modules, 
 * control progressive rollout percentages, or execute an emergency shutdown.
 */

const FeatureFlagPanel = () => {
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFlags();
    }, []);

    const loadFlags = async () => {
        setLoading(true);
        try {
            const snap = await getDoc(doc(db, 'system_config', 'feature_flags'));
            if (snap.exists()) {
                setFlags(snap.data());
            } else {
                // Initialize default schema if missing
                const defaultSchema = {
                    'new_feed_algorithm': { status: 'active', percentages: { 'A': 50, 'B': 50 } },
                    'enhanced_onboarding': { status: 'rollingOut', rolloutPercentage: 80 },
                    'hidden_dev_tool': { status: 'disabled' },
                    'emergency_maintenance_mode': { status: 'disabled' }
                };
                await setDoc(doc(db, 'system_config', 'feature_flags'), defaultSchema);
                setFlags(defaultSchema);
            }
        } catch (e) {
            console.error("Failed to fetch feature flags", e);
        }
        setLoading(false);
    };

    const updateStatus = async (key, nextStatus) => {
        if (!window.confirm(`Are you sure you want to change [${key}] to ${nextStatus.toUpperCase()}?`)) return;

        const nextFlags = { ...flags, [key]: { ...flags[key], status: nextStatus } };
        setFlags(nextFlags);

        try {
            await setDoc(doc(db, 'system_config', 'feature_flags'), nextFlags);
        } catch (e) {
            console.error("Sync failed", e);
            alert("Failed to sync structural configuration changes.");
        }
    };

    const handleEmergencyShutdown = async () => {
        const confirmMsg = "CRITICAL: This will hard-route all incoming traffic to a Maintenance Screen. Type 'SHUTDOWN' to proceed.";
        if (window.prompt(confirmMsg) !== 'SHUTDOWN') return;

        const nextFlags = { ...flags, 'emergency_maintenance_mode': { status: 'active' } };
        setFlags(nextFlags);
        try {
            await setDoc(doc(db, 'system_config', 'feature_flags'), nextFlags);
            alert("Emergency Shutdown Protocol Executed.");
        } catch (e) {
            alert("Emergency action failed to sync with Firestore.");
        }
    };

    if (loading) return <div style={{ padding: '32px' }}>Reading active configurations...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ margin: 0 }}>Global Feature Flag Operations</h1>
                <button onClick={handleEmergencyShutdown} style={styles.btnDanger}>EMERGENCY SHUTDOWN ALARM</button>
            </div>

            <div style={styles.grid}>
                {Object.entries(flags).map(([key, config]) => (
                    <div key={key} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>{key}</h3>
                            <span style={{ ...styles.badge, background: config.status === 'active' ? '#10b981' : config.status === 'rollingOut' ? '#3b82f6' : '#6b7280' }}>
                                {config.status.toUpperCase()}
                            </span>
                        </div>

                        <div style={styles.cardBody}>
                            {config.status === 'rollingOut' && (
                                <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>Rollout Status: {config.rolloutPercentage}% of global users.</p>
                            )}

                            <div style={styles.buttonGroup}>
                                <button disabled={config.status === 'active'} onClick={() => updateStatus(key, 'active')} style={styles.btnEnable}>Enable Globally</button>
                                <button disabled={config.status === 'disabled'} onClick={() => updateStatus(key, 'disabled')} style={styles.btnDisable}>Disable (Kill switch)</button>
                                {config.rolloutPercentage && (
                                    <button disabled={config.status === 'rollingOut'} onClick={() => updateStatus(key, 'rollingOut')} style={styles.btnRollout}>Resume Rollout</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '32px', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text-primary)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' },
    btnDanger: { padding: '12px 24px', borderRadius: '8px', border: '2px dashed red', cursor: 'pointer', background: 'transparent', color: 'red', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' },
    card: { background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(0,0,0,0.2)' },
    badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '10px', color: 'white', fontWeight: 'bold' },
    cardBody: { padding: '16px' },
    buttonGroup: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    btnEnable: { padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    btnDisable: { padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#6b7280', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    btnRollout: { padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
};

export default FeatureFlagPanel;
