import os
from PIL import Image, ImageDraw, ImageFont

# Content for 30 posts
posts = [
    {
        "id": 1,
        "title": "THE ATTENTION FILTER",
        "insight": "Your brain doesn't see the world. It filters it. Focus is the art of exclusion.",
        "takeaway": "Action: Identify one distraction to cut TODAY."
    },
    {
        "id": 2,
        "title": "THE GATEKEEPER (RAS)",
        "insight": "The Reticular Activating System decides what reaches your conscious mind.",
        "takeaway": "Action: Write down your #1 goal to 'tune' your RAS."
    },
    {
        "id": 3,
        "title": "OBSERVATION VS SEEING",
        "insight": "Seeing is passive. Observation is an active interrogation of reality.",
        "takeaway": "Action: Describe a common object in 10 unique details."
    },
    {
        "id": 4,
        "title": "EVOLUTIONARY FOCUS",
        "insight": "Your brain evolved for survival, not spreadsheets. Understand your biology.",
        "takeaway": "Action: Work in 90-minute 'ultradian' cycles."
    },
    {
        "id": 5,
        "title": "THE DISTRACTION CRISIS",
        "insight": "Modern tech is designed to bypass your prefrontal cortex. You are the target.",
        "takeaway": "Action: Put your phone in another room for 2 hours."
    },
    {
        "id": 6,
        "title": "SELECTIVE ATTENTION",
        "insight": "The brain can only handle bits of data at once. Choose your bits wisely.",
        "takeaway": "Action: Focus only on the sound of your breath for 5 mins."
    },
    {
        "id": 7,
        "title": "NEURAL MAPS",
        "insight": "Neurons that fire together, wire together. Focus builds your brain's hardware.",
        "takeaway": "Action: Practice one difficult skill with total intensity."
    },
    {
        "id": 8,
        "title": "THE CHEMISTRY OF FOCUS",
        "insight": "Acetylcholine marks neurons for change. Norepinephrine provides the energy.",
        "takeaway": "Action: Use cold water exposure to spike focus neurochemicals."
    },
    {
        "id": 9,
        "title": "THE DOPAMINE TRAP",
        "insight": "Dopamine is for seeking, not satisfaction. Novelty is the enemy of depth.",
        "takeaway": "Action: Do one 'boring' task without any background noise."
    },
    {
        "id": 10,
        "title": "HYPER AWARENESS",
        "insight": "Elevate your baseline awareness. Notice the 'invisible' patterns around you.",
        "takeaway": "Action: Try to sense the air temperature on your skin now."
    },
    {
        "id": 11,
        "title": "PATTERN RECOGNITION",
        "insight": "Masters see patterns where others see chaos. Focus is the lens.",
        "takeaway": "Action: Identify a recurring habit in your daily routine."
    },
    {
        "id": 12,
        "title": "SENSORY INTELLIGENCE",
        "insight": "Use your senses to anchor your mind to the present moment.",
        "takeaway": "Action: Eat one meal in total silence and focus on taste."
    },
    {
        "id": 13,
        "title": "SELECTIVE IGNORING",
        "insight": "Elite focus is defined more by what you ignore than by what you do.",
        "takeaway": "Action: Say 'No' to one low-value request today."
    },
    {
        "id": 14,
        "title": "OBSERVATION TRAINING",
        "insight": "Sharpness is a muscle. Train it by recalling details from memory.",
        "takeaway": "Action: Look at a scene for 30s, close eyes, recall all."
    },
    {
        "id": 15,
        "title": "MICRO EXPRESSIONS",
        "insight": "Focus on the nuances of human interaction to read the unspoken.",
        "takeaway": "Action: Watch a silent video and guess the emotions."
    },
    {
        "id": 16,
        "title": "TEMPORAL AWARENESS",
        "insight": "Flow states distort time. Learn to track your internal clock.",
        "takeaway": "Action: Guess the time before checking your clock."
    },
    {
        "id": 17,
        "title": "MEMORY & FOCUS",
        "insight": "Attention is the currency of memory. No focus, no retention.",
        "takeaway": "Action: Summarize this post in 3 words from memory."
    },
    {
        "id": 18,
        "title": "MONOTASKING",
        "insight": "Multitasking is a myth. You are just paying a 'switch cost' every time.",
        "takeaway": "Action: Finish one task before opening a new tab."
    },
    {
        "id": 19,
        "title": "SUBCONSCIOUS PATTERNS",
        "insight": "Your brain solves problems while you rest. Trust the process.",
        "takeaway": "Action: Sleep 8 hours to consolidate today's patterns."
    },
    {
        "id": 20,
        "title": "META COGNITION",
        "insight": "Think about your thinking. Be the observer of your own mind.",
        "takeaway": "Action: Ask: 'Why did I just have that thought?'"
    },
    {
        "id": 21,
        "title": "SELF OBSERVATION",
        "insight": "Watch your reactions without judgment. Data over emotion.",
        "takeaway": "Action: Notice your heart rate during a stressful moment."
    },
    {
        "id": 22,
        "title": "THE SHADOW MIND",
        "insight": "Hidden biases and fears distract you. Shine light on them.",
        "takeaway": "Action: Identify one fear that stops you from focusing."
    },
    {
        "id": 23,
        "title": "DISCIPLINE IS ATTENTION",
        "insight": "Discipline is just keeping your focus on the 'long-term self'.",
        "takeaway": "Action: Delay one small gratification for 1 hour."
    },
    {
        "id": 24,
        "title": "DIGITAL PREDATORS",
        "insight": "Algorithms are optimized for your weakness. Be the architect, not the product.",
        "takeaway": "Action: Turn off ALL non-human notifications."
    },
    {
        "id": 25,
        "title": "SENSORY CONTROL",
        "insight": "Control your environment or it will control your mind.",
        "takeaway": "Action: Declutter your physical workspace entirely."
    },
    {
        "id": 26,
        "title": "COGNITIVE DOMINANCE",
        "insight": "Operate at a level where distraction cannot reach you.",
        "takeaway": "Action: Spend 4 hours in 'Deep Work' tomorrow."
    },
    {
        "id": 27,
        "title": "FOCUS EXERCISES",
        "insight": "Stare at a single point for 2 minutes without blinking. This is power.",
        "takeaway": "Action: Do the 'Dot Drill' tonight."
    },
    {
        "id": 28,
        "title": "MIND ARCHITECTURE",
        "insight": "Design a mental blueprint that prioritizes depth over surface.",
        "takeaway": "Action: Map out your ideal 'Focus Day'."
    },
    {
        "id": 29,
        "title": "HYPERFOCUS INTEGRATION",
        "insight": "Focus is not a tool you use. It's the state you live in.",
        "takeaway": "Action: Apply 100% focus to even 'trivial' tasks."
    },
    {
        "id": 30,
        "title": "MASTERY OF ATTENTION",
        "insight": "You are now the Architect. Total control of your mental energy is yours.",
        "takeaway": "Action: Repeat the series. Mastery is a circle."
    }
]

