const admin = require('firebase-admin');


const SOULGUIDE_SYSTEM_PROMPT = `You are the SoulThread Guide — the compassionate spirit and intelligent heart of the SoulThread platform. Role: enlightened, supportive guide for emotional/mental health challenges. Tone: Empathetic, Warm, Culturally Grounded (Indian context), Non-Judgmental. Constraints: Never diagnose; suggest 'Care' page for danger; keep under 150 words.`;

let genAIInstance = null;
function getGenAI() {
    if (!genAIInstance) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "UNSET");
    }
    return genAIInstance;
}

exports.handleAskSoulGuide = async (data, context) => {
    const { message } = data;
    const userId = context.auth.uid;
    const db = admin.firestore();
    const sessionRef = db.collection('soulguide_sessions').doc(`sg_${userId}`);

    try {
        console.log(`[SoulGuide] Starting request for user: ${userId}`);
        const sessionSnap = await sessionRef.get();
        let sessionData = sessionSnap.exists ? sessionSnap.data() : { messages: [], optIn: false };
        if (!sessionData.optIn) return { error: 'permission-denied', message: 'SoulGuide opt-in required.' };

        const apiKey = process.env.GEMINI_API_KEY;
        console.log(`[SoulGuide] API Key present: ${!!apiKey} (Starts with: ${apiKey ? apiKey.substring(0, 4) : 'N/A'})`);

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SOULGUIDE_SYSTEM_PROMPT
        });

        const historyData = (sessionData.messages || []).slice(-6);
        const history = historyData.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        console.log(`[SoulGuide] Generating content with history length: ${history.length}`);
        const result = await model.generateContent({
            contents: [...history, { role: "user", parts: [{ text: message }] }]
        });
        const aiResponse = result.response.text();

        console.log(`[SoulGuide] Successfully generated response.`);
        await sessionRef.set({
            messages: [...(sessionData.messages || []), { role: 'user', content: message }, { role: 'model', content: aiResponse }],
            lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { response: aiResponse };
    } catch (error) {
        console.error("SoulGuide Module Error:", error);
        const errorMessage = error.message || "";
        const isBlocked = (errorMessage.includes('API_KEY_SERVICE_BLOCKED') ||
            errorMessage.includes('403') ||
            error.status === 403 ||
            error.httpErrorCode?.status === 403);

        if (isBlocked) {
            console.warn("[SoulGuide] API is BLOCKED. Returning empathetic fallback.");
            return {
                response: "I'm having a little trouble connecting to my wisdom right now, but I'm still here for you. It looks like my 'wisdom engine' (API) needs to be enabled in the Google Cloud Console. Let's take a deep breath together while that gets sorted out."
            };
        }

        return {
            response: "I'm sensing a small connection glitch, but please know I'm still listening. Could we try that one more time? I want to make sure I give you the support you deserve."
        };
    }
};
