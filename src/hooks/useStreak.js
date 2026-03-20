import { useState, useEffect } from 'react';

/**
 * useStreak — Hook to track daily visit streaks.
 * Persists to localStorage.
 */
export function useStreak() {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const lastVisit = localStorage.getItem('st_last_visit');
        const currentStreak = parseInt(localStorage.getItem('st_streak') || '0');
        const today = new Date().toISOString().split('T')[0];

        if (!lastVisit) {
            // First time ever
            setStreak(1);
            localStorage.setItem('st_streak', '1');
            localStorage.setItem('st_last_visit', today);
        } else if (lastVisit === today) {
            // Already visited today
            setStreak(currentStreak);
        } else {
            const lastDate = new Date(lastVisit);
            const todayDate = new Date(today);
            const diffInDays = (todayDate - lastDate) / (1000 * 3600 * 24);

            if (diffInDays === 1) {
                // Streak continued
                const newStreak = currentStreak + 1;
                setStreak(newStreak);
                localStorage.setItem('st_streak', newStreak.toString());
                
                // Track streak engagement
                import('../services/analytics').then(({ analytics }) => {
                    analytics.logEvent('streak_continued', { days: newStreak });
                });
            } else {
                // Streak broken
                setStreak(1);
                localStorage.setItem('st_streak', '1');
            }
            localStorage.setItem('st_last_visit', today);
        }
    }, []);

    return streak;
}
