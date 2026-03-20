/**
 * SoulThread — Emotional Control Posts Seeder (Admin SDK)
 * Uses Admin SDK to bypass security rules.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Try to find service account or use ADC
// If running on user's machine, it might need the JSON.
// Since I couldn't find the file easily, I'll allow the user to provide it or try ADC.
// But wait, seedCategoriesADC.cjs exists, let's see how it's initialized.

initializeApp(); // Uses ADC by default

const db = getFirestore();
const auth = getAuth();

const USER_EMAIL = "mindsetguide@soulthread.in";
const USER_USERNAME = "MindsetGuide";
const USER_DISPLAY_NAME = "Mindset Guide";
const USER_BIO = "Master your emotions, master your life. Daily insights on emotional control and mental resilience.";
const USER_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=MindsetGuide&backgroundColor=b6e3f4";

const POSTS_RAW = [
    {
        title: "Your First Reaction Is Not Always the Best Response",
        content: "When something triggers you, your brain reacts instantly. Your heart races, your mind forms judgments, and you feel an urge to respond immediately.\n\nBut this first reaction often comes from the emotional part of the brain, not the rational one.\n\nThe real power lies in the pause between the trigger and your response.\n\nWhen you give yourself even a few seconds to think, you allow logic to guide your actions instead of impulse.\n\nThat pause can protect relationships, decisions, and opportunities.",
        tags: ["Emotional Control", "Self Awareness", "Mindfulness"]
    },
    {
        title: "The Cost of Emotional Reactions",
        content: "A single emotional reaction can damage things that took years to build.\n\nAn angry message.\nA harsh comment.\nA defensive reply.\n\nThese moments may feel justified in the moment, but they often create long-term consequences.\n\nLearning to pause before reacting protects your reputation, relationships, and future opportunities.\n\nEmotional control is not weakness.\nIt is one of the most powerful skills you can develop.",
        tags: ["Emotional Control", "Relationships", "Personal Growth"]
    },
    {
        title: "Your Brain Is Designed to Overreact",
        content: "Your brain evolved to react quickly to threats.\n\nThousands of years ago, this helped humans survive predators and danger.\n\nBut today, your brain still reacts strongly to things like criticism, emails, or disagreements.\n\nThe problem is not your emotions.\nThe problem is reacting automatically to them.\n\nLearning to slow down your reaction gives your rational mind time to take control.",
        tags: ["Emotional Intelligence", "Self Awareness"]
    },
    {
        title: "Emotions Are Information, Not Instructions",
        content: "Feeling angry does not mean you must act angrily.\n\nFeeling anxious does not mean you must avoid the situation.\n\nEmotions provide signals about what is happening inside you.\n\nBut they should inform your decisions, not control them.\n\nThe strongest people are not emotionless.\nThey simply choose their actions carefully.",
        tags: ["Emotional Awareness", "Self Control"]
    },
    {
        title: "The Power of the Pause",
        content: "Most regret comes from reacting too quickly.\n\nBefore replying to a message…\nBefore responding in an argument…\nBefore making a decision while upset…\n\nPause.\n\nTake a breath.\nGive yourself a moment.\n\nThis short pause often prevents mistakes that could take days, months, or years to repair.",
        tags: ["Mindfulness", "Emotional Control"]
    },
    {
        title: "Your Body Warns You Before You React",
        content: "Your body often signals emotional reactions before your mind realizes it.\n\nYou might notice:\n• a faster heartbeat\n• tense muscles\n• shallow breathing\n• heat in your face\n\nThese are early warning signs that your emotions are rising.\n\nWhen you notice them, slow down and breathe.\n\nYour body is telling you it's time to regain control.",
        tags: ["Emotional Awareness", "Self Regulation"]
    },
    {
        title: "One Emotional Reaction Can Affect Your Entire Day",
        content: "An argument in the morning can ruin your focus at work.\n\nA stressful email can affect how you speak to others later.\n\nEmotions carry momentum.\n\nThis is why learning to regulate them early is so powerful.\n\nWhen you control your reactions, you prevent one moment from controlling the rest of your day.",
        tags: ["Emotional Regulation", "Mindset"]
    },
    {
        title: "Emotional Control Builds Trust",
        content: "People trust those who stay calm under pressure.\n\nWhen others panic, react, or argue, the person who stays composed becomes a stabilizing force.\n\nOver time, this reputation creates opportunities.\n\nLeaders, teams, and friends rely on people who can handle difficult situations without losing control.\n\nEmotional stability builds credibility.",
        tags: ["Leadership", "Emotional Intelligence"]
    },
    {
        title: "Your Emotions Can Cloud Your Thinking",
        content: "When emotions rise, your brain shifts into survival mode.\n\nThis reduces your ability to think clearly or make logical decisions.\n\nThat is why decisions made while angry or anxious often lead to regret.\n\nThe solution is simple:\n\nDelay the decision.\n\nClarity returns once your emotions settle.",
        tags: ["Decision Making", "Emotional Control"]
    },
    {
        title: "Awareness Is the First Step to Control",
        content: "Many people believe they \"just react.\"\n\nBut emotional reactions are habits.\n\nThe first step to changing them is awareness.\n\nStart noticing:\n• what situations trigger you\n• what thoughts appear\n• how your body reacts\n\nOnce you recognize the pattern, you gain the ability to change it.",
        tags: ["Self Awareness", "Emotional Growth"]
    },
    {
        title: "Emotional Strength Is Not Suppression",
        content: "Controlling emotions does not mean ignoring them.\n\nIt means acknowledging what you feel without letting it dictate your actions.\n\nYou can feel anger without acting aggressively.\nYou can feel fear without avoiding challenges.\n\nTrue strength comes from managing emotions wisely, not pretending they don’t exist.",
        tags: ["Emotional Intelligence"]
    },
    {
        title: "High Performers Master Their Reactions",
        content: "The most successful people are not free from emotions.\n\nThey simply respond differently.\n\nThey pause.\nThey analyze the situation.\nThey choose responses that align with long-term goals.\n\nThis ability to think before reacting often separates leaders from followers.",
        tags: ["Success Mindset", "Emotional Control"]
    },
    {
        title: "The STOP Method",
        content: "When emotions rise, try this simple technique:\n\nS – Stop what you're doing\nT – Take a slow breath\nO – Observe your thoughts and feelings\nP – Proceed with a conscious response\n\nThis method interrupts automatic reactions and gives your rational mind time to regain control.",
        tags: ["Emotional Regulation", "Mindfulness"]
    },
    {
        title: "Slow Breathing Calms the Brain",
        content: "Breathing patterns influence your nervous system.\n\nSlow breathing signals safety to the brain.\n\nTry this simple exercise:\n\nInhale for 4 seconds\nHold for 4 seconds\nExhale for 6 seconds\n\nRepeat several times.\n\nThis activates your body's calming system and helps restore clear thinking.",
        tags: ["Stress Relief", "Emotional Control"]
    },
    {
        title: "Interpretations Create Emotions",
        content: "Two people can experience the same event but react completely differently.\n\nThe difference is interpretation.\n\nIf you interpret feedback as an attack, you feel anger.\nIf you interpret it as improvement, you feel motivation.\n\nChanging the story you tell yourself can transform your emotional response.",
        tags: ["Mindset", "Cognitive Awareness"]
    },
    {
        title: "Labeling Emotions Reduces Their Power",
        content: "Instead of saying “I feel bad,” get specific.\n\nAre you feeling:\n• frustrated\n• disappointed\n• anxious\n• hurt\n\nNaming emotions activates the rational part of the brain and reduces emotional intensity.\n\nClarity creates control.",
        tags: ["Emotional Awareness"]
    },
    {
        title: "Your Body Can Reset Your Mind",
        content: "Physical actions can shift emotional states.\n\nWalking, stretching, or exercising helps release stress hormones built during emotional reactions.\n\nMovement allows your body to process emotional energy rather than letting it build inside you.\n\nSometimes the best emotional reset is simply moving your body.",
        tags: ["Stress Relief", "Mental Health"]
    },
    {
        title: "Perspective Reduces Emotional Intensity",
        content: "When something upsetting happens, ask yourself:\n\n“How important will this feel in one week?”\n\nOften, problems that feel overwhelming today will seem small later.\n\nThis shift in perspective helps you respond calmly rather than react emotionally.",
        tags: ["Perspective", "Emotional Control"]
    },
    {
        title: "Emotional Energy Can Become Motivation",
        content: "Anger, frustration, and disappointment contain energy.\n\nInstead of directing that energy toward conflict, redirect it toward improvement.\n\nUse it to work harder.\nSolve problems.\nBuild something better.\n\nNegative emotions can become powerful fuel when used wisely.",
        tags: ["Personal Growth", "Mindset"]
    },
    {
        title: "Fear Often Points Toward Growth",
        content: "The things that scare us often represent opportunities for growth.\n\nFear signals uncertainty, but uncertainty is where learning happens.\n\nCourage is not the absence of fear.\nIt is taking action despite it.",
        tags: ["Growth Mindset"]
    },
    {
        title: "Emotional Reactions Are Habits",
        content: "Every time you react impulsively, you reinforce that habit.\n\nEvery time you pause and respond thoughtfully, you build a new pattern.\n\nOver time, these patterns become automatic.\n\nYour future emotional responses are shaped by the choices you make today.",
        tags: ["Habit Formation", "Emotional Intelligence"]
    },
    {
        title: "Calm Is Contagious",
        content: "Emotions spread between people.\n\nWhen someone reacts emotionally, others often mirror that reaction.\n\nBut calmness spreads too.\n\nOne person staying composed can stabilize an entire conversation or team.",
        tags: ["Leadership", "Emotional Intelligence"]
    },
    {
        title: "Difficult Conversations Require Calm Minds",
        content: "When emotions rise during conflict, productive communication disappears.\n\nStaying calm allows you to:\n\n• listen clearly\n• ask better questions\n• find real solutions\n\nEmotional control often turns arguments into conversations.",
        tags: ["Communication Skills"]
    },
    {
        title: "Emotional Control Improves Decisions",
        content: "Impulsive decisions often lead to regret.\n\nWhen emotions are high, delay important choices.\n\nClarity returns once the emotional wave passes.\n\nThe best decisions are made when emotions and logic work together.",
        tags: ["Decision Making"]
    },
    {
        title: "Stress Tolerance Can Be Trained",
        content: "Just like muscles grow stronger through exercise, emotional resilience grows through controlled challenges.\n\nCold exposure, intense workouts, or public speaking practice teach your nervous system to stay calm under stress.\n\nThis preparation helps you handle real pressure when it arrives.",
        tags: ["Resilience"]
    },
    {
        title: "Your Environment Influences Your Emotions",
        content: "The people you spend time with affect your emotional patterns.\n\nIf you are surrounded by drama and negativity, emotional reactivity becomes normal.\n\nSurrounding yourself with calm, disciplined people strengthens your own emotional stability.",
        tags: ["Personal Development"]
    },
    {
        title: "Emotional Mastery Builds Confidence",
        content: "Confidence comes from knowing you can handle difficult situations.\n\nEach time you manage your emotions effectively, you prove to yourself that you are capable.\n\nOver time, this creates a deep sense of inner strength.",
        tags: ["Confidence"]
    },
    {
        title: "Emotional Control Is a Daily Practice",
        content: "Like fitness, emotional strength develops through consistent practice.\n\nSmall habits such as reflection, breathing exercises, and mindfulness strengthen emotional awareness.\n\nWith time, calm responses become automatic.",
        tags: ["Self Improvement"]
    },
    {
        title: "Your Reputation Is Built in Difficult Moments",
        content: "People remember how you behave when things go wrong.\n\nStaying calm during pressure creates trust and respect.\n\nEmotional reactions fade quickly.\nBut reputations last for years.",
        tags: ["Leadership"]
    },
    {
        title: "The Ultimate Power Is Self-Control",
        content: "You cannot control every situation.\nYou cannot control other people.\n\nBut you can control how you respond.\n\nAnd that single ability changes everything.\n\nWhen you master your reactions, you master your life.",
        tags: ["Emotional Mastery", "Personal Growth"]
    }
];

async function ensureUser() {
    console.log(`Checking user: ${USER_EMAIL}`);
    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(USER_EMAIL);
        console.log(`ℹ️ User already exists: ${userRecord.uid}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            userRecord = await auth.createUser({
                email: USER_EMAIL,
                password: "Mindset@Guide2024",
                displayName: USER_DISPLAY_NAME,
                photoURL: USER_AVATAR
            });
            console.log(`✅ Created new user: ${userRecord.uid}`);
        } else {
            throw error;
        }
    }

    const uid = userRecord.uid;

    await db.collection('users').doc(uid).set({
        uid,
        displayName: USER_DISPLAY_NAME,
        username: USER_USERNAME.toLowerCase(),
        email: USER_EMAIL,
        bio: USER_BIO,
        photoURL: USER_AVATAR,
        role: "Academy",
        isIncognito: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    console.log("✅ Firestore profile updated.");
    return uid;
}

async function publishPost(uid, p, index) {
    const postNum = index + 1;
    const BASE_MS = Date.now() - (30 - index) * 5 * 60 * 1000;
    const createdAt = Timestamp.fromMillis(BASE_MS);

    const postDoc = {
        title: p.title,
        content: `${p.title}\n\n${p.content}\n\n${postNum}/30`,
        authorId: uid,
        authorName: USER_USERNAME,
        authorPhoto: USER_AVATAR,
        categoryId: "psychology-mental-health",
        categoryName: "Psychology",
        tags: p.tags,
        createdAt,
        likes: 0,
        commentsCount: 0,
        likeCount: 0,
        style: {
            background: "#0c1a16",
            color: "#e2e8f0",
            textAlign: "center",
            fontFamily: "Outfit, sans-serif",
        },
        isSensitive: false,
        isAnonymous: false,
        postNumber: postNum,
        totalPosts: 30,
    };

    const docRef = await db.collection('posts').add(postDoc);
    return docRef.id;
}

async function main() {
    console.log("🚀 Starting Emotional Control Seeder (Admin)...");
    const uid = await ensureUser();

    console.log(`Publishing ${POSTS_RAW.length} posts...`);
    for (let i = 0; i < POSTS_RAW.length; i++) {
        const id = await publishPost(uid, POSTS_RAW[i], i);
        console.log(`  [${i+1}/30] Published: ${id}`);
    }

    console.log("🎉 Success! 30 Emotional Control posts are live.");
    process.exit(0);
}

main().catch(err => {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
});
