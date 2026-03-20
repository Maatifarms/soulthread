import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { analytics } from '../../services/analytics';
import './ReflectionWall.css';

const ReflectionWall = () => {
    const [reflections, setReflections] = useState([]);
    const [newReflection, setNewReflection] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        const q = query(
            collection(db, 'reflections'),
            orderBy('createdAt', 'desc'),
            limit(12)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReflections(items);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReflection.trim() || newReflection.length > 100) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'reflections'), {
                text: newReflection,
                createdAt: serverTimestamp(),
                userId: currentUser?.uid || 'anonymous',
                isAnonymous: true
            });
            setNewReflection('');
            analytics.logEvent('reflection_shared', { text_length: newReflection.length });
        } catch (error) {
            console.error("Error sharing reflection:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="reflection-wall-root">
            <div className="reflection-header">
                <h2>Global Reflection Wall</h2>
                <p>What's on your soul right now? (Anonymous)</p>
            </div>

            <div className="wall-canvas">
                <AnimatePresence>
                    {reflections.map((ref, idx) => (
                        <motion.div
                            key={ref.id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                            className="reflection-chip"
                            style={{
                                '--delay': `${idx * 0.1}s`
                            }}
                        >
                            <span className="reflection-text">"{ref.text}"</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="reflection-input-container">
                <form onSubmit={handleSubmit} className="reflection-form">
                    <input
                        type="text"
                        value={newReflection}
                        onChange={(e) => setNewReflection(e.target.value)}
                        placeholder="I feel..."
                        maxLength={100}
                        className="reflection-input"
                        disabled={isSubmitting}
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !newReflection.trim()}
                        className="reflection-submit"
                    >
                        {isSubmitting ? '...' : 'Share'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ReflectionWall;
