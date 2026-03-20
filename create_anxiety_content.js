
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const project = 'soulthread-15a72';
initializeApp({ projectId: project });

const db = getFirestore();
const auth = getAuth();

const postsData = [
    {
        title: "Anxiety Is a Signal, Not an Enemy",
        content: "Anxiety often feels like something attacking you, but it’s actually your brain trying to protect you. Your mind evolved to scan for danger so you could survive. The problem is that this alarm system sometimes becomes too sensitive in modern life.\n\nInstead of fighting anxiety, try observing it. Ask yourself: “What is my mind trying to protect me from right now?”\n\nSometimes simply understanding the signal reduces the intensity of the feeling.\n\nTry this: Take three slow breaths and simply notice your thoughts without judging them.",
        tags: ["Anxiety", "Mental Health", "Self Awareness"]
    },
    {
        title: "Your Brain Is Wired to Notice Danger",
        content: "Human brains are built with something called a negativity bias. This means your mind naturally focuses more on possible threats than positive outcomes. Thousands of years ago, this helped humans survive predators and dangerous environments. But today, this same system can make everyday situations feel like emergencies.\n\nWhen you notice yourself imagining worst-case scenarios, remind yourself: “My brain is just doing its job.” Then gently bring your focus back to the present moment.",
        tags: ["Anxiety", "Overthinking", "Mind Awareness"]
    },
    {
        title: "Anxiety Loves Uncertainty",
        content: "One of the biggest triggers for anxiety is uncertainty. Your mind wants to know what will happen next so it can feel safe. But life rarely offers guarantees. The more we try to control every outcome, the more anxious we become.\n\nA powerful shift is learning to replace the question “What if something goes wrong?” with “Whatever happens, I will handle it.” Trusting your ability to respond often reduces the need to control everything.",
        tags: ["Anxiety", "Uncertainty", "Mindset"]
    },
    {
        title: "Stop Fighting Your Thoughts",
        content: "Many people try to eliminate anxious thoughts completely. Ironically, this often makes them stronger. The mind works like quicksand. The more you struggle against it, the deeper you sink.\n\nInstead of fighting thoughts, try observing them like passing clouds. You might say to yourself: “I notice I’m having anxious thoughts.”\n\nThis creates distance between you and the thought, reducing its power over your emotions.",
        tags: ["Anxiety", "Mindfulness", "Awareness"]
    },
    {
        title: "Your Body Knows How to Calm Down",
        content: "Your body has a natural calming system called the parasympathetic nervous system. Its job is to return you to a state of relaxation after stress. One of the fastest ways to activate it is through slow breathing.\n\nTry this: Breathe in slowly for 4 seconds. Hold for 4 seconds. Exhale slowly for 6 seconds. Repeat for one minute.\n\nThis simple practice sends a signal to your brain that you are safe.",
        tags: ["Anxiety", "Breathing", "Calm Mind"]
    },
    {
        title: "Overthinking Is Not Problem Solving",
        content: "Overthinking often feels productive, but most of the time it simply repeats the same worries again and again. Your brain keeps replaying possible problems without creating real solutions.\n\nWhen you notice overthinking starting, ask yourself: “Is this thought helping me solve something right now?”\n\nIf the answer is no, gently shift your focus to something practical or grounding in the present moment.",
        tags: ["Anxiety", "Overthinking", "Mental Clarity"]
    },
    {
        title: "Perfectionism Feeds Anxiety",
        content: "Perfectionism creates a constant pressure to avoid mistakes. This pressure keeps your mind in a permanent state of alert. The truth is that perfection doesn’t exist. Everyone makes mistakes while learning and growing.\n\nInstead of aiming for perfection, try aiming for progress. Ask yourself: “What is the next small step I can take?”\n\nProgress reduces anxiety far more effectively than perfection ever will.",
        tags: ["Anxiety", "Perfectionism", "Growth Mindset"]
    },
    {
        title: "Anxiety Lives in the Future",
        content: "Anxiety almost always comes from thinking about what might happen next. Your mind jumps ahead to possible problems and treats them as if they are already real. But right now, in this exact moment, you are usually safe.\n\nTry grounding yourself by noticing: 5 things you can see, 4 things you can touch, 3 things you can hear. This brings your mind back to the present.",
        tags: ["Anxiety", "Mindfulness", "Present Moment"]
    },
    {
        title: "Your Thoughts Are Not Facts",
        content: "An anxious mind can make imagined situations feel completely real. But thoughts are simply mental events, not guaranteed truths.\n\nNext time your mind says “This will definitely go wrong”, pause and ask: “What evidence do I actually have?”\n\nThis small question can interrupt the cycle of catastrophic thinking.",
        tags: ["Anxiety", "Cognitive Awareness", "Mental Health"]
    },
    {
        title: "Anxiety Often Comes From Control",
        content: "The anxious mind wants to control everything: the future, other people, every possible outcome. But control is mostly an illusion. Life is unpredictable.\n\nPeace often comes from focusing only on what you can influence today. Your effort matters. Your actions matter. But the final outcome is rarely fully in your control.",
        tags: ["Anxiety", "Letting Go", "Mental Peace"]
    },
    {
        title: "Your Nervous System Needs Movement",
        content: "When anxiety builds up, stress hormones accumulate in your body. Physical movement helps release them. You don’t need intense workouts. A simple 10-minute walk can help your body reset.\n\nMovement sends a signal to your brain that the danger has passed. Sometimes the fastest way to calm your mind is simply to move your body.",
        tags: ["Anxiety", "Movement", "Stress Relief"]
    },
    {
        title: "The Fear of Anxiety Creates More Anxiety",
        content: "After experiencing anxiety or panic once, many people begin worrying about feeling anxious again. This is called anticipatory anxiety. Ironically, fearing anxiety often triggers it.\n\nA helpful shift is reminding yourself: “Anxiety is uncomfortable, but it is temporary.” When you stop fearing the feeling itself, the intensity often decreases.",
        tags: ["Anxiety", "Panic", "Emotional Awareness"]
    },
    {
        title: "Sleep Has a Huge Impact on Anxiety",
        content: "Poor sleep makes your nervous system more sensitive to stress. When you are tired, your brain reacts more strongly to small problems. Protecting your sleep can significantly improve anxiety levels.\n\nTry creating a simple routine: dim lights, reduce screen time, sleep at the same time each night. Your brain resets and recovers during sleep.",
        tags: ["Anxiety", "Sleep", "Mental Health"]
    },
    {
        title: "Your Inner Voice Matters",
        content: "Many anxious people speak to themselves very harshly. They criticize their mistakes and constantly doubt themselves. But imagine speaking to a friend the same way you speak to yourself.\n\nKindness toward yourself is not weakness. It is emotional strength. Supportive self-talk creates an inner environment of safety rather than fear.",
        tags: ["Anxiety", "Self Compassion", "Inner Dialogue"]
    },
    {
        title: "Breathing Can Interrupt Anxiety",
        content: "When anxiety rises, breathing becomes shallow and fast. This tells your brain that something dangerous is happening. Slow breathing sends the opposite signal.\n\nTry this technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. This pattern activates the body’s calming system.",
        tags: ["Anxiety", "Breathing Technique", "Calm"]
    },
    {
        title: "Anxiety Shrinks When You Observe It",
        content: "When anxiety appears, our first instinct is often to escape or suppress it. But observation can be more powerful than resistance. Try noticing the sensation in your body. Where do you feel it? Chest, stomach, shoulders. Simply observing the sensation often reduces its intensity.",
        tags: ["Anxiety", "Awareness", "Emotional Regulation"]
    },
    {
        title: "The Mind Creates Stories",
        content: "Your brain constantly fills gaps in information with stories. Unfortunately, anxious minds often create the most negative version of the story. Example: “They didn’t reply to my message… something must be wrong.”\n\nBut many other explanations exist. Practicing curiosity instead of assumption reduces unnecessary stress.",
        tags: ["Anxiety", "Overthinking", "Perspective"]
    },
    {
        title: "You Are Not Your Thoughts",
        content: "Thoughts come and go throughout the day. But the awareness noticing those thoughts is deeper than them. You are not the worry itself. You are the observer of it.\n\nRecognizing this difference creates powerful emotional distance from anxious thinking.",
        tags: ["Anxiety", "Mindfulness", "Self Awareness"]
    },
    {
        title: "Anxiety Is Temporary",
        content: "Every emotional state rises, peaks, and eventually fades. Even intense anxiety cannot last forever. Reminding yourself of this truth helps your nervous system stay calmer during difficult moments.\n\nLike waves in the ocean, emotions come and go. Your job is not to stop the waves, but to learn how to ride them.",
        tags: ["Anxiety", "Emotional Regulation", "Calm"]
    },
    {
        title: "Self-Compassion Calms the Mind",
        content: "When anxiety appears, many people judge themselves for feeling anxious. But criticism only increases tension.\n\nInstead try saying: “It’s okay to feel this way. I’m doing my best.” Self-compassion creates emotional safety, which helps anxiety settle naturally.",
        tags: ["Anxiety", "Self Compassion", "Emotional Support"]
    }
];

