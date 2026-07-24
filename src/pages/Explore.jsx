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
import { 
    Sparkles, 
    PenLine, 
    Sprout, 
    Wind, 
    Heart, 
    Moon, 
    Flame, 
    Users, 
    BookOpen 
} from 'lucide-react';

import './Explore.css';

const Explore = () => {
    const isNativeApp = Capacitor.isNativePlatform();
    const { currentUser } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const getAnonymousName = (user) => {
        if (!user) return 'Soul';
        if (user.anonymousHandle) return user.anonymousHandle;
        const id = user.id || user.uid;
        const suffix = id ? id.slice(-4) : 'xxxx';
        return `Soul${suffix}`;
    };

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
            setPeopleLoading(true);
            try {
                const q = query(collection(db, 'users'), limit(100));
                const snap = await getDocs(q);
                let users = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(u => u.id !== currentUser?.uid && !u.isAnonymous && !u.isIncognito && u.displayName);

                if (debouncedTerm.trim()) {
                    const term = debouncedTerm.toLowerCase();
                    users = users.filter(u => 
                        (u.displayName && u.displayName.toLowerCase().includes(term)) || 
                        (u.anonymousHandle && u.anonymousHandle.toLowerCase().includes(term)) ||
                        (u.username && u.username.toLowerCase().includes(term))
                    );
                }
                setPeopleResults(users);
            } catch (err) {
                console.error(err);
            } finally { 
                setPeopleLoading(false); 
            }
        };

        searchPeople();
    }, [debouncedTerm, currentUser]);

    const initiateConnect = async (e, user) => {
        e.stopPropagation();
        if (!currentUser) return navigate('/login');
        try {
            const targetId = user.id;
            await setDoc(doc(db, 'users', currentUser.uid), { connections: arrayUnion(targetId) }, { merge: true });
            await setDoc(doc(db, 'users', targetId), { connections: arrayUnion(currentUser.uid) }, { merge: true });
            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'notifications'), {
                recipientId: targetId,
                senderId: currentUser.uid,
                senderName: isAnon ? 'Someone' : (currentUser.displayName || 'Someone'),
                type: 'new_connection',
                message: `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} connected with you on SoulThread.`,
                read: false,
                createdAt: serverTimestamp()
            });
        } catch (err) { console.error(err); }
    };

    const confirmConnect = async () => {};;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const categories = [
        { id: 'all', label: 'All', icon: <Sparkles size={16} /> },
        { id: 'general', label: 'General', icon: <PenLine size={16} /> },
        { id: 'healing', label: 'Healing', icon: <Sprout size={16} /> },
        { id: 'anxiety', label: 'Anxiety', icon: <Wind size={16} /> },
        { id: 'relationships', label: 'Relationships', icon: <Heart size={16} /> },
        { id: 'mindfulness', label: 'Mindfulness', icon: <Moon size={16} /> },
        { id: 'growth', label: 'Growth', icon: <Flame size={16} /> },
        { id: 'community', label: 'Community', icon: <Users size={16} /> },
        { id: 'series', label: 'Series', icon: <BookOpen size={16} /> }
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
                    title="Find Emotional Support & Wellness Stories | Explore"
                    description="Explore an anonymous venting platform filled with relatable emotional well-being stories, stress relief tips, and supportive connections on SoulThread."
                    url="https://soulthread.in/explore"
                    keywords="venting platform, personal stories, find emotional support, stress relief tips, anonymous community, personal growth"
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
                                    <div className="soul-avatar" style={user.photoURL ? { backgroundImage: `url(${user.photoURL})`, backgroundSize: 'cover', backgroundPosition: 'center', fontSize: 0 } : {}}>
                                        {!user.photoURL && (user.displayName || 'S').charAt(0)}
                                    </div>
                                    <div className="soul-name">{user.displayName || user.name || 'SoulThread User'}</div>
                                    <div className="soul-role">{user.role === 'guide' ? 'Guide' : 'Member'}</div>

                                    <button
                                        onClick={(e) => initiateConnect(e, user)}
                                        style={{
                                            marginTop: '8px', padding: '7px 20px',
                                            borderRadius: '20px', border: '1.5px solid',
                                            borderColor: currentUser?.connections?.includes(user.id) ? 'var(--color-border)' : 'var(--color-primary)',
                                            background: currentUser?.connections?.includes(user.id) ? 'transparent' : 'var(--color-primary)',
                                            color: currentUser?.connections?.includes(user.id) ? 'var(--color-text-muted)' : 'white',
                                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    >
                                        {currentUser?.connections?.includes(user.id) ? 'Connected ✓' : 'Connect'}
                                    </button>
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
                        targetName={getAnonymousName(connectModalTarget)}
                        onConfirm={confirmConnect}
                        onClose={() => setConnectModalTarget(null)}
                    />
                )}
            </div>
        </DesktopLayoutWrapper>
    );
};

export default Explore;
