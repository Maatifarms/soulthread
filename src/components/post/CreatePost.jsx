import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, functions } from '../../services/firebase';
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
import { CATEGORIES } from '../../data/categories';
import './CreatePost.css';

import { 
    PenLine, 
    HeartPulse, 
    Wind, 
    Users, 
    Brain, 
    Sprout, 
    Target, 
    Sparkles, 
    Zap,
    Plus,
    X,
    Shield,
    User as UserIcon,
    Camera,
    Info,
    CheckCircle
} from 'lucide-react';

const isNativeApp = Capacitor.isNativePlatform();

const ICON_MAP = {
    PenLine,
    HeartPulse,
    Wind,
    Users,
    Brain,
    Sprout,
    Target,
    Sparkles,
    Zap
};

const POSTING_PROMPTS = [
    "What's something you've been holding in that needs somewhere to go...",
    "I feel like I can't tell anyone, but...",
    "Something that's been weighing on me lately...",
    "I've been pretending to be okay about this, but...",
    "Is it normal that I feel this way...",
    "Nobody knows that I...",
    "I thought I was over this, but...",
    "What I really need right now is...",
    "I came here because I had nowhere else to put this...",
    "The honest version of how I'm doing is...",
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
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex(prev => (prev + 1) % POSTING_PROMPTS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);
    const [uploadError, setUploadError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

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

    const handleRefine = async () => {
        if (!content.trim() || isRefining) return;
        if (!handleInteraction()) return;

        setIsRefining(true);
        try {
            const refine = httpsCallable(functions, 'refineContent');
            const result = await refine({ text: content });
            if (result.data?.refined) {
                setContent(result.data.refined);
            }
        } catch (err) {
            console.error("AI Refine Error:", err);
            setUploadError("AI Refinement failed. Please try again.");
        } finally {
            setIsRefining(false);
        }
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
                    <span className="branding-text">Share Your Heart</span>
                </div>
                {currentUser && (
                    <div className="mode-badge" onClick={() => setIsAnonymous(!isAnonymous)} style={{ cursor: 'pointer' }}>
                        {isAnonymous ? (
                            <><Shield size={14} style={{ marginRight: '6px' }} /> Anonymous Mode</>
                        ) : (
                            <><UserIcon size={14} style={{ marginRight: '6px' }} /> Public Mode</>
                        )}
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
                    placeholder={currentUser ? POSTING_PROMPTS[placeholderIndex] : "Sign in to share your story with the world..."}
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
                                <span className="category-icon">
                                    {(() => {
                                        const IconComponent = ICON_MAP[cat.icon];
                                        return IconComponent ? <IconComponent size={16} /> : <PenLine size={16} />;
                                    })()}
                                </span>
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
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {uploadError && <div className="error-message">Error: {uploadError}</div>}

                {showSuccess && (
                    <div className="success-message">
                        <CheckCircle size={18} style={{ marginRight: '8px' }} />
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
                            <Camera size={18} style={{ marginRight: '8px' }} />
                            Add Visuals
                        </button>

                        <button
                            type="button"
                            onClick={handleRefine}
                            className={`btn-refine ${isRefining ? 'refining' : ''}`}
                            disabled={!currentUser || !content.trim() || isRefining}
                        >
                            <Sparkles size={16} className={isRefining ? 'spinning' : ''} style={{ marginRight: '6px' }} />
                            {isRefining ? 'Polishing...' : 'Refine with SoulMaven'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`btn-anonymous ${isAnonymous ? 'active' : ''}`}
                        >
                            <Shield size={16} style={{ marginRight: '6px' }} />
                            {isAnonymous ? 'Incognito' : 'Named'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitDisabled || isRefining}
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
