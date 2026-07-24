import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

const PLUS_FEATURES = [
    'Everything in Free',
    'Unlimited Soul Guide discovery',
    'Priority community',
    'Advanced report analysis',
    'NEHA Premium'
];

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        priceLabel: '₹0',
        cadence: '',
        features: ['Community feed', 'Crisis support', 'Basic NEHA']
    },
    {
        id: 'plus_monthly',
        name: 'Plus',
        price: 199,
        priceLabel: '₹199',
        cadence: '/month',
        features: PLUS_FEATURES,
        orderNote: 'SoulThread Plus - Monthly',
        buttonLabel: 'Get Plus'
    },
    {
        id: 'plus_annual',
        name: 'Plus Annual',
        price: 1499,
        priceLabel: '₹1,499',
        cadence: '/year',
        savingsLabel: 'Save 37%',
        badge: 'Best value',
        recommended: true,
        features: PLUS_FEATURES,
        orderNote: 'SoulThread Plus - Annual',
        buttonLabel: 'Get Annual'
    }
];

const Subscribe = () => {
    const { currentUser } = useAuth();
    const [loadingPlanId, setLoadingPlanId] = useState(null);

    const subscription = currentUser?.subscription;
    const isActive = subscription?.status === 'active';
    const activePlanId = isActive ? subscription.plan : 'free';
    const isCurrentlyFree = !isActive;

    const expiresLabel = isActive && subscription.expiresAt
        ? new Date(subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    const handlePay = async (plan) => {
        if (!currentUser) {
            alert('Please login to subscribe.');
            return;
        }
        if (loadingPlanId) return;

        setLoadingPlanId(plan.id);
        try {
            // Redirects the page to Cashfree checkout — on success the browser
            // navigates away to /payment-status, so there's nothing to do here.
            await paymentService.initiatePayment({
                amount: plan.price,
                orderNote: plan.orderNote,
                orderType: 'subscription',
                metadata: { plan: plan.id }
            });
        } catch (err) {
            console.error('Subscription payment failed:', err);
            alert(`Payment could not be completed: ${err.message}`);
            setLoadingPlanId(null);
        }
    };

    return (
        <DesktopLayoutWrapper>
            <SEO
                title="Subscribe to SoulThread Plus"
                description="Upgrade to SoulThread Plus for unlimited Soul Guide access, priority community, and NEHA Premium."
                url="https://soulthread.in/subscribe"
            />
            <div style={{
                background: 'var(--color-background)',
                minHeight: '100vh',
                padding: '20px 20px 100px'
            }}>
                <Breadcrumbs />
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <header style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                fontFamily: 'var(--font-header)',
                                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                                color: 'var(--color-text-primary)',
                                marginBottom: '16px'
                            }}
                        >
                            Upgrade to <span style={{ color: 'var(--color-primary)' }}>Plus</span>
                        </motion.h1>
                        <p style={{
                            fontSize: '1.05rem',
                            color: 'var(--color-text-secondary)',
                            maxWidth: '560px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Unlimited Soul Guide sessions, priority support, and deeper wellness tools.
                        </p>

                        {isActive && (
                            <div style={{
                                marginTop: '20px',
                                display: 'inline-block',
                                background: 'var(--color-primary-soft)',
                                color: 'var(--color-primary-dark)',
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: '800',
                                fontSize: '0.9rem'
                            }}>
                                You are on Plus — expires {expiresLabel}
                            </div>
                        )}
                    </header>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '28px',
                        alignItems: 'stretch'
                    }}>
                        {PLANS.map((plan, index) => {
                            const isCurrent = plan.id === 'free' ? isCurrentlyFree : (isActive && activePlanId === plan.id);
                            const isLoading = loadingPlanId === plan.id;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        background: 'var(--color-surface)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '36px',
                                        border: plan.recommended ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                                        boxShadow: plan.recommended ? 'var(--shadow-premium)' : 'var(--shadow-sm)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {plan.badge && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '18px',
                                            right: '-34px',
                                            background: 'var(--grad-primary)',
                                            color: '#ffffff',
                                            padding: '6px 38px',
                                            transform: 'rotate(45deg)',
                                            fontSize: '11px',
                                            fontWeight: '900',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase'
                                        }}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    <h3 style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '900',
                                        color: 'var(--color-text-primary)',
                                        marginBottom: '8px'
                                    }}>
                                        {plan.name}
                                    </h3>

                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ fontSize: '2.2rem', fontWeight: '950', color: 'var(--color-text-primary)' }}>
                                            {plan.priceLabel}
                                        </span>
                                        {plan.cadence && (
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>{plan.cadence}</span>
                                        )}
                                    </div>
                                    {plan.savingsLabel && (
                                        <div style={{
                                            color: 'var(--color-primary)',
                                            fontWeight: '800',
                                            fontSize: '0.85rem',
                                            marginBottom: '20px'
                                        }}>
                                            {plan.savingsLabel}
                                        </div>
                                    )}
                                    {!plan.savingsLabel && <div style={{ marginBottom: '20px' }} />}

                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1 }}>
                                        {plan.features.map((feature) => (
                                            <li key={feature} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                marginBottom: '14px',
                                                color: 'var(--color-text-secondary)',
                                                fontSize: '0.9rem'
                                            }}>
                                                <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => plan.id !== 'free' && handlePay(plan)}
                                        disabled={plan.id === 'free' ? isCurrentlyFree : (isCurrent || loadingPlanId !== null)}
                                        style={{
                                            padding: '14px',
                                            borderRadius: 'var(--radius-md)',
                                            border: 'none',
                                            background: isCurrent ? 'var(--color-border)' : 'var(--grad-primary)',
                                            color: '#ffffff',
                                            fontWeight: '900',
                                            fontSize: '0.95rem',
                                            cursor: (plan.id === 'free' ? isCurrentlyFree : isCurrent) ? 'default' : 'pointer',
                                            opacity: (loadingPlanId && !isLoading) ? 0.6 : 1
                                        }}
                                    >
                                        {plan.id === 'free'
                                            ? 'Current plan'
                                            : isCurrent
                                                ? 'Current plan'
                                                : isLoading
                                                    ? 'Connecting...'
                                                    : plan.buttonLabel}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
};

export default Subscribe;
