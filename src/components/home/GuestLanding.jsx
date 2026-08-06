// GuestLanding.jsx — Minimal Product Landing Page (Instagram, Threads & LinkedIn Philosophy)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../common/SEO';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
    ShieldCheck, Lock, Users, BookOpen, Sparkles, Building2,
    ArrowRight, ChevronDown, ChevronUp, Award, PhoneCall, Check,
    MessageSquare, AlertCircle, Send, Brain, Stethoscope, Globe,
    HeartHandshake
} from 'lucide-react';
import './GuestLanding.css';

// ── 20 EXPANDED FAQs FOR FAQPAGE SCHEMA.ORG ──
const EXPANDED_FAQS = [
    {
        q: 'How does SoulThread guarantee 100% anonymity for users in India?',
        a: 'When you join SoulThread, you select an anonymous handle (e.g., @SoulTraveler842). Your real name, phone number, email address, and social profiles are never shared publicly or stored in unencrypted form. You can vent, share, and connect with complete privacy.',
    },
    {
        q: 'What happens after I submit the Confidential Support Request Form?',
        a: 'Our care coordination team receives your request securely in our database and dispatches an immediate email alert to our clinical leads. A coordinator will review your situation and reach out via your preferred method (WhatsApp, Phone Call, or Email) at your requested time.',
    },
    {
        q: 'How are psychologists and clinical guides verified on SoulThread?',
        a: 'Every mental health professional on SoulThread undergoes a rigorous credentialing process. We verify accredited degrees (M.Phil / Ph.D. in Clinical or Counseling Psychology) from recognized Indian institutions and conduct background checks before granting access to client sessions.',
    },
    {
        q: 'Is SoulThread a substitute for emergency medical care?',
        a: 'No. SoulThread provides peer support, guided self-care programs, and online therapy connections. If you or someone you know is in immediate life-threatening danger, please contact national emergency helplines like Tele-MANAS (14416) or NIMHANS immediately.',
    },
    {
        q: 'How does SoulThread protect user data privacy on mobile and web?',
        a: 'All content safety screening and crisis detection run locally inside your device browser using on-device classifiers. Your private reflections and thoughts are never sold, rented, or transmitted to unverified third-party AI APIs.',
    },
    {
        q: 'Can I use SoulThread in Hindi or regional Indian languages?',
        a: 'Yes. Peer support communities and clinical therapists on SoulThread offer guidance in English, Hindi, and major Indian regional languages to ensure everyone feels comfortable expressing themselves.',
    },
    {
        q: 'What is the cost of using the SoulThread community platform?',
        a: 'Joining the anonymous community feed, reading peer stories, participating in support circles, and accessing crisis helplines are 100% free forever. 1-on-1 private therapy sessions with verified psychologists are available on a transparent pay-per-session model.',
    },
    {
        q: 'How does SoulThread for Enterprise work for corporate employee wellness?',
        a: 'SoulThread for Enterprise provides companies with confidential EAPs, anonymous employee peer circles, 1-on-1 therapy access, and aggregated workplace burnout analytics — without exposing individual employee identities to HR.',
    },
    {
        q: 'How do peer support circles work?',
        a: 'Support circles are specialized anonymous groups dedicated to specific challenges such as Exam Stress, Corporate Burnout, Relationship Heartbreak, and Caretaker Support. Members share experiences and encourage each other in a moderated, safe environment.',
    },
    {
        q: 'What should I do if I am experiencing a severe panic attack right now?',
        a: 'If you are having a panic attack, visit our Crisis Support page immediately for 1-tap grounding audio guides, deep breathing timers, and direct speed-dial connections to 24/7 counselors on Tele-MANAS (14416).',
    },
    {
        q: 'Can college students access free mental health support on SoulThread?',
        a: 'Yes. SoulThread has dedicated student support pathways specifically designed for academic stress, placement anxiety, hostel loneliness, and career pressure with peer mentors and affordable therapy.',
    },
    {
        q: 'What is the Free 2-Minute Mental Health Assessment?',
        a: 'Our self-assessment screening tool helps you evaluate symptoms of anxiety, stress, or burnout through a series of quick, confidential questions, providing immediate personalized care recommendations.',
    },
    {
        q: 'Can I delete my posts and account data at any time?',
        a: 'Yes. You retain 100% ownership of your data. You can delete any post, comment, or your entire account with a single click, completely removing your records from our systems.',
    },
    {
        q: 'Are screenshots allowed on the SoulThread mobile app?',
        a: 'No. The SoulThread Android app enforces native FLAG_SECURE protection to prevent screenshots and screen recordings in community feeds and chat rooms to preserve complete privacy.',
    },
    {
        q: 'How can I book a session with a psychologist on SoulThread?',
        a: 'Visit the Clinical Directory, filter by specialization, experience, and language preference, choose an available time slot, and confirm your confidential video or chat session.',
    },
    {
        q: 'What guided self-care series are available on SoulThread?',
        a: 'We offer structured audio and visual series on Hyperfocus & ADHD, Overcoming Burnout, Understanding Ego & Attachment, Biological Sleep Recovery, and Mindful Breathing.',
    },
    {
        q: 'How does SoulThread prevent cyberbullying and hate speech?',
        a: 'We combine automated on-device sentiment screening with trained human moderators to ensure all comments remain empathetic, constructive, and free from abuse or trolling.',
    },
    {
        q: 'Can family members of individuals with chronic illness get support on SoulThread?',
        a: 'Yes. We have a dedicated Caretaker Support Hub designed to help family members cope with caregiver fatigue, emotional burn-out, and hospital stress.',
    },
    {
        q: 'Does SoulThread offer couples or relationship counseling?',
        a: 'Yes. Verified relationship counselors and psychologists are available on SoulThread for 1-on-1 or couples sessions focused on communication, trust rebuilding, and boundary setting.',
    },
    {
        q: 'How can verified mental health professionals apply to join SoulThread?',
        a: 'Psychologists, psychiatrists, and certified counselors can visit our "Join as Clinical Expert" portal to submit credentials for review by our clinical advisory board.',
    },
];

