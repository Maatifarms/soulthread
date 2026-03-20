import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { analytics } from '../services/analytics';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import './EgoIdSeries.css';

const episodes = [
    {
        id: 1,
        title: "मन की छिपी हुई दुनिया",
        topic: "Conscious vs Unconscious Mind",
        mainThought: "हमारे मन के दो बड़े हिस्से होते हैं: कॉन्शियस (होश वाला मन) जो हमें पता होता है, और अनकॉन्शियस (छिपा हुआ मन) जो अंदर छिपा रहता है।",
        highlights: [
            "हर विचार हमेशा होश में नहीं रहता।",
            "कुछ विचार गायब हो जाते हैं और बाद में वापस आते हैं।",
            "मन जानबूझकर कुछ विचारों को दबा देता है (Repression)।"
        ],
        image: "/assets/egoid/post_01.png"
    },
    {
        id: 2,
        title: "मन के तीन स्तर",
        topic: "Conscious, Preconscious, Unconscious",
        mainThought: "फ्रॉयड ने मन के तीन स्तरों को समझाया है जो हमारी सोच और यादों को नियंत्रित करते हैं।",
        highlights: [
            "कॉन्शियस: जो अभी हम सोच रहे हैं।",
            "प्रीकॉन्शियस: जो थोड़ी कोशिश से याद आ सकता है।",
            "अनकॉन्शियस: जो गहराई में दबा हुआ है।",
            "हर दबा हुआ विचार अनकॉन्शियस होता है।"
        ],
        image: "/assets/egoid/post_02.png"
    },
    {
        id: 3,
        title: "ईगो (Ego) क्या है?",
        topic: "Ego (मैं)",
        mainThought: "हर इंसान के अंदर एक हिस्सा होता है जो सब संभालता है और बाहर की दुनिया से तालमेल बिठाता है।",
        highlights: [
            "ईगो का काम निर्णय लेना और व्यवहार को नियंत्रित करना है।",
            "यह वास्तविकता और इच्छाओं के बीच संतुलन बनाता है।",
            "चौंकाने वाली बात ये है कि ईगो का भी एक हिस्सा अनकॉन्शियस होता है।"
        ],
        image: "/assets/egoid/post_03.png"
    },
    {
        id: 4,
        title: "इड (Id) क्या है?",
        topic: "Id (इच्छाओं का स्रोत)",
        mainThought: "मन का वो हिस्सा जो सिर्फ इच्छाओं और तुरंत सुख (Pleasure) की तलाश में रहता है।",
        highlights: [
            "इड वास्तविकता की परवाह नहीं करता।",
            "यह भावनात्मक और बेकाबू होता है।",
            "ईगो और इड का रिश्ता सवार और घोड़े जैसा है (घोड़ा = इड)।"
        ],
        image: "/assets/egoid/post_04.png"
    },
    {
        id: 5,
        title: "सुपर ईगो क्या है?",
        topic: "Superego (अंदर का जज)",
        mainThought: "हमारे अंदर का नैतिक जज जो हमें सही और गलत की पहचान करवाता है और समाज के नियमों को सिखाता है।",
        highlights: [
            "यह माता-पिता और समाज के प्रभाव से बनता है।",
            "यही हमें गिल्ट (ग्लानि) महसूस करवाता है।",
            "यह एक आदर्श व्यक्तित्व की छवि बनाए रखता है।"
        ],
        image: "/assets/egoid/post_05.png"
    },
    {
        id: 6,
        title: "ओडीपस कॉम्प्लेक्स",
        topic: "Childhood Psychology",
        mainThought: "बचपन के वो मनोवैज्ञानिक खिंचाव जो हमारे व्यक्तित्व के विकास में गहरा रोल निभाते हैं।",
        highlights: [
            "बच्चे का माता-पिता के प्रति आकर्षण और प्रतिस्पर्धा।",
            "यह स्थिति व्यक्तित्व की नींव रखती है।",
            "इसे समझना हमारे रिश्तों के पैटर्न को समझने जैसा है।"
        ],
        image: "/assets/egoid/post_06.png"
    },
    {
        id: 7,
        title: "सुपर ईगो की ताकत",
        topic: "Moral Control",
        mainThought: "सुपर ईगो इतना शक्तिशाली क्यों है? क्योंकि ये हमारे बचपन के सबसे गहरे अनुभवों से जुड़ा है।",
        highlights: [
            "सही और गलत का गहरा एहसास।",
            "आत्म-आलोचना और गिल्ट की जड़ें यहीं हैं।",
            "सामाजिक नैतिकता का आंतरिक रूप।"
        ],
        image: "/assets/egoid/post_07.png"
    },
    {
        id: 8,
        title: "जीवन और मृत्यु की ताकतें",
        topic: "Eros vs Death Instinct",
        mainThought: "इंसानी मन के भीतर दो महान प्रवृत्तियां हमेशा आपस में टकराती रहती हैं।",
        highlights: [
            "Eros: जीवन शक्ति, प्यार और रचनात्मकता।",
            "Death Instinct: विनाश और आक्रामकता की प्रवृत्ति।",
            "मानव जीवन इन दोनों के बीच एक निरंतर संघर्ष है।"
        ],
        image: "/assets/egoid/post_08.png"
    },
    {
        id: 9,
        title: "ईगो की मुश्किल स्थिति",
        topic: "Ego under pressure",
        mainThought: "ईगो को एक साथ तीन कड़े मालिकों को खुश रखना पड़ता है, जिससे मानसिक तनाव पैदा होता है।",
        highlights: [
            "बाहरी दुनिया की वास्तविकता।",
            "इड की अनियंत्रित इच्छाएं।",
            "सुपर ईगो की सख्त नैतिकता।",
            "यही रस्साकशी 'एंग्जायटी' का कारण बनती है।"
        ],
        image: "/assets/egoid/post_09.png"
    },
    {
        id: 10,
        title: "मन की अंतिम समझ",
        topic: "Final understanding of the psyche",
        mainThought: "इड, ईगो और सुपर ईगो के संतुलन से ही एक स्वस्थ मानसिक जीवन संभव है।",
        highlights: [
            "इड: इच्छाओं की शक्ति।",
            "ईगो: वास्तविकता का प्रबंधक।",
            "सुपर ईगो: नैतिक जज।",
            "असंतुलन ही मानसिक समस्याओं की जड़ है।"
        ],
        image: "/assets/egoid/post_10.png"
    }
];

