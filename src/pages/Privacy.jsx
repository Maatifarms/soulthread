import React from 'react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';

const Privacy = () => {
    return (
        <DesktopLayoutWrapper>
            <SEO title="Privacy Policy | SoulThread" />
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>Last Updated: July 8, 2026</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                    <section>
                        <h2>1. Radical Anonymity</h2>
                        <p>SoulThread is built on high-privacy principles. We do not require real names, and we minimize data collection to the absolute essentials for security and content serving.</p>
                    </section>
                    <section>
                        <h2>2. Data Encryption</h2>
                        <p>Your stories (threads) and private messages are encrypted and served through secure Firebase infrastructure.</p>
                    </section>
                    <section>
                        <h2>3. Third-Party Sharing</h2>
                        <p>We do not sell user data to advertisers. Our business model is based on premium learning series and sponsorship, not data mining.</p>
                    </section>
                    <section>
                        <h2>4. Data Retention and Deletion</h2>
                        <p>We retain your personal data only for as long as is necessary for the purposes set out in our policies, such as keeping your account active and providing our anonymous peer support platform. If you wish to delete your account or request deletion of your personal data, you can do so directly within the App settings or by contacting us at support@soulthread.in. We will delete or anonymize your information within 30 days of the request.</p>
                    </section>
                    <section>
                        <h2>5. AI Processing and Automated Safety Moderation</h2>
                        <p>To ensure a safe environment for all users, SoulThread utilizes automated safety tools and AI models to review user-generated content (including posts, comments, and messages). These automated systems scan for harmful content, self-harm risks, and policy violations. By using the platform, you acknowledge and agree that your content may be processed by these automated tools prior to being published.</p>
                    </section>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
};

export default Privacy;
