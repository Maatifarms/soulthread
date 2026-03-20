import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import { Capacitor } from '@capacitor/core';

const DesktopLeftSidebar = () => {
    const { currentUser } = useAuth();

    if (Capacitor.isNativePlatform()) return null;
    const location = useLocation();

    // Reusing the same unread count logic from Navbar if needed, 
    // but typically we can just assume standard links here or pass props
    const NavItem = ({ to, label, icon: Icon, badge }) => {
        const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

        return (
            <RouterNavLink to={to} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '14px 20px', borderRadius: '16px',
                color: active ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                fontWeight: active ? '800' : '600',
                fontSize: '17px',
                textDecoration: 'none',
                background: active ? 'var(--color-primary-soft)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: '4px',
                position: 'relative'
            }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-surface-2)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'all 0.2s'
                }}>
                    <Icon active={active} />
                </div>
                {label}
                {badge > 0 && (
                    <span style={{
                        marginLeft: 'auto', background: '#ff3b30', color: 'white',
                        borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: '800'
                    }}>
                        {badge > 9 ? '9+' : badge}
                    </span>
                )}
            </RouterNavLink>
        );
    };

    return (
        <aside className="desktop-left-sidebar" style={{
            position: 'sticky', top: 'calc(var(--header-height) + 20px)',
            padding: '10px 24px 20px 0',
            height: 'calc(100vh - var(--header-height) - 40px)',
            flexDirection: 'column'
        }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavItem to="/" label="Home" icon={({ active }) => (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                )} />
                <NavItem to="/explore" label="Explore" icon={({ active }) => (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? '3' : '2'} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                )} />
                <NavItem to="/series" label="Series" icon={({ active }) => (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5" />
                    </svg>
                )} />
                <NavItem to="/messages" label="Chat" icon={({ active }) => (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )} />
                <NavItem to="/crisis" label="Crisis" icon={({ active }) => (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                )} />
                {currentUser && (
                    <NavItem to={`/profile/${currentUser.uid}`} label="Profile" icon={({ active }) => (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    )} />
                )}
            </nav>
            {!currentUser && (
                <div style={{ marginTop: 'auto', padding: '20px', background: 'var(--color-surface-2)', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '15px', margin: '0 0 8px 0' }}>Join Sanctuary</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4 }}>Find peace, build resilience, and share your growth.</p>
                    <RouterNavLink to="/login" style={{
                        display: 'block', textAlign: 'center', background: 'var(--color-primary)', color: 'white',
                        padding: '12px', borderRadius: '99px', textDecoration: 'none', fontWeight: '800', fontSize: '14px'
                    }}>Log In</RouterNavLink>
                </div>
            )}
        </aside>
    );
};

export default React.memo(DesktopLeftSidebar);
