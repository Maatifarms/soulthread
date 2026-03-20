/**
 * aiCompanion.js — AI Wellness Companion (Task 81)
 *
 * Implements conversational safety wrappers restricting LLM logic
 * from diagnosing users and triggering immediate escalation vectors
 * upon detecting crisis phraseology natively.
 */

class AIWellnessCompanion {
    constructor() {
        this.sessionContext = [];
        this.CRISIS_keywords = ['suicide', 'kill myself', 'end it all', 'no way out', 'worthless'];

        // Safety wrapper injected invisibly before sending to LLM
        this.SYSTEM_PROMPT = `
            You are 'SoulThread Guide', an empathetic wellness listener.
            RULES:
            1. Validate emotions gently.
            2. NEVER provide medical advice or diagnose conditions.
            3. If the user appears in danger, output the exact string: [CRISIS_ESCALATION_REQUIRED].
            4. Keep responses under 3 sentences unless guiding a breathing exercise.
        `;
    }

    /**
     * Interacts with user text, evaluating safety rules before answering.
     */
    async sendMessage(userInput) {
        console.log(`[Companion] User input received. Length: ${userInput.length}`);

        // 1. Hardcoded Crisis Pre-Flight Check (Fast fail)
        const isCrisis = this.CRISIS_keywords.some(k => userInput.toLowerCase().includes(k));
        if (isCrisis) {
            return this.triggerEscalation();
        }

        // 2. Append to Session Memory
        this.sessionContext.push({ role: 'user', content: userInput });

        try {
            // 3. Mock Call to LLM Backend (e.g., Gemini / Vertex AI via Firebase Functions)
            const botResponse = await this.mockLlmNetworkCall(userInput);

            // 4. Post-Flight Model Safety Verification
            if (botResponse.includes('[CRISIS_ESCALATION_REQUIRED]')) {
                return this.triggerEscalation();
            }

            this.sessionContext.push({ role: 'assistant', content: botResponse });
            return {
                type: 'standard',
                text: botResponse
            };

        } catch (e) {
            console.error('[Companion] Engine offline', e);
            return { type: 'error', text: "I'm having trouble connecting right now, but I'm here. Take a slow breath." };
        }
    }

    triggerEscalation() {
        console.warn(`[Companion] CRITICAL: Escalated to Human Support Pipeline.`);
        return {
            type: 'crisis',
            text: "It sounds like you're going through an incredibly hard time right now. I'm a bot and I can't give you the help you deserve, but I want to connect you to someone who can.",
            action: 'SHOW_CRISIS_BANNER'
        };
    }

    // Mocks network latency resolving model outputs
    async mockLlmNetworkCall(input) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (input.includes('anxious')) return resolve("I hear you. Anxiety can feel overwhelming. Would you like to try a quick 4-7-8 breathing exercise with me?");
                resolve("That sounds like a heavy weight to carry. I'm here to listen whenever you're ready to share more.");
            }, 800);
        });
    }
}

export const companionApi = new AIWellnessCompanion();
