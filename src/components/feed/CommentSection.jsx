import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Reply, Ghost, UserCircle2, Send, ShieldCheck, Heart, Leaf, Handshake } from 'lucide-react';
import LoginModal from '../common/LoginModal';
import { moderateContent } from '../../services/moderation';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

const EMPATHY_QUICK_REPLIES = [
    { id: 'hear', text: 'I hear you', icon: <Heart className="w-4 h-4 text-red-500" /> },
    { id: 'support', text: 'Sending support', icon: <Leaf className="w-4 h-4 text-green-500" /> },
    { id: 'with_you', text: "I'm with you", icon: <Handshake className="w-4 h-4 text-blue-500" /> }
];

export default function CommentSection({ postId, postAuthorId }) {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const replyInputRef = React.useRef(null);

    useEffect(() => {
        const q = query(
            collection(db, 'posts', postId, 'replies'),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, [postId]);

    const handleInteraction = (e) => {
        if (!currentUser) {
            if (e) e.preventDefault();
            setShowLoginModal(true);
            return false;
        }
        return true;
    };

    const handleQuickReply = (text) => {
        if (!handleInteraction()) return;
        setNewComment(text);
        replyInputRef.current?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!handleInteraction() || !newComment.trim()) return;

        const moderation = moderateContent(newComment, 'comment');
        if (!moderation.safe) {
            // Empathetic safety block
            alert("This space prioritizes safety. Please rephrase your response to ensure it remains supportive.");
            return;
        }

        try {
            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            const isProfessional = currentUser.role === 'guide' || currentUser.role === 'doctor';
            
            await addDoc(collection(db, 'posts', postId, 'replies'), {
                content: newComment.trim(),
                authorId: currentUser.uid,
                authorName: isAnon ? 'Anonymous' : (currentUser.displayName || 'Anonymous'),
                authorPhotoURL: isAnon ? null : currentUser.photoURL,
                isProfessional,
                replyToId: replyingTo || null,
                createdAt: serverTimestamp()
            });

            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsCount: increment(1)
            });

            setNewComment('');
            setReplyingTo(null);
        } catch (error) {
            console.error("Error adding comment", error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this supportive message?")) return;
        try {
            await deleteDoc(doc(db, 'posts', postId, 'replies', commentId));
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsCount: increment(-1)
            });
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    // Thread organization
    const topLevelComments = comments.filter(c => !c.replyToId);
    const getReplies = (parentId) => comments.filter(c => c.replyToId === parentId);

    const CommentNode = ({ comment, isReply }) => {
        const replies = getReplies(comment.id);
        const isAnon = comment.authorName === 'Anonymous';
        const canDelete = currentUser?.uid === comment.authorId || currentUser?.role === 'admin';
        const isPro = comment.isProfessional;

        return (
            <div className={`flex gap-3 ${isReply ? 'mt-4' : 'mt-6'}`}>
                <div className="shrink-0 mt-1">
                    {isAnon ? (
                        <div className={`bg-gray-100 rounded-full flex items-center justify-center text-gray-400 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
                            <Ghost className={isReply ? 'w-4 h-4' : 'w-5 h-5'} />
                        </div>
                    ) : comment.authorPhotoURL ? (
                        <img src={comment.authorPhotoURL} alt="Avatar" className={`rounded-full object-cover shadow-sm ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`} />
                    ) : (
                        <div className={`bg-blue-50 rounded-full flex items-center justify-center text-blue-500 border border-blue-100 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
                            <UserCircle2 className={isReply ? 'w-4 h-4' : 'w-5 h-5'} />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <Card className={`p-4 ${isPro ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-gray-50/50 shadow-none'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">{comment.authorName}</span>
                                {isPro && (
                                    <Badge variant="success" className="flex items-center gap-1 text-[10px] py-0.5 px-1.5">
                                        <ShieldCheck className="w-3 h-3" /> Clinical Professional
                                    </Badge>
                                )}
                            </div>
                            {canDelete && (
                                <button onClick={() => handleDelete(comment.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
                        
                        {isPro && (
                            <div className="mt-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider border-t border-green-100 pt-2">
                                * Informational insight, not medical advice
                            </div>
                        )}
                    </Card>
                    
                    <div className="mt-2 ml-1 flex items-center gap-4">
                        <button 
                            onClick={() => {
                                setReplyingTo(comment.id);
                                setTimeout(() => {
                                    replyInputRef.current?.focus();
                                }, 50);
                            }}
                            className="text-xs font-bold text-gray-500 hover:text-black transition-colors flex items-center"
                        >
                            <Reply className="w-3.5 h-3.5 mr-1" /> Continue Conversation
                        </button>
                        <span className="text-xs font-medium text-gray-400">
                            {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </span>
                    </div>

                    {/* Nested Replies (Max 1 level deep conceptually for readability) */}
                    {replies.length > 0 && (
                        <div className="border-l-2 border-gray-100 pl-4 mt-2">
                            {replies.map(reply => (
                                <CommentNode key={reply.id} comment={reply} isReply={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            
            {/* Empathy Composer */}
            <div className="relative pt-4">
                {replyingTo && (
                    <div className="flex items-center justify-between bg-blue-50 text-blue-800 text-xs font-bold px-4 py-2.5 rounded-t-xl border-x border-t border-blue-100">
                        <span>Joining this thread...</span>
                        <button onClick={() => setReplyingTo(null)} className="hover:text-blue-900 font-bold">Cancel</button>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex gap-2 pb-2 overflow-x-auto hide-scrollbar">
                        {EMPATHY_QUICK_REPLIES.map(reply => (
                            <button
                                key={reply.id}
                                type="button"
                                onClick={() => handleQuickReply(reply.text)}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full text-xs font-bold text-gray-700 transition-colors"
                            >
                                {reply.icon} {reply.text}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <textarea
                                ref={replyInputRef}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onFocus={(e) => {
                                    if (!currentUser) { e.target.blur(); setShowLoginModal(true); }
                                }}
                                placeholder={currentUser ? "Offer support or share your experience..." : "Sign in to support others..."}
                                className={`w-full bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm font-medium text-gray-900 placeholder-gray-400 ${replyingTo ? 'rounded-b-2xl rounded-tr-2xl border border-gray-200 border-t-0' : 'rounded-2xl border border-gray-200'}`}
                                rows="3"
                            />
                        </div>
                        <Button 
                            variant="primary"
                            type="submit"
                            disabled={!newComment.trim()}
                            style={{ padding: '16px', borderRadius: '16px' }}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </form>
            </div>

            {/* Conversation Threads */}
            <div className="mt-8 space-y-2">
                {topLevelComments.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Heart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm font-medium">This space is quiet. Be the first to offer support.</p>
                    </div>
                ) : (
                    topLevelComments.map(comment => (
                        <CommentNode key={comment.id} comment={comment} isReply={false} />
                    ))
                )}
            </div>

            {/* End of Conversation Anchor */}
            {topLevelComments.length > 0 && (
                <div className="pt-8 pb-4 text-center border-t border-gray-100 mt-8">
                    <p className="text-sm font-bold text-gray-400 mb-4">You've reached the end of this conversation.</p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline">Explore Community</Button>
                        <Button variant="secondary">Find a Professional</Button>
                    </div>
                </div>
            )}

            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </div>
    );
}
