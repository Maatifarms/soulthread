
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

// Load service account - Change this path to your actual key location
const serviceAccountPath = 'g:/soulthread/soulthread-admin.json';
let serviceAccount;

if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} else {
    console.error("❌ ERROR: soulthread-admin.json NOT FOUND. Please upload the service account key to the project root.");
    process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const BOT_ID = 'gully_voices_bot';
const BOT_NAME = 'GullyVoices';
const BOT_PHOTO = 'https://api.dicebear.com/7.x/avataaars/svg?seed=gully_voices_bot';

const POVERTY_CONFESSIONS = [
    // --- HINDI POSTS (40) ---
    "गरीबी सिर्फ जेब खाली होना नहीं है, गरीबी वो डर है जो आपको अपने ही दोस्तों से नजरें चुराने पर मजबूर कर देता है क्योंकि आपके पैरों के जूते घिस चुके हैं और उनकी चमक देख कर आपको अपनी औकात याद आ जाती है।",
    "मेरे दादाजी कर्ज में मरे, पिता ने पूरी जिंदगी उस कर्ज को चुकाने में लगा दी और अब 22 साल की उम्र में मैं भी उसी जाल में फंसा हूँ। क्या मेरा खानदान कभी इस दलदल से बाहर निकल पाएगा या ये 'गरीबी' हमारा सरनेम बन गई है?",
    "35 साल की उम्र, दो छोटे बच्चे और महीने का आखिरी हफ्ता। जब मेरी बेटी कहती है कि उसे चॉकलेट खानी है, तो मैं उस पर चिल्ला देता हूँ। गुस्सा उस मासूम पर नहीं, अपनी उस बेबसी पर होता है कि मैं एक 10 रुपये की खुशी भी नहीं दे सकता।",
    "लोग कहते हैं कि सपना देखना फ्री है। पर गरीबी में सपने देखना सबसे महंगा सौदा होता है। जब आप ये सोचकर सो नहीं पाते कि कल सुबह चूल्हा जलेगा या नहीं, तो 'करियर' की बातें मजाक लगने लगती हैं।",
    "हर रोज ऑफिस के बाहर वो महंगी गाड़ियां देखकर मन उदास हो जाता है। मैं दिन-रात मेहनत करता हूँ, फिर भी बस इतना कमा पाता हूँ कि रात को रूखी रोटी मिल सके। ये फासला कभी खत्म होगा?",
    "कॉलेज में जब सब कैंटीन जाते थे, मैं लाइब्रेरी में छुप जाता था। भूख नहीं थी ऐसी बात नहीं है, बस दूसरों के सामने अपना खाली बटुआ खोलने की हिम्मत नहीं थी।",
    "मेरी माँ ने पूरी उम्र दूसरों के घरों में बर्तन माँज कर हमें पढ़ाया। आज जब मैं पहली बार इंटरव्यू के लिए गया, तो मेरे पास ढंग की शर्ट भी नहीं थी। माँ की आँखों में वो आंसू देखकर आज फिर से एक सपना टूट गया।",
    "बीमारी सबसे बड़ी दुश्मन है। अमीर डॉक्टर के पास जाता है, गरीब मौत का इंतजार करता है। कल रात पिता जी को दर्द था, पर अस्पताल जाने के 500 रुपये नहीं थे। सिर्फ दवा मंगवाई और भगवान से प्रार्थना की।",
    "गरीबी इंसान को मौका नहीं देती, वो बस इंसान को काम पर लगा देती है। मुझे पेंटिंग का शौक था, पर अब मैं एक ढाबे पर सफाई करता हूँ। हाथ में ब्रश की जगह जूठन वाला कपड़ा है।",
    "जब पड़ोसी के बच्चे नए कपड़े पहनकर निकलते हैं, तो मैं अपने बच्चों को अंदर कमरे में ले जाता हूँ। उन्हें समझाना मुश्किल है कि दिवाली हमारे लिए सिर्फ एक और साधारण रात है।",
    "शादी के 10 साल बाद भी हम किराए के एक कमरे में रह रहे हैं। मेरी पत्नी कभी कुछ नहीं मांगती, पर उसकी शांत आँखों में वो अनकही इच्छाएं मुझे रोज अंदर ही अंदर काटती हैं।",
    "फेसबुक पर दुनिया की फोटो देखता हूँ, लोग घूम रहे हैं, खा रहे हैं। मुझे लगता है कि मैं किसी और ही दुनिया का हूँ। गरीबी आपको समाज से काट देती है।",
    "एक लड़की के लिए गरीबी और भी मुश्किल है। जब सैनिटरी पैड खरीदने के पैसे न हों और पुराने कपड़े इस्तेमाल करने पड़ें, तो अपनी 'गरिमा' भी बोझ लगने लगती है।",
    "पिता जी का वो पुराना फटा हुआ छाता... आज बारिश में जब मैं भीग रहा था, तो मुझे एहसास हुआ कि उन्होंने कैसे हमारी छत बचाने के लिए खुद को गला दिया। पर आज भी हम वहीं खड़े हैं।",
    "गरीबी में आप कभी 'ना' नहीं कह सकते। चाहे अपमान हो या शोषण, आपको चुपचाप सहना पड़ता है क्योंकि घर में आटा खत्म होने वाला है।",
    "जब राशन कार्ड वाली लाइन में खड़ा होता हूँ, तो वो भीड़ मुझे याद दिलाती है कि हमारे देश में इंसान की कीमत बस एक किलो गेंहू के बराबर है।",
    "मेरी बहन की शादी टूट गई क्योंकि हम दहेज के लिए उनके बराबर की रकम नहीं जुटा पाए। गरीबी सिर्फ घर नहीं तोड़ती, रिश्तों का कत्ल भी करती है।",
    "स्कूल में 'माय फादर' पर निबंध लिखना था। मैंने लिखा - 'वो बहुत बहादुर हैं'। टीचर ने पूछा कैसे? मैंने कहा- 'दो दिन से बिना खाए काम कर रहे हैं ताकि मुझे लंच मिल सके।' क्लास हंस पड़ी।",
    "सरकारी दफ्तरों में हमारी कोई नहीं सुनता। बाबू फाइल दबा कर बैठा है क्योंकि हमारे पास 'चाय-पानी' के पैसे नहीं हैं। क्या न्याय भी सिर्फ अमीरों के लिए बना है?",
    "जब मैं छोटा था, मैं सोचता था कि मेहनत करने से सब मिलता है। आज मजदूरी करते हुए समझ आया कि मेहनत तो गधा भी करता है, पर किस्मत और अवसर अमीरों की बपौती हैं।",
    "त्योहारों से डर लगता है। खुशियों की जगह ये याद दिलाते हैं कि हम कितने पीछे छूट गए हैं। बच्चों को खिलौने न दे पाने का दर्द सबसे बड़ा दर्द है।",
    "मेरी पत्नी का इलाज चल रहा है। डॉक्टर ने फल खिलाने को कहा है। मैं मंडी में गया, सेब का दाम सुना और बिना लिए वापस आ गया। मुझे अपनी ही मर्दानगी पर शर्म आने लगी।",
    "गरीबी आपको चालाक बना देती है। आप हर चीज को 'पैसे' में तोलने लगते हैं। यहाँ तक कि प्यार को भी।",
    "आज बस में किसी ने मुझे धक्का दिया और 'गरीब' कह कर झिड़का। मेरा कसूर सिर्फ इतना था कि मेरे कपड़ों से पसीने की गंध आ रही थी। मेहनत की गंध भी अब गाली बन गई है।",
    "शहर की चकाचौंध के बीच हमारी झुग्गी जैसे कोई दाग है। लोग हमें देखते हैं पर नजरें मिलाना नहीं चाहते, जैसे गरीबी कोई संक्रामक बीमारी हो।",
    "पढ़ाई छोड़ दी ताकि छोटा भाई स्कूल जा सके। अब मैं एक गैरेज में काम करता हूँ। उम्मीद है कि वो वो सब बन पाएगा जो मैं नहीं बन सका।",
    "किराया न देने पर जब मकान मालिक ने सामान बाहर फेंक दिया, तब समझ आया कि इस दुनिया में 'अपना' कहने के लिए चार दीवारें होना कितनी बड़ी बात है।",
    "बूढ़े माता-पिता को छोड़कर शहर आना पड़ा। यहाँ 12 घंटे काम करता हूँ, फिर भी उन्हें दवाई के पैसे नहीं भेज पाता। ये मजबूरी जान ले लेती है।",
    "रात को जब हवा ठंडी होती है, तो वो फटी हुई रजाई हमें एक-दूसरे के करीब रहने को मजबूर करती है। गरीबी में सिर्फ शरीर की गर्मी ही मुफ्त है।",
    "मुझे अच्छे जूते चाहिए थे, अब बस रोटी चाहिए। प्राथमिकताएं बदल जाती हैं जब आप सर्वाइवल के लिए लड़ते हैं।",
    "मेरे दोस्त सब पब जाते हैं, मैं ओवरटाइम करता हूँ। वो लाइफ 'इन्जॉय' कर रहे हैं, मैं लाइफ 'मैनेज' कर रहा हूँ।",
    "पलायन की मजबूरी... अपनी मिट्टी छोड़कर जहाँ काम मिले वहीं चले जाना। घर की बहुत याद आती है, पर खाली हाथ वापस नहीं जा सकता।",
    "मेरी बेटी ने पूछा, 'पापा, ऊपर वाले ने हमें गरीब क्यों बनाया?' मेरे पास कोई जवाब नहीं था। मैंने बस उसे गले से लगा लिया।",
    "जब उधार वाले घर के दरवाजे पर आकर शोर मचाते हैं, तो ऐसा लगता है कि इज्जत की नीलामी हो रही है।",
    "गरीबी में बचपन जल्दी खत्म हो जाता है। खिलौनों की जगह काम के औजार हाथ में आ जाते हैं।",
    "35 साल का हूँ, कुंवारा हूँ। कोई अपनी बेटी मुझे नहीं देना चाहता क्योंकि 'आर्थिक स्थिरता' नहीं है। क्या मेरे दिल की कोई कीमत नहीं?",
    "अस्पताल के फर्श पर सोई हुई वो रात... जब डॉक्टर ने कहा 'दवा लाओ वरना मरीज बच नहीं पाएगा' और मेरी जेब में सिर्फ 20 रुपये थे।",
    "सूट वाले लोग अक्सर हमें अनदेखा कर देते हैं। हम उनके लिए सिर्फ 'मैनपावर' हैं, इंसान नहीं।",
    "गरीबी में हँसी भी कम हो जाती है। घर में बस चिंताओं की गूँज सुनाई देती है।",
    "एक दिन आएगा जब हम भी इस कमरे से बाहर निकलेंगे... यही बोलकर माँ पिछले 15 सालों से हमें सुला रही है।",

    // --- ENGLISH POSTS (10) ---
    "Poverty isn't just about the lack of money; it’s about the lack of options. It's the silent scream in your head when you realize that no matter how hard you work, you're always one accident or one illness away from total collapse.",
    "The worst part of growing up poor is the constant awareness of the price of things. Before I learned my ABCs, I knew the cost of a liter of milk and how many hours of labor it took for my dad to buy it.",
    "Being a 35-year-old unemployed father is a special kind of hell. Society looks at you as a failure, but the reflection in your children's eyes—who still see you as a hero—is what truly breaks your heart. You want to provide a palace, but you're struggling to keep a bulb lit.",
    "Poverty shrinks your world. You stop thinking about the future because the present is so loud. Dreams are luxury items that people like us can't afford to keep on our shelves.",
    "I remember the shame when the school fee collection started. I'd slide down my seat, hoping the teacher would miss my name. You learn to be invisible before you learn to be confident.",
    "My grandmother used to say poverty is a cycle. I didn't believe her until I reached my thirties and realized I'm fighting the exact same battles she fought fifty years ago. The tools changed, but the struggle stayed the same.",
    "The gender aspect of poverty is brutal. As a girl in a poor household, you're often the first to give up education and the last to get a full plate. You learn to sacrifice before you even learn what you're losing.",
    "Poverty doesn't just crumble your dreams; it hardens your heart. You stop feeling empathy for others because you're too busy trying to survive the next 24 hours.",
    "I'm at that age where my friends are buying cars and homes, and I'm still calculating if I can afford an extra set of clothes this year. The gap feels wider every single day.",
    "They say money can't buy happiness. Maybe not, but it can buy 'sleep'—the kind of sleep where you aren't waking up at 3 AM wondering if the debt collector will knock on your door tomorrow."
];

async function seedPovertyPosts() {
    console.log("🚀 Starting Poverty Theme Seeding...");

    try {
        // 1. Create/Update the Bot Profile
        console.log("👤 Setting up GullyVoices profile...");
        await db.collection('users').doc(BOT_ID).set({
            uid: BOT_ID,
            displayName: BOT_NAME,
            photoURL: BOT_PHOTO,
            role: 'user',
            isBot: true,
            bio: "Exploring the silent struggles, hidden hope, and harsh realities of survival. Your struggle is valid.",
            createdAt: FieldValue.serverTimestamp(),
            acceptedVersion: 1,
            isAdmin: false,
            isOwner: false,
            fcmTokens: [],
            interests: ['Social Issues', 'Life', 'Growth']
        });

        // 2. Clear existing posts for this bot
        const oldPosts = await db.collection('posts').where('authorId', '==', BOT_ID).get();
        if (!oldPosts.empty) {
            const batch = db.batch();
            oldPosts.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        // 3. Create 50 Posts
        console.log(`📝 Creating ${POVERTY_CONFESSIONS.length} poverty confession posts (80% Hindi / 20% English)...`);
        
        let now = new Date();
        for (let i = 0; i < POVERTY_CONFESSIONS.length; i++) {
            const batch = db.batch(); // New batch per op to be safe or group them
            const postRef = db.collection('posts').doc();
            // Stagger by 1 hour
            const date = new Date(now.getTime() - (i * 60 * 60 * 1000));
            
            await postRef.set({
                authorId: BOT_ID,
                authorName: BOT_NAME,
                authorPhoto: BOT_PHOTO,
                content: POVERTY_CONFESSIONS[i],
                categoryId: 'awareness-social-education',
                categoryName: 'Awareness & Social Education',
                createdAt: date,
                likesCount: Math.floor(Math.random() * 40) + 10,
                commentsCount: 0,
                isIncognito: true, 
                authorIsAnonymous: false,
                type: 'text',
                status: 'published',
                viewCount: Math.floor(Math.random() * 300) + 100
            });

            if (i % 25 === 0) console.log(`Progress: ${i}/${POVERTY_CONFESSIONS.length}`);
        }

        console.log("✨ Poverty Seeding complete!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seedPovertyPosts();