// ── 6 ECOSYSTEM INTENTIONS ──
const ECOSYSTEM_INTENTIONS = [
    {
        id: 'emotional',
        icon: MessageSquare,
        title: 'Need Emotional Support?',
        subtitle: 'Connect anonymously with people who understand',
        tool: 'Community & Peer Circles',
        role: 'Creates Belonging',
        journey: ['Express feelings anonymously in peer circles', 'Receive empathetic validation from members', 'Access guided audio grounding tools', 'Connect with therapists when ready'],
        actionText: 'Join Anonymous Community Feed →',
        actionLink: '/community'
    },
    {
        id: 'clinical',
        icon: Stethoscope,
        title: 'Need Professional Care?',
        subtitle: 'Consult 1-on-1 with verified Indian psychologists',
        tool: 'Expert Matching Directory',
        role: 'Delivers Professional Care',
        journey: ['Filter psychologists by specialty & language', 'Review verified M.Phil / Ph.D. credentials', 'Book 1-on-1 confidential video/chat session', 'Receive personalized ongoing care'],
        actionText: 'Find Verified Psychologist →',
        actionLink: '/experts'
    },
    {
        id: 'symptoms',
        icon: BookOpen,
        title: 'Need to Understand Symptoms?',
        subtitle: 'Read evidence-based guides reviewed by doctors',
        tool: 'Healthcare Learning Center',
        role: 'Builds Clinical Trust',
        journey: ['Browse clinical guides on anxiety, burnout & sleep', 'Understand neurobiological stress triggers', 'Learn evidence-based CBT & MBSR coping strategies', 'Explore recommended support pathways'],
        actionText: 'Explore Medical Guides →',
        actionLink: '/resources'
    },
    {
        id: 'deciding',
        icon: Brain,
        title: 'Need Help Deciding?',
        subtitle: 'Take a free 2-minute private self-assessment',
        tool: 'Screening & Guidance Engine',
        role: 'Personalizes Your Journey',
        journey: ['Answer 3 quick, confidential questions', 'Evaluate anxiety, stress, or burnout levels', 'Receive immediate personalized recommendations', 'Directly connect with the right care tool'],
        actionText: 'Start 2-Min Assessment →',
        actionLink: 'modal_assessment'
    },
    {
        id: 'workplace',
        icon: Building2,
        title: 'Need Workplace Support?',
        subtitle: 'Confidential EAP and burnout relief for teams',
        tool: 'SoulThread for Enterprise',
        role: 'Improves Workplace Wellbeing',
        journey: ['Access 100% anonymous employee venting circles', 'Book employer-covered private therapy sessions', 'Prevent burnout with guided stress programs', 'Aggregated wellness analytics for leaders'],
        actionText: 'Explore Corporate EAP →',
        actionLink: '#enterprise'
    },
    {
        id: 'family',
        icon: HeartHandshake,
        title: 'Need Support for a Loved One?',
        subtitle: 'Guidance for family members & medical caretakers',
        tool: 'Caregiver Support Hub',
        role: 'Supports Caregivers',
        journey: ['Join dedicated caretaker support circles', 'Cope with hospital fatigue & caregiver burnout', 'Access family conflict & grief counseling', 'Use offline care assistant for medical logs'],
        actionText: 'Caregiver Support Hub →',
        actionLink: '/explore?category=caretaker'
    }
];

// ── TOP 4 FEATURED CONDITIONS ──
const FEATURED_TOP_CONDITIONS = [
    { id: 'anxiety', title: 'Anxiety & Panic Attacks', tag: 'Clinical & Peer Care', desc: 'Grounding techniques, peer validation, and verified therapists for racing thoughts and chest tightness.', link: '/anxiety' },
    { id: 'depression', title: 'Depression & Low Mood', tag: 'Emotional Support', desc: 'Safe, judgment-free spaces and 1-on-1 counseling for persistent sadness and emotional fatigue.', link: '/depression' },
    { id: 'stress', title: 'Chronic Stress & Overwhelm', tag: 'Daily Wellness', desc: 'Nervous system regulation tools, audio series, and peer circles to release daily pressure.', link: '/stress' },
    { id: 'burnout', title: 'Workplace Burnout', tag: 'Career & EAP', desc: 'Restorative guidance, boundary strategies, and anonymous workplace support circles.', link: '/burnout' },
];

// ── HEALTHCARE LEARNING CENTER ARTICLES ──
const LEARNING_CENTER_ARTICLES = [
    {
        id: '1',
        title: 'How to Ground Yourself During a Sudden Panic Attack',
        category: 'Anxiety & Grounding',
        readTime: '4 min read',
        lastUpdated: 'July 2026',
        author: 'Dr. Ananya Sharma, Ph.D.',
        reviewer: 'SoulThread Clinical Board',
        desc: 'Practical 5-4-3-2-1 sensory grounding techniques to restore calm when your nervous system feels overwhelmed.',
        link: '/anxiety'
    },
    {
        id: '2',
        title: 'Recognizing Workplace Burnout Before Emotional Exhaustion Hits',
        category: 'Burnout & EAP',
        readTime: '6 min read',
        lastUpdated: 'July 2026',
        author: 'Dr. Vikramaditya Roy, M.D.',
        reviewer: 'Clinical Advisory Team',
        desc: 'Key warning signs of chronic job burnout and how to set healthy workplace boundaries without career anxiety.',
        link: '/burnout'
    },
    {
        id: '3',
        title: 'Navigating Exam & Placement Pressure as a College Student',
        category: 'Student Wellness',
        readTime: '5 min read',
        lastUpdated: 'July 2026',
        author: 'Rahul Verma, Counseling Psych.',
        reviewer: 'Youth Care Panel',
        desc: 'Evidence-based strategies to manage placement anxiety, imposter syndrome, and study fatigue in Indian colleges.',
        link: '/explore?category=student'
    },
    {
        id: '4',
        title: 'The Neuroscience of Sleep Recovery & Quieting Overactive Night Thoughts',
        category: 'Sleep & Meditation',
        readTime: '7 min read',
        lastUpdated: 'July 2026',
        author: 'SoulThread Health Research',
        reviewer: 'Dr. Ananya Sharma, Ph.D.',
        desc: 'Biological sleep hygiene tips and mindfulness exercises to help your brain disengage from late-night stress loops.',
        link: '/sleep'
    }
];

