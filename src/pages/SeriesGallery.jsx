import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { sustainability } from '../services/sustainabilityModel';
import { Capacitor } from '@capacitor/core';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import { useSeriesProgress } from '../hooks/useSeriesProgress';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { ArrowRight } from 'lucide-react';

const SeriesProgressBar = ({ seriesId, total }) => {
    const { getCompletionRate } = useSeriesProgress(seriesId);
    const rate = getCompletionRate(total);
    if (!rate) return null;
    return (
        <div style={{
            position: 'absolute', bottom: '0', left: '0', width: '100%', height: '8px', 
            background: 'rgba(255,255,255,0.1)', overflow: 'hidden'
        }}>
            <div style={{
                height: '100%', width: `${rate}%`, background: 'var(--color-primary)',
                transition: 'width 0.8s ease'
            }} />
        </div>
    );
};

export const SERIES_DATA = [
    {
        id: 'hyperfocus-architect',
        title: 'Hyperfocus Architect',
        subtitle: 'Neuroscience-based attention training.',
        description: 'Upgrade your mental operating system through 30 chapters of focus mastery and observation training.',
        image: '/assets/hyperfocus/post_01.png',
        path: '/hyperfocus-series',
        tag: 'Neuroscience',
        count: '30 Posts'
    },
    {
        id: 'memory-architect',
        title: 'Memory Architect',
        subtitle: 'Science-Based Recall Mastery.',
        description: 'Reprogram your brain’s recall mechanisms using 30 days of neurobiology-backed protocols for retention and growth.',
        image: '/assets/memory/series_cover.png',
        path: '/memory-series',
        tag: 'Neuroscience',
        count: '30 Chapters'
    },
    {
        id: 'never-finished',
        title: 'Never Finished',
        subtitle: 'Mental Toughness Series.',
        description: 'A 30-day psychological bootcamp inspired by the David Goggins philosophy of the "uncommon amongst uncommon".',
        image: '/assets/neverfinished/post_01.png',
        path: '/never-finished-series',
        tag: 'Psychology',
        count: '30 Posts'
    },
    {
        id: 'prompt-architect',
        title: 'The Prompt Architect',
        subtitle: 'Mastering AI Engineering.',
        description: 'Bridge the gap between human thought and AI execution through 10 chapters of advanced prompt engineering.',
        image: '/assets/prompt/post_01.png',
        path: '/prompt-engineering-series',
        tag: 'Technology',
        count: '10 Chapters',
        requiredTier: 'soul_basic'
    },
    {
        id: 'ego-id',
        title: 'The Ego and the Id',
        subtitle: 'Understanding the Human Psyche (Hindi).',
        description: 'Explore Freud’s revolutionary model of the human mind: the impulsive Id, the realistic Ego, and the moral Superego.',
        image: '/assets/egoid/post_01.png',
        path: '/ego-id-series',
        tag: 'Psychology',
        count: '10 Episodes'
    },
    {
        id: 'inner-bloom',
        title: 'Inner Bloom: Meditation',
        subtitle: 'A sensory journey into silence.',
        description: 'From the neon bustle of Seoul to the mist of the countryside. A 3-level meditation series designed for every stage of your practice.',
        image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=1200',
        path: '/meditation-series',
        tag: 'Spirituality',
        count: '3 Levels',
        requiredTier: 'soul_pro'
    },
    {
        id: 'biological-soul',
        title: 'The Biological Soul',
        subtitle: 'Human Nature Decoded.',
        description: 'Explore the biological roots of behavior, stress, and society in this 25-lecture masterclass based on Stanford’s human biology curriculum.',
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200',
        path: '/biological-soul-series',
        tag: 'Science',
        count: '25 Lectures',
        requiredTier: 'soul_pro'
    },
    {
        id: 'relationship-mastery',
        title: 'Relationship Mastery',
        subtitle: 'The Heart\'s Journey.',
        description: 'Navigate modern dating, toxic patterns, and the psychology of love in this 10-chapter immersive guide for students and professionals.',
        image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200',
        path: '/relationship-series',
        tag: 'Psychology',
        count: '10 Chapters',
        requiredTier: 'soul_basic'
    },
    {
        id: 'lust-decoded',
        title: 'Lust Decoded',
        subtitle: 'Intimacy & Attraction.',
        description: 'Understand the quiet shifts in intimacy, the patterns of attraction, and how to decode desire (18+).',
        image: '/assets/hyperfocus/post_01.png',
        path: '/lust-decoded',
        tag: 'Relationships',
        count: '17 Posts',
        requiredTier: 'soul_basic'
    }
];

