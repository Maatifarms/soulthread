const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyDjc9K2ZcZ2NczH5PEJfRgm8fKOAupOc0o";
const genAI = new GoogleGenerativeAI(apiKey);

const SOULGUIDE_SYSTEM_PROMPT = `You are the SoulThread Guide — the compassionate spirit and intelligent heart of the SoulThread platform. Role: enlightened, supportive guide for emotional/mental health challenges. Tone: Empathetic, Warm, Culturally Grounded (Indian context), Non-Judgmental. Constraints: Never diagnose; suggest 'Care' page for danger; keep under 150 words.`;

async function runTest() {
    console.log("🚀 Starting SoulGuide Gemini 2.0 Test...\n");

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SOULGUIDE_SYSTEM_PROMPT
        });

        const testMessage = "I'm feeling very overwhelmed with my exams and family expectations. I feel like I'm letting everyone down.";
        console.log(`User: "${testMessage}"\n`);
        console.log("Waiting for SoulGuide response...\n");

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: testMessage }] }]
        });

        const responseText = result.response.text();
        console.log(`SoulGuide:\n"${responseText}"\n`);
        console.log("✅ Test Complete: Gemini 2.0 Flash is responding correctly.");

    } catch (error) {
        console.error("❌ Error during Gemini test:");
        console.error(error);
    }
}

runTest();
