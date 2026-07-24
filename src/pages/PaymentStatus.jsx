import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { paymentService } from '../services/paymentService';

const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000;

const ORDER_TYPE_COPY = {
    guide_session: {
        heading: 'Your session is booked',
        buttonLabel: 'View booking',
        path: '/bookings'
    },
    subscription: {
        heading: 'Welcome to Premium',
        buttonLabel: 'Explore',
        path: '/'
    },
    neha_premium: {
        heading: 'NEHA Premium activated',
        buttonLabel: 'Open NEHA',
        path: '/neha'
    }
};

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');

    // 'polling' | 'success' | 'failure' | 'timeout' | 'error'
    const [phase, setPhase] = useState(() => (orderId ? 'polling' : 'error'));
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!orderId) return;

        let cancelled = false;
        let timeoutId = null;
        let attempts = 0;

        const poll = async () => {
            attempts += 1;
            try {
                const result = await paymentService.checkPaymentStatus(orderId);
                if (cancelled) return;

                if (result.status !== 'created') {
                    setOrder(result);
                    setPhase(result.status === 'paid' ? 'success' : 'failure');
                    return;
                }

                if (attempts >= MAX_POLL_ATTEMPTS) {
                    setOrder(result);
                    setPhase('timeout');
                    return;
                }

                timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
            } catch (err) {
                if (cancelled) return;
                console.error('[PaymentStatus] checkPaymentStatus failed:', err);
                if (attempts >= MAX_POLL_ATTEMPTS) {
                    setPhase('error');
                    return;
                }
                timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
            }
        };

        poll();

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [orderId]);

    const cardStyle = {
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-premium)',
        padding: '48px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
    };

    const headingStyle = {
        fontFamily: 'var(--font-header)',
        fontSize: '1.8rem',
        color: 'var(--color-text-primary)',
        margin: 0
    };

    const bodyStyle = {
        color: 'var(--color-text-secondary)',
        fontSize: '1rem',
        margin: 0
    };

    const buttonStyle = {
        marginTop: '16px',
        padding: '14px 32px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: 'var(--grad-primary)',
        color: '#ffffff',
        fontWeight: '800',
        fontSize: '1rem',
        cursor: 'pointer'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        background: 'transparent',
        border: '1.5px solid var(--color-primary)',
        color: 'var(--color-primary)'
    };

    const renderContent = () => {
        if (phase === 'polling') {
            return (
                <div style={cardStyle}>
                    <Loader2 size={56} style={{ color: 'var(--color-primary)' }} className="payment-status-spin" />
                    <p style={bodyStyle}>Confirming your payment...</p>
                </div>
            );
        }

        if (phase === 'success') {
            const orderType = order?.orderType;
            const copy = ORDER_TYPE_COPY[orderType];

            return (
                <div style={cardStyle}>
                    <CheckCircle2 size={64} style={{ color: 'var(--neha-success, #16a34a)' }} />
                    <h1 style={headingStyle}>Payment confirmed</h1>
                    {typeof order?.amount === 'number' && (
                        <p style={bodyStyle}>Amount paid: ₹{order.amount}</p>
                    )}
                    {copy && <p style={bodyStyle}>{copy.heading}</p>}
                    <button
                        style={buttonStyle}
                        onClick={() => navigate(copy ? copy.path : '/')}
                    >
                        {copy ? copy.buttonLabel : 'Continue'}
                    </button>
                </div>
            );
        }

        if (phase === 'failure') {
            return (
                <div style={cardStyle}>
                    <XCircle size={64} style={{ color: 'var(--neha-danger, #dc2626)' }} />
                    <h1 style={headingStyle}>Payment was not completed</h1>
                    <p style={bodyStyle}>No amount has been deducted, or it will be refunded automatically.</p>
                    <button style={buttonStyle} onClick={() => navigate(-1)}>
                        Try again
                    </button>
                </div>
            );
        }

        if (phase === 'timeout') {
            return (
                <div style={cardStyle}>
                    <Clock size={56} style={{ color: 'var(--neha-warning, #d97706)' }} />
                    <h1 style={headingStyle}>Still confirming...</h1>
                    <p style={bodyStyle}>
                        This is taking longer than usual. We'll update your account as soon as the payment clears —
                        no need to try again.
                    </p>
                    <button style={secondaryButtonStyle} onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            );
        }

        // phase === 'error'
        return (
            <div style={cardStyle}>
                <XCircle size={64} style={{ color: 'var(--neha-danger, #dc2626)' }} />
                <h1 style={headingStyle}>We couldn't find this payment</h1>
                <p style={bodyStyle}>The link may be incomplete or expired.</p>
                <button style={secondaryButtonStyle} onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        );
    };

    return (
        <DesktopLayoutWrapper>
            <SEO
                title="Payment Status | SoulThread"
                description="Confirming your SoulThread payment."
                url="https://soulthread.in/payment-status"
            />
            <div style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{ maxWidth: '440px', width: '100%' }}>
                    {renderContent()}
                </div>
            </div>
            <style>{`
                .payment-status-spin {
                    animation: paymentStatusSpin 1s linear infinite;
                }
                @keyframes paymentStatusSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </DesktopLayoutWrapper>
    );
};

export default PaymentStatus;
