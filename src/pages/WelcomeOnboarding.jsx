import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_STEPS = [
    {
        title: "Welcome to SoulThread",
        subtitle: "A digital sanctuary for your mind.",
        icon: "🧵",
        text: "We believe in honest conversations and radical empathy. Here, you don't have to perform. You just have to be."
    },
    {
        title: "Zero Bias. Zero Judgment.",
        subtitle: "Safe by Design.",
        icon: "🛡️",
        text: "SoulThread is built on anonymity. Your identity is hidden by default. Share your stories without fear of real-world repercussions."
    },
    {
        title: "Community Guidelines",
        subtitle: "Protect the Peace.",
        icon: "🤝",
        text: "We do not tolerate hate speech, harassment, or harm. We protect our community fiercely. By entering, you agree to be kind."
    },
    {
        title: "How are you feeling?",
        subtitle: "First Check-in",
        icon: "💭",
        text: "Take a deep breath. Drop a quick mood, or skip it. Then we'll get you signed in."
    }
];

const WelcomeOnboarding = () => {
    const [step, setStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();

    const handleNext = () => {
        if (isAnimating) return;
        if (step < ONBOARDING_STEPS.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(s => s + 1);
                setIsAnimating(false);
            }, 300); // Wait for fade out
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = () => {
        localStorage.setItem('soulthread_welcomed', 'true');
        navigate('/login', { replace: true });
    };

    const currentData = ONBOARDING_STEPS[step];

    return (
        <div style={styles.container}>
            <div style={styles.skipRow}>
                {step < ONBOARDING_STEPS.length - 1 && (
                    <button onClick={finishOnboarding} style={styles.skipBtn}>Skip</button>
                )}
            </div>

            <div style={{ ...styles.contentSection, opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(10px)' : 'translateY(0)' }}>
                <div style={styles.icon}>{currentData.icon}</div>
                <h1 style={styles.title}>{currentData.title}</h1>
                <h2 style={styles.subtitle}>{currentData.subtitle}</h2>
                <p style={styles.text}>{currentData.text}</p>

                {step === 3 && (
                    <div style={styles.moodGrid}>
                        {['😊 Peaceful', '😔 Heavy', '🤔 Reflective', '⚡ Anxious', '🔥 Motivated'].map(m => (
                            <button key={m} onClick={finishOnboarding} style={styles.moodBtn}>{m}</button>
                        ))}
                    </div>
                )}
            </div>

            <div style={styles.footer}>
                <div style={styles.progressRow}>
                    {ONBOARDING_STEPS.map((_, i) => (
                        <div key={i} style={{
                            ...styles.dot,
                            background: i === step ? 'var(--color-primary)' : 'var(--color-border)',
                            width: i === step ? '24px' : '8px'
                        }} />
                    ))}
                </div>

                <button onClick={handleNext} style={styles.nextBtn}>
                    {step === ONBOARDING_STEPS.length - 1 ? 'Enter SoulThread' : 'Continue'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex', flexDirection: 'column', height: '100vh',
        background: 'var(--color-background)', color: 'var(--color-text-primary)'
    },
    skipRow: { padding: '24px', display: 'flex', justifyContent: 'flex-end', minHeight: '40px' },
    skipBtn: { background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
    contentSection: {
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 32px', textAlign: 'center', transition: 'all 0.3s ease'
    },
    icon: { fontSize: '64px', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '18px', fontWeight: '600', color: 'var(--color-primary)', margin: '0 0 16px 0' },
    text: { fontSize: '16px', lineHeight: '1.6', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' },
    moodGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '32px' },
    moodBtn: {
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: '24px', padding: '10px 16px', fontSize: '15px',
        cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--color-text-primary)'
    },
    footer: { padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' },
    progressRow: { display: 'flex', gap: '8px' },
    dot: { height: '8px', borderRadius: '4px', transition: 'all 0.3s ease' },
    nextBtn: {
        width: '100%', maxWidth: '400px', padding: '16px', borderRadius: '12px',
        background: 'var(--color-primary)', color: 'white', border: 'none',
        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
    }
};

export default WelcomeOnboarding;
