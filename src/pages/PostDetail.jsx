import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import FeedItem from '../components/feed/FeedItem';
import Skeleton from '../components/common/Skeleton';
import { onSnapshot } from 'firebase/firestore';
import { recordReadTime } from '../services/trackingService';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!postId) return;

        const docRef = doc(db, 'posts', postId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() });
                setError(null);
            } else {
                setError("Post not found");
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError("Failed to load post");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [postId]);

    // R58: Track Read Time
    useEffect(() => {
        if (!post?.categoryId) return;

        const startTime = Date.now();
        return () => {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            recordReadTime(post.categoryId, timeSpent);
        };
    }, [post?.id, post?.categoryId]);

    if (loading) return (
        <div className="container" style={{ marginTop: '20px' }}>
            <Skeleton width="100%" height="200px" />
        </div>
    );

    if (error) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-text-secondary)' }}>
            <h2>😕</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} style={{ marginTop: '10px' }}>Go Home</button>
        </div>
    );

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--color-background)',
            paddingBottom: '80px'
        }}>
            <SEO 
                title={post ? `Shared by ${post.authorName || 'Anonymous'}` : "SoulThread Stories"}
                description={post?.content ? post.content.substring(0, 160) : "Connect and share in the SoulThread sanctuary."}
                image={post?.mediaUrl || post?.mediaItems?.[0]?.url}
                url={`https://soulthread.in/post/${postId}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://soulthread.in/" },
                        { "@type": "ListItem", "position": 2, "name": "Direct Link", "item": `https://soulthread.in/post/${postId}` }
                    ]
                }}
            />
            <div className="container" style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
                <Breadcrumbs />
                <div style={{ 
                    padding: '12px 0 24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 'var(--navbar-height)',
                    zIndex: 10,
                    background: 'var(--color-background)',
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ 
                            padding: '10px 20px',
                            background: 'var(--color-surface)',
                            border: '1.5px solid var(--color-border)',
                            borderRadius: '16px',
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            color: 'var(--color-text-primary)',
                            fontWeight: '800',
                            fontSize: '14px',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.2s',
                            fontFamily: 'Outfit, sans-serif'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-4px)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back
                    </button>

                    <h1 style={{ 
                        fontSize: '18px', 
                        fontWeight: '900', 
                        color: 'var(--color-text-primary)',
                        fontFamily: 'Outfit, sans-serif'
                    }}>
                        Post Detail
                    </h1>
                </div>

                <div style={{ 
                    background: 'var(--color-surface)', 
                    borderRadius: '32px', 
                    overflow: 'hidden',
                    border: '1.5px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    {post && <FeedItem post={post} />}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
