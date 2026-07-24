// Reactions — simple Like button like Instagram/Facebook
// Single tap to like, tap again to unlike. No popup picker.
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../common/LoginModal';

export default function Reactions({ post }) {
    const { currentUser } = useAuth();
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        if (!post?.id) return;
        const likes = post.reactions?.with_you || post.likes || 0;
        setCount(typeof likes === 'object' ? Object.keys(likes).length : (likes || 0));
        if (currentUser && post.likedBy) {
            setLiked(post.likedBy.includes(currentUser.uid));
        } else if (currentUser && post.reactions_by?.[currentUser.uid]) {
            setLiked(true);
        }
    }, [post, currentUser]);

    const handleLike = async () => {
        if (!currentUser) { setShowLoginModal(true); return; }
        const ref = doc(db, 'posts', post.id);
        const newLiked = !liked;
        setLiked(newLiked);
        setCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
        try {
            const snap = await getDoc(ref);
            if (!snap.exists()) return;
            const data = snap.data();
            const likedBy = data.likedBy || [];
            if (newLiked) {
                await updateDoc(ref, {
                    likedBy: [...new Set([...likedBy, currentUser.uid])],
                    'reactions.with_you': (data.reactions?.with_you || 0) + 1
                });
            } else {
                await updateDoc(ref, {
                    likedBy: likedBy.filter(id => id !== currentUser.uid),
                    'reactions.with_you': Math.max(0, (data.reactions?.with_you || 1) - 1)
                });
            }
        } catch (err) {
            // Revert on error
            setLiked(!newLiked);
            setCount(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
                onClick={handleLike}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '20px', border: 'none',
                    background: liked ? '#fff0f3' : 'var(--color-surface-2)',
                    color: liked ? '#f43f5e' : 'var(--color-text-secondary)',
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.15s',
                }}
            >
                <Heart
                    size={17}
                    fill={liked ? '#f43f5e' : 'none'}
                    stroke={liked ? '#f43f5e' : 'currentColor'}
                    strokeWidth={2}
                />
                <span>{count > 0 ? count : 'Like'}</span>
            </button>
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </div>
    );
}
