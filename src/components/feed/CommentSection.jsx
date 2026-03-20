import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LoginModal from '../common/LoginModal';
import { moderateContent } from '../../services/moderation';

const CommentSection = React.memo(({ postId, postAuthorId }) => {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'posts', postId, 'comments'),
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!handleInteraction()) return;
        if (!newComment.trim()) return;

        // MODERATION CHECK (Added)
        const moderation = moderateContent(newComment, 'comment');
        if (!moderation.safe) {
            alert(moderation.reason);
            return;
        }

        try {
            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'posts', postId, 'comments'), {
                content: newComment,
                authorId: currentUser.uid,
                authorName: isAnon ? 'Anonymous' : (currentUser.displayName || 'Anonymous'),
                authorPhotoURL: isAnon ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' : currentUser.photoURL,
                createdAt: serverTimestamp()
            });

            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsCount: increment(1)
            });

            // NOTIFICATION LOGIC
            if (postAuthorId && postAuthorId !== currentUser.uid) {
                try {
                    const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
                    await addDoc(collection(db, 'notifications'), {
                        recipientId: postAuthorId,
                        senderId: currentUser.uid,
                        senderName: isAnon ? 'Someone' : (currentUser.displayName || 'Anonymous'),
                        senderPhoto: isAnon ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' : currentUser.photoURL,
                        type: 'post_comment',
                        postId: postId,
                        message: `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} commented on your post.`,
                        read: false,
                        createdAt: serverTimestamp()
                    });
                } catch (nErr) { console.warn("Notif fail", nErr); }
            }

            setNewComment('');
        } catch (error) {
            console.error("Error adding comment", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm("Delete this comment?")) return;
        try {
            await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsCount: increment(-1)
            });
            alert("Comment deleted.");
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--color-divider)' }}>
            {/* Comments List */}
            <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <Link to={`/profile/${comment.authorId}`}>
                            <img
                                src={comment.authorPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`}
                                style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                                alt="avatar"
                            />
                        </Link>
                        <div style={{ flex: 1 }}>
                            <div style={{ background: 'var(--color-background)', padding: '8px 12px', borderRadius: '12px', color: 'var(--color-text-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '12px' }}>
                                        {comment.authorName}
                                    </div>
                                    {(currentUser?.uid === comment.authorId || currentUser?.role === 'admin') && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                                            title="Delete Comment"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                                <div style={{ fontSize: '13px' }}>{comment.content}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {currentUser && (
                    <img
                        src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`}
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                        alt="me"
                    />
                )}
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onFocus={(e) => {
                        if (!currentUser) {
                            e.target.blur();
                            setShowLoginModal(true);
                        }
                    }}
                    placeholder={currentUser ? "Write a supportive comment..." : "Login to comment..."}
                    style={{
                        flex: 1,
                        borderRadius: '24px',
                        padding: '10px 16px',
                        fontSize: '14px',
                        background: 'var(--color-background)',
                        border: '1.5px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                    }}
                />
                <button
                    type="submit"
                    style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '13px' }}
                >
                    Post
                </button>
            </form>
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </div>
    );
});

export default CommentSection;
