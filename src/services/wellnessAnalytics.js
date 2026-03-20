/**
 * wellnessAnalytics.js — Wellness Analytics Engine (Task 74)
 *
 * Scans personal mood timelines to map emotional patterns and generate 
 * highly personalized recommendation prompts securely on-device.
 */

// Private Client-Side Only Library. No data leaves the device unless encrypted.
class WellnessAnalyticsEngine {
    constructor() {
        this.scoreMap = {
            'Overwhelmed': 1,
            'Anxious': 2,
            'Numb': 3,
            'Calm': 4,
            'Radiant': 5
        };
    }

    /**
     * Analyzes standard User metrics locally generating a Trend object.
     */
    analyzeWeeklyPattern(moodLogsArray) {
        if (!moodLogsArray || moodLogsArray.length === 0) return null;

        console.log(`[WellnessEngine] Analyzing ${moodLogsArray.length} recent entries...`);

        // Sort chronologically
        const sorted = moodLogsArray.sort((a, b) => new Date(a.date) - new Date(b.date));

        let totalScore = 0;
        let lowestPoint = 5;
        let anxietySpikes = 0;

        sorted.forEach(log => {
            const score = log.score || this.scoreMap[log.label];
            totalScore += score;

            if (score < lowestPoint) lowestPoint = score;
            if (score <= 2) anxietySpikes++;
        });

        const averageMood = totalScore / sorted.length;
        const trendDirection = this.calculateSlope(sorted);

        const insights = this.generateSuggestions(averageMood, anxietySpikes, trendDirection);

        return {
            averageScore: averageMood.toFixed(2),
            anxietyDays: anxietySpikes,
            trend: trendDirection, // 'improving', 'stable', 'declining'
            insights: insights
        };
    }

    calculateSlope(logs) {
        if (logs.length < 3) return 'stable';

        const firstHalf = logs.slice(0, Math.floor(logs.length / 2));
        const secondHalf = logs.slice(Math.floor(logs.length / 2));

        const avg1 = firstHalf.reduce((acc, val) => acc + val.score, 0) / firstHalf.length;
        const avg2 = secondHalf.reduce((acc, val) => acc + val.score, 0) / secondHalf.length;

        if (avg2 > avg1 + 0.5) return 'improving';
        if (avg2 < avg1 - 0.5) return 'declining';
        return 'stable';
    }

    generateSuggestions(averageMood, anxietySpikes, trend) {
        const triggers = [];

        if (anxietySpikes >= 3) {
            triggers.push({
                type: 'meditation',
                title: 'Box Breathing Exercises',
                reason: 'You logged multiple anxious days recently.'
            });
        }

        if (averageMood <= 2.5 && trend === 'declining') {
            triggers.push({
                type: 'professional',
                title: 'Connect with a Listener',
                reason: 'Your trend suggests you might benefit from talking to someone.'
            });
        }

        if (trend === 'improving') {
            triggers.push({
                type: 'group',
                title: 'Share your progress in a Group',
                reason: 'You are trending upwards! Consider inspiring others.'
            });
        }

        return triggers;
    }
}

export const wellnessAnalytics = new WellnessAnalyticsEngine();