// ── REAL RECOVERY JOURNEYS ──
const RECOVERY_JOURNEYS = [
    {
        title: 'Overcoming Silent Placement Anxiety',
        persona: 'Engineering Student, Delhi',
        problem: 'Felt overwhelming pressure during campus interviews, experiencing chest tightness and severe sleep deprivation.',
        journey: 'Joined SoulThread anonymously to share fears without letting parents know, participated in the Hyperfocus Audio Series, and booked 2 sessions with a verified psychologist.',
        outcome: 'Learned grounding techniques, regained sleep hygiene, and cleared interviews with newfound confidence.',
        category: 'Student Wellness'
    },
    {
        title: 'Healing Work Burnout & Imposter Syndrome',
        persona: 'Senior Software Engineer, Bengaluru',
        problem: 'Working 14-hour days led to emotional numbness, chronic fatigue, and dreading every morning stand-up call.',
        journey: 'Vented anonymously in the Workplace Stress Circle, accessed EAP resources, and set firm work-life boundaries with guidance from a clinical psychologist.',
        outcome: 'Reduced overtime by 50%, restored energy, and re-engaged with hobbies without quitting career.',
        category: 'Corporate EAP'
    },
    {
        title: 'Navigating Caregiver Fatigue Alone',
        persona: 'Family Caretaker, Mumbai',
        problem: 'Caring for an ailing parent for 18 months resulted in isolation, guilt, and emotional exhaustion.',
        journey: 'Found a compassionate caretaker circle on SoulThread, realized caregiver burnout is valid, and received weekly guidance from peer mentors.',
        outcome: 'Gained a supportive community that listens without judgment, restoring emotional resilience.',
        category: 'Family Care'
    }
];

