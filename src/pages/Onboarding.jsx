import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../services/categories';
import { 
    HeartPulse, 
    Brain, 
    Volume2, 
    Wrench, 
    Sparkles, 
    Rainbow, 
    Users, 
    Heart, 
    Flame,
    PenLine,
    Sprout,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';

const ICON_MAP = {
    HeartPulse,
    Brain,
    Volume2,
    Wrench,
    Sparkles,
    Rainbow,
    Users,
    Heart,
    Flame,
    PenLine,
    Sprout
};

const Onboarding = () => {
    const { currentUser, createPhoneUserProfile } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: name, 2: details, 3: interests
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        bio: '',
        interests: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStep1 = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.name.trim().length < 2) {
            setError('Please enter your name (at least 2 characters).');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createPhoneUserProfile(currentUser, formData);
            navigate('/');
        } catch (err) {
            setError('Could not save your profile. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-md)',
                width: '100%',
                maxWidth: '420px'
            }}>
                {/* Progress bar */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        <span>{step === 1 ? 'Step 1 of 3' : step === 2 ? 'Step 2 of 3' : 'Step 3 of 3'}</span>
                        <span>{step === 1 ? '33%' : step === 2 ? '66%' : '100%'}</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '999px' }}>
                        <div style={{ height: '100%', width: step === 1 ? '33%' : step === 2 ? '66%' : '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
                    </div>
                </div>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>
                        {step === 1 ? <Sprout size={48} /> : <Sparkles size={48} />}
                    </div>
                    <h1 style={{ fontSize: '24px', color: 'var(--color-primary)', margin: '0 0 8px 0' }}>
                        {step === 1 ? 'Welcome to SoulThread!' : step === 2 ? 'A little more about you' : 'What touches your soul?'}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                        {step === 1 ? 'This is your safe space. Let\'s start with your name.' :
                            step === 2 ? 'These details help us personalise your experience. All optional.' :
                                'Select categories that interest you to personalise your feed.'}
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                {/* Step 1: Name */}
                {step === 1 && (
                    <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                                What should we call you? *
                            </label>
                            <input
                                type="text"
                                placeholder="Your name..."
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                maxLength={50}
                                required
                                autoFocus
                                style={{
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1.5px solid var(--color-border)',
                                    fontSize: '16px',
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-text-primary)',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                                Age (optional)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 24"
                                value={formData.age}
                                onChange={e => handleChange('age', e.target.value)}
                                min={13}
                                max={100}
                                style={{
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1.5px solid var(--color-border)',
                                    fontSize: '16px',
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-text-primary)',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                                Gender (optional)
                            </label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => handleChange('gender', formData.gender === g ? '' : g)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '999px',
                                            border: `1.5px solid ${formData.gender === g ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            background: formData.gender === g ? 'rgba(139,169,137,0.15)' : 'transparent',
                                            color: formData.gender === g ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                            fontWeight: formData.gender === g ? '600' : '400',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                                A little about yourself (optional)
                            </label>
                            <textarea
                                placeholder="Share what brings you to SoulThread..."
                                value={formData.bio}
                                onChange={e => handleChange('bio', e.target.value)}
                                maxLength={200}
                                rows={3}
                                style={{
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1.5px solid var(--color-border)',
                                    fontSize: '15px',
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-text-primary)',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    resize: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                {formData.bio.length}/200
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn-ghost"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="btn-primary"
                                style={{ flex: 2, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Interests */}
                {step === 3 && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                                Pick 3 or more (Optional)
                            </label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {CATEGORIES.map(cat => {
                                    const isSelected = formData.interests.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                const newInterests = isSelected
                                                    ? formData.interests.filter(id => id !== cat.id)
                                                    : [...formData.interests, cat.id];
                                                handleChange('interests', newInterests);
                                            }}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '999px',
                                                border: `1.5px solid ${isSelected ? cat.color : 'var(--color-border)'}`,
                                                background: isSelected ? cat.colorSoft : 'white',
                                                color: isSelected ? cat.color : 'var(--color-text-secondary)',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <span className="category-icon" style={{ display: 'flex' }}>
                                                {(() => {
                                                    const IconComp = ICON_MAP[cat.icon];
                                                    return IconComp ? <IconComp size={16} /> : <PenLine size={16} />;
                                                })()}
                                            </span> {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="btn-ghost"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    flex: 2, fontSize: '16px',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                    boxShadow: '0 4px 14px rgba(61,139,127,0.3)'
                                }}
                            >
                                {loading ? 'Entering...' : 'Enter SoulThread'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
