import React from 'react';
import LegalPolicy from '../components/legal/LegalPolicy';

const Terms = () => {
    const content = (
        <div style={{ display: 'flex', flex_direction: 'column', gap: '32px' }}>
            <section>
                <h2>1. Acceptance of Terms</h2>
                <p>By using SoulThread, you agree to form a safe, respectful, and helpful community. Any behavior that compromises this will result in account suspension.</p>
            </section>
            <section>
                <h2>2. User Content</h2>
                <p>You retain ownership of your threads. By posting on SoulThread, you grant us the right to serve and host your stories for other community members to benefit from.</p>
            </section>
            <section>
                <h2>3. Medical Disclaimer</h2>
                <p>SoulThread is a peer-support platform, not a medical institution. The content shared here is for educational and supportive purposes only and does not replace professional medical advice.</p>
            </section>
        </div>
    );

    return (
        <LegalPolicy 
            title="Terms of Service"
            lastUpdated="March 18, 2026"
            content={content}
            keywords="soulthread terms, community guidelines, mental health support rules"
        />
    );
};

export default Terms;
