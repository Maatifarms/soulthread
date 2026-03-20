
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync('g:/soulthread/soulthread-admin.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const BOT_ID = 'heart_shadows_bot';
const BOT_NAME = 'HeartShadows';
const BOT_PHOTO = 'https://api.dicebear.com/7.x/avataaars/svg?seed=heart_shadows_bot';

const RELATIONSHIP_CONFESSIONS = [
    // Theme: Separation & Breakups
    "It's been six months since we broke up, and I still walk past our old favorite cafe every morning just to see if your car is there. I know you moved cities, but my heart hasn't caught up with my head yet.",
    "The hardest part of the breakup wasn't losing you; it was losing the version of myself I was when I was with you. I don't know who I am anymore without our Friday night movie marathons.",
    "We signed the divorce papers today. 12 years of marriage condensed into a few sheets of ink. I feel lighter, but also incredibly hollow. How does something so big end so quietly?",
    "I saw you yesterday at the grocery store. You looked happy. You were buying that specific brand of organic apples you used to hate but I loved. I wonder if you buy them for someone else now.",
    "Leaving him was the bravest thing I've ever done. He wasn't a bad man, we just weren't meant for the long haul. The silence in my new apartment is deafening, but it's finally peaceful.",
    "Everyone says I should be over it by now. It was 'only' a two-year relationship. But how do you stop missing the person who knew your coffee order and your deepest fears by heart?",
    "I deleted our shared playlist today. It felt like burning a bridge made of memories. Every song was a ghost of a moment we'll never have again.",
    "Sometimes I pick up my phone to text you about something funny I saw, and then I remember we don't speak anymore. The realization hits like a physical blow every single time.",
    "We broke up because I wanted kids and he didn't. There's no compromise for that. I still love him, but I had to choose the life I envisioned over the man I adored.",
    "The worst part of a breakup is having to re-learn how to be alone. I forgot how to sleep in the middle of the bed. I forgot how to cook for just one person.",

    // Theme: Cheating & Infidelity
    "I found the texts. He didn't even try to hide them. He said it was 'just physical,' but the way he looked at her in those photos tell a different story. My trust is shattered forever.",
    "I'm the 'other woman.' I hate myself for it. Every time he leaves to go back to his wife, a little piece of me dies. I'm waiting for a day that I know will never come.",
    "I cheated once, three years ago. I never told her. Every time she tells me how much she trusts me, the guilt feels like a lead weight in my stomach. I'm terrified of losing her.",
    "She's been cold for months. I suspect she's seeing someone else, but I'm too scared to ask. I'd rather live in a beautiful lie than face the ugly truth of our failing marriage.",
    "My ex-boyfriend cheated on me with my best friend. I lost my partner and my support system in one night. I don't think I'll ever be able to trust anyone again.",
    "He apologized, and I took him back. But every time he receives a notification, my heart skips a beat for all the wrong reasons. Forgiving isn't the same as forgetting.",
    "I found out he had a whole second family in another state. I feel like my entire life for the last five years has been a carefully constructed stage play.",
    "The emotional affair hurt more than a physical one ever could. You didn't touch her, but you gave her all the parts of your soul that were supposed to be mine.",
    "I saw my dad with another woman today. My mom has no idea. I have to go to dinner with them tonight and act like my world hasn't just imploded.",
    "I cheated because I was lonely. It's the most selfish thing I've ever done. I broke a good man's heart because I couldn't handle the silence of our long-distance relationship.",

    // Theme: Past Trauma & Secrets
    "He thinks I'm a virgin. I'm not. I had a whole life before him that was messy and complicated, but I'm so afraid that if I tell him the truth, he'll see me differently.",
    "I never told my wife about my debt. It's ballooning, and I'm drowning. I'm so ashamed that I'd rather lose everything than admit I failed as a provider.",
    "I was married before. I never mentioned it. We were young, it lasted a week, but the legal record exists. I'm terrified he'll find out and think I'm a liar.",
    "I have a child I don't see. I gave him up for adoption 10 years ago. My current partner doesn't know, and every Mother's Day, I have to hide my tears behind a headache.",
    "I suffered abuse in my childhood that I've never shared with anyone, not even him. Sometimes I pull away when he touches me, and he thinks he's done something wrong.",
    "I used to have a substance abuse problem. I've been clean for five years, but I still go to meetings in secret. I don't want him to worry that I'll relapse.",
    "There's a secret I've held since college that could ruin my reputation. I'm a successful professional now, but that ghost follows me into every room.",
    "I told him I grew up in a wealthy family because I was embarrassed of the trailer park. Now we're visiting 'home' for the first time, and I'm panicked.",
    "I've been married for 20 years and I've never told my husband that I don't actually like his mother. I play the part of the perfect daughter-in-law while screaming inside.",
    "I have a chronic illness that I'm hiding. I manage my symptoms with medication, but I know one day I won't be able to hide it anymore. I'm scared he'll leave when I become a burden.",

    // Theme: Sexual Fantasies ruining things
    "My husband found my search history. Now he thinks I'm some kind of monster. I just wanted to explore, but he's so traditional that he won't even look at me now.",
    "I shared a fantasy with her that I thought we both would enjoy. She looked at me with such disgust that I've been unable to be intimate with her for weeks.",
    "Our sex life has completely died because I can't get past my specific kinks and he's not interested. We're roommates who happen to share a bed now.",
    "He wants to bring a third person into our bedroom. I said yes because I didn't want to lose him, but now I feel invisible in my own marriage.",
    "I struggle with a porn addiction that has warped my expectations of real intimacy. My girlfriend is beautiful, but I can't seem to stay present with her.",
    "She has a fantasy that involves roleplay I find deeply uncomfortable. I feel like a bad partner for saying no, but I have to maintain my boundaries.",
    "I realized I'm not actually attracted to my boyfriend's gender. We've been together for three years. Telling him will destroy his world, but I'm suffocating.",
    "I wish he was more dominant. I've tried to hint at it, but he's so gentle it's almost frustrating. I feel guilty for wanting something he isn't.",
    "Our 'open relationship experiment' was a disaster. It didn't spice things up; it just opened a door for resentment that we can't seem to close.",
    "I'm more attracted to my fantasies than the reality of our relationship. I spend more time in my head than I do with the person sitting right across from me.",

    // Theme: General Relationship Issues
    "I'm so tired of being the only one who cleans. I feel like his mother, not his partner. I love him, but I'm losing my attraction to him because of his lack of effort.",
    "We haven't had a real conversation in months. We talk about bills, the kids, and what's for dinner, but we never talk about *us* anymore.",
    "I've realized that I'm settling. He's a good man, but he doesn't set my soul on fire. Am I supposed to stay for the comfort or leave for the passion?",
    "We're stuck in a loop of the same three arguments. I know exactly what he's going to say before he says it. We're just going through the motions.",
    "I feel invisible. I could walk out the door right now and I don't think he'd notice until he was hungry. I've vanished into the background of my own life.",
    "Long distance is killing us. Every time we hang up the phone, I feel more disconnected. I don't know if the 'someday' we're working toward is even real.",
    "My in-laws are ruining my marriage and my husband won't choose me. I feel like a guest in my own home whenever they visit.",
    "I'm terrified that we've become one of those couples that just stays together because it's easier than being alone. Is this all there is?",
    "I love him, but I don't like who he's become. He's bitter and angry at the world, and it's starting to rub off on me. I want the old him back.",
    "I think I'm falling out of love. There was no big event, no betrayal. Just a slow, steady cooling until there's nothing left but ashes."
];

async function seedRelationshipPosts() {
    console.log("🚀 Starting Relationship Seeding...");

    try {
        // 1. Create/Update the Bot Profile
        console.log("👤 Setting up HeartShadows profile...");
        await db.collection('users').doc(BOT_ID).set({
            uid: BOT_ID,
            displayName: BOT_NAME,
            photoURL: BOT_PHOTO,
            role: 'user',
            isBot: true,
            bio: "Sharing the unspoken shadows of the heart. Relationships are messy, and you're not alone in the dark.",
            createdAt: FieldValue.serverTimestamp(),
            acceptedVersion: 1,
            isAdmin: false,
            isOwner: false,
            fcmTokens: [],
            interests: ['Relationships', 'Anxiety', 'Healing']
        });

        // 2. Clear existing posts for this bot to prevent duplicates if re-run
        console.log("🧹 Clearing old posts for this bot...");
        const oldPosts = await db.collection('posts').where('authorId', '==', BOT_ID).get();
        if (!oldPosts.empty) {
            const batch = db.batch();
            oldPosts.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        // 3. Create 50 Posts
        console.log(`📝 Creating ${RELATIONSHIP_CONFESSIONS.length} confession posts...`);
        const batch = db.batch();
        
        // Stagger posts by 2 hours across the last few days
        let now = new Date();
        
        for (let i = 0; i < RELATIONSHIP_CONFESSIONS.length; i++) {
            const postRef = db.collection('posts').doc();
            const date = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000));
            
            batch.set(postRef, {
                authorId: BOT_ID,
                authorName: BOT_NAME,
                authorPhoto: BOT_PHOTO,
                content: RELATIONSHIP_CONFESSIONS[i],
                categoryId: 'Relationships',
                categoryName: 'Relationships',
                createdAt: date,
                likesCount: Math.floor(Math.random() * 25) + 5,
                commentsCount: 0,
                isIncognito: true, 
                authorIsAnonymous: false, // Visible as the Bot profile
                type: 'text',
                status: 'published',
                viewCount: Math.floor(Math.random() * 200) + 50
            });

            // Every 10 docs commit to avoid batch limits (though 50 is fine)
            if ((i + 1) % 50 === 0) {
                await batch.commit();
                console.log(`✅ Committed batch up to ${i + 1}`);
            }
        }

        console.log("✨ Seeding complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seedRelationshipPosts();
