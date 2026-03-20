import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Capacitor } from '@capacitor/core';

/**
 * Desktop Right Sidebar — Shown only on screens ≥ 1100px
 * Contains: Quick links, Series promo, Crisis help
 */
const DesktopSidebar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    if (Capacitor.isNativePlatform()) return null;

    return (
        <aside className="desktop-sidebar">
            {/* Series CTA */}
            <div style={{
                background: 'linear-gradient(135deg, #1a2e2c 0%, #2a4f4a 100%)',
                borderRadius: '20px',
                padding: '22px',
                marginBottom: '16px',
                border: '1px solid rgba(61,139,127,0.3)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(61,139,127,0.3)', color: '#7ecdc4',
                    padding: '3px 10px', borderRadius: '999px',
                    fontSize: '10px', fontWeight: '800', letterSpacing: '0.1em',
                    textTransform: 'uppercase', marginBottom: '12px',
                }}>🎓 Learning Series</div>
                <h3 style={{ color: 'white', fontWeight: '800', fontSize: '17px', lineHeight: '1.3', marginBottom: '10px', margin: '0 0 10px 0' }}>
                    Upgrade Your Mind
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 18px 0' }}>
                    Structured 30-day paths for focus mastery, mental toughness, and psychological resilience.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                    {[
                        { name: 'Hyperfocus Architect', path: '/hyperfocus-series', tag: 'Neuroscience' },
                        { name: 'Never Finished', path: '/never-finished-series', tag: 'Mental Toughness' },
                    ].map(s => (
                        <Link key={s.path} to={s.path} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 14px',
                            border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        >
                            <div>
                                <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{s.name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginTop: '2px' }}>{s.tag}</div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </Link>
                    ))}
                </div>
                <Link to="/series" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: 'var(--color-primary)', color: 'white',
                    padding: '10px', borderRadius: '12px', fontWeight: '700', fontSize: '13px',
                    textDecoration: 'none', transition: 'all 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >Browse All Series →</Link>
            </div>

            {/* Crisis Help */}
            <div style={{
                background: 'var(--color-surface)',
                borderRadius: '20px', padding: '20px', marginBottom: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--color-text-primary)' }}>Need Support?</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '1px' }}>Talk to a professional</div>
                    </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                    Verified psychologists available for confidential sessions.
                </p>
                <Link to="/crisis" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', background: '#ef4444', color: 'white',
                    padding: '10px', borderRadius: '12px', fontWeight: '700', fontSize: '13px',
                    textDecoration: 'none', transition: 'all 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    Find a Psychologist
                </Link>
            </div>

            {/* Trending Topics Placeholder */}
            <div style={{
                background: 'var(--color-surface)',
                borderRadius: '20px', padding: '16px', marginBottom: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>Trending Topics</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['#MentalToughness', '#AnxietyRelief', '#FocusMastery', '#Healing', '#DailyReflections', '#GrowthMindset'].map(tag => (
                        <Link key={tag} to="/explore" style={{
                            fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)',
                            background: 'var(--color-primary-soft)', padding: '6px 12px', borderRadius: '14px',
                            textDecoration: 'none', transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-soft)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick Links / Community Guidelines */}
            <div style={{
                background: 'var(--color-surface)',
                borderRadius: '20px', padding: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Community Links</div>
                {[
                    { to: '/explore', label: 'Explore Community' },
                    { to: '/crisis', label: 'Psychologist List' },
                    { to: '/', label: 'Community Guidelines' },
                    ...(currentUser ? [{ to: `/profile/${currentUser.uid}`, label: 'My Profile' }] : [{ to: '/signup', label: 'Create Account' }]),
                ].map(link => (
                    <Link key={link.to} to={link.to} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 4px', borderBottom: '1px solid var(--color-divider)',
                        textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '600',
                        transition: 'color 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                    >
                        {link.label}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </Link>
                ))}
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    © 2026 SoulThread · <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Privacy</a> · <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Terms</a>
                </div>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
