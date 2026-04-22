import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import FeedItem from '../components/feed/FeedItem';
import { Sparkles, Clapperboard, Home, Users, MessageSquare, HeartPulse } from 'lucide-react';

const VideoFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Fetch recent posts and filter client-side to avoid Index issues
                const q = query(
                    collection(db, 'posts'),
                    where('circleId', '==', null), // R61: Public-only for moments
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
                const snapshot = await getDocs(q);

                // Filter for videos (checking mediaType OR file extension)
                const videoPosts = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(post => {
                        if (post.mediaType === 'video') return true;
                        if (post.mediaItems && post.mediaItems.length > 0) {
                            return post.mediaItems.some(item => item.type === 'video');
                        }
                        if (!post.mediaUrl) return false;

                        const url = post.mediaUrl.split('?')[0];
                        return url.match(/\.(mp4|webm|ogg|mov)$/i);
                    });

                setPosts(videoPosts);
            } catch (error) {
                console.error("Error fetching video posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>Loading Videos...</div>;

    return (
        <div className="moments-container" style={{ paddingBottom: '60px' }}>
            <div className="moments-split">
                {/* Main Content: Video Feed */}
                <div className="moments-main">
                    <h2 style={{ marginBottom: '24px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={24} /> Moments
                    </h2>

                    {posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                        <div style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                            <Clapperboard size={48} />
                        </div>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>No moments shared yet. Be the first to spark a connection!</p>
                            <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>Go Home</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {posts.map(post => (
                                <FeedItem key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Navigation & More (Desktop Only) */}
                <aside className="moments-sidebar">
                    <div>
                        <h4 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--color-text-primary)' }}>Sanctuary Path</h4>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <SidebarLink to="/">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Home size={18} /> Home
                                </div>
                            </SidebarLink>
                            <SidebarLink to="/search">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Users size={18} /> Community
                                </div>
                            </SidebarLink>
                            <SidebarLink to="/messages">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <MessageSquare size={18} /> Messages
                                </div>
                            </SidebarLink>
                            <SidebarLink to="/care">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <HeartPulse size={18} /> Find Help
                                </div>
                            </SidebarLink>
                        </nav>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '15px', color: 'var(--color-text-primary)' }}>Why Moments?</h4>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                            Moments are short glimpses into other souls' journeys.
                            Watch, listen, and connect with people who truly understand.
                        </p>
                    </div>

                    <div style={{
                        marginTop: 'auto',
                        padding: '16px',
                        background: 'var(--color-primary-soft)',
                        borderRadius: '12px',
                        border: '1px solid var(--color-primary-light)'
                    }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-primary-dark)', fontWeight: '600', textAlign: 'center' }}>
                            Shared a moment recently? <br />
                            <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Post yours now</Link>
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const sidebarLinkStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'block',
    background: 'transparent'
};


const SidebarLink = ({ to, children }) => {
    const [hover, setHover] = useState(false);
    return (
        <Link
            to={to}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                ...sidebarLinkStyle,
                color: hover ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: hover ? 'var(--color-primary-soft)' : 'transparent',
                transform: hover ? 'translateX(5px)' : 'none'
            }}
        >
            {children}
        </Link>
    );
};

export default VideoFeed;
