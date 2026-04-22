const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAIInstance = null;

function getGenAI() {
    if (!genAIInstance) {
        const apiKey = process.env.GEMINI_API_KEY || "UNSET";
        genAIInstance = new GoogleGenerativeAI(apiKey);
    }
    return genAIInstance;
}

/**
 * SoulMaven Social Outreach Core
 * Designed to generate highly empathetic, non-spammy outreach messages 
 * for people sharing mental health struggles on Instagram, LinkedIn, etc.
 */
exports.generateOutreachMessage = async (platform, postContent, context = "") => {
    try {
        const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
You are SoulMaven, the Growth Concierge for SoulThread (soulthread.in).
Your mission is to reach out to individuals on ${platform} who have shared vulnerable posts about their mental health, anxiety, or emotional struggles.

CRITICAL GUIDELINES:
1. DO NOT SELL. You are inviting them to a "Sanctuary," not a product.
2. BE DEEPLY EMPATHETIC. Acknowledge their specific struggle mentioned in the post.
3. BE CONCISE. Social media attention spans are short.
4. TONE: Professional, warm, and highly emotionally intelligent.
5. NO SPAMMY HASHTAGS.
6. MANDATORY CALL TO ACTION: Gently invite them to explore a specific part of SoulThread (e.g., a relevant "Series" or just the "Anonymous Feed") at soulthread.in.
7. PRIVACY FIRST: Emphasize that SoulThread is a 100% anonymous sanctuary where they don't have to carry their burden alone.

SENDER PROFILE:
- Name: Rupesh Ojha
- Role: Founder / Mental Well-being Advocate at SoulThread.
- LinkedIn Profile: https://www.linkedin.com/in/rupesh-ojha/

Use these details if the outreach fits the tone (especially for LinkedIn Connection Notes). Ensure others on the team know they are representing this "Sanctuary" brand founded by him.

PLATFORM SPECIFICS:
- Instagram: Use a warmer, more personal tone. Emoji usage should be subtle and tasteful.
- LinkedIn: Use a more professional yet supportive "well-being advocate" tone. Focus on growth and resilience.

POST CONTENT TO ANALYZE:
"${postContent}"

ADDITIONAL CONTEXT:
${context}

Generate 3 options:
1. A short Comment (max 250 chars).
2. A Direct Message (DM) / Connection Note (empathetic and personalized).
3. A 'Safe Space' check-in message.

Return the response as a clean JSON object with keys: 'comment', 'dm', and 'checkin'. Do not include markdown code blocks.
        `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean up JSON if it came with markdown blocks
        const cleanedJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Outreach Generation Error:", error);
        throw new Error("Failed to generate outreach message.");
    }
};
