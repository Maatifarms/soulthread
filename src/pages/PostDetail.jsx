import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import FeedItem from '../components/feed/FeedItem';
import SEO from '../components/common/SEO';
import { ArrowLeft, BookOpen, HeartPulse, ShieldAlert } from 'lucide-react';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';

export default function PostDetail() {
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

    if (loading) {
        return (
            <DesktopLayoutWrapper>
                <div className="min-h-screen bg-gray-50 flex justify-center p-8">
                    <div className="max-w-2xl w-full bg-white rounded-3xl h-64 animate-pulse border border-gray-100" />
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (error) {
        return (
            <DesktopLayoutWrapper>
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center max-w-lg shadow-sm">
                        <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Post Unavailable</h2>
                        <p className="text-gray-500 mb-8">This post may have been deleted or is no longer accessible.</p>
                        <button onClick={() => navigate('/')} className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                            Return to Sanctuary
                        </button>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper>
            <SEO title="Community Discussion | SoulThread" />
            <div className="min-h-screen bg-gray-50 pb-24">
                
                {/* Header */}
                <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-500 hover:text-black font-semibold transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Post Content */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Discussion</h1>
                            <p className="text-gray-500">Join the conversation. Remember to be kind and supportive.</p>
                        </div>
                        
                        {post && (
                            <div className="shadow-lg shadow-gray-200/50 rounded-3xl overflow-hidden">
                                <FeedItem post={post} autoExpandComments={true} />
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Helpful Resources */}
                    <div className="lg:w-80 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                                <HeartPulse className="w-5 h-5 mr-2 text-indigo-500" />
                                Support Resources
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                If you or someone else is struggling, help is always available.
                            </p>
                            
                            <div className="space-y-4">
                                <a href="/experts" className="block p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100 group">
                                    <h4 className="font-bold text-indigo-900 mb-1 group-hover:text-indigo-700 transition-colors">Talk to a Professional</h4>
                                    <p className="text-xs text-indigo-700">Book a session with a verified clinical psychologist.</p>
                                </a>

                                <a href="/resources/coping" className="block p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-100 group">
                                    <h4 className="font-bold text-teal-900 mb-1 group-hover:text-teal-700 transition-colors">Coping Strategies</h4>
                                    <p className="text-xs text-teal-700">Explore grounding exercises and breathing techniques.</p>
                                </a>
                                
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                                    <h4 className="font-bold text-red-900 mb-1">Crisis Helpline (India)</h4>
                                    <p className="text-xs text-red-700 font-semibold mb-2">Vandrevala Foundation: 9999 666 555</p>
                                    <p className="text-xs text-red-700 font-semibold">AASRA: 9820466726</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
