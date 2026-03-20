import SEO from '../common/SEO';
import Breadcrumbs from '../common/Breadcrumbs';

const LegalPolicy = ({ title, lastUpdated, content, keywords }) => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '120px 5% 80px' }}>
            <SEO 
                title={`${title} | SoulThread Official`}
                description={`SoulThread official ${title.toLowerCase()}. Learn how we protect our community and maintain a safe sanctuary.`}
                keywords={keywords}
            />
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Breadcrumbs />
                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
                    fontWeight: '900', 
                    marginBottom: '16px',
                    fontFamily: 'Outfit, sans-serif'
                }}>
                    {title}
                </h1>
                <p style={{ opacity: 0.5, marginBottom: '48px', fontSize: '0.9rem' }}>
                    Last Updated: {lastUpdated}
                </p>

                <div className="policy-content" style={{ 
                    lineHeight: '1.8', 
                    fontSize: '1.1rem', 
                    color: 'var(--color-text-primary)' 
                }}>
                    {content}
                </div>
            </div>
        </div>
    );
};

export default LegalPolicy;