// Summarized posts from 21-50
const morePosts = [
    { title: "Anxiety and the Need for Approval", content: "We often feel anxious because we fear the judgment of others. We try to mold ourselves into what we think they want. But true peace comes from realizing that you cannot control how others perceive you. Focus on your own values and being authentic. When you stop seeking external validation, the mental pressure begins to lift. You are enough as you are." },
    { title: "The Present Moment Is Powerful", content: "Anxiety is a time traveler—it dragged you into a future that hasn't happened yet. The present moment is the only place where you have power. By grounding your attention in what is happening right now, you deprive anxiety of the fuel it needs to grow. Notice your breath, the ground beneath your feet, and the sounds around you. Here, you are safe." },
    { title: "Your Body Stores Stress", content: "Physical tension in your shoulders, neck, and jaw is often the stored energy of anxiety. Your mind and body are deeply connected. By consciously relaxing your muscles, you send a signal to your brain that it's okay to let go. Try a simple body scan today: start at your toes and work your way up, releasing tension in每一处." },
    { title: "Fear Often Points Toward Growth", content: "Sometimes, the anxiety we feel isn't a warning of danger, but a sign that we are stretching our comfort zone. Stepping into the unknown is naturally scary. Instead of seeing fear as a reason to stop, see it as a companion on your journey toward growth. It means you are doing something that matters to you." },
    { title: "Calm Is a Skill", content: "Many people think they are either 'born calm' or 'born anxious.' But calm is actually a skill that can be developed over time. Just like learning to play an instrument, it takes practice. Each time you choose a deep breath over a spiral, you are training your nervous system to respond differently. Be patient with yourself." },
    { title: "Journaling Clears Mental Noise", content: "Worries often feel larger and more chaotic when they are trapped in your head. Getting them out onto paper gives them a definite shape and size. It allows your brain to stop looping the same thoughts because they have been 'recorded.' Try writing for 10 minutes tonight; you'll be surprised at the mental space it creates." },
    { title: "You Can Rewire Your Brain", content: "Thanks to neuroplasticity, your brain is not fixed. You can build new neural pathways that favor calm over panic. This doesn't happen overnight, but through small, consistent actions. Each time you practice mindfulness or self-compassion, you are physically changing your brain. Every small effort counts in the long run." },
    { title: "Uncertainty Is Part of Life", content: "The anxious mind tries to build a bridge across the unknown using 'what if' scenarios. But uncertainty is the natural state of life. Learning to sit with the discomfort of not knowing is one of the most powerful things you can do. Instead of seeking certainty, build your capacity to handle whatever comes." },
    { title: "Grounding Through Your Senses", content: "When your mind is racing, your senses are the anchor that can pull you back to reality. Try the 5-4-3-2-1 technique: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste. This shifts your brain's focus from internal worry to external reality." },
    { title: "Your Breath Is Always Available", content: "You don't need special equipment or a quiet room to calm your anxiety. Your breath is a tool you carry with you every second. It is the direct remote control for your nervous system. Even a single deep, conscious breath can interrupt a stress response and bring you back to a state of balance." },
    { title: "Anxiety and the Body", content: "Anxiety often reduces when we move our attention from the storm in our head to the sensations in our body. Notice the weight of your body in the chair or the feeling of air against your skin. By inhabiting your body fully, you leave less room for the mind to create imaginary problems. Your body is always in the present." },
    { title: "Progress Matters More Than Perfection", content: "We often feel anxious because we've set a bar for ourselves that is impossible to reach. Perfectionism is just anxiety in a suit. Release yourself from the burden of getting it right every time. Focus on showing up and doing the next right thing. Small, imperfect steps are what lead to lasting change and mental peace." },
    { title: "Worry Steals Your Peace", content: "Worrying about the future doesn't prevent problems—it just steals the peace you could be enjoying right now. It is a form of payment for a debt you might never owe. Remind yourself that you have handled every challenge in your past, and you will handle the ones in your future. Give yourself permission to be here now." },
    { title: "Small Actions Break Cycles", content: "Overthinking is a loop that can paralyze you. The best way to break it is through action. It doesn't have to be a big action; even washing a dish or making a bed can interrupt the cycle. Action moves your energy from stagnant thought into productive movement, which naturally lowers anxiety levels." },
    { title: "Nature's Calming Effect", content: "Spending time in nature has been scientifically proven to lower cortisol levels and calm the nervous system. The rhythm of the natural world—the rustle of leaves, the flow of water—is inherently soothing. If you're feeling overwhelmed, try to find a patch of green or look at the sky. Let nature remind you of the bigger picture." },
    { title: "Fear and Curiosity", content: "Fear loses much of its power when we examine it with curiosity instead of judgment. Instead of saying 'I hate this feeling,' try saying 'That's interesting, I wonder why I'm feeling this right now?' Curiosity opens up mental space and replaces the 'threat' signal with a 'learning' signal. It's much harder to be curious and panicked at the same time." },
    { title: "You Have Survived Everything", content: "When you are in the middle of an anxious moment, it's easy to forget your own strength. But look back: you have survived 100% of your bad days. You have navigated uncertainty and fear many times before. Your track record of getting through difficult things is perfect. Trust that your current self is just as capable." },
    { title: "Rest Is Part of Healing", content: "We often push ourselves to do more when we feel anxious, thinking it will make us feel better. But sometimes, what the nervous system needs is deep rest. Rest is not a reward for work; it is a fundamental requirement for mental health. Give yourself permission to do nothing. Your brain needs time to process and reset." },
    { title: "Sharing Your Burden", content: "Anxiety often grows in the silence of isolation. When we keep our worries to ourselves, they can become distorted and overwhelming. Speaking them out loud to a trusted friend or therapist can make them manageable. Sharing isn't a sign of weakness—it's an act of courage that breaks the hold that fear has on your mind." },
    { title: "Building Resilience", content: "Emotional regulation is like a muscle that grows through use. Each time you successfully navigate an anxious thought without being consumed by it, you are building resilience. You aren't avoiding life; you are learning how to handle it. Resilience doesn't mean you never feel fear; it means you know how to return to your center." },
    { title: "Release Trapped Energy", content: "Anxiety is often just trapped nervous energy looking for an exit. Gentle movement, stretching, or even shaking your hands can help release this build-up. Your body wants to move through the stress response, not stay stuck in it. Listen to what your body is asking for and give it an outlet for that energy." },
    { title: "The Peace of Letting Go", content: "A huge amount of anxiety comes from trying to control things that are outside of our influence. There is a deep peace that comes when we finally accept that we cannot control the weather, the future, or other people. Focus your energy on your own actions and reactions. Letting go is not giving up; it is choosing where to spend your energy." },
    { title: "Confidence and Courage", content: "Confidence is not the absence of fear; it is the belief that you can act in spite of it. Courage is found in the small acts: making that phone call, going to that event, or simply getting out of bed. Every time you act despite feeling anxious, you are building a new version of yourself that is defined by strength, not fear." },
    { title: "Repetition and Calm", content: "Your nervous system learns through repetition. You can't think your way into a calm state once and expect it to stay forever. You have to practice returning to calm, day after day. Like a well-worn path in the woods, the more you practice these techniques, the easier it becomes for your brain to find its way back to peace." },
    { title: "The Power of One Breath", content: "Never underestimate the power of a single calm breath. It is the bridge between your conscious mind and your autonomic nervous system. By consciously slowing your exhale, you are literally telling your heart to beat slower and your brain to relax. It’s the most portable and effective tool you have for mental health." },
    { title: "Mind vs. Truth", content: "Your mind is a survival machine, not a truth-telling machine. It will often prioritize 'safety' over 'accuracy,' leading to cognitive distortions and false alarms. Just because you have a thought doesn't mean it's true. Learn to question your internal narrative. Sometimes the most revolutionary thing you can do is not believe every thought you have." },
    { title: "From Thought to Action", content: "Anxiety thrives in the realm of the theoretical. It withers in the realm of the practical. When you find yourself stuck in a loop of 'what if,' try to do one small, concrete thing. Move a book, water a plant, or write one sentence. Shifting from the abstract to the physical grounds you and diminishes the power of anxious speculation." },
    { title: "Self-Trust and Fear", content: "At its core, much of our anxiety is a lack of trust in ourselves to handle the unknown. But you are resilient. You are adaptable. You have a lifetime of experience in solving problems. By building self-trust, you reduce the fear of what might happen. You know that whatever comes your way, you have the inner resources to face it." },
    { title: "Rewiring Each Moment", content: "Every time you choose a moment of calm over a moment of panic, you are performing a small act of neurosurgery. You are strengthening the connections in your prefrontal cortex and weakening the 'alarm' response of your amygdala. It’s a slow process, but it’s a powerful one. Every calm moment counts." },
    { title: "Acceptance is Peace", content: "Peace begins when you stop fighting your own mind. Resisting anxiety only adds another layer of stress. Instead, try radical acceptance: 'I am feeling anxious right now, and that's okay.' By allowing the feeling to exist without fighting it, you take away its power to cause you further pain. Acceptance is the doorway to peace." }
];

