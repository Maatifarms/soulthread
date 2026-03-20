import React, { useState } from 'react';

/**
 * CrisisBanner.jsx — Crisis Support System (Task 15)
 * Triggers automatically if high-risk intent (suicidal ideation/severe distress) 
 * is flagged locally or through community reports.
 */

const CrisisBanner = ({
    active = false,
    onDismiss,
    contactMethods = [
        { label: "Vandrevala Foundation (India)", phone: "9999 666 555", url: "tel:9999666555" },
        { label: "AASRA", phone: "9820466726", url: "tel:9820466726" },
        { label: "I Call Pro", email: "icall@tiss.edu", url: "mailto:icall@tiss.edu" }
    ]
}) => {
    if (!active) return null;

    return (
        <div style={styles.bannerContainer}>
            <div style={styles.header}>
                <span style={styles.icon}>⚠️</span>
                <h3 style={styles.title}>You are not alone.</h3>
                <button onClick={onDismiss} style={styles.closeBtn}>×</button>
            </div>

            <p style={styles.text}>
                We detected that you might be going through a particularly tough time.
                Please know that there are people who want to listen and help, confidentially and free of charge.
            </p>

            <div style={styles.actions}>
                {contactMethods.map((method, i) => (
                    <a key={i} href={method.url} style={styles.contactBtn} title={method.label}>
                        📞 {method.phone || method.email}
                    </a>
                ))}
            </div>

            <p style={styles.disclaimer}>
                If you are in immediate physical danger, please contact local emergency services immediately (112 in India).
            </p>
        </div>
    );
};

const styles = {
    bannerContainer: {
        background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(255, 100, 100, 0.05))',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        margin: '16px 0',
        color: 'var(--color-text-primary)',
        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.08)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
    },
    title: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#ef4444',
        margin: 0,
        flex: 1,
        paddingLeft: '8px'
    },
    text: {
        fontSize: '14px',
        lineHeight: '1.5',
        color: 'var(--color-text-secondary)',
        marginBottom: '16px'
    },
    actions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px'
    },
    contactBtn: {
        padding: '8px 16px',
        background: '#ef4444',
        color: '#fff',
        borderRadius: '24px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'background 0.2s ease',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        lineHeight: 1,
        cursor: 'pointer',
        color: 'var(--color-text-muted)'
    },
    disclaimer: {
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        margin: 0,
        fontStyle: 'italic'
    }
};

export default CrisisBanner;
