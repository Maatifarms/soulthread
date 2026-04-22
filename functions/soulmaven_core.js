const admin = require('firebase-admin');

function getDb() {
    if (!admin.apps.length) admin.initializeApp();
    return admin.firestore();
}


const SOULMAVEN_SYSTEM_PROMPT = `You are the SoulMaven — the growth concierge and expert advocate for the SoulThread platform. 

Your Role:
1. Help users discover the best tools and resources for their mental and emotional growth.
2. Explain the value of SoulThread's premium offerings (Soul Basic, Soul Pro, and Psychologist Consultations).
3. Be persuasive but never pushy. You are like a wise mentor guiding someone to invest in themselves.
4. If a user asks about pricing, explain the tiers clearly (Soul Basic: 199 INR, Soul Pro: 499 INR).
5. If a user is in distress, gently suggest the 'Care' page or 'SoulGuide' for immediate emotional support, while explaining that 'Soul Pro' offers 1-on-1 AI Deep Care.
6. Emphasize the benefits of 'Series' (Biological Soul, Ego/ID, Hyperfocus, etc.) which are available in Soul Basic.

Tone: Professional, Insightful, Persuasive, Encouraging, and Action-Oriented.
Context: Indian-centric but globally accessible.
Constraint: Keep responses under 150 words. Focus on conversion and user education.`;

const CONTENT_REFINER_PROMPT = `You are the SoulThread Institutional Muse. 
Your task is to refine user-generated reflections, posts, or messages to be more poignant, sophisticated, and premium.

Guidelines:
1. Preserve the original emotional intent and core message.
2. Elevate the vocabulary to be 'Institutional' - authoritative yet deeply empathetic.
3. Improve the vertical rhythm and flow.
4. Keep the output concise and suitable for a social feed or direct message.
5. Avoid generic AI fluff; focus on raw, human-centric depth.

Input: User's draft text.
Output: The refined, premium version only.`;

let genAIInstance = null;
function getGenAI() {
    if (!genAIInstance) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "UNSET");
    }
    return genAIInstance;
}

exports.askSalesAgent = async (data, context) => {
    const { message } = data;
    const userId = context.auth ? context.auth.uid : 'anonymous';
    const db = getDb();
    const sessionRef = db.collection('soulmaven_sessions').doc(`sm_${userId}`);

    try {
        console.log(`[SoulMaven] Starting request for user: ${userId}`);
        const sessionSnap = await sessionRef.get();
        let sessionData = sessionSnap.exists ? sessionSnap.data() : { messages: [] };

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash", // Using the latest standard
            systemInstruction: SOULMAVEN_SYSTEM_PROMPT
        });

        const historyData = (sessionData.messages || []).slice(-6);
        const history = historyData.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        console.log(`[SoulMaven] Generating content with history length: ${history.length}`);
        const result = await model.generateContent({
            contents: [...history, { role: "user", parts: [{ text: message }] }]
        });
        const aiResponse = result.response.text();

        console.log(`[SoulMaven] Successfully generated response.`);
        await sessionRef.set({
            messages: [...(sessionData.messages || []), { role: 'user', content: message }, { role: 'model', content: aiResponse }],
            lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { response: aiResponse };
    } catch (error) {
        console.error("SoulMaven Module Error:", error);
        return {
            response: "I'm having a brief moment of reflection. While I reconnect, why not explore our 'Series' gallery to see how we can support your growth today?"
        };
    }
};

exports.refineContent = async (data, context) => {
    const { text, context: msgContext } = data;
    if (!text) return { refined: "" };

    try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: CONTENT_REFINER_PROMPT
        });

        const prompt = msgContext 
            ? `Refine this message in the context of: "${msgContext}"\n\nDraft: ${text}`
            : `Refine this post draft:\n\n${text}`;

        const result = await model.generateContent(prompt);
        const refinedText = result.response.text().trim();

        return { refined: refinedText };
    } catch (error) {
        console.error("Content Refinement Error:", error);
        return { refined: text }; // Return original on error
    }
};
