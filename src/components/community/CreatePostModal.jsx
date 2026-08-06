import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MOODS, COMMUNITIES, useCommunityStore } from '../../store/useCommunityStore';
import { X, Image as ImageIcon, Send, Ghost, Trash2, Heart, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

const MAX_CHARS = 2000;
const DRAFT_KEY = 'soulthread_post_draft_v2';

export default function CreatePostModal({ onClose, onPostSuccess }) {
    const { currentUser } = useAuth();
    const { selectedCommunityFilter } = useCommunityStore();
    
    const [step, setStep] = useState('compose'); // 'compose' | 'preview' | 'success'
    
    // Load draft if exists
    const [content, setContent] = useState(() => localStorage.getItem(`${DRAFT_KEY}_content`) || '');
    const [selectedMood, setSelectedMood] = useState(() => localStorage.getItem(`${DRAFT_KEY}_mood`) || null);
    const [selectedCommunity, setSelectedCommunity] = useState(() => localStorage.getItem(`${DRAFT_KEY}_community`) || selectedCommunityFilter || 'general');
    const [privacy, setPrivacy] = useState(() => localStorage.getItem(`${DRAFT_KEY}_privacy`) || 'public');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSensitiveContent, setHasSensitiveContent] = useState(false);

    // Draft autosave
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content.trim()) {
                localStorage.setItem(`${DRAFT_KEY}_content`, content);
                if (selectedMood) localStorage.setItem(`${DRAFT_KEY}_mood`, selectedMood);
                localStorage.setItem(`${DRAFT_KEY}_community`, selectedCommunity);
                localStorage.setItem(`${DRAFT_KEY}_privacy`, privacy);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [content, selectedMood, selectedCommunity, privacy]);

    const handleClearDraft = () => {
        setContent('');
        setSelectedMood(null);
        localStorage.removeItem(`${DRAFT_KEY}_content`);
        localStorage.removeItem(`${DRAFT_KEY}_mood`);
    };

    const handlePreview = () => {
        // Simple NLP simulation for safety review
        const sensitiveWords = ['suicide', 'kill', 'end it', 'hopeless', 'harm'];
        const hasTrigger = sensitiveWords.some(word => content.toLowerCase().includes(word));
        setHasSensitiveContent(hasTrigger);
        setStep('preview');
    };

    const handleSubmit = async () => {
        if (!content.trim() || !currentUser || content.length > MAX_CHARS) return;
        
        setIsSubmitting(true);
        try {
            const isAnonymous = privacy === 'anonymous';
            const newPost = {
                content: content.trim(),
                authorId: currentUser.uid,
                authorName: isAnonymous ? 'Anonymous' : (currentUser.displayName || 'User'),
                authorPhoto: isAnonymous ? null : currentUser.photoURL,
                isAnonymous,
                privacy,
                moodId: selectedMood,
                communityId: selectedCommunity,
                createdAt: serverTimestamp(),
                likesCount: 0,
                commentsCount: 0,
                status: 'published'
            };

            const docRef = await addDoc(collection(db, 'posts'), newPost);
            
            // Clear draft
            localStorage.removeItem(`${DRAFT_KEY}_content`);
            localStorage.removeItem(`${DRAFT_KEY}_mood`);
            localStorage.removeItem(`${DRAFT_KEY}_community`);
            localStorage.removeItem(`${DRAFT_KEY}_privacy`);

            if (onPostSuccess) {
                onPostSuccess({ id: docRef.id, ...newPost, createdAt: new Date() });
            }
            setStep('success');
        } catch (err) {
            console.error("Failed to create post", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const charsLeft = MAX_CHARS - content.length;
    const isOverLimit = charsLeft < 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {step === 'compose' ? 'Share your thoughts' : step === 'preview' ? 'Review & Publish' : ''}
                    </h2>
                    {step !== 'success' && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-8">
                    {step === 'compose' && (
                        <>
                            {/* Step 1: Mood */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-900">How are you feeling today?</label>
                                <div className="flex flex-wrap gap-2">
                                    {MOODS.map(mood => (
                                        <button
                                            key={mood.id}
                                            type="button"
                                            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                                selectedMood === mood.id 
                                                ? mood.color 
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            {mood.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Content */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-900">What would you like to share?</label>
                                <div className="relative">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="This is a safe space. No judgement here..."
                                        className={`w-full min-h-[150px] p-4 text-lg text-gray-900 placeholder-gray-400 border rounded-2xl focus:outline-none focus:ring-2 resize-none ${isOverLimit ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-black bg-gray-50'}`}
                                    />
                                    <div className={`absolute bottom-4 right-4 text-xs font-bold ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                                        {charsLeft}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Step 3: Community */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-900">Where does this belong?</label>
                                    <select 
                                        value={selectedCommunity}
                                        onChange={(e) => setSelectedCommunity(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black text-gray-700 font-medium"
                                    >
                                        {COMMUNITIES.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Step 4: Privacy */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-900">Privacy</label>
                                    <select 
                                        value={privacy}
                                        onChange={(e) => setPrivacy(e.target.value)}
                                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black text-gray-700 font-medium"
                                    >
                                        <option value="public">Public (Visible to everyone)</option>
                                        <option value="community">Community Only (Visible in {selectedCommunity})</option>
                                        <option value="anonymous">Anonymous (Identity hidden)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {content.trim() && (
                                        <button type="button" onClick={handleClearDraft} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors font-medium text-sm flex items-center">
                                            <Trash2 className="w-4 h-4 mr-1.5" /> Discard
                                        </button>
                                    )}
                                </div>
                                
                                <Button 
                                    variant="primary"
                                    disabled={!content.trim() || isOverLimit}
                                    onClick={handlePreview}
                                >
                                    Review Post
                                </Button>
                            </div>
                        </>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            {hasSensitiveContent && (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                                    <Heart className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-blue-900 mb-1">It sounds like you're going through something difficult.</h4>
                                        <p className="text-sm text-blue-800 leading-relaxed mb-3">
                                            We want you to know you're not alone. If you're in immediate danger or need urgent help, there are free, confidential resources available 24/7.
                                        </p>
                                        <Button variant="secondary" className="bg-white">View Crisis Resources</Button>
                                    </div>
                                </div>
                            )}

                            <Card className="opacity-90">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                        {privacy === 'anonymous' ? <Ghost className="w-5 h-5" /> : currentUser.displayName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{privacy === 'anonymous' ? 'Anonymous' : currentUser.displayName}</p>
                                        <p className="text-xs text-gray-500">Posting in <span className="font-bold">{COMMUNITIES.find(c => c.id === selectedCommunity)?.label}</span> • {privacy}</p>
                                    </div>
                                </div>
                                {selectedMood && (
                                    <div className="mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${MOODS.find(m => m.id === selectedMood)?.color}`}>
                                            {MOODS.find(m => m.id === selectedMood)?.label}
                                        </span>
                                    </div>
                                )}
                                <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
                            </Card>

                            <div className="pt-4 border-t border-gray-100 flex justify-between">
                                <Button variant="outline" onClick={() => setStep('compose')}>
                                    Keep Editing
                                </Button>
                                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Publishing...' : 'Publish to Community'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-12 space-y-6">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Thank you for sharing.</h2>
                            <p className="text-lg text-gray-500">Your voice matters. It takes courage to open up.</p>

                            <div className="pt-8 space-y-3 max-w-sm mx-auto">
                                <Button variant="primary" style={{ width: '100%' }} onClick={onClose}>
                                    Return to Feed
                                </Button>
                                <Button variant="secondary" style={{ width: '100%' }} onClick={onClose}>
                                    Go to {COMMUNITIES.find(c => c.id === selectedCommunity)?.label}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
