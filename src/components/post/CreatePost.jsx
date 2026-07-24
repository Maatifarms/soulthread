// CreatePost — compose box for new posts (text, media, category, anonymous toggle)
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
import { CATEGORY_LIST, getSubCategories } from '../../config/issueCategories';
import { analyzeContent, analyzeContentDebounced } from '../../services/safetyEngine';
import CrisisCard from '../safety/CrisisCard';
import SafetyIndicator from '../safety/SafetyIndicator';
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

const CreatePost = ({ circleId = null, onPostCreated = null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    // Guided Reflection data
    const prefilledPrompt = location.state?.prefilledPrompt || null;

    const [content, setContent] = useState(() => {
        try {
            return localStorage.getItem('soulthread_draft_content') || '';
        } catch (e) {
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
    const [isAnonymous, setIsAnonymous] = useState(currentUser?.hideIdentity || currentUser?.isAnonymous || false);
    const [selectedCategory, setSelectedCategory] = useState(() => localStorage.getItem('st_last_cat') || 'mental_health');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [postLanguage, setPostLanguage] = useState('en');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [safetyResult, setSafetyResult] = useState(null);
    const [showCrisisCard, setShowCrisisCard] = useState(false);
    const [crisisAcknowledged, setCrisisAcknowledged] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showSubcategories, setShowSubcategories] = useState(false);
    const [isCheckingModeration, setIsCheckingModeration] = useState(false);
    const postContainerRef = useRef(null);

    // Keyboard handling
    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport && postContainerRef.current) {
                // Adjust height for keyboard
                postContainerRef.current.style.height = `${window.visualViewport.height}px`;
                window.scrollTo(0, 0);
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            // Initial setting
            handleResize();
        }

        if (isNativeApp) {
            import('@capacitor/keyboard').then(({ Keyboard }) => {
                Keyboard.addListener('keyboardWillShow', info => {
                    if (postContainerRef.current) {
                        postContainerRef.current.style.paddingBottom = `${info.keyboardHeight}px`;
                    }
                });
                Keyboard.addListener('keyboardWillHide', () => {
                    if (postContainerRef.current) {
                        postContainerRef.current.style.paddingBottom = '0px';
                    }
                });
            }).catch(() => {});
        }

        return () => {
            if (window.visualViewport) window.visualViewport.removeEventListener('resize', handleResize);
        };
    }, []);

    function handleTextChange(e) {
        const text = e.target.value;
        setContent(text);
        // AI Moderation removed from keystroke to prevent spinner UI blocking
    }

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
        setResetKey(prev => prev + 1);
        setEditingIndex(null);
        setSafetyResult(null);
        setCrisisAcknowledged(false);
        setIsAnonymous(currentUser?.hideIdentity || currentUser?.isAnonymous || false);
        setUploadError(null);
        setShowMoreOptions(false);
        setShowSubcategories(false);
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

        // Run final safety check on submit
        const finalCheck = analyzeContent(content);

        // Block hate speech completely
        if (finalCheck.hasHateSpeech) {
            setUploadError(postLanguage === 'hi'
                ? 'यह पोस्ट नफरत फैलाने वाली भाषा के कारण पोस्ट नहीं की जा सकती।'
                : 'This post cannot be shared as it contains harmful language.');
            return;
        }

        // Crisis — show card if not yet acknowledged
        if (finalCheck.riskLevel === 'crisis' && !crisisAcknowledged) {
            setShowCrisisCard(true);
            return;
        }

        // 1. AI Moderation Check (On Submit)
        if (!forceContinue) {
            setIsCheckingModeration(true);
            
            // Promise race to not block > 2 seconds
            let moderationResolved = false;
            
            const runModeration = new Promise((resolve) => {
                setTimeout(() => {
                    if (!moderationResolved) resolve(null); // Timeout fallback
                }, 2000);
                
                try {
                    const moderation = moderateText(content);
                    moderationResolved = true;
                    resolve(moderation);
                } catch (e) {
                    moderationResolved = true;
                    resolve(null);
                }
            });

            const moderation = await runModeration;
            setIsCheckingModeration(false);

            if (moderation && moderation.moderationAction !== 'allow') {
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
                circleId: circleId,
                isAnonymous: isAnonymous,
                categoryId: selectedCategory ? selectedCategory.toLowerCase() : 'general',
                category: selectedCategory ? selectedCategory.toLowerCase() : 'general',
                subCategory: selectedSubCategory,
                language: postLanguage,
                riskLevel: finalCheck.riskLevel,
                flagged: finalCheck.riskLevel === 'high' || finalCheck.riskLevel === 'crisis',
                isPublic: true,
                isSeeded: false
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
                if (onPostCreated) onPostCreated();
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            logError(error, 'CreatePost_submit');
            setUploadError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isSubmitReady = content.trim().length >= 10 || mediaFiles.length > 0;

  return (
    <div className="cp-card">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-dot" />
        <span className="cp-title">Share Your Heart</span>
        {currentUser && (
          <button
            type="button"
            className={`cp-anon-toggle ${isAnonymous ? 'active' : ''}`}
            onClick={() => setIsAnonymous(!isAnonymous)}
          >
            {isAnonymous ? '🛡️ Anonymous' : '👤 Named'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          key={resetKey}
        />

        {/* Main text area — first thing user sees */}
        <textarea
          className="cp-textarea"
          placeholder={currentUser ? POSTING_PROMPTS[placeholderIndex] : 'Sign in to share your story...'}
          value={content}
          onChange={handleTextChange}
          onClick={() => !currentUser && setShowLoginModal(true)}
          autoFocus
          inputMode="text"
          rows={4}
        />

        <SafetyIndicator result={safetyResult} language={postLanguage} />

        {showCrisisCard && (
          <CrisisCard
            language={postLanguage}
            onClose={() => { setShowCrisisCard(false); setContent(''); }}
            onContinue={() => { setShowCrisisCard(false); setCrisisAcknowledged(true); }}
          />
        )}

        {/* Category chips — below textarea, minimal */}
        {currentUser && (
          <div className="cp-category-row no-scrollbar">
            {CATEGORY_LIST.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`cp-cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                style={selectedCategory === cat.id
                  ? { borderColor: cat.color, color: cat.color, background: cat.colorSoft }
                  : {}}
                onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(''); }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Optional details — collapsed by default */}
        {currentUser && (
          <div className="cp-optional-row">
            <button
              type="button"
              className="cp-optional-toggle"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '▾' : '+'} Add details (optional)
            </button>
            {showDetails && (
              <div className="cp-details-panel">
                {/* Subcategory chips */}
                {selectedCategory && getSubCategories(selectedCategory, postLanguage).length > 0 && (
                  <div className="cp-subcat-row no-scrollbar">
                    {getSubCategories(selectedCategory, postLanguage).map((sub, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`cp-subcat-chip ${selectedSubCategory === sub ? 'active' : ''}`}
                        onClick={() => setSelectedSubCategory(prev => prev === sub ? '' : sub)}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* More options — language + extra (collapsed) */}
        {currentUser && (
          <div className="cp-more-row">
            <button
              type="button"
              className="cp-optional-toggle"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
            >
              ··· More options
            </button>
            {showMoreOptions && (
              <div className="cp-more-panel">
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className={`cp-subcat-chip ${postLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => setPostLanguage('en')}
                  >English</button>
                  <button
                    type="button"
                    className={`cp-subcat-chip ${postLanguage === 'hi' ? 'active' : ''}`}
                    onClick={() => setPostLanguage('hi')}
                  >हिन्दी</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Media previews */}
        {mediaPreviews.length > 0 && (
          <div className="cp-media-row no-scrollbar">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="cp-media-item">
                {preview.type === 'image'
                  ? <img src={preview.url} alt="Preview" className="cp-media-img" />
                  : <video src={preview.url} className="cp-media-img" />
                }
                <div className="cp-media-actions">
                  <button type="button" onClick={() => setEditingIndex(index)} className="cp-media-btn">Edit</button>
                  <button type="button" onClick={() => clearMedia(index)} className="cp-media-btn remove"><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadError && <div className="cp-error">⚠ {uploadError}</div>}
        {showSuccess && (
          <div className="cp-success">
            <CheckCircle size={16} /> Shared! It will appear shortly.
          </div>
        )}

        {/* Footer: media + submit */}
        <div className="cp-footer">
          <div className="cp-footer-left">
            <button
              type="button"
              className="cp-icon-btn"
              onClick={() => handleInteraction() && fileInputRef.current?.click()}
              disabled={!currentUser}
              title="Add photo or video"
            >
              <Camera size={18} />
            </button>
            <button
              type="button"
              className={`cp-icon-btn ${isRefining ? 'spinning' : ''}`}
              onClick={handleRefine}
              disabled={!currentUser || !content.trim() || isRefining}
              title="Refine with AI"
            >
              <Sparkles size={18} />
            </button>
          </div>
          <button
            type="submit"
            className="cp-submit-btn"
            disabled={!isSubmitReady || isRefining}
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