const EgoIdSeries = () => {
    const { currentUser } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    useEffect(() => {
        window.scrollTo(0, 0);
        analytics.logEvent('series_start', { series: 'ego_id_hindi' });
        document.body.classList.add('hyperfocus-mode');
        return () => document.body.classList.remove('hyperfocus-mode');
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const blocks = document.querySelectorAll('.post-block');
            const scrollPos = window.scrollY + window.innerHeight / 2;

            blocks.forEach((block, idx) => {
                const top = block.offsetTop;
                if (scrollPos >= top && scrollPos < top + block.offsetHeight) {
                    if (idx !== currentIndex) {
                        setCurrentIndex(idx);
                        if (currentUser) {
                            const userRef = doc(db, 'users', currentUser.uid);
                            updateDoc(userRef, { [`seriesProgress.ego-id`]: idx + 1 });
                        }
                    }
                }
            });

            // Completion check
            const footer = document.querySelector('.bottom-cta');
            if (footer && footer.getBoundingClientRect().top < window.innerHeight && !isCompleted) {
                setIsCompleted(true);
                analytics.logEvent('series_completion', { series: 'ego_id_hindi' });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentIndex, isCompleted, currentUser]);

    const scrollToIdx = (idx) => {
        const blocks = document.querySelectorAll('.post-block');
        if (blocks[idx]) blocks[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="hyperfocus-page ego-id-page">
            <SEO 
                title="The Ego and the Id: मन का विज्ञान (Hindi Psychology Series)"
                description="Explore the depths of the human psyche with our 10-part series on Sigmund Freud's concepts of the Id, Ego, and Superego. Explained in simple Hindi."
                image="/assets/egoid/post_01.png"
                url="https://soulthread.in/ego-id-series"
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": "The Ego and the Id: Freud's Psychology in Hindi",
                    "description": "A 10-part series explaining Sigmund Freud's psychological models in simple Hindi.",
                    "provider": {
                        "@type": "Organization",
                        "name": "SoulThread",
                        "sameAs": "https://soulthread.in"
                    }
                }}
            />
            <Breadcrumbs />
            <header className="sticky-header">
                <div className="header-content">
                    <Link to="/" className="logo-link">
                        <span className="logo-text">SOULTHREAD</span>
                    </Link>
                    <div className="series-title-mini">The Ego and the Id</div>
                    <div className="progress-text">Episode {currentIndex + 1} / 10</div>
                </div>
                <motion.div className="progress-bar psych-bar" style={{ scaleX }} />
            </header>

            <section className="hero-section psych-hero">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                    <span className="topic-label">Psychoanalysis Series</span>
                    <h1>Ego and the Id</h1>
                    <p>फ्रॉयड की मनोवैज्ञानिक समझ: मन की गहराइयों का सफर।</p>
                    <button className="start-btn" onClick={() => scrollToIdx(0)}>सीखना शुरू करें</button>
                </motion.div>
            </section>

            <main className="series-container">
                <div className="series-intro">
                    <h2>मन का विज्ञान</h2>
                    <p className="subtitle">Understanding the Human Psyche through Freud's Core Concepts</p>
                </div>

                <div className="posts-list">
                    {episodes.map((ep, idx) => (
                        <motion.div 
                            key={ep.id} 
                            className="post-block"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <div className="episode-header">
                                <span className="topic-label">{ep.topic}</span>
                                <span className="episode-number">EPISODE {ep.id}</span>
                            </div>
                            <h3>{ep.title}</h3>

                            <div className="post-image-container">
                                <img 
                                    src={ep.image} 
                                    alt={`The Ego and the Id: ${ep.title} - Psychology Explainer Hindi`} 
                                    className="psych-image" 
                                    loading="lazy"
                                />
                            </div>

                            <div className="post-content">
                                <p className="main-thought">{ep.mainThought}</p>
                                <div className="psych-insight-box">
                                    {ep.highlights.map((item, i) => (
                                        <div key={i} className="learn-item">
                                            <span className="learn-bullet">✦</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="post-navigation">
                                <button className="nav-btn prev" disabled={idx === 0} onClick={() => scrollToIdx(idx - 1)}>Prev</button>
                                <button className="nav-btn next" disabled={idx === episodes.length - 1} onClick={() => scrollToIdx(idx + 1)}>Next</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            <section className="bottom-cta" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '60px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ opacity: 0.7, marginBottom: '12px' }}>Understanding the human mind? Now understand the artificial one.</p>
                    <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Master AI Engineering</h2>
                    <Link to="/prompt-engineering-series" className="explore-btn" style={{ background: '#3b82f6', color: 'white', border: 'none' }}>
                        Start The Prompt Architect →
                    </Link>
                </div>
                <div style={{ marginTop: '40px' }}>
                    <p>आपने सभी एपिसोड देख लिए हैं। अपनी यात्रा जारी रखें।</p>
                    <Link to="/series" className="explore-btn" style={{ marginTop: '16px' }}>सब देखें (View All)</Link>
                </div>
            </section>

            <footer className="series-footer">
                <p>© 2026 SoulThread. Exploring the Depths of Mind.</p>
            </footer>
        </div>
    );
};

export default EgoIdSeries;
