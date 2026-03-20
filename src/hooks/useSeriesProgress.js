import { useState, useEffect } from 'react';

/**
 * useSeriesProgress — Hook to track and persist progress in Learning Series.
 * Stores completion status per series ID and lesson title.
 */
export function useSeriesProgress(seriesId) {
    const [progress, setProgress] = useState({});

    useEffect(() => {
        const saved = localStorage.getItem(`st_progress_${seriesId}`);
        if (saved) {
            try { setProgress(JSON.parse(saved)); } catch (e) { }
        }
    }, [seriesId]);

    const markAsRead = (lessonTitle) => {
        const updated = { ...progress, [lessonTitle]: true };
        setProgress(updated);
        localStorage.setItem(`st_progress_${seriesId}`, JSON.stringify(updated));
        
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

    return { progress, markAsRead, isRead, getCompletionRate };
}
