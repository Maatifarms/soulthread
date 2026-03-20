import React from 'react';
import LegalPolicy from '../components/legal/LegalPolicy';

const Privacy = () => {
    const content = (
        <div style={{ display: 'flex', flex_direction: 'column', gap: '32px' }}>
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
        </div>
    );

    return (
        <LegalPolicy 
            title="Privacy Policy"
            lastUpdated="March 18, 2026"
            content={content}
            keywords="soulthread privacy, mental health data protection, anonymous support privacy"
        />
    );
};

export default Privacy;
