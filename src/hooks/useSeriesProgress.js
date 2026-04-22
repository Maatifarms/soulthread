import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

/**
 * useSeriesProgress — Hook to track and persist progress in Learning Series.
 * Stores completion status per series ID and lesson title.
 * Syncs with Firestore if user is authenticated.
 */
export function useSeriesProgress(seriesId) {
    const { currentUser } = useAuth();
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);

    // Initial load from LocalStorage and Firestore
    useEffect(() => {
        const loadProgress = async () => {
            // 1. Start with LocalStorage (fastest)
            const saved = localStorage.getItem(`st_progress_${seriesId}`);
            let localData = {};
            if (saved) {
                try { localData = JSON.parse(saved); } catch (e) { }
            }
            setProgress(localData);

            // 2. Sync with Firestore if logged in
            if (currentUser) {
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        const cloudData = snap.data().lessonProgress?.[seriesId] || {};
                        // Merge Local + Cloud (Cloud wins for persistence, Local for recent offline)
                        const merged = { ...localData, ...cloudData };
                        setProgress(merged);
                        localStorage.setItem(`st_progress_${seriesId}`, JSON.stringify(merged));
                    }
                } catch (e) {
                    console.error("Error fetching progress from Firestore:", e);
                }
            }
            setLoading(false);
        };
        loadProgress();
    }, [seriesId, currentUser]);

    const markAsRead = async (lessonTitle) => {
        const updated = { ...progress, [lessonTitle]: true };
        setProgress(updated);
        localStorage.setItem(`st_progress_${seriesId}`, JSON.stringify(updated));
        
        // Persist to Firestore
        if (currentUser) {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    [`lessonProgress.${seriesId}.${lessonTitle.replace(/\./g, '_')}`]: true
                });
            } catch (e) {
                // If field doesn't exist, use setDoc with merge
                const userRef = doc(db, 'users', currentUser.uid);
                await setDoc(userRef, {
                    lessonProgress: {
                        [seriesId]: { [lessonTitle.replace(/\./g, '_')]: true }
                    }
                }, { merge: true });
            }
        }

        // Push to analytics
        if (window.analytics) {
            window.analytics.logEvent('lesson_completed', {
                series_id: seriesId,
                lesson_title: lessonTitle
            });
        }
    };

    const isRead = (lessonTitle) => !!progress[lessonTitle];

    const getCompletionRate = (totalLessons) => {
        if (!totalLessons) return 0;
        const completed = Object.values(progress).filter(Boolean).length;
        return Math.round((completed / totalLessons) * 100);
    };

    return { progress, markAsRead, isRead, getCompletionRate, loading };
}
