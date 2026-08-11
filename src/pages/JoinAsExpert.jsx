import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { ShieldCheck, ArrowLeft, CheckCircle2, User, Mail, Phone, BookOpen, FileText, Award, Calendar, Languages, IndianRupee, MessageSquare, HelpCircle } from 'lucide-react';

import './JoinAsExpert.css';

const TITLES = [
    "Clinical Psychologist",
    "Counseling Psychologist",
    "Psychiatrist",
    "Wellness Coach",
    "Therapist"
];

const SPECIALIZATIONS = [
    "Anxiety",
    "Depression",
    "Relationships",
    "Trauma",
    "Career stress",
    "Grief",
    "Addiction",
    "Student counseling"
];

const LANGUAGES = [
    "Hindi",
    "English",
    "Other"
];

const JoinAsExpert = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Form States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [title, setTitle] = useState(TITLES[0]);
    const [qualification, setQualification] = useState('');
    const [rciNumber, setRciNumber] = useState('');
    const [experience, setExperience] = useState('');
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [sessionPrice, setSessionPrice] = useState('');
    const [bio, setBio] = useState('');
    const [whyJoin, setWhyJoin] = useState('');

    // UI States
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const toggleSpecialization = (spec) => {
        if (selectedSpecializations.includes(spec)) {
            setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
        } else {
            setSelectedSpecializations([...selectedSpecializations, spec]);
        }
    };

    const toggleLanguage = (lang) => {
        if (selectedLanguages.includes(lang)) {
            setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
        } else {
            setSelectedLanguages([...selectedLanguages, lang]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("You must be logged in to submit an application.");
            return;
        }

        // Validate experience is positive number
        const expNum = parseInt(experience, 10);
        if (isNaN(expNum) || expNum < 0) {
            alert("Please enter a valid number of years of experience.");
            return;
        }

        // Validate price is positive number
        const priceNum = parseFloat(sessionPrice);
        if (isNaN(priceNum) || priceNum < 0) {
            alert("Please enter a valid expected session price.");
            return;
        }

        // Validate specializations & languages
        if (selectedSpecializations.length === 0) {
            alert("Please select at least one specialization.");
            return;
        }
        if (selectedLanguages.length === 0) {
            alert("Please select at least one language.");
            return;
        }

        setLoading(true);

        try {
            const freshAvailability = {};
            ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].forEach(day => freshAvailability[day] = []);

            // `guides` is publicly readable (Discover browsing needs no auth), so contact
            // PII doesn't belong here — email/phone stay only on the applicant's own
            // users/{uid} doc, which is owner/admin-only per firestore.rules.
            await setDoc(doc(db, 'guides', currentUser.uid), {
                id: currentUser.uid,
                name: fullName,
                photoURL: currentUser.photoURL || null,
                title,
                qualification,
                rciNumber: title === "Clinical Psychologist" ? rciNumber : (rciNumber || ''),
                experience: expNum,
                specialization: selectedSpecializations.join(', '),
                specializations: selectedSpecializations,
                languages: selectedLanguages,
                sessionRate: priceNum,
                bio,
                whyJoin: whyJoin || '',
                isCalendarOpen: false,
                verified: false,
                availability: freshAvailability,
                joinedAt: serverTimestamp()
            });
            
            // Notify Admins
            const { getDocs, collection, query, where, addDoc } = await import('firebase/firestore');
            const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
            const adminSnap = await getDocs(adminQuery);
            const notifications = [];
            adminSnap.forEach((adminDoc) => {
                notifications.push(addDoc(collection(db, 'notifications'), {
                    recipientId: adminDoc.id,
                    type: 'new_expert_application',
                    title: 'New Psychologist Application',
                    message: `${fullName} has applied to be a guide.`,
                    senderId: currentUser.uid,
                    read: false,
                    createdAt: serverTimestamp(),
                    link: '/admin'
                }));
            });
            await Promise.all(notifications);

            setSuccess(true);
        } catch (error) {
            console.error("Error submitting expert application:", error);
            alert("Failed to submit application: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <DesktopLayoutWrapper>
                <SEO title="Application Received | SoulThread" />
                <div className="join-expert-success-page">
                    <div className="success-card animate-fade-in">
                        <CheckCircle2 size={64} className="success-icon" />
                        <h1>Application received</h1>
                        <p>We review within 3-5 days and email you.</p>
                        <div className="success-details">
                            <p>Thank you for your willingness to help and build a safer mental health space with SoulThread.</p>
                        </div>
                        <button onClick={() => navigate('/')} className="success-home-btn">
                            Return Home
                        </button>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (!currentUser) {
        return (
            <DesktopLayoutWrapper>
                <SEO title="Apply as Expert | SoulThread" />
                <div className="join-expert-unauth-page">
                    <div className="unauth-card">
                        <ShieldCheck size={48} className="unauth-icon" />
                        <h1>Authentication Required</h1>
                        <p>Only registered members can apply to become verified guides on SoulThread.</p>
                        <div className="unauth-actions">
                            <Link to="/login?redirect=/join-as-expert" className="unauth-btn-primary">
                                Log In to Apply
                            </Link>
                            <Link to="/signup?redirect=/join-as-expert" className="unauth-btn-secondary">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    return (
        <DesktopLayoutWrapper>
            <SEO title="Apply to become a Verified Guide | SoulThread" />
            <div className="join-expert-page">
                <Breadcrumbs />

                <div className="form-container">
                    <div className="form-header">
                        <ShieldCheck size={36} className="header-icon" />
                        <h1>Join as a Verified Guide</h1>
                        <p>Provide your credentials to start offering professional support on India's anonymous mental wellness community.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="expert-form">
                        
                        {/* Section 1: Basic details */}
                        <div className="form-section">
                            <h2><User size={18} /> Basic Details</h2>
                            <div className="form-grid-2">
                                <div className="form-field">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Dr. Sandhya Ojha"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        placeholder="expert@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Section 2: Professional credentials */}
                        <div className="form-section">
                            <h2><Award size={18} /> Professional Credentials</h2>
                            <div className="form-grid-2">
                                <div className="form-field">
                                    <label>Professional Title *</label>
                                    <select
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="form-select"
                                    >
                                        {TITLES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Qualification *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MA Psychology, BHU"
                                        required
                                        value={qualification}
                                        onChange={(e) => setQualification(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-field">
                                    <label>
                                        RCI Registration Number 
                                        {title === "Clinical Psychologist" ? " *" : " (Optional)"}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. A12345"
                                        required={title === "Clinical Psychologist"}
                                        value={rciNumber}
                                        onChange={(e) => setRciNumber(e.target.value)}
                                    />
                                    {title === "Clinical Psychologist" && (
                                        <span className="field-note warning">Required for clinical psychologists</span>
                                    )}
                                </div>
                                <div className="form-field">
                                    <label>Years of Experience *</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 5"
                                        min="0"
                                        required
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Practice info */}
                        <div className="form-section">
                            <h2><Languages size={18} /> Practice Details</h2>
                            <div className="form-field">
                                <label>Specializations * (Select all that apply)</label>
                                <div className="chips-container">
                                    {SPECIALIZATIONS.map(spec => {
                                        const isSelected = selectedSpecializations.includes(spec);
                                        return (
                                            <button
                                                type="button"
                                                key={spec}
                                                className={`chip-btn ${isSelected ? 'active' : ''}`}
                                                onClick={() => toggleSpecialization(spec)}
                                            >
                                                {spec}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-field">
                                    <label>Languages * (Select all that apply)</label>
                                    <div className="chips-container">
                                        {LANGUAGES.map(lang => {
                                            const isSelected = selectedLanguages.includes(lang);
                                            return (
                                                <button
                                                    type="button"
                                                    key={lang}
                                                    className={`chip-btn ${isSelected ? 'active' : ''}`}
                                                    onClick={() => toggleLanguage(lang)}
                                                >
                                                    {lang}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label>Expected Session Price (₹) *</label>
                                    <div className="price-input-wrapper">
                                        <span className="price-prefix">₹</span>
                                        <input
                                            type="number"
                                            placeholder="999"
                                            min="0"
                                            required
                                            value={sessionPrice}
                                            onChange={(e) => setSessionPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Personal Statement */}
                        <div className="form-section">
                            <h2><MessageSquare size={18} /> Profile & Statement</h2>
                            <div className="form-field">
                                <label>Short Bio * (Max 300 characters)</label>
                                <textarea
                                    placeholder="Briefly describe your approach to guidance..."
                                    required
                                    maxLength={300}
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                                <span className="char-counter">{bio.length} / 300</span>
                            </div>

                            <div className="form-field">
                                <label>Why SoulThread? (Optional)</label>
                                <textarea
                                    placeholder="What interests you about joining our community?"
                                    rows={3}
                                    value={whyJoin}
                                    onChange={(e) => setWhyJoin(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="form-submit-btn">
                            {loading ? "Submitting Application..." : "Submit Application"}
                        </button>
                    </form>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
};

export default JoinAsExpert;
