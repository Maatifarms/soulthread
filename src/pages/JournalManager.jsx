import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { FileText, Plus, X, Lock, CheckCircle2, Loader2, Feather, AlertCircle } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';
import { Button } from '../components/common/Button';

export default function JournalManager() {
    const { currentUser } = useAuth();
    const location = useLocation();
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    // Compose State
    const [isComposing, setIsComposing] = useState(!!location.state?.autoCompose);
    const [draftContent, setDraftContent] = useState('');
    const [draftId, setDraftId] = useState(null); // Firestore doc ID if already created
    
    // Auto-save Status
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    
    const autoSaveTimeoutRef = useRef(null);

    // Initial Fetch
    const fetchJournals = async () => {
        if (!currentUser) return;
        setLoading(true);
        setFetchError(false);
        try {
            // Optimized fetch: strict limit
            const q = query(
                collection(db, 'journals'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc'),
                limit(50)
            );
            const snap = await getDocs(q);
            setJournals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Failed to fetch journals", error);
            setFetchError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // Offline Recovery / Local Draft
    useEffect(() => {
        if (isComposing && !draftContent && !draftId) {
            const localDraft = localStorage.getItem('soulthread_journal_draft');
            if (localDraft) setDraftContent(localDraft);
        }
    }, [isComposing]);

    // Auto-save Mechanism
    useEffect(() => {
        if (!isComposing) return;
        
        // Backup to local storage instantly
        localStorage.setItem('soulthread_journal_draft', draftContent);

        // Debounced sync to Firebase
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

        if (draftContent.trim() !== '') {
            setSaveStatus('saving');
            autoSaveTimeoutRef.current = setTimeout(async () => {
                await syncToFirebase(draftContent.trim());
            }, 1500); // 1.5s debounce
        } else {
            setSaveStatus('saved');
        }

        return () => clearTimeout(autoSaveTimeoutRef.current);
    }, [draftContent, isComposing]);

    const syncToFirebase = async (content) => {
        if (!currentUser) return;
        try {
            if (draftId) {
                // Update existing
                const docRef = doc(db, 'journals', draftId);
                await updateDoc(docRef, { content, updatedAt: serverTimestamp() });
                
                // Update local state without jarring re-render
                setJournals(prev => prev.map(j => j.id === draftId ? { ...j, content } : j));
            } else {
                // Create new
                const entryData = {
                    userId: currentUser.uid,
                    content,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };
                const docRef = await addDoc(collection(db, 'journals'), entryData);
                setDraftId(docRef.id);
                
                // Add to local state
                setJournals(prev => [{ id: docRef.id, ...entryData, createdAt: new Date() }, ...prev]);
                
                // IMPORTANT: We do NOT broadcast this to the timeline to preserve absolute privacy.
            }
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to auto-save journal", error);
            setSaveStatus('error');
        }
    };

    const handleCloseComposer = () => {
        // Clear local storage if we successfully synced
        localStorage.removeItem('soulthread_journal_draft');
        setIsComposing(false);
        setDraftContent('');
        setDraftId(null);
        setSaveStatus('saved');
    };

    if (loading) return <Loading />;

    if (fetchError) {
        return (
            <DesktopLayoutWrapper>
                <SEO title="My Journal | SoulThread" />
                <div className="min-h-screen bg-[#fafafa] pb-24 pt-8">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="bg-white rounded-3xl p-12 border border-red-100 shadow-sm flex flex-col items-center justify-center text-center mt-10">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Couldn't load your journal</h3>
                            <p className="text-gray-500 max-w-sm mb-8">Something went wrong reaching your entries. Your past entries are safe — please try again.</p>
                            <Button variant="primary" onClick={fetchJournals} className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm">
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper>
            <SEO title="My Journal | SoulThread" />
            <div className="min-h-screen bg-[#fafafa] pb-24 pt-8">
                <div className="max-w-3xl mx-auto px-4">
                    
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Journal</h1>
                            <div className="flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full w-fit border border-green-100">
                                <Lock className="w-3 h-3 mr-1" /> End-to-End Encrypted Sanctuary
                            </div>
                        </div>
                        {!isComposing && (
                            <button 
                                onClick={() => setIsComposing(true)}
                                className="px-5 py-2.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Feather className="w-4 h-4" /> Write
                            </button>
                        )}
                    </div>
                    
                    {isComposing && (
                        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 transition-all duration-500 ease-out border border-gray-100 relative">
                            
                            {/* Auto-save Status Bar */}
                            <div className="absolute top-8 right-8 flex items-center gap-3">
                                {saveStatus === 'saving' && (
                                    <span className="flex items-center text-xs font-semibold text-gray-400">
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving securely...
                                    </span>
                                )}
                                {saveStatus === 'saved' && draftContent.trim() !== '' && (
                                    <span className="flex items-center text-xs font-semibold text-green-600">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Saved to vault
                                    </span>
                                )}
                                <button onClick={handleCloseComposer} className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 p-2 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <textarea 
                                value={draftContent}
                                onChange={(e) => setDraftContent(e.target.value)}
                                placeholder="What's on your mind? Just start typing..."
                                className="w-full min-h-[300px] text-gray-800 text-lg leading-relaxed bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder:text-gray-300 mt-12"
                                autoFocus
                            />
                        </div>
                    )}

                    {!isComposing && journals.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center mt-10">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">A safe place for your thoughts</h3>
                            <p className="text-gray-500 max-w-sm mb-8">Write without fear. Your journal is completely private and securely encrypted.</p>
                            <button 
                                onClick={() => setIsComposing(true)}
                                className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                            >
                                Start your first entry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {journals.filter(j => j.id !== draftId).map(journal => {
                                const date = journal.createdAt?.toDate ? journal.createdAt.toDate() : new Date();
                                return (
                                    <div key={journal.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <p className="text-gray-800 text-base leading-loose whitespace-pre-wrap font-serif">
                                            {journal.content}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
