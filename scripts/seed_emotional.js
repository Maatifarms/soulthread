
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBcpOg9-ZKbEDkPGI3hHlrvekwh4PPHrCY",
  authDomain: "soulthread-15a72.firebaseapp.com",
  projectId: "soulthread-15a72",
  storageBucket: "soulthread-15a72.firebasestorage.app",
  messagingSenderId: "813685915255",
  appId: "1:813685915255:web:553165fc25cc38f5121072",
  measurementId: "G-S96ZQPBJLJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const posts = [
  {
    title: "Your First Reaction Is Not Always the Best Response",
    content: "When something triggers you, your brain reacts instantly. Your heart races, your mind forms judgments, and you feel an urge to respond immediately.\n\nBut this first reaction often comes from the emotional part of the brain, not the rational one. The real power lies in the pause between the trigger and your response.\n\nWhen you give yourself even a few seconds to think, you allow logic to guide your actions instead of impulse.\n\nTakeaway: Next time you feel triggered, count to five before saying a word. Let the initial wave pass.",
    tags: ["Emotional Control", "Self Awareness", "Mindfulness"]
  },
  {
    title: "The Cost of Emotional Reactions",
    content: "A single emotional reaction can damage things that took years to build. An angry message, a harsh comment, a defensive reply.\n\nThese moments may feel justified in the moment, but they often create long-term consequences. Learning to pause before reacting protects your reputation, relationships, and peace of mind.\n\nTakeaway: Ask yourself, 'Will I regret this reaction in an hour?' If the answer is yes, wait until the emotion subsides.",
    tags: ["Intelligence", "Control", "Wisdom"]
  },
  {
    title: "The Space Between Trigger and Response",
    content: "Viktor Frankl once said, 'Between stimulus and response there is a space. In that space is our power to choose our response.'\n\nExpansion of this space is the goal of emotional maturity. When the space is small, we react. When the space is large, we choose.\n\nTakeaway: Practice deep breathing when you feel a stimulus. Each breath expands that space.",
    tags: ["Psychology", "Freedom", "Choice"]
  },
  {
    title: "Emotions are Information, Not Directions",
    content: "Anger tells you a boundary was crossed. Sadness tells you something you care about was lost. Fear tells you there's a threat.\n\nListen to the message, but don't let the emotion drive the car. You are the driver; the emotion is just a dashboard light.\n\nTakeaway: When you feel a strong emotion, label it: 'I am feeling anger because...' and then decide how to act based on your values, not the feeling.",
    tags: ["Insights", "Awareness", "Growth"]
  },
  {
    title: "Validating Yourself",
    content: "You don't need someone else to agree with your feelings for them to be valid. However, validation doesn't mean your reaction is helpful.\n\nYou can say, 'It makes sense that I feel frustrated,' without letting that frustration dictate a destructive behavior.\n\nTakeaway: Spend 2 minutes a day acknowledging your feelings without trying to change them or act on them.",
    tags: ["Self Love", "Validation", "Peace"]
  },
  {
    title: "The Power of 'Not Now'",
    content: "When an intense emotion demands action, give it a rain check. Tell yourself, 'I am allowed to be angry, but I will not discuss this until 4 PM.'\n\nUsually, by the time the appointment arrives, the intensity has dropped, and your perspective has cleared.\n\nTakeaway: Postpone difficult conversations by at least 30 minutes when you're feeling emotionally charged.",
    tags: ["Maturity", "Boundaries", "Strategy"]
  },
  {
    title: "Observing the Storm",
    content: "Imagine your mind is the sky and your emotions are weather patterns. Storms are loud and dark, but they always pass. The sky remains throughout.\n\nYou are the sky. The anger, the anxiety, the jealousy—they are just clouds passing through.\n\nTakeaway: Close your eyes and visualize the emotion as a cloud drifting away. You are the vast background.",
    tags: ["Visualization", "Zen", "Perspective"]
  },
  {
    title: "Emotional Breath",
    content: "Your physiology and your emotions are linked. You cannot be in a state of 'fight or flight' while taking slow, deep diaphragmatic breaths.\n\nBy controlling your breath, you send a signal to your nervous system that you are safe, regardless of what's happening externally.\n\nTakeaway: Use the 4-7-8 breathing technique (inhale 4, hold 7, exhale 8) whenever you feel a surge of emotion.",
    tags: ["Biology", "Calm", "Technique"]
  },
  {
    title: "The Anchor in the Gale",
    content: "In moments of high stress, find one physical sensation to focus on. The feeling of your feet on the floor, the texture of a stone, or the coolness of water.\n\nThis grounds you in the physical reality and pulls you out of the emotional whirlpool in your mind.\n\nTakeaway: Carry a small 'worry stone' or token in your pocket to touch when you need instant grounding.",
    tags: ["Grounding", "Physicality", "Presence"]
  },
  {
    title: "Detaching from the Outcome",
    content: "Much of our emotional turmoil comes from trying to control things we can't. We want people to act a certain way or situations to go perfectly.\n\nTrue control is internal. You control your effort and your character. The rest belongs to the world.\n\nTakeaway: Identify one thing you are trying to control right now and mentally 'release' it. Focus only on your next right step.",
    tags: ["Philosophy", "Release", "Stoicism"]
  },
  {
    title: "The Language of Calm",
    content: "The words you use to describe your experience change your experience. Instead of saying 'This is a disaster,' try 'This is a challenge I am currently navigating.'\n\nSoftening your language softens your emotional response.\n\nTakeaway: Replace 'I have to' with 'I get to' and 'This is impossible' with 'This is new.'",
    tags: ["Language", "Mindset", "Reframing"]
  },
  {
    title: "Compassion for the Inner Child",
    content: "Often, our biggest emotional reactions are triggered by old wounds. The part of you that feels abandoned or unheard is usually much younger than you are now.\n\nReacting with harshness only hurts that part more. React with the kindness you would show a child.\n\nTakeaway: When you feel small or hurt, imagine yourself giving your younger self a hug. Tell them, 'I've got this now.'",
    tags: ["Healing", "Compassion", "Inner Child"]
  },
  {
    title: "Setting Internal Boundaries",
    content: "You can't always set boundaries with others, but you can always set them with yourself. Decide what you will and will not allow into your mental space.\n\nYou can refuse to participate in your own downward spiral by changing your focus.\n\nTakeaway: When you catch yourself ruminating, literally say 'Stop' out loud and change your physical location.",
    tags: ["Boundaries", "Focus", "Discipline"]
  },
  {
    title: "The 'Five Fold' Why",
    content: "To understand a drive, ask 'Why?' five times. 'I'm angry.' Why? 'He was late.' Why does that matter? 'It feels disrespectful.' Why does that hurt? 'I feel my time isn't valued.' Why is that scary? 'I'm afraid I'm not important.'\n\nNow you're dealing with the real issue, not just the lateness.\n\nTakeaway: Use the 'Why' chain to find the root of your next big emotion.",
    tags: ["Analysis", "Truth", "Discovery"]
  },
  {
    title: "Resilience is a Muscle",
    content: "Every time you choose to remain calm in a difficult situation, you are training your brain. It feels hard because it is a workout for your prefrontal cortex.\n\nThe more you do it, the more natural it becomes.\n\nTakeaway: Look at every minor annoyance as a 'rep' in the gym of emotional control.",
    tags: ["Training", "Neuroplasticity", "Strength"]
  },
  {
    title: "Reframing the Narrative",
    content: "We don't react to facts; we react to the stories we tell ourselves about the facts. If someone doesn't text back, the fact is 'no text.' The story is 'they don't care.'\n\nChange the story, and the emotion changes too.\n\nTakeaway: Write down a recurring negative thought and find three alternative (and positive) explanations for the same event.",
    tags: ["Narrative", "Perception", "Logic"]
  },
  {
    title: "The Wisdom of Silence",
    content: "You don't have to have an opinion on everything. You don't have to respond to every criticism. Sometimes, the most powerful thing you can do is say nothing.\n\nSilence is not weakness; it is the ultimate expression of self-possession.\n\nTakeaway: Try to go through one hour of your day without offering a judgment or opinion on anything.",
    tags: ["Silence", "Power", "Presence"]
  },
  {
    title: "Processing vs Rumination",
    content: "Processing leads to a resolution or acceptance. Rumination is a loop that leads only to more distress.\n\nIf you aren't finding a solution or a new insight, you are ruminating. Move your body to break the loop.\n\nTakeaway: If you've been thinking about the same problem for 15 minutes without progress, go for a walk or do 20 jumping jacks.",
    tags: ["Action", "Mental Health", "Movement"]
  },
  {
    title: "Grounding in the Present",
    content: "Anxiety is living in the future. Regret is living in the past. Peace is living in the right now.\n\nYour emotions often chase ghosts of things that haven't happened or things that are already over.\n\nTakeaway: Use the 5-4-3-2-1 technique: 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
    tags: ["Presence", "Senses", "Peace"]
  },
  {
    title: "Letting Go of Control",
    content: "Stress is the resistance to what is. When we accept reality as it is—not as we wish it were—the emotional friction disappears.\n\nAcceptance isn't agreement; it's simply acknowledging the starting point.\n\nTakeaway: Say the words 'It is what it is' and mean it for one thing you're currently fighting against.",
    tags: ["Acceptance", "Surrender", "Freedom"]
  },
  {
    title: "The Gift of Acceptance",
    content: "When you accept that you feel bad, you stop feeling bad about feeling bad. This removes the secondary layer of suffering.\n\nIt's okay to not be okay. Let the feeling exist without judging it.\n\nTakeaway: Next time you feel sad or anxious, tell yourself: 'This is what a human being feels like sometimes. It's okay.'",
    tags: ["Humanity", "Grace", "Acceptance"]
  },
  {
    title: "Mindful Responding",
    content: "A mindful response is filtered through your values. A reactive response is filtered through your wounds.\n\nBefore you speak, ask: 'Does this reflect the person I want to be?'\n\nTakeaway: Choose one value (e.g., Kindness, Integrity, Honesty) to be your 'filter' for the day.",
    tags: ["Values", "Integrity", "Mindfulness"]
  },
  {
    title: "Emotional Literacy",
    content: "The more specifically you can name an emotion, the less power it has over you. Instead of 'bad,' are you 'disappointed,' 'exhausted,' 'overlooked,' or 'insecure?'\n\nNaming it 'tames' it.\n\nTakeaway: Look up an 'Emotions Wheel' and find the exact word for your current state.",
    tags: ["Education", "Literacy", "Self Mastery"]
  },
  {
    title: "The Ripple Effect",
    content: "Your emotional state affects everyone around you. When you remain calm, you give others permission to be calm too.\n\nBy mastering your triggers, you contribute to the peace of your community.\n\nTakeaway: Be the 'calm one' in the room during your next group interaction, no matter what.",
    tags: ["Community", "Impact", "Leadership"]
  },
  {
    title: "Investing in Peace",
    content: "Every morning, set an intention for your emotional state. 'Today, I will prioritize my peace over being right.'\n\nWhen you value your peace more than your ego, control becomes effortless.\n\nTakeaway: Spend the first 5 minutes of your day in total silence, setting your intention.",
    tags: ["Intention", "Ego", "Peace"]
  },
  {
    title: "The Value of Vulnerability",
    content: "True emotional control isn't about being a robot. It's about being honest with your feelings without being overwhelmed by them.\n\nSharing your struggle is a sign of strength, not weakness.\n\nTakeaway: Share one small emotional challenge with a trusted friend today.",
    tags: ["Connection", "Strength", "Vulnerability"]
  },
  {
    title: "Patience with the Process",
    content: "You wouldn't expect to run a marathon after one day of training. Emotional mastery is a lifelong practice.\n\nBe patient with your failures. They are your greatest teachers.\n\nTakeaway: Forgive yourself for a recent emotional 'slip up.' You are learning.",
    tags: ["Patience", "Learning", "Forgiveness"]
  },
  {
    title: "The Strength of Softness",
    content: "Bridges that are rigid break in the wind. Bridges that have some 'give' survive the hurricane.\n\nBeing flexible and soft in your responses is what keeps you standing when life gets loud.\n\nTakeaway: Try to find a flexible compromise in your next disagreement.",
    tags: ["Flexibility", "Softness", "Resilience"]
  },
  {
    title: "Choosing Your Battles",
    content: "Not everything deserves your attention. Not everything deserves your reaction. Guard your energy like it's gold.\n\nAsk: 'Will this matter in five years?' If not, don't give it more than five minutes of your anger.\n\nTakeaway: Intentionally ignore one minor annoyance today that would usually bother you.",
    tags: ["Energy", "Focus", "Wisdom"]
  },
  {
    title: "The Final Mastery: Yourself",
    content: "The greatest victory is not over others, but over your own impulses. When you can sit with any feeling and not be moved to a destructive act, you are truly free.\n\nThis is the goal of SoulThread.\n\nTakeaway: Remind yourself today: 'I am the master of my reaction. I am the captain of my soul.'",
    tags: ["Freedom", "Mastery", "SoulThread"]
  }
];

