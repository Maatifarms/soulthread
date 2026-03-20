from PIL import Image, ImageDraw, ImageFont
import os

def generate_post(id, title, statement):
    # Image size
    size = (1080, 1080)
    img = Image.new('RGB', size, color='black')
    draw = ImageDraw.Draw(img)
    
    # Try to load a clean font, fallback to default
    try:
        # Assuming Inter or Outfit might be available on the system or use a standard sans-serif
        font_path = "C:/Windows/Fonts/arialbd.ttf" # Bold Arial for high contrast
        title_font = ImageFont.truetype(font_path, 80)
        num_font = ImageFont.truetype(font_path, 40)
        statement_font = ImageFont.truetype(font_path, 60)
    except:
        title_font = ImageFont.load_default()
        num_font = ImageFont.load_default()
        statement_font = ImageFont.load_default()

    # Draw Post Number
    num_text = f"POST {id} / 30"
    left, top, right, bottom = draw.textbbox((0, 0), num_text, font=num_font)
    w, h = right - left, bottom - top
    draw.text(((1080-w)/2, 200), num_text, fill="white", font=num_font)

    # Draw Title
    left, top, right, bottom = draw.textbbox((0, 0), title, font=title_font)
    w, h = right - left, bottom - top
    draw.text(((1080-w)/2, 450), title, fill="white", font=title_font)

    # Draw Statement - wrapping text if needed
    lines = []
    words = statement.split()
    current_line = []
    for word in words:
        current_line.append(word)
        line_text = " ".join(current_line)
        l, t, r, b = draw.textbbox((0, 0), line_text, font=statement_font)
        w = r - l
        if w > 800:
            current_line.pop()
            lines.append(" ".join(current_line))
            current_line = [word]
    lines.append(" ".join(current_line))

    y_start = 650
    for line in lines:
        l, t, r, b = draw.textbbox((0, 0), line, font=statement_font)
        w, h = r - l, b - t
        draw.text(((1080-w)/2, y_start), line, fill="white", font=statement_font)
        y_start += 80

    # Save
    filename = f"public/assets/neverfinished/post_{str(id).zfill(2)}.png"
    img.save(filename)
    print(f"Generated {filename}")

posts = [
    (1, "THE WORLD CREATES LIMITS", "The world is designed to keep you comfortable and small. Break the mold."),
    (2, "THE SOLO MISSION", "Mastery is a lonely road. You must be comfortable walking it alone."),
    (3, "HOPE IS NOT BELIEF", "Hope is a gamble. Belief is a certainty born from work."),
    (4, "PAIN IS CONFIDENCE", "Real confidence is the ability to endure what others won't."),
    (5, "STOP BLAMING THE PAST", "Your past is a lesson, not a life sentence. Own your future."),
    (6, "RESPONSIBILITY IS FREEDOM", "Total ownership of your life is the only path to real power."),
    (7, "THE GOLDEN HOUR", "How you start your day determines how you win your life."),
    (8, "STOP LIVING THE STORY", "You are the author, not a character in someone else's book."),
    (9, "PROCESS THE PAIN", "Pain held inside becomes a cage. Process it to become free."),
    (10, "CONTROL THE NARRATIVE", "The voice in your head is your most important conversation."),
    (11, "ONE SECOND DECISION", "Greatness is decided in the second you want to quit."),
    (12, "DON'T QUIT IN PANIC", "Decisions made in fear are always wrong. Wait for the calm."),
    (13, "TRAIN LIKE A SOLDIER", "Discipline is the bridge between goals and accomplishment."),
    (14, "THE MENTAL LABORATORY", "Test your limits every day. Experiment with discomfort."),
    (15, "THE SAVAGE ALTER EGO", "Create a version of yourself that doesn't know how to quit."),
    (16, "COMFORT IS THE ENEMY", "If you are comfortable, you are not growing. Get uncomfortable."),
    (17, "DISCIPLINE CHANGES DNA", "Consistency rewires your brain and strengthens your soul."),
    (18, "STOP SEEKING SYMPATHY", "Sympathy is a drug that keeps you weak. Seek strength instead."),
    (19, "HUMILITY IS STRENGTH", "The moment you think you've made it, you've lost."),
    (20, "USE HATE AS FUEL", "Turn negativity into the energy required to prove them wrong."),
    (21, "RECORD YOUR TRUTH", "Be brutally honest with yourself. Facts don't care about feelings."),
    (22, "BUILD YOUR INNER CIRCLE", "You are the average of the people you allow in your space."),
    (23, "SEPARATE FROM LIMITS", "Distance yourself from anyone who doesn't challenge you to grow."),
    (24, "BECOME YOUR OWN LEADER", "Stop looking for a mentor and start being the example."),
    (25, "CREATE YOUR CODE", "Standards are not suggestions. Live by a non-negotiable code."),
    (26, "BREAK IDENTITY LIMITS", "You are not who you were. You are who you decide to be now."),
    (27, "USE PAIN AS ENERGY", "Burn your trauma as the primary fuel for your ambition."),
    (28, "REDEFINE GREATNESS", "Greatness is not a destination. It is the quality of your effort."),
    (29, "EFFORT IS GREATNESS", "Success is temporary. The work is permanent."),
    (30, "THE MISSION NEVER ENDS", "Stay hard. The finish line is just the start of the next race.")
]

for p in posts:
    generate_post(p[0], p[1], p[2])