def create_post(post_data, output_path):
    # Image settings
    size = (1080, 1080)
    img = Image.new("RGB", size, color=(0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Try to load a modern font, fallback to default
    try:
        # Common Windows paths for fonts
        font_path = "C:/Windows/Fonts/segoeuib.ttf" # Segoe UI Bold
        font_title = ImageFont.truetype(font_path, 80)
        font_main = ImageFont.truetype(font_path, 40)
        font_small = ImageFont.truetype(font_path, 30)
    except:
        font_title = ImageFont.load_default()
        font_main = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw Header
    header_text = f"POST {post_data['id']} / 30"
    w = draw.textlength(header_text, font=font_small)
    draw.text(((1080-w)/2, 100), header_text, fill=(255, 255, 255), font=font_small)

    # Draw Title (Wrapped if needed)
    title_text = post_data['title']
    w = draw.textlength(title_text, font=font_title)
    draw.text(((1080-w)/2, 400), title_text, fill=(255, 255, 255), font=font_title)

    # Draw Insight
    insight_text = post_data['insight']
    # Simple word wrap for insight
    words = insight_text.split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        line = " ".join(current_line)
        if draw.textlength(line, font=font_main) > 900:
            current_line.pop()
            lines.append(" ".join(current_line))
            current_line = [word]
    lines.append(" ".join(current_line))
    
    y = 550
    for line in lines:
        w = draw.textlength(line, font=font_main)
        draw.text(((1080-w)/2, y), line, fill=(200, 200, 200), font=font_main)
        y += 60

    # Draw Actionable Takeaway (Box or underlined)
    takeaway_text = post_data['takeaway']
    w = draw.textlength(takeaway_text, font=font_main)
    draw.text(((1080-w)/2, 850), takeaway_text, fill=(255, 255, 255), font=font_main)
    
    # Save
    img.save(output_path)

# Ensure directory exists
output_dir = "g:/soulthread/hyperfocus_architect/posts"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Generate 30 posts
for p in posts:
    filename = f"post_{p['id']:02d}.png"
    create_post(p, os.path.join(output_dir, filename))
    print(f"Generated {filename}")

# Create Captions file
with open("g:/soulthread/hyperfocus_architect/captions.md", "w") as f:
    f.write("# Hyperfocus Architect - Instagram Captions\n\n")
    for p in posts:
        f.write(f"## Post {p['id']}/30\n")
        f.write(f"Image: post_{p['id']:02d}.png\n\n")
        f.write(f"**Caption:**\n")
        f.write(f"This is Post {p['id']}/30 of the Hyperfocus Series.\n")
        f.write(f"Follow the account and start from Post 1 to upgrade your brain.\n\n")
        f.write(f"---\n\n")
