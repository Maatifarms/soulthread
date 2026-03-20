import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, startAt, endAt, doc, arrayUnion, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';
import FeedItem from '../components/feed/FeedItem';
import ConnectModal from '../components/common/ConnectModal';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import { Capacitor } from '@capacitor/core';
import useTheme from '../hooks/useTheme';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

import './Explore.css';

const Explore = () => {
    const isNativeApp = Capacitor.isNativePlatform();
    const { currentUser } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [activeTab, setActiveTab] = useState('souls'); // 'souls' or 'threads'
    const [peopleResults, setPeopleResults] = useState([]);
    const [peopleLoading, setPeopleLoading] = useState(false);
    const [connectModalTarget, setConnectModalTarget] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Posts Hook integration
    const { posts: threadResults, loading: threadsLoading } = usePosts(
        40,
        selectedCategory,
        currentUser,
        null,
        debouncedTerm
    );

    // People Search Logic
    useEffect(() => {
        const searchPeople = async () => {
            if (!debouncedTerm.trim()) {
                setPeopleLoading(true);
                try {
                    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(15));
                    const snap = await getDocs(q);
                    setPeopleResults(snap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(u => u.id !== currentUser?.uid && !u.isAnonymous && !u.isIncognito)
                    );
                } finally { setPeopleLoading(false); }
                return;
            }

            setPeopleLoading(true);
            try {
                const term = debouncedTerm.toLowerCase();
                const usersRef = collection(db, 'users');
                const variants = [debouncedTerm, term, debouncedTerm.charAt(0).toUpperCase() + term.slice(1)];

                const promises = variants.map(v => getDocs(query(usersRef, orderBy('displayName'), startAt(v), endAt(v + '\uf8ff'), limit(10))));
                const snaps = await Promise.all(promises);

                let merged = new Map();
                snaps.forEach(s => s.docs.forEach(d => {
                    const data = d.data();
                    if (d.id !== currentUser?.uid && !data.isAnonymous && !data.isIncognito) {
                        merged.set(d.id, { id: d.id, ...data });
                    }
                }));
                setPeopleResults(Array.from(merged.values()));
            } catch (err) {
                console.error(err);
            } finally {
                setPeopleLoading(false);
            }
        };

        searchPeople();
    }, [debouncedTerm, currentUser]);

    const initiateConnect = (e, user) => {
        e.stopPropagation();
        if (!currentUser) return navigate('/login');
        setConnectModalTarget(user);
    };

    const confirmConnect = async (note) => {
        if (!currentUser || !connectModalTarget) return;
        try {
            const targetId = connectModalTarget.id;
            await setDoc(doc(db, 'users', targetId), { pendingRequests: arrayUnion(currentUser.uid) }, { merge: true });
            await setDoc(doc(db, 'users', currentUser.uid), { sentRequests: arrayUnion(targetId) }, { merge: true });

            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'notifications'), {
                recipientId: targetId,
                senderId: currentUser.uid,
                senderName: isAnon ? 'Anonymous Soul' : (currentUser.displayName || 'Someone'),
                type: 'connection_request',
                message: `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} wants to connect.`,
                note: note || '',
                read: false,
                createdAt: serverTimestamp()
            });
            alert("Connection request sent!");
        } catch (e) { console.error(e); }
        setConnectModalTarget(null);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const categories = [
        { id: 'all', label: 'All', icon: '🌟' },
        { id: 'healing', label: 'Healing', icon: '🌱' },
        { id: 'anxiety', label: 'Anxiety', icon: '🌊' },
        { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
        { id: 'growth', label: 'Growth', icon: '🚀' },
        { id: 'community', label: 'Community', icon: '🤝' },
        { id: 'series', label: 'Series', icon: '📚' }
    ];

    const seriesData = [
        {
            id: 'hyperfocus-architect',
            title: 'Hyperfocus Architect',
            subtitle: 'Neuroscience-based attention training.',
            image: '/assets/hyperfocus/post_01.png',
            path: '/hyperfocus-series',
            tag: 'Neuroscience'
        },
        {
            id: 'never-finished',
            title: 'Never Finished',
            subtitle: 'Mental Toughness bootcamp.',
            image: '/assets/neverfinished/post_01.png',
            path: '/never-finished-series',
            tag: 'Mindset'
        },
        {
            id: 'ego-id',
            title: 'The Ego and the Id',
            subtitle: 'Understanding the Human Psyche (Hindi).',
            image: '/assets/egoid/post_01.png',
            path: '/ego-id-series',
            tag: 'Psychology'
        }
    ];

    return (
        <DesktopLayoutWrapper>
            <div className={`explore-page ${isNativeApp ? 'is-native' : ''}`}>
                <Breadcrumbs />
                <SEO 
                    title="Explore Souls & Insights"
                    description="Discover authentic stories, connect with like-minded souls, and explore a variety of mental health insights on SoulThread."
                    url="https://soulthread.in/explore"
                />
                
                {/* Header / Search Area */}
                <div className="explore-header">
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="Search souls, insights, and stories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="search-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Categories Bar */}
                    <div className="categories-bar no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id === 'all' ? null : cat.id);
                                    if (cat.id !== 'series' && activeTab === 'souls') setActiveTab('threads');
                                }}
                                className={`category-btn ${(selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory)) ? 'active' : ''}`}
                            >
                                <span className="category-icon">{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Switcher */}
                    <div className="tab-switcher">
                        <button
                            onClick={() => setActiveTab('souls')}
                            className={`tab-btn ${activeTab === 'souls' ? 'active' : ''}`}
                        >
                            Souls
                        </button>
                        <button
                            onClick={() => setActiveTab('threads')}
                            className={`tab-btn ${activeTab === 'threads' ? 'active' : ''}`}
                        >
                            Threads
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="explore-content-container" style={{ maxWidth: 'var(--max-width-feed)', margin: '40px auto', padding: '0 24px' }}>
                    {activeTab === 'souls' ? (
                        <div className="souls-grid">
                            {peopleLoading ? [1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={{ height: '240px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)' }} />
                            )) : peopleResults.map(user => (
                                <div key={user.id} onClick={() => navigate(`/profile/${user.id}`)} className="soul-card">
                                    <div className="soul-avatar">
                                        {user.displayName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="soul-name">{user.displayName || 'Soul'}</div>
                                    <div className="soul-role">{user.role === 'psychologist' ? 'Counselor' : 'Member'}</div>

                                    {!currentUser?.connections?.includes(user.id) && (
                                        <button
                                            onClick={(e) => initiateConnect(e, user)}
                                            className="connect-btn"
                                        >
                                            Connect
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="threads-results">
                            {selectedCategory === 'series' ? (
                                <div className="series-grid">
                                    {seriesData.map(series => (
                                        <div key={series.id} onClick={() => navigate(series.path)} className="series-card">
                                            <div className="series-thumb">
                                                <img src={series.image} alt={series.title} loading="lazy" />
                                            </div>
                                            <div className="series-info">
                                                <div className="series-tag">{series.tag}</div>
                                                <div className="series-title">{series.title}</div>
                                                <div className="series-subtitle">{series.subtitle}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="feed-results">
                                    {threadsLoading ? [1, 2, 3].map(i => (
                                        <div key={i} style={{ height: '200px', marginBottom: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-soft)' }} />
                                    )) : threadResults.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--color-text-muted)', fontSize: '18px', fontWeight: '600' }}>No matching threads found.</div>
                                    ) : threadResults.map(post => (
                                        <FeedItem key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {connectModalTarget && (
                    <ConnectModal
                        targetName={connectModalTarget.displayName || 'Soul'}
                        onConfirm={confirmConnect}
                        onClose={() => setConnectModalTarget(null)}
                    />
                )}
            </div>
        </DesktopLayoutWrapper>
    );
};

export default Explore;