const authorId = "emotional_architect_2026";
const authorName = "SereneObserver";
const authorPhotoURL = "https://api.dicebear.com/7.x/avataaars/svg?seed=SereneObserver";

async function seed() {
  console.log("Seeding Emotional Control posts...");
  const userRef = doc(db, 'users', authorId);
  await setDoc(userRef, {
    uid: authorId,
    displayName: authorName,
    photoURL: authorPhotoURL,
    role: 'user',
    bio: "Guiding you through the storms of the mind toward a horizon of lasting peace and self-mastery. 🌿",
    interactions: { followers: 1205, following: 84 },
    stats: { posts: 30, threads: 12, connections: "1.2k" },
    social: { website: "soulthread.in", twitter: "@serenity" },
    createdAt: new Date().toISOString()
  });

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    // Set createdAt in descending order (last post is newest)
    const date = new Date();
    date.setMinutes(date.getMinutes() - (30 - i)); 
    
    await addDoc(collection(db, 'posts'), {
      ...post,
      authorId,
      authorName,
      authorPhotoURL,
      authorRole: 'user',
      createdAt: date.toISOString(),
      type: 'text',
      reactionCounts: { "🙏": Math.floor(Math.random() * 50) + 10, "❤️": Math.floor(Math.random() * 30) + 5 },
      commentsCount: 0
    });
    console.log(`Added: ${post.title}`);
  }
  console.log("Done!");
}

seed().catch(console.error);
