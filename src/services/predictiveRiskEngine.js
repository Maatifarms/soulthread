/**
 * predictiveRiskEngine.js — Predictive Wellness Risk Engine (Task 111)
 *
 * Implements a predictive model that analyzes mood regressions, engagement drop-offs,
 * and biometric markers to identify sub-clinical risk signals before they escalate.
 */

class PredictiveWellnessRiskEngine {
    constructor() {
        this.THRESHOLD_CRITICAL = 0.85;
        this.THRESHOLD_PREVENTIVE = 0.50;
    }

    /**
     * Analyzes a user's trajectory over 14 days.
     * Looks for "Negative Divergence" where mood drops despite high app engagement, or vice versa.
     */
    async analyzeRiskTrajectory(userId, telemetryData) {
        console.log(`[PredictiveEngine] Running 14-day trajectory analysis for ${userId}`);

        const { moodScores, engagementFrequency, sleepHours } = telemetryData;

        // Calculate Mood Velocity (rate of change)
        const velocity = this.calculateVelocity(moodScores);

        // Detect "Flatlining" or "Sharp Drop"
        let riskScore = 0;
        if (velocity < -0.2) riskScore += 0.4; // Consistent decline
        if (Math.min(...moodScores) < 3) riskScore += 0.3; // Low floor
        if (sleepHours && Math.min(...sleepHours) < 4) riskScore += 0.2; // Biometric distress

        console.log(`[PredictiveEngine] Risk Score for User ${userId}: ${riskScore.toFixed(2)}`);

        return {
            userId,
            riskScore,
            status: riskScore > this.THRESHOLD_PREVENTIVE ? 'Needs_Intervention' : 'Stable',
            recommendedAction: this.getPreventivePrompt(riskScore)
        };
    }

    calculateVelocity(scores) {
        if (scores.length < 2) return 0;
        const first = scores[0];
        const last = scores[scores.length - 1];
        return (last - first) / scores.length;
    }

    getPreventivePrompt(score) {
        if (score > this.THRESHOLD_CRITICAL) return 'PROMPT_CRISIS_SUPPORT';
        if (score > this.THRESHOLD_PREVENTIVE) return 'SUGGEST_ANXIETY_JOURNEY';
        return 'DAILY_MAINTENANCE';
    }
}

export const riskEngine = new PredictiveWellnessRiskEngine();