export default function GuestLanding({ isNativeApp }) {
    const [selectedIntentionId, setSelectedIntentionId] = useState('emotional');

    // ── 2-STEP PROGRESSIVE FORM STATE MANAGEMENT ──
    const [formStep, setFormStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        contactInfo: '',
        concern: 'Anxiety',
        language: 'Hindi / English',
        contactMethod: 'WhatsApp',
        preferredTime: 'Morning (9 AM - 12 PM)',
        urgency: 'Within 24 hours',
        message: '',
        hp_field: ''
    });

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // ── ASSESSMENT MODAL STATE ──
    const [showAssessment, setShowAssessment] = useState(false);
    const [assessmentStep, setAssessmentStep] = useState(1);
    const [assessmentAnswers, setAssessmentAnswers] = useState({ mood: '', sleep: '', stressLevel: '' });
    const [assessmentResult, setAssessmentResult] = useState(null);

    // ── LEARNING CENTER CATEGORY FILTER STATE ──
    const [activeArticleCategory, setActiveArticleCategory] = useState('All');

    // ── FAQ ACCORDION STATE ──
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    const activeIntention = ECOSYSTEM_INTENTIONS.find(i => i.id === selectedIntentionId) || ECOSYSTEM_INTENTIONS[0];

    // ── STEP 1 SUBMIT HANDLER ──
    const handleStep1Submit = (e) => {
        e.preventDefault();
        setFormError(null);

        if (formData.hp_field) {
            console.warn('[SPAM REJECTED] Honeypot field filled');
            setFormSubmitted(true);
            return;
        }

        if (!formData.name.trim()) {
            setFormError('Please enter your name or preferred alias.');
            return;
        }

        if (!formData.contactInfo.trim()) {
            setFormError('Please provide a valid phone number or email address.');
            return;
        }

        const isEmail = formData.contactInfo.includes('@');
        const isPhone = /^[+\d\s-]{8,15}$/.test(formData.contactInfo.trim());

        if (!isEmail && !isPhone) {
            setFormError('Please enter a valid phone number (e.g. +91 9876543210) or email address.');
            return;
        }

        setFormStep(2);
    };

    // ── FINAL SUBMISSION HANDLER ──
    const handleFinalSubmit = async (e) => {
        if (e) e.preventDefault();
        setFormError(null);

        const lastSubmission = localStorage.getItem('last_support_submission_time');
        if (lastSubmission && (Date.now() - parseInt(lastSubmission, 10)) < 60000) {
            setFormError('You submitted a support request recently. Please wait a moment before submitting again.');
            return;
        }

        setFormLoading(true);

        try {
            const isEmail = formData.contactInfo.includes('@');
            const isPhone = /^[+\d\s-]{8,15}$/.test(formData.contactInfo.trim());
            const userEmail = isEmail ? formData.contactInfo.trim() : '';
            const userPhone = isPhone ? formData.contactInfo.trim() : '';

            await addDoc(collection(db, 'support_requests'), {
                name: formData.name.trim(),
                contactInfo: formData.contactInfo.trim(),
                email: userEmail,
                phone: userPhone,
                concern: formData.concern,
                language: formData.language,
                contactMethod: formData.contactMethod,
                preferredTime: formData.preferredTime,
                urgency: formData.urgency,
                message: formData.message.trim(),
                status: 'New',
                createdAt: serverTimestamp(),
                userAgent: navigator.userAgent || 'Web Browser',
                referrer: document.referrer || 'Direct Visit',
                device: navigator.platform || 'Web',
                honeypot: false
            });

            localStorage.setItem('last_support_submission_time', Date.now().toString());

            setFormLoading(false);
            setFormSubmitted(true);
        } catch (err) {
            console.error('Error submitting support request:', err);
            setFormLoading(false);
            setFormError('Unable to submit your request right now. Please try again or call Tele-MANAS (14416) directly.');
        }
    };

    const handleAssessmentComplete = (answers) => {
        let score = 'Mild Overwhelm';
        if (answers.mood === 'Often' || answers.stressLevel === 'High') {
            score = 'Moderate Anxiety / Stress';
        }
        if (answers.mood === 'Always' || answers.stressLevel === 'Severe') {
            score = 'High Burnout / Depression Indicators';
        }
        setAssessmentResult(score);
    };

    const filteredArticles = activeArticleCategory === 'All' 
        ? LEARNING_CENTER_ARTICLES 
        : LEARNING_CENTER_ARTICLES.filter(a => a.category.includes(activeArticleCategory));

    // ── SCHEMA.ORG GENERATION FOR SEO ──
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "SoulThread",
        "url": "https://soulthread.in",
        "logo": "https://soulthread.in/logo.jpg",
        "description": "India's trusted Mental Healthcare Ecosystem unifying anonymous peer community, verified clinical psychologists, and healthcare guides.",
        "sameAs": [
            "https://play.google.com/store/apps/details?id=in.soulthread.app"
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": EXPANDED_FAQS.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://soulthread.in/"
            }
        ]
    };

    return (
        <div className="gl-storytelling-root">
            <SEO 
                title="SoulThread | Mental Healthcare Ecosystem for India"
                description="No matter what you're going through, SoulThread helps you find the right support. Anonymous peer circles, verified psychologists, and healthcare guides under one ecosystem."
                schema={[organizationSchema, faqSchema, breadcrumbSchema]}
            />

            {/* ══════════════════════════════════════════════════════════════
               SECTION 1: HERO — INVISIBLE UI & CONTENT-FIRST PROMISE
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-hero-human">
                <div className="gl-container">
                    <div className="hero-human-badge">
                        <ShieldCheck size={14} className="badge-ic" />
                        <span>INDIA'S MENTAL HEALTHCARE ECOSYSTEM</span>
                    </div>

                    <h1 className="hero-human-h1">
                        No matter what you're going through,<br />
                        <span className="h1-highlight">SoulThread helps you find the right support.</span>
                    </h1>

                    <p className="hero-human-sub">
                        SoulThread is your Mental Healthcare Ecosystem. We listen first, understand your situation, and guide you to the exact peer, clinical, or self-care resources you need — completely judgment-free.
                    </p>

                    <div className="hero-human-cta-row">
                        <a href="#ecosystem-guide" className="btn-hero-primary">
                            Find Your Right Support Pathway ↓
                        </a>
                        <a href="#support-form" className="btn-hero-secondary">
                            Request Confidential Guidance
                        </a>
                    </div>

                    <div className="hero-crisis-bar">
                        <PhoneCall size={14} className="crisis-call-ic" />
                        <span>In immediate distress? Call Tele-MANAS national helpline 24/7: <a href="tel:14416" className="crisis-link-num">14416</a></span>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 2: INTELLIGENT ECOSYSTEM GUIDANCE ("What do you need today?")
               ══════════════════════════════════════════════════════════════ */}
            <section id="ecosystem-guide" className="gl-ecosystem-selector-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">INTELLIGENT GUIDANCE</span>
                        <h2 className="section-heading">What do you need today?</h2>
                        <p className="section-subheading">Select your situation below. SoulThread will guide you directly to the right support path.</p>
                    </div>

                    <div className="eco-selector-grid">
                        {ECOSYSTEM_INTENTIONS.map(item => {
                            const IconComponent = item.icon;
                            const isSelected = item.id === selectedIntentionId;
                            return (
                                <button 
                                    key={item.id}
                                    className={`eco-select-btn ${isSelected ? 'active' : ''}`}
                                    onClick={() => setSelectedIntentionId(item.id)}
                                >
                                    <div className="eco-btn-icon">
                                        <IconComponent size={18} />
                                    </div>
                                    <div className="eco-btn-text">
                                        <strong>{item.title}</strong>
                                        <span>{item.subtitle}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Dynamic Ecosystem Response Card */}
                    <div className="eco-guidance-box">
                        <div className="eco-box-header">
                            <div className="eco-role-pill">
                                {activeIntention.tool} • {activeIntention.role}
                            </div>
                            <h3 className="eco-box-title">{activeIntention.title}</h3>
                        </div>

                        <p className="eco-box-desc">
                            We hear you. Finding the right support can feel overwhelming, but you don't have to navigate it alone. Here is your recommended care path:
                        </p>

                        <div className="eco-flow-steps">
                            {activeIntention.journey.map((step, idx) => (
                                <div key={idx} className="eco-step-item">
                                    <div className="eco-step-badge">{idx + 1}</div>
                                    <span className="eco-step-text">{step}</span>
                                </div>
                            ))}
                        </div>

                        <div className="eco-box-cta-row">
                            {activeIntention.actionLink === 'modal_assessment' ? (
                                <button 
                                    className="btn-eco-action"
                                    onClick={() => { setAssessmentStep(1); setShowAssessment(true); }}
                                >
                                    {activeIntention.actionText}
                                </button>
                            ) : activeIntention.actionLink.startsWith('#') ? (
                                <a href={activeIntention.actionLink} className="btn-eco-action">
                                    {activeIntention.actionText}
                                </a>
                            ) : (
                                <Link to={activeIntention.actionLink} className="btn-eco-action">
                                    {activeIntention.actionText}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 3: THE 6 ECOSYSTEM PILLARS SHOWCASE
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-ecosystem-pillars-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">ONE CONNECTED PLATFORM</span>
                        <h2 className="section-heading">How the SoulThread Ecosystem Works</h2>
                        <p className="section-subheading">Every tool reinforces one ecosystem — ensuring you always receive seamless, continuous support.</p>
                    </div>

                    <div className="eco-pillars-grid">
                        <div className="eco-pillar-card">
                            <div className="pillar-ic-wrap"><Users size={20} /></div>
                            <h3>Community</h3>
                            <div className="pillar-role">Creates Belonging</div>
                            <p>Anonymous peer support circles and validation where you can vent freely without social identity risks.</p>
                        </div>

                        <div className="eco-pillar-card">
                            <div className="pillar-ic-wrap"><Stethoscope size={20} /></div>
                            <h3>Verified Experts</h3>
                            <p className="pillar-role">Provides Professional Care</p>
                            <p>1-on-1 private video and chat therapy sessions with M.Phil & Ph.D. clinical psychologists across India.</p>
                        </div>

                        <div className="eco-pillar-card">
                            <div className="pillar-ic-wrap"><BookOpen size={20} /></div>
                            <h3>Learning Center</h3>
                            <div className="pillar-role">Builds Clinical Trust</div>
                            <p>Evidence-based medical guides, CBT frameworks, and neurobiological stress articles reviewed by clinical leads.</p>
                        </div>

                        <div className="eco-pillar-card">
                            <div className="pillar-ic-wrap"><Brain size={20} /></div>
                            <h3>Assessments</h3>
                            <div className="pillar-role">Personalizes Your Journey</div>
                            <p>Free 2-minute clinical screening tools that evaluate anxiety, stress, and burnout to recommend custom pathways.</p>
                        </div>

                        <div className="eco-pillar-card">
                            <div className="pillar-ic-wrap"><Building2 size={20} /></div>
                            <h3>Enterprise EAP</h3>
                            <div className="pillar-role">Improves Workplace Wellbeing</div>
                            <p>Confidential employee assistance programs and aggregated burnout analytics for forward-thinking organizations.</p>
                        </div>

                        <div className="eco-pillar-card">
                            <div className="pillar-ic-wrap"><HeartHandshake size={20} /></div>
                            <h3>Family & Caretakers</h3>
                            <div className="pillar-role">Supports Caregivers</div>
                            <p>Dedicated resources, hospital care assistant tools, and support groups for individuals caring for loved ones.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 4: AUTHENTIC BRAND STORY & MISSION
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-brand-story-section">
                <div className="gl-container">
                    <div className="brand-story-card">
                        <div className="brand-story-badge">
                            OUR MISSION & WHY WE BUILT SOULTHREAD
                        </div>
                        <h2 className="brand-story-h2">A Safe Digital Sanctuary for Every Mind in India</h2>
                        <p className="brand-story-p">
                            SoulThread was born out of a stark reality in India: millions of people suffer silently from anxiety, burnout, academic pressure, and emotional distress due to social stigma, privacy fears, and inaccessible clinical care.
                        </p>
                        <p className="brand-story-p">
                            We built SoulThread as a safe, 100% anonymous digital sanctuary where anyone across India can express their deepest thoughts without fear of judgment, find empathetic peer support from people who truly get it, and access verified M.Phil and Ph.D. clinical care whenever they feel ready.
                        </p>

                        <div className="brand-pillars-row">
                            <div className="brand-pillar-item">
                                <Lock size={15} className="bp-icon" />
                                <span>Zero Social Login Required</span>
                            </div>
                            <div className="brand-pillar-item">
                                <ShieldCheck size={15} className="bp-icon" />
                                <span>On-Device Encryption</span>
                            </div>
                            <div className="brand-pillar-item">
                                <Award size={15} className="bp-icon" />
                                <span>Verified Indian Psychologists</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 5: LIVE ANONYMOUS COMMUNITY PREVIEW
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-community-preview-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">LIVE COMMUNITY SANCTUARY</span>
                        <h2 className="section-heading">Inside SoulThread's Peer Community</h2>
                        <p className="section-subheading">See how members share anonymously, receive empathetic validation, and connect with clinical experts.</p>
                    </div>

                    <div className="community-preview-card">
                        <div className="preview-card-header">
                            <div className="user-handle-badge">
                                <Lock size={12} /> @SoulTraveler842 • Anonymous Member
                            </div>
                            <span className="preview-timestamp">12 mins ago in #AnxietySupport</span>
                        </div>

                        <div className="preview-post-content">
                            "Feeling overwhelming placement anxiety and sleep loss this week. Every time I open my study notes, my chest feels tight and I overthink everything..."
                        </div>

                        <div className="preview-replies-stack">
                            <div className="reply-box peer-reply">
                                <div className="reply-user">@MindfulPioneer • Peer Supporter</div>
                                <div className="reply-text">
                                    "You are not alone in this! I felt the exact same way during campus rounds last year. The 5-4-3-2-1 sensory grounding technique in the SoulThread audio series really helped me quiet racing thoughts."
                                </div>
                            </div>

                            <div className="reply-box expert-reply">
                                <div className="reply-user">
                                    <Stethoscope size={12} /> Dr. Ananya Sharma, Ph.D. • Verified Clinical Psychologist
                                </div>
                                <div className="reply-text">
                                    "Remember that placement anxiety is a natural physiological reaction to high-stakes uncertainty, not a personal flaw. Take deep diaphragmatic breaths and focus on 1 small task at a time."
                                </div>
                            </div>
                        </div>

                        <div className="preview-action-footer">
                            <Link to="/community" className="btn-join-community">
                                Join Anonymous Community Feed →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 6: 2-STEP PROGRESSIVE SUPPORT FORM
               ══════════════════════════════════════════════════════════════ */}
            <section id="support-form" className="gl-form-section">
                <div className="gl-container">
                    <div className="form-split-grid">
                        
                        <div className="form-info-side">
                            <span className="section-label">CONFIDENTIAL ASSISTANCE</span>
                            <h2 className="form-main-heading">Need Mental Health Support?</h2>
                            <p className="form-main-desc">
                                Tell us what you're going through. Our care coordination team will review your request privately and connect you with the right guidance.
                            </p>

                            <div className="post-submission-diagram">
                                <div className="diagram-title">WHAT HAPPENS AFTER YOU SUBMIT</div>
                                <div className="diagram-steps">
                                    <div className="d-step">
                                        <div className="d-step-num">1</div>
                                        <div className="d-step-text">
                                            <strong>Support Request Submitted</strong>
                                            <span>Your request is encrypted in Firestore and dispatches an instant alert to clinical leads.</span>
                                        </div>
                                    </div>
                                    <div className="d-step">
                                        <div className="d-step-num">2</div>
                                        <div className="d-step-text">
                                            <strong>Clinical Evaluation</strong>
                                            <span>We match your situation with relevant peer circles, guided series, or psychologists.</span>
                                        </div>
                                    </div>
                                    <div className="d-step">
                                        <div className="d-step-num">3</div>
                                        <div className="d-step-text">
                                            <strong>Right Support Recommendation</strong>
                                            <span>You receive a personalized recommendation tailored to your budget and preference.</span>
                                        </div>
                                    </div>
                                    <div className="d-step">
                                        <div className="d-step-num">4</div>
                                        <div className="d-step-text">
                                            <strong>Community / Expert Connect</strong>
                                            <span>Join anonymous support circles or schedule 1-on-1 sessions with verified psychologists.</span>
                                        </div>
                                    </div>
                                    <div className="d-step">
                                        <div className="d-step-num">5</div>
                                        <div className="d-step-text">
                                            <strong>Ongoing Follow-up</strong>
                                            <span>Our care team checks in to ensure your ongoing well-being and recovery.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-card-side">
                            {formSubmitted ? (
                                <div className="form-success-box">
                                    <div className="success-icon-wrap">
                                        <Check size={24} />
                                    </div>
                                    <h3 className="success-heading">Thank you for reaching out.</h3>
                                    <p className="success-body-p">
                                        Your request has been received securely. A member of the SoulThread team will review your request and contact you as soon as possible.
                                    </p>
                                    <div className="success-emergency-notice">
                                        <AlertCircle size={15} className="emergency-ic" />
                                        <span>If you are experiencing a mental health emergency or are at immediate risk, please contact your local emergency services or your nearest crisis helpline immediately.</span>
                                    </div>
                                    <div className="success-helpline-box">
                                        National Helpline (Tele-MANAS): <a href="tel:14416" className="h-link">14416</a> (24/7 Free)
                                    </div>
                                    <button onClick={() => { setFormSubmitted(false); setFormStep(1); setFormData({ name: '', contactInfo: '', concern: 'Anxiety', language: 'Hindi / English', contactMethod: 'WhatsApp', preferredTime: 'Morning (9 AM - 12 PM)', urgency: 'Within 24 hours', message: '', hp_field: '' }); }} className="btn-return-home">
                                        Return to Homepage
                                    </button>
                                </div>
                            ) : (
                                <div className="form-step-wrapper">
                                    <div className="form-step-header">
                                        <div className="step-indicator-row">
                                            <span className={`step-dot ${formStep >= 1 ? 'active' : ''}`}>1</span>
                                            <span className="step-line"></span>
                                            <span className={`step-dot ${formStep >= 2 ? 'active' : ''}`}>2</span>
                                        </div>
                                        <span className="step-label-text">
                                            {formStep === 1 ? 'Step 1 of 2: Essential Details' : 'Step 2 of 2: Preferences (Optional)'}
                                        </span>
                                    </div>

                                    {formError && (
                                        <div className="form-error-alert">
                                            <AlertCircle size={14} /> {formError}
                                        </div>
                                    )}

                                    <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                                        <label>Leave this field empty</label>
                                        <input 
                                            type="text" 
                                            tabIndex="-1" 
                                            value={formData.hp_field} 
                                            onChange={e => setFormData({...formData, hp_field: e.target.value})} 
                                        />
                                    </div>

                                    {formStep === 1 && (
                                        <form onSubmit={handleStep1Submit} className="support-request-form">
                                            <h3 className="form-card-title">Confidential Support Request</h3>
                                            
                                            <div className="form-group">
                                                <label>Your Name / Preferred Alias *</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="e.g. Rahul or @SoulSeeker" 
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Phone Number or Email Address *</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="Where should we contact you confidentially?" 
                                                    value={formData.contactInfo}
                                                    onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>What are you struggling with?</label>
                                                <select 
                                                    value={formData.concern}
                                                    onChange={e => setFormData({...formData, concern: e.target.value})}
                                                >
                                                    <option value="Anxiety">Anxiety & Panic Attacks</option>
                                                    <option value="Depression">Depression & Low Mood</option>
                                                    <option value="Stress">Chronic Stress & Overwhelm</option>
                                                    <option value="Burnout">Workplace Burnout</option>
                                                    <option value="Relationships">Relationship Breakdown</option>
                                                    <option value="Loneliness">Loneliness & Isolation</option>
                                                    <option value="Family Problems">Family & Caregiver Stress</option>
                                                    <option value="Student Stress">Student & Academic Pressure</option>
                                                    <option value="Sleep Issues">Sleep & Insomnia</option>
                                                    <option value="Not Sure">Not Sure / Other</option>
                                                </select>
                                            </div>

                                            <button type="submit" className="btn-submit-support">
                                                Request Support →
                                            </button>

                                            <div className="form-footer-guarantee">
                                                <Lock size={12} /> 100% Private • No Spam • Judgment-Free Guarantee
                                            </div>
                                        </form>
                                    )}

                                    {formStep === 2 && (
                                        <form onSubmit={handleFinalSubmit} className="support-request-form">
                                            <h3 className="form-card-title">Customize Contact Preferences</h3>
                                            <p className="step2-subtitle">Help us reach out at the right time in your preferred language.</p>

                                            <div className="form-row-2">
                                                <div className="form-group">
                                                    <label>Preferred Contact Method</label>
                                                    <select 
                                                        value={formData.contactMethod}
                                                        onChange={e => setFormData({...formData, contactMethod: e.target.value})}
                                                    >
                                                        <option value="WhatsApp">WhatsApp</option>
                                                        <option value="Phone Call">Phone Call</option>
                                                        <option value="Email">Email</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Preferred Contact Time</label>
                                                    <select 
                                                        value={formData.preferredTime}
                                                        onChange={e => setFormData({...formData, preferredTime: e.target.value})}
                                                    >
                                                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                                                        <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                                                        <option value="Evening (5 PM - 9 PM)">Evening (5 PM - 9 PM)</option>
                                                        <option value="Anytime">Anytime</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-row-2">
                                                <div className="form-group">
                                                    <label>Urgency Level</label>
                                                    <select 
                                                        value={formData.urgency}
                                                        onChange={e => setFormData({...formData, urgency: e.target.value})}
                                                    >
                                                        <option value="Within 24 hours">Within 24 hours</option>
                                                        <option value="Need immediate support">Need immediate support</option>
                                                        <option value="Just exploring options">Just exploring options</option>
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label>Preferred Language</label>
                                                    <select 
                                                        value={formData.language}
                                                        onChange={e => setFormData({...formData, language: e.target.value})}
                                                    >
                                                        <option value="Hindi / English">Hindi / English</option>
                                                        <option value="English Only">English Only</option>
                                                        <option value="Regional Language">Regional Language</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label>Anything specific you'd like to share? (Optional)</label>
                                                <textarea 
                                                    rows="3" 
                                                    placeholder="Share a brief note about what you're feeling..."
                                                    value={formData.message}
                                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                                />
                                            </div>

                                            <div className="step2-btn-row">
                                                <button type="button" onClick={() => setFormStep(1)} className="btn-back-step">
                                                    ← Back
                                                </button>
                                                <button type="submit" className="btn-submit-support flex-1" disabled={formLoading}>
                                                    {formLoading ? 'Submitting...' : 'Complete Support Request'} <Send size={15} />
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 7: PRIVACY PROCESS FLOW
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-privacy-diagram-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">PRIVACY ARCHITECTURE</span>
                        <h2 className="section-heading">How your privacy is protected</h2>
                        <p className="section-subheading">A visual breakdown of how SoulThread preserves complete anonymity and data security.</p>
                    </div>

                    <div className="privacy-process-flow">
                        <div className="flow-step-box">
                            <div className="flow-badge">STAGE 01</div>
                            <div className="flow-icon-wrap"><Lock size={20} /></div>
                            <h3>Alias Masking</h3>
                            <p>Your real name, phone number, and social profiles are masked behind a randomly generated encrypted handle (e.g. @SoulTraveler842).</p>
                        </div>

                        <div className="flow-arrow-ic"><ArrowRight size={18} /></div>

                        <div className="flow-step-box">
                            <div className="flow-badge">STAGE 02</div>
                            <div className="flow-icon-wrap"><ShieldCheck size={20} /></div>
                            <h3>On-Device Memory Guard</h3>
                            <p>Safety screening and crisis detection run locally inside your browser memory. Unencrypted text is never transmitted to third-party AI APIs.</p>
                        </div>

                        <div className="flow-arrow-ic"><ArrowRight size={18} /></div>

                        <div className="flow-step-box">
                            <div className="flow-badge">STAGE 03</div>
                            <div className="flow-icon-wrap"><Award size={20} /></div>
                            <h3>Verified Clinical Standards</h3>
                            <p>Therapists undergo M.Phil / Ph.D. degree verification from recognized Indian institutions and adhere to strict patient confidentiality laws.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 8: OUR CLINICAL STANDARDS
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-clinical-standards-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">CLINICAL AUTHORITY & INTEGRITY</span>
                        <h2 className="section-heading">Our Clinical Standards</h2>
                        <p className="section-subheading">Grounding every therapeutic interaction in rigorous clinical ethics, credential verification, and safety protocol.</p>
                    </div>

                    <div className="clinical-standards-grid">
                        <div className="clinical-card">
                            <div className="clinical-icon"><Stethoscope size={20} /></div>
                            <h3>Rigorous Credentialing</h3>
                            <p>Every therapist undergoes strict verification of accredited degrees (M.Phil / Ph.D. in Clinical or Counseling Psychology) from recognized Indian institutions.</p>
                        </div>

                        <div className="clinical-card">
                            <div className="clinical-icon"><Lock size={20} /></div>
                            <h3>100% On-Device Privacy</h3>
                            <p>Your personal reflections and data are shielded by client-side browser encryption. We never sell, rent, or monetize sensitive personal health records.</p>
                        </div>

                        <div className="clinical-card">
                            <div className="clinical-icon"><Brain size={20} /></div>
                            <h3>Evidence-Based Care</h3>
                            <p>All guided audio series, cognitive frameworks, and self-care tools are modeled on Cognitive Behavioral Therapy (CBT) and Mindfulness-Based Stress Reduction (MBSR).</p>
                        </div>

                        <div className="clinical-card">
                            <div className="clinical-icon"><ShieldCheck size={20} /></div>
                            <h3>24/7 Crisis Escalation</h3>
                            <p>Continuous sentiment safety monitoring with immediate, direct speed-dial access to national crisis helplines like Tele-MANAS (14416).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 9: TOP 4 COMMON CONDITIONS + DEDICATED HUB LINK
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-conditions-seo">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">EVIDENCE-BASED CARE</span>
                        <h2 className="section-heading">Common Mental Health Challenges</h2>
                        <p className="section-subheading">Targeted guidance, peer validation, and clinical care for the most common mental health conditions in India.</p>
                    </div>

                    <div className="top4-conditions-grid">
                        {FEATURED_TOP_CONDITIONS.map(hub => (
                            <Link key={hub.id} to={hub.link} className="seo-hub-card top4-card">
                                <div className="hub-tag">{hub.tag}</div>
                                <h3 className="hub-title">{hub.title}</h3>
                                <p className="hub-desc">{hub.desc}</p>
                                <div className="hub-action">
                                    Explore Pathway <ArrowRight size={14} />
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="conditions-hub-link-banner">
                        <div className="hub-link-text">
                            <strong>Explore All Mental Health Pathways</strong>
                            <span>Find dedicated resources for ADHD, OCD, Grief, Sleep Insomnia, Panic Attacks, and Relationships.</span>
                        </div>
                        <Link to="/conditions" className="btn-view-all-conditions">
                            View All Conditions & Pathways →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 10: SEO ECOSYSTEM INTERNAL LINKING FOOTER BAR
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-seo-ecosystem-bar">
                <div className="gl-container">
                    <div className="seo-eco-header">
                        <Globe size={15} className="eco-ic" />
                        <span>SOULTHREAD MENTAL HEALTH HUB ECOSYSTEM</span>
                    </div>
                    <div className="seo-links-grid">
                        <Link to="/conditions" className="seo-eco-link">All Conditions Hub</Link>
                        <Link to="/anxiety" className="seo-eco-link">Anxiety & Panic Support</Link>
                        <Link to="/depression" className="seo-eco-link">Depression & Low Mood</Link>
                        <Link to="/stress" className="seo-eco-link">Chronic Stress Management</Link>
                        <Link to="/burnout" className="seo-eco-link">Workplace Burnout EAP</Link>
                        <Link to="/adhd" className="seo-eco-link">ADHD & Executive Focus</Link>
                        <Link to="/ocd" className="seo-eco-link">OCD Cognitive Guidance</Link>
                        <Link to="/sleep" className="seo-eco-link">Sleep Insomnia Recovery</Link>
                        <Link to="/grief" className="seo-eco-link">Grief & Bereavement</Link>
                        <Link to="/relationships" className="seo-eco-link">Relationship Counseling</Link>
                        <Link to="/assessment" className="seo-eco-link">Free Mental Health Assessment</Link>
                        <Link to="/experts" className="seo-eco-link">Verified Clinical Psychologists</Link>
                        <Link to="/community" className="seo-eco-link">Anonymous Community Feed</Link>
                        <Link to="/resources" className="seo-eco-link">Healthcare Learning Center</Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 11: VISUAL 6-STEP RECOVERY PROCESS
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-recovery-process-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">VISUAL PROCESS FLOW</span>
                        <h2 className="section-heading">Your complete recovery process</h2>
                        <p className="section-subheading">From initial distress to long-term emotional resilience.</p>
                    </div>

                    <div className="recovery-6step-grid">
                        <div className="r-step-card">
                            <div className="r-step-num">01</div>
                            <h3>Visitor</h3>
                            <p>Arrive safely without requiring upfront social login or identity exposure.</p>
                        </div>
                        <div className="r-step-card">
                            <div className="r-step-num">02</div>
                            <h3>Support Request</h3>
                            <p>Submit private support request or complete 2-minute self-assessment.</p>
                        </div>
                        <div className="r-step-card">
                            <div className="r-step-num">03</div>
                            <h3>Community Support</h3>
                            <p>Share anonymously and receive empathetic validation from peer circles.</p>
                        </div>
                        <div className="r-step-card">
                            <div className="r-step-num">04</div>
                            <h3>Expert Guidance</h3>
                            <p>Consult 1-on-1 with verified M.Phil/Ph.D. Indian psychologists.</p>
                        </div>
                        <div className="r-step-card">
                            <div className="r-step-num">05</div>
                            <h3>Guided Programs</h3>
                            <p>Listen to self-paced audio series on hyperfocus, anxiety, and sleep.</p>
                        </div>
                        <div className="r-step-card">
                            <div className="r-step-num">06</div>
                            <h3>Long-term Wellness</h3>
                            <p>Build lasting coping mechanisms and daily emotional stability.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 12: REAL STORIES
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-stories-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">REAL RECOVERY STORIES</span>
                        <h2 className="section-heading">Stories of resilience & healing</h2>
                        <p className="section-subheading">Authentic recovery journeys shared by SoulThread community members.</p>
                    </div>

                    <div className="stories-grid">
                        {RECOVERY_JOURNEYS.map((story, i) => (
                            <div key={i} className="story-card">
                                <div className="story-cat-badge">{story.category}</div>
                                <h3 className="story-title">{story.title}</h3>
                                <div className="story-persona">{story.persona}</div>
                                
                                <div className="story-block problem">
                                    <strong>The Challenge:</strong> {story.problem}
                                </div>
                                <div className="story-block journey">
                                    <strong>The Journey:</strong> {story.journey}
                                </div>
                                <div className="story-block outcome">
                                    <strong>The Outcome:</strong> {story.outcome}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 13: HEALTHCARE LEARNING CENTER
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-learning-center-section">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">KNOWLEDGE & RESOURCES</span>
                        <h2 className="section-heading">SoulThread Learning Center</h2>
                        <p className="section-subheading">Evidence-based guides, cognitive strategies, and clinical wellness insights written and reviewed by mental health professionals.</p>
                    </div>

                    <div className="learning-categories-pills">
                        {['All', 'Anxiety', 'Burnout', 'Student Wellness', 'Sleep & Meditation'].map(cat => (
                            <button 
                                key={cat} 
                                className={`cat-pill-btn ${activeArticleCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveArticleCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="learning-articles-grid">
                        {filteredArticles.map(article => (
                            <Link key={article.id} to={article.link} className="learning-article-card">
                                <div className="article-meta-row">
                                    <span className="article-cat">{article.category}</span>
                                    <span className="article-read-time">{article.readTime}</span>
                                </div>
                                <h3 className="article-title">{article.title}</h3>
                                <p className="article-desc">{article.desc}</p>
                                
                                <div className="healthcare-meta-box">
                                    <div><strong>Author:</strong> {article.author}</div>
                                    <div><strong>Reviewed By:</strong> {article.reviewer} • <em>Updated {article.lastUpdated}</em></div>
                                </div>

                                <div className="article-author-row">
                                    <span>Read Medical Guide</span>
                                    <ArrowRight size={14} className="article-arrow" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 14: SOULTHREAD FOR ENTERPRISE
               ══════════════════════════════════════════════════════════════ */}
            <section id="enterprise" className="gl-enterprise-secondary">
                <div className="gl-container">
                    <div className="enterprise-container-box">
                        <div className="ent-badge-pill">
                            WORKPLACE WELLNESS & EAP
                        </div>
                        <h2 className="ent-h2">Why Forward-Thinking Companies Choose SoulThread</h2>
                        <p className="ent-p">
                            Traditional EAPs have less than 5% employee engagement due to privacy fears. SoulThread delivers an anonymous employee sanctuary combining peer circles, verified therapy, and workplace burnout prevention.
                        </p>

                        <div className="ent-grid-3">
                            <div className="ent-card">
                                <h4>100% Employee Anonymity</h4>
                                <p>Employees express job stress without fear of HR visibility or performance repercussions.</p>
                            </div>
                            <div className="ent-card">
                                <h4>Licensed Therapy Access</h4>
                                <p>Direct 1-on-1 session booking with verified psychologists for individual care.</p>
                            </div>
                            <div className="ent-card">
                                <h4>Burnout Reduction Analytics</h4>
                                <p>Aggregated team wellness insights to help leadership build healthier work culture.</p>
                            </div>
                        </div>

                        <div className="ent-btn-row">
                            <a href="mailto:support@soulthread.in?subject=Enterprise%20Demo%20Inquiry" className="btn-ent-primary">
                                Book Enterprise Demo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
               SECTION 15: 20-QUESTION EXPANDED FAQ ACCORDION
               ══════════════════════════════════════════════════════════════ */}
            <section className="gl-faq-expanded">
                <div className="gl-container">
                    <div className="section-label-group">
                        <span className="section-label">FREQUENTLY ASKED QUESTIONS</span>
                        <h2 className="section-heading">Everything you need to know</h2>
                        <p className="section-subheading">Transparent answers about anonymity, clinical safety, pricing, and support.</p>
                    </div>

                    <div className="faq-20-wrapper">
                        {EXPANDED_FAQS.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div key={index} className={`faq-20-card ${isOpen ? 'open' : ''}`} onClick={() => setOpenFaqIndex(isOpen ? null : index)}>
                                    <div className="faq-20-q-row">
                                        <h3 className="faq-20-q-text">{faq.q}</h3>
                                        <div className="faq-20-icon">
                                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                    {isOpen && <p className="faq-20-a-text">{faq.a}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── INTERACTIVE MENTAL HEALTH ASSESSMENT MODAL ── */}
            {showAssessment && (
                <div className="assessment-modal-overlay" onClick={() => setShowAssessment(false)}>
                    <div className="assessment-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <h3>2-Minute Mental Health Assessment</h3>
                            <button className="btn-close-modal" onClick={() => setShowAssessment(false)}>✕</button>
                        </div>

                        {!assessmentResult ? (
                            <div className="modal-body-step">
                                {assessmentStep === 1 && (
                                    <div>
                                        <p className="q-title">1. How often have you felt overwhelmed or anxious in the past 2 weeks?</p>
                                        <div className="options-stack">
                                            {['Rarely', 'Sometimes', 'Often', 'Always'].map(opt => (
                                                <button key={opt} className="opt-btn" onClick={() => { setAssessmentAnswers({...assessmentAnswers, mood: opt}); setAssessmentStep(2); }}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {assessmentStep === 2 && (
                                    <div>
                                        <p className="q-title">2. How has your sleep quality been recently?</p>
                                        <div className="options-stack">
                                            {['Restful & Normal', 'Trouble falling asleep', 'Waking up exhausted', 'Severe insomnia'].map(opt => (
                                                <button key={opt} className="opt-btn" onClick={() => { setAssessmentAnswers({...assessmentAnswers, sleep: opt}); setAssessmentStep(3); }}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {assessmentStep === 3 && (
                                    <div>
                                        <p className="q-title">3. How would you rate your overall stress / burnout level?</p>
                                        <div className="options-stack">
                                            {['Low', 'Moderate', 'High', 'Severe'].map(opt => (
                                                <button key={opt} className="opt-btn" onClick={() => { 
                                                    const updated = {...assessmentAnswers, stressLevel: opt};
                                                    setAssessmentAnswers(updated);
                                                    handleAssessmentComplete(updated);
                                                }}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="modal-result-box">
                                <div className="result-badge">ASSESSMENT COMPLETE</div>
                                <h4>Suggested Support Pathway:</h4>
                                <div className="result-highlight">{assessmentResult}</div>
                                <p className="result-desc">
                                    Based on your responses, we recommend starting with private anonymous peer support or scheduling a 1-on-1 session with a verified psychologist.
                                </p>
                                <div className="modal-cta-row">
                                    <a href="#support-form" onClick={() => setShowAssessment(false)} className="btn-modal-primary">
                                        Request Confidential Guidance
                                    </a>
                                    <Link to="/experts" onClick={() => setShowAssessment(false)} className="btn-modal-secondary">
                                        Explore Psychologists
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
