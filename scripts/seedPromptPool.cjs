/**
 * seedPromptPool.cjs
 *
 * Seeds the `prompt_pool` Firestore collection with 100 reflection prompts.
 * The rotateDailyPrompt Cloud Function draws from this pool daily.
 *
 * Run once:
 *   node scripts/seedPromptPool.cjs
 *
 * Uses Application Default Credentials:
 *   gcloud auth application-default login
 */

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const PROJECT_ID = 'soulthread-15a72';

if (getApps().length === 0) {
    initializeApp({ projectId: PROJECT_ID });
}
const db = getFirestore();

const PROMPTS = [
    // Emotional depth
    "What's something you've been carrying lately that you haven't said out loud?",
    "What are you pretending to be okay about?",
    "What feeling keeps coming back no matter how hard you try to ignore it?",
    "What would you say if you knew no one who knew you would ever read it?",
    "What's hurting you right now that you've been minimising?",
    "What truth are you not ready to say out loud yet?",
    "What do you say you're okay about that you're actually not?",
    "What are you grieving that you've never called grief?",
    "What's the feeling you're most afraid to admit — even to yourself?",
    "What would the honest version of 'I'm fine' actually sound like today?",

    // Relationships
    "Who do you miss but can't reach out to — and why?",
    "What do you wish someone in your life understood about you?",
    "What's something you've never said to the person you needed to say it to?",
    "Who made you feel small, and did they ever know?",
    "What relationship taught you the most painful lesson?",
    "When did you last feel truly understood by someone?",
    "What would you say to someone who hurt you if there were no consequences?",
    "Who is the person you always pretend to be okay around?",
    "What did someone once say to you that you've never forgotten?",
    "What does love feel like to you when it's real?",

    // Loneliness
    "When do you feel most alone — even around other people?",
    "What does your loneliness feel like when you're completely honest about it?",
    "What's something you want to share but have no one to tell?",
    "What part of you goes unseen in almost every room you walk into?",
    "What would change if someone truly knew all of you?",
    "What do you wish someone would notice without you having to say it?",
    "When was the last time you felt genuinely, completely seen?",
    "What does being seen actually mean to you?",

    // Anxiety & overthinking
    "What thought do you wish your brain would stop returning to?",
    "What's the worst-case scenario you keep rehearsing?",
    "What are you afraid will happen if you let yourself fully relax?",
    "What does anxiety feel like in your body — specifically?",
    "What small thing others don't understand makes you deeply anxious?",
    "Do you overthink the past, the present, or the future most?",
    "What would you do differently if you weren't afraid?",
    "What's the decision you keep avoiding?",
    "What would you stop worrying about if you knew it would be okay?",
    "What's the conversation you've rehearsed but never had?",

    // Self-doubt
    "What do you secretly believe about yourself that you'd never admit publicly?",
    "When do you feel most like an imposter?",
    "What achievement do you still struggle to accept as real?",
    "What would you try if you were certain you wouldn't fail?",
    "What criticism from your past do you still hear in your own voice?",
    "What is something genuinely good about you that you struggle to believe?",
    "When did you first start doubting yourself?",
    "What comparison do you make that isn't fair to yourself?",
    "What would the version of you without self-doubt look like?",
    "What do you need to hear but can't believe when someone says it?",

    // Life direction
    "What did you think your life would look like that it doesn't?",
    "When did you last feel truly alive?",
    "What would you do if you stopped doing what you thought you should?",
    "What dream did you quietly let go of — and why?",
    "What does a life well-lived actually mean to you?",
    "If you could give yourself a year to live differently, what would change?",
    "What version of yourself are you most afraid of becoming?",
    "What are you still waiting to start?",
    "What are you staying in that you know you should leave?",
    "What would you regret not doing more than you'd regret trying and failing?",

    // Childhood & past
    "What do you wish your childhood self knew?",
    "What did you learn about love from the people who raised you?",
    "What did you need as a child that you didn't get?",
    "What childhood moment made you who you are in a way you're still processing?",
    "What did you have to grow up too fast to deal with?",
    "What would you go back and protect yourself from?",
    "What did your younger self deserve that they didn't receive?",
    "What pattern from your childhood do you still see in your adult life?",

    // Workplace & pressure
    "What do you pretend to be fine about professionally?",
    "What are you performing every day that exhausts you?",
    "What would you do professionally if approval didn't matter?",
    "What part of your work self isn't really you?",
    "When did work stop feeling meaningful — and what changed?",
    "What pressure are you carrying that isn't actually yours?",
    "What would you tell your manager or team if there were no professional consequences?",

    // Identity & belonging
    "When do you feel most like yourself?",
    "What part of your identity do you hide in certain spaces?",
    "What do you wish you could accept about yourself?",
    "What label do people put on you that doesn't fit?",
    "What do you believe about yourself that you've never questioned?",
    "Who were you before the world started shaping you?",
    "What do you want more than you've allowed yourself to admit?",

    // Open & raw
    "What's something that broke something in you — and did it ever heal?",
    "What have you been holding for so long you've almost forgotten it's there?",
    "What do you need to forgive yourself for?",
    "What story are you still telling yourself that no longer fits?",
    "What does your silence hold that your words don't?",
    "What would you say if this were the last place you could ever say the true thing?",
    "What are you still angry about that you haven't let yourself admit?",
    "What's the kindest thing you could say to yourself right now?",
    "What do you need from yourself that you keep waiting for others to give you?",
    "If your pain had words, what would it say?",

    // Connection
    "What would it feel like to be fully known by someone and still chosen?",
    "What does trust mean to you — and do you have it?",
    "What do you wish you could say to someone you've lost?",
    "Where do you feel most at home — and when was the last time you were there?",
    "What would you tell someone going through exactly what you went through?",
];

async function seedPromptPool() {
    console.log(`Seeding ${PROMPTS.length} prompts into prompt_pool...`);

    // Check if already seeded
    const existingSnap = await db.collection('prompt_pool').limit(1).get();
    if (!existingSnap.empty) {
        console.log('⚠️  prompt_pool already has documents. Skipping to avoid duplicates.');
        console.log('   Delete the collection first if you want to re-seed.');
        process.exit(0);
    }

    const BATCH_SIZE = 400;
    let seeded = 0;

    for (let i = 0; i < PROMPTS.length; i += BATCH_SIZE) {
        const batch = db.batch();
        PROMPTS.slice(i, i + BATCH_SIZE).forEach(text => {
            const ref = db.collection('prompt_pool').doc();
            batch.set(ref, {
                text,
                used: false,
                usedAt: null,
                createdAt: new Date(),
            });
        });
        await batch.commit();
        seeded += Math.min(BATCH_SIZE, PROMPTS.length - i);
        console.log(`  Seeded ${seeded}/${PROMPTS.length}...`);
    }

    console.log(`\n✅ Done. ${PROMPTS.length} prompts added to prompt_pool.`);
    console.log('   The rotateDailyPrompt function will now pick from this pool daily.');
    process.exit(0);
}

seedPromptPool().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
