import React from 'react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';

const Terms = () => {
    return (
        <DesktopLayoutWrapper>
            <SEO title="Terms of Service | SoulThread" />
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>Terms of Service</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>Last Updated: March 18, 2026</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>By using SoulThread, you agree to form a safe, respectful, and helpful community. Any behavior that compromises this will result in account suspension.</p>
                    </section>
                    <section>
                        <h2>2. User Content</h2>
                        <p>You retain ownership of your threads. By posting on SoulThread, you grant us the right to serve and host your stories for other community members to benefit from.</p>
                    </section>
                    <section>
                        <h2>3. Wellness Disclaimer</h2>
                        <p>SoulThread is a peer-support platform, not a wellness institution. The content shared here is for educational and supportive purposes only and does not replace professional wellness advice.</p>
                    </section>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
};

export default Terms;
