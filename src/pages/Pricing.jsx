import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import { Capacitor } from '@capacitor/core';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

import { paymentService } from '../services/paymentService';

import { CheckCircle2 } from 'lucide-react';

const Pricing = () => {
    const { currentUser } = useAuth();
    const [loadingTier, setLoadingTier] = useState(null);

    const handleSubscribe = async (tierId) => {
        if (!currentUser) {
            alert('Please login to subscribe.');
            return;
        }

        setLoadingTier(tierId);
        const tier = sustainability.getTierDetails(tierId);
        tier.id = tierId;

        try {
            console.log(`[Billing] Initializing checkout for tier: ${tierId}`);
            
            if (tierId === SUBSCRIPTION_TIERS.PRO) {
                // Use Razorpay for Pro
                await paymentService.initializeRazorpay(currentUser, tier, tier.price);
            } else {
                // Use Stripe for Basic (or choice)
                await paymentService.initializeStripe(currentUser, tierId);
                alert('Stripe redirect would happen here. For now, we are using Razorpay for testing.');
            }
        } catch (err) {
            console.error('Payment failed:', err);
            alert(`Payment could not be completed: ${err.message}`);
        } finally {
            setLoadingTier(null);
        }
    };

    const tiers = Object.keys(sustainability.TIERS).map(id => ({
        id,
        ...sustainability.TIERS[id]
    }));

    return (
        <DesktopLayoutWrapper>
            <SEO 
                title="Elevate Your Soul: Pricing & Membership | SoulThread"
                description="Choose the right path for your mental growth. Access advanced learning series, expert guidance, and premium wellness tools."
                url="https://soulthread.in/pricing"
            />
            <div style={{
                background: 'var(--color-background)',
                minHeight: '100vh',
                padding: '20px 20px 100px',
                fontFamily: "'Outfit', sans-serif"
            }}>
                <Breadcrumbs />
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                                fontWeight: '950',
                                color: 'var(--color-text-primary)',
                                marginBottom: '16px',
                                letterSpacing: '-0.04em'
                            }}
                        >
                            Elevate Your <span style={{ color: 'var(--color-primary)' }}>Soul</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                fontSize: '1.2rem',
                                color: 'var(--color-text-secondary)',
                                maxWidth: '600px',
                                margin: '0 auto',
                                lineHeight: '1.6'
                            }}
                        >
                            Structured growth paths and deep clinical support for those who prioritize their mental architecture.
                        </motion.p>
                    </header>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '30px',
                        alignItems: 'stretch'
                    }}>
                        {tiers.map((tier, index) => {
                            const isCurrent = currentUser?.subscriptionTier === tier.id || (!currentUser?.subscriptionTier && tier.id === 'free');
                            const isPro = tier.id === SUBSCRIPTION_TIERS.PRO;

                            return (
                                <motion.div
                                    key={tier.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    style={{
                                        background: isPro ? 'var(--color-surface)' : 'var(--color-surface)',
                                        borderRadius: '32px',
                                        padding: '40px',
                                        border: isPro ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                                        boxShadow: isPro ? 'var(--shadow-premium)' : 'var(--shadow-sm)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {isPro && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '20px',
                                            right: '-35px',
                                            background: 'var(--grad-primary)',
                                            color: 'white',
                                            padding: '8px 40px',
                                            transform: 'rotate(45deg)',
                                            fontSize: '12px',
                                            fontWeight: '900',
                                            letterSpacing: '0.1em',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            MOST VALUED
                                        </div>
                                    )}

                                    <h3 style={{ 
                                        fontSize: '1.5rem', 
                                        fontWeight: '900', 
                                        marginBottom: '8px',
                                        color: 'var(--color-text-primary)'
                                    }}>
                                        {tier.name}
                                    </h3>
                                    
                                    <div style={{ marginBottom: '32px' }}>
                                        <span style={{ 
                                            fontSize: '2.5rem', 
                                            fontWeight: '950', 
                                            color: 'var(--color-text-primary)' 
                                        }}>
                                            {tier.price === 0 ? 'Free' : `₹${tier.price}`}
                                        </span>
                                        {tier.price > 0 && <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}> / month</span>}
                                    </div>

                                    <div style={{ flex: 1, marginBottom: '40px' }}>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {tier.benefits.map((benefit, bIndex) => (
                                                <li key={bIndex} style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '12px', 
                                                    marginBottom: '16px',
                                                    color: 'var(--color-text-secondary)',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    <CheckCircle2 size={18} className="text-primary" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => handleSubscribe(tier.id)}
                                        disabled={isCurrent || loadingTier !== null}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: 'none',
                                            background: isCurrent ? 'var(--color-border)' : 'var(--grad-primary)',
                                            color: 'white',
                                            fontWeight: '900',
                                            fontSize: '1rem',
                                            cursor: isCurrent ? 'default' : 'pointer',
                                            boxShadow: isCurrent ? 'none' : 'var(--shadow-glow)',
                                            transition: 'transform 0.2s',
                                            opacity: (loadingTier && loadingTier !== tier.id) ? 0.6 : 1
                                        }}
                                        onMouseEnter={e => !isCurrent && (e.currentTarget.style.transform = 'scale(1.02)')}
                                        onMouseLeave={e => !isCurrent && (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        {loadingTier === tier.id ? 'Connecting...' : (isCurrent ? 'Current Plan' : 'Select Plan')}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>

                    <footer style={{ marginTop: '80px', textAlign: 'center' }}>
                        <div style={{
                            background: 'var(--color-surface)',
                            padding: '32px',
                            borderRadius: '24px',
                            border: '1.5px solid var(--color-border)',
                            display: 'inline-block',
                            maxWidth: '700px'
                        }}>
                            <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '12px', fontWeight: '800' }}>Building for Institutions?</h4>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                We provide bespoke enterprise architecture for universities and corporations including advanced population analytics and dedicated support lines.
                            </p>
                            <button style={{
                                marginTop: '20px',
                                background: 'transparent',
                                border: '1.5px solid var(--color-primary)',
                                color: 'var(--color-primary)',
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}>
                                Request Institutional Quote
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .container { padding: 0 10px; }
                }
            `}</style>
        </DesktopLayoutWrapper>
    );
};

export default Pricing;
