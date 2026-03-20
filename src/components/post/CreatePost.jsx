import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../common/LoginModal';
import { moderateText, logModerationEvent } from '../../services/aiModeration';
import ModerationWarning from '../moderation/ModerationWarning';
import MediaEditor from '../media/MediaEditor';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { enqueueUpload } from '../../services/uploadPipeline';
import { logError } from '../../services/performanceMonitor';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Capacitor } from '@capacitor/core';
import './CreatePost.css';

const isNativeApp = Capacitor.isNativePlatform();

const CATEGORIES = [
    { id: 'general', label: 'General', icon: '📝' },
    { id: 'healing', label: 'Healing', icon: '🌱' },
    { id: 'anxiety', label: 'Anxiety', icon: '🌊' },
    { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { id: 'growth', label: 'Growth', icon: '📈' },
    { id: 'community', label: 'Community', icon: '🤝' },
];

const CreatePost = ({ circleId = null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    // Guided Reflection data
    const prefilledPrompt = location.state?.prefilledPrompt || null;

    const [content, setContent] = useState(() => {
        try {
            return localStorage.getItem('soulthread_draft_content') || '';
        } catch (e) {
            console.warn("LocalStorage access failed", e);
            return '';
        }
    });
    const [loading, setLoading] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]); // Array of File objects
    const [mediaPreviews, setMediaPreviews] = useState([]); // Array of { url, type }
    const [resetKey, setResetKey] = useState(0);
    const [editingIndex, setEditingIndex] = useState(null); // Index of media being edited
    const [modResult, setModResult] = useState(null); // AI Moderation result
    const fileInputRef = useRef(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // STATES
    const [isAnonymous, setIsAnonymous] = useState(currentUser?.isAnonymous || false);
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [uploadError, setUploadError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('soulthread_draft_content', content);
        } catch (e) {
            console.warn("LocalStorage write failed", e);
        }
    }, [content]);

    useEffect(() => {
        if (showLoginModal || editingIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showLoginModal, editingIndex]);

    useEffect(() => {
        return () => {
            mediaPreviews.forEach(preview => {
                if (preview.url && preview.url.startsWith('blob:')) {
                    URL.revokeObjectURL(preview.url);
                }
            });
        };
    }, [mediaPreviews]);

    const handleInteraction = () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return false;
        }
        return true;
    };

    const handleFileChange = async (e) => {
        const rawFiles = Array.from(e.target.files);
        if (rawFiles.length === 0) return;
        setUploadError(null);

        setMediaFiles(prev => [...prev, ...rawFiles]);

        const newPreviews = rawFiles.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image'
        }));
        setMediaPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleEditComplete = ({ file, thumbnail }) => {
        if (editingIndex === null) return;

        setMediaFiles(prev => {
            const updated = [...prev];
            updated[editingIndex] = file;
            return updated;
        });

        setMediaPreviews(prev => {
            const updated = [...prev];
            if (updated[editingIndex].url.startsWith('blob:')) {
                URL.revokeObjectURL(updated[editingIndex].url);
            }
            updated[editingIndex] = {
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image',
                thumbnail: thumbnail
            };
            return updated;
        });

        setEditingIndex(null);
    };

    const resetForm = () => {
        setContent('');
        setMediaFiles([]);
        setMediaPreviews([]);
        setUploadError(null);
        setIsAnonymous(currentUser?.isAnonymous || false);
        setSelectedCategory('general');
        setResetKey(prev => prev + 1);
    };

    const clearMedia = (index) => {
        setMediaFiles(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });

        setMediaPreviews(prev => {
            const updated = [...prev];
            if (updated[index].url.startsWith('blob:')) {
                URL.revokeObjectURL(updated[index].url);
            }
            updated.splice(index, 1);
            return updated;
        });

        setResetKey(prev => prev + 1);
    };

    const handleSubmit = async (e, forceContinue = false) => {
        if (e) e.preventDefault();
        if (!handleInteraction()) return;
        if (!content.trim() && mediaFiles.length === 0) return;

        // 1. AI Moderation Check
        if (!forceContinue) {
            const moderation = moderateText(content);
            if (moderation.moderationAction !== 'allow') {
                setModResult(moderation);
                // Log event for analytics
                logModerationEvent(db, { addDoc, collection, serverTimestamp }, {
                    userId: currentUser.uid,
                    content,
                    riskLevel: moderation.riskLevel,
                    action: moderation.moderationAction,
                    context: 'post'
                });
                return;
            }
        }

        setUploadError(null);
        setLoading(true);

        try {
            const mediaItems = [];

            // 2. Parallel Upload Pipeline
            if (mediaFiles.length > 0) {
                const uploadJobs = mediaFiles.map((file, idx) => {
                    return new Promise((resolve, reject) => {
                        const path = `posts/${currentUser.uid}/${Date.now()}_${idx}_${file.name}`;
                        enqueueUpload(file, {
                            path,
                            onComplete: (res) => resolve({ url: res.url, type: file.type.startsWith('video/') ? 'video' : 'image', thumbnail: res.thumbnail }),
                            onError: (err) => reject(err)
                        });
                    });
                });

                const results = await Promise.all(uploadJobs);
                mediaItems.push(...results);
            }

            const hashtags = (content.match(/#\w+/g) || []).map(h => h.toLowerCase());
            const functions = getFunctions();

            const postPayload = {
                content: content,
                mediaItems: mediaItems,
                isSensitive: modResult?.riskLevel === 'low' || modResult?.riskLevel === 'medium',
                hashtags: hashtags,
                type: prefilledPrompt ? 'guided' : 'normal',
                promptId: prefilledPrompt?.id || null,
                promptText: prefilledPrompt?.text || null,
                circleId: circleId,
                isAnonymous: isAnonymous,
                categoryId: selectedCategory
            };

            const createPostFn = httpsCallable(functions, 'createPost');
            const result = await createPostFn(postPayload);

            if (result.data.success) {
                // Background classification call remains as is
                import('../../services/classificationService').then(service => {
                    service.classifyStory(result.data.postId, content).catch(err => {
                        console.error("Background classification failed:", err);
                    });
                });

                setShowSuccess(true);
                resetForm();
                setModResult(null);
                localStorage.removeItem('soulthread_draft_content');
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            logError(error, 'CreatePost_submit');
            setUploadError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isSubmitDisabled = loading || (!content.trim() && mediaFiles.length === 0);

    return (
        <div className="create-post-card animate-fade-in premium-card">
            <div className="create-post-light-effect" />

            {/* Soulthread Branding Header */}
            <div className="create-post-header">
                <div className="create-post-branding">
                    <div className="branding-dot" />
                    <span className="branding-text">SoulThread</span>
                </div>
                {currentUser && (
                    <div className="mode-badge">
                        {isAnonymous ? 'Incognito Mode' : 'Public Persona'}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Guided Reflection Prompt Header */}
                {prefilledPrompt && (
                    <div className="prompt-header">
                        <div className="prompt-label">
                            Reflection Topic
                        </div>
                        "{prefilledPrompt.text}"
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    multiple
                    style={{ display: 'none' }}
                    key={resetKey}
                />

                <textarea
                    placeholder={currentUser ? "What's on your mind? This is your sanctuary." : "Sign in to share your story..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onClick={() => !currentUser && setShowLoginModal(true)}
                    className="post-textarea"
                />

                {/* Category Selection Bar */}
                {currentUser && (
                    <div className="category-bar no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            >
                                <span className="category-icon">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {mediaPreviews.length > 0 && (
                    <div className="media-preview-scroll no-scrollbar">
                        {mediaPreviews.map((preview, index) => (
                            <div key={index} className="media-preview-item">
                                {preview.type === 'image' ? (
                                    <img src={preview.url} alt="Preview" className="media-preview-img" />
                                ) : (
                                    <video src={preview.url} className="media-preview-vid" />
                                )}
                                <div className="media-actions-overlay">
                                    <button
                                        type="button"
                                        onClick={() => setEditingIndex(index)}
                                        className="media-btn-edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => clearMedia(index)}
                                        className="media-btn-remove"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {uploadError && <div className="error-message">Error: {uploadError}</div>}

                {showSuccess && (
                    <div className="success-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Post shared successfully!
                    </div>
                )}

                <div className="post-footer">
                    <div className="footer-left">
                        <button
                            type="button"
                            onClick={() => { if (handleInteraction()) fileInputRef.current?.click(); }}
                            className="btn-add-visuals"
                            disabled={!currentUser}
                            style={{ opacity: !currentUser ? 0.5 : 1 }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Add Visuals
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`btn-anonymous ${isAnonymous ? 'active' : ''}`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a4 4 0 1 0 4 4 4 4 0 0 0-4-4z"/>
                            </svg>
                            {isAnonymous ? 'Incognito' : 'Named'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="btn-submit-post animate-float"
                    >
                        {loading ? 'Posting...' : 'Share Soul'}
                    </button>
                </div>
            </form>

            {editingIndex !== null && (
                <MediaEditor
                    file={mediaFiles[editingIndex]}
                    onSave={handleEditComplete}
                    onCancel={() => setEditingIndex(null)}
                />
            )}

            {modResult && (
                <ModerationWarning
                    result={modResult}
                    onContinue={() => handleSubmit(null, true)}
                    onEdit={() => setModResult(null)}
                />
            )}

            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </div>
    );
};

export default CreatePost;
