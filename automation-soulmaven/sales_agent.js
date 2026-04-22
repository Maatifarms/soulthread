const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const outreachCore = require('../functions/soulmaven_outreach_core');

dotenv.config({ path: path.join(__dirname, '.env') });
chromium.use(stealth);

// Initialize Firebase
let credential;
try {
    const serviceAccount = require('./serviceAccountKey.json');
    credential = admin.credential.cert(serviceAccount);
} catch (e) {
    console.log("ℹ️ No serviceAccountKey.json found. Using Application Default Credentials (ADC).");
    credential = admin.credential.applicationDefault();
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: credential,
        projectId: process.env.FIREBASE_PROJECT_ID
    });
}
const db = admin.firestore();

async function runSalesAgent() {
    const browser = await chromium.launch({ headless: false }); // Visible for now so user can see/intervene
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log("🚀 Starting SoulMaven Sales Agent...");
        
        // 1. Login to LinkedIn
        await loginLinkedIn(page);
        
        // 2. Search and Process Keywords
        const keywords = process.env.SEARCH_KEYWORDS.split(',');
        for (const keyword of keywords) {
            console.log(`🔍 Searching for: ${keyword}`);
            const posts = await searchPosts(page, keyword);
            
            for (const post of posts.slice(0, process.env.DAILY_LIMIT)) {
                await processOutreach(page, post);
            }
        }

    } catch (error) {
        console.error("❌ Agent Failure:", error);
    } finally {
        // await browser.close();
        console.log("🏁 Cycle Complete. Browser left open for review.");
    }
}

async function loginLinkedIn(page) {
    await page.goto('https://www.linkedin.com/login');
    await page.fill('#username', process.env.LINKEDIN_EMAIL);
    await page.fill('#password', process.env.LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for feed or checkpoint
    try {
        await page.waitForURL(/.*linkedin\.com\/feed.*/, { timeout: 15000 });
        console.log("✅ Transitioned to Feed.");
    } catch (e) {
        if (page.url().includes('checkpoint')) {
            console.log("⚠️ Security Check detected. Please complete it in the browser window.");
            await page.waitForNavigation({ timeout: 60000 });
        } else {
            console.log("ℹ️ Slow login or unknown state. Checking for identity-dash...");
            await page.waitForSelector('.identity-dash-avatar, .feed-identity-module', { timeout: 15000 }).catch(() => {});
        }
    }
    
    console.log("✅ Logged in successfully.");
}

async function searchPosts(page, keyword) {
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=SWITCH_SEARCH_VERTICAL`;
    await page.goto(searchUrl);
    await page.waitForTimeout(5000); // Allow posts to load
    
    // Simple extraction logic - in production this would be more robust
    const posts = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.update-components-text'));
        return items.map(item => ({
            text: item.innerText.trim(),
            author: item.closest('.feed-shared-update-v2')?.querySelector('.update-components-actor__name')?.innerText.trim() || "Unknown",
            profileUrl: item.closest('.feed-shared-update-v2')?.querySelector('.update-components-actor__container-link')?.href
        })).filter(p => p.text.length > 50); // Filter out short noise
    });
    
    return posts;
}

async function processOutreach(page, post) {
    console.log(`🤝 Processing outreach for ${post.author}...`);
    
    // Check if already reached out
    const alreadyReached = await db.collection('soulmaven_outreach')
        .where('profileUrl', '==', post.profileUrl)
        .get();
        
    if (!alreadyReached.empty) {
        console.log(`⏭️ Skipping ${post.author} (Already contacted)`);
        return;
    }

    // Generate Message using Gemini
    const messages = await outreachCore.generateOutreachMessage('LinkedIn', post.text, `Author: ${post.author}`);
    
    // Log intent (Real sending would involve navigating to profile and clicking 'Connect')
    console.log(`✨ Generated Note: "${messages.dm}"`);
    
    // Track in Firestore
    await db.collection('soulmaven_outreach').add({
        author: post.author,
        profileUrl: post.profileUrl,
        postContent: post.text.substring(0, 500),
        generatedMessage: messages.dm,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'draft_logged'
    });
    
    console.log(`✅ Logged outreach for ${post.author}`);
}

runSalesAgent();