const allPosts = [...postsData, ...morePosts];

async function setup() {
    console.log("Setting up Anxiety posts...");
    
    // 1. Check if user exists, else create
    let uid;
    try {
        const user = await auth.getUserByEmail('anxietycare@soulthread.in');
        uid = user.uid;
        console.log("Existing user found:", uid);
    } catch (e) {
        const user = await auth.createUser({
            email: 'anxietycare@soulthread.in',
            displayName: 'MindfulPath',
            photoURL: 'https://ui-avatars.com/api/?name=Mindful+Path&background=3d8b7f&color=fff'
        });
        uid = user.uid;
        console.log("New user created:", uid);
        
        await db.collection('users').doc(uid).set({
            displayName: 'MindfulPath',
            username: 'anxiety_care',
            bio: 'Simple insights and practical solutions for a quieter mind. #AnxietySupport',
            createdAt: FieldValue.serverTimestamp(),
            role: 'member',
            isAnonymous: false,
            postCount: 0,
            followerCount: 0,
            followingCount: 0
        });
    }

    // 2. Add posts
    console.log(`Adding ${allPosts.length} posts...`);
    const batch = db.batch();
    
    for (let i = 0; i < allPosts.length; i++) {
        const p = allPosts[i];
        const postRef = db.collection('posts').doc();
        batch.set(postRef, {
            authorId: uid,
            authorName: 'MindfulPath',
            title: p.title,
            content: p.content,
            tags: ["ANXIETY", "Mental Health", "Mindfulness"], // Standardized tag as requested
            categoryId: 'anxiety',
            createdAt: FieldValue.serverTimestamp(),
            type: 'text',
            style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
            },
            likesCount: 0,
            commentsCount: 0,
            viewsCount: 0,
            isPublic: true
        });
        
        if ((i + 1) % 50 === 0 || i === allPosts.length - 1) {
            await batch.commit();
            console.log(`Committed batch up to post ${i + 1}`);
        }
    }
    
    // 3. Update user post count
    await db.collection('users').doc(uid).update({
        postCount: FieldValue.increment(allPosts.length)
    });

    console.log("All done!");
}

setup().catch(console.error);