const SeriesGallery = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleSeriesClick = (e, series) => {
        if (series.isLocked) {
            e.preventDefault();
            return; // Still coming soon
        }

        // Navigate using the predefined path from the series object
        analytics.logEvent('series_view', { 
            series_id: series.id,
            series_title: series.title 
        });
        
        navigate(series.path);
    };

    return (
        <DesktopLayoutWrapper>
            <SEO 
                title="Learning Series: Curated Wisdom & Focus Mastery | SoulThread"
                description="Explore our library of deep-dive series on neuroscience, mental toughness, AI engineering, and psychology. Curated for the modern seeker."
                image="/assets/hyperfocus/post_01.png"
                url="https://soulthread.in/series"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "itemListElement": SERIES_DATA.map((series, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Course",
                            "name": series.title,
                            "description": series.description,
                            "publisher": {
                                "@type": "Organization",
                                "name": "SoulThread",
                                "url": "https://soulthread.in"
                            },
                            "provider": {
                                "@type": "Organization",
                                "name": "SoulThread",
                                "url": "https://soulthread.in"
                            },
                            "url": `https://soulthread.in${series.path}`,
                            "image": `https://soulthread.in${series.image}`
                        }
                    }))
                }}
            />
            <Breadcrumbs />
            <div style={{
                paddingTop: '40px',
                paddingBottom: '100px',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '6px 18px',
                        background: 'var(--color-primary-soft)',
                        color: 'var(--color-primary)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '800',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: '20px'
                    }}>
                        Transformation Library
                    </span>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '900',
                        fontFamily: 'Outfit, sans-serif',
                        background: 'var(--grad-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px',
                        lineHeight: 1.1
                    }}>
                        Change Your Life.<br />One Series at a Time.
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--color-text-secondary)',
                        maxWidth: '600px',
                        margin: '0 auto 40px',
                        fontWeight: '500',
                        lineHeight: 1.6
                    }}>
                        Neuroscience. Psychology. Focus. Relationships. Each series is a structured journey — not just content, but a blueprint for lasting change.
                    </p>

                    {/* Stats bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '48px',
                        flexWrap: 'wrap',
                        padding: '24px 32px',
                        background: 'var(--color-surface)',
                        borderRadius: '20px',
                        border: '1.5px solid var(--color-border)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {[
                            { value: '8', label: 'Series' },
                            { value: '150+', label: 'Lessons' },
                            { value: '30 Days', label: 'To Transform' }
                        ].map(stat => (
                            <div key={stat.label} style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '900',
                                    background: 'var(--grad-primary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    lineHeight: 1
                                }}>{stat.value}</div>
                                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600', marginTop: '4px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '32px'
                }}>
                    {SERIES_DATA.map((series) => (
                        <motion.div
                            key={series.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            whileHover={{ y: -6, boxShadow: 'var(--shadow-xl)' }}
                            style={{
                                background: 'var(--color-surface)',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                border: '1.5px solid var(--color-border)',
                                boxShadow: 'var(--shadow-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'border-color 0.3s ease'
                            }}
                        >
                            <Link 
                                to={series.path} 
                                onClick={(e) => handleSeriesClick(e, series)}
                                style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{
                                    position: 'relative',
                                    height: '260px',
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src={series.image} 
                                        alt={series.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))'
                                    }} />
                                    
                                    <div style={{
                                        position: 'absolute',
                                        top: '24px',
                                        left: '24px',
                                        padding: '6px 14px',
                                        background: 'rgba(255,255,255,0.9)',
                                        color: 'black',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {series.tag}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '24px',
                                        right: '24px',
                                        padding: '6px 14px',
                                        background: 'var(--grad-primary)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        boxShadow: 'var(--shadow-glow)'
                                    }}>
                                        {series.count}
                                    </div>

                                    {/* Removed individual tier badges per user request to keep feed-like cards clean */}
                                    {/* Progress Bar (Phase 6 Retention) */}
                                    {series.count && (
                                        <SeriesProgressBar seriesId={series.id} total={parseInt(series.count, 10) || 0} />
                                    )}
                                </div>
                                <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h2 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: '900',
                                        marginBottom: '8px',
                                        color: 'var(--color-text-primary)',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {series.title}
                                    </h2>
                                    <h4 style={{
                                        fontSize: '1.05rem',
                                        background: 'var(--grad-primary)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        marginBottom: '20px',
                                        fontWeight: '800'
                                    }}>
                                        {series.subtitle}
                                    </h4>
                                    <p style={{
                                        fontSize: '1.05rem',
                                        lineHeight: '1.6',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '24px',
                                        flex: 1
                                    }}>
                                        {series.description}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: 'var(--color-primary)',
                                        fontWeight: '800',
                                        fontSize: '1.1rem'
                                    }}>
                                        <span>Start Journey</span>
                                        <ArrowRight size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* ── ELEVATE YOUR SOUL SECTION ── */}
                <div className="upsell-section" style={{
                    marginTop: '120px',
                    padding: '60px 40px',
                    borderRadius: '40px',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-xl)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-50px', right: '-50px',
                        width: '200px', height: '200px', background: 'var(--color-primary-soft)',
                        borderRadius: '50%', filter: 'blur(60px)', opacity: 0.4
                    }} />

                    <h2 className="upsell-title" style={{
                        fontSize: '2.4rem',
                        fontWeight: '900',
                        fontFamily: 'Outfit, sans-serif',
                        marginBottom: '16px'
                    }}>Elevate Your Soul</h2>
                    <p className="upsell-text" style={{
                        fontSize: '1.15rem',
                        maxWidth: '600px',
                        margin: '0 auto 32px',
                        lineHeight: '1.6'
                    }}>
                        Unlock the full potential of your wellness journey. Access advanced AI architecture, deeper learning series, and priority guidance.
                    </p>
                    <Link to="/pricing" className="upsell-btn" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 40px',
                        borderRadius: '20px',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span>Upgrade Your Sanctuary</span>
                        <ArrowRight size={20} strokeWidth={2.5} />
                    </Link>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
};

export default SeriesGallery;
