import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './Onboarding.css';

export default function Onboarding() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [patientName, setPatientName] = useState('');
  const [primaryConcern, setPrimaryConcern] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If we arrived here but are not logged in, wait or redirect (handled by AuthContext generally)
  useEffect(() => {
    if (!currentUser) {
      // Just wait for auth to catch up
    }
  }, [currentUser]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleComplete = async () => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    setIsSubmitting(true);
    const onboardingData = {
      userType,
      completedAt: new Date().toISOString()
    };
    
    if (userType === 'caretaker' || userType === 'both') {
      if (patientName.trim()) onboardingData.patientName = patientName.trim();
    } else {
      if (primaryConcern) onboardingData.primaryConcern = primaryConcern;
    }

    try {
      // Save to users/{uid}/onboarding/data
      await setDoc(doc(db, 'users', currentUser.uid, 'onboarding', 'data'), onboardingData);
      
      if (userType === 'caretaker' || userType === 'both') {
        navigate('/neha');
      } else {
        navigate('/');
      }
    } catch (e) {
      console.error("Failed to save onboarding data", e);
      navigate('/'); // safe fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const concerns = [
    'Anxiety', 'Depression', 'Loneliness', 
    'Relationships', 'Career', 'Financial stress', 'Just exploring'
  ];

  return (
    <div className="onboarding-container">
      {/* Progress Dots */}
      <div className="onboarding-progress">
        <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} />
        <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} />
        <div className={`progress-dot ${step >= 3 ? 'active' : ''}`} />
      </div>

      <div className="onboarding-slider" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>
        
        {/* SCREEN 1 */}
        <div className="onboarding-screen">
          <div className="onboarding-content-center">
            <div className="welcome-emoji">👋</div>
            <h1 className="onboarding-title">Welcome to SoulThread</h1>
            <p className="onboarding-subtitle">
              Tell us why you're here so we can show you what matters most
            </p>
          </div>
          <div className="onboarding-footer">
            <button className="onboarding-btn-primary" onClick={handleNext}>
              Let's go →
            </button>
          </div>
        </div>

        {/* SCREEN 2 */}
        <div className="onboarding-screen">
          <div className="onboarding-content-scroll">
            <h2 className="onboarding-heading">I am here because...</h2>
            
            <div className="onboarding-cards">
              <button 
                className={`onboarding-card ${userType === 'caretaker' ? 'selected' : ''}`}
                onClick={() => setUserType('caretaker')}
              >
                <div className="card-icon">🏥</div>
                <div className="card-text">
                  <h3>I'm caring for a patient</h3>
                  <p>Track medicines, reports, recovery</p>
                </div>
              </button>

              <button 
                className={`onboarding-card ${userType === 'mental_health' ? 'selected' : ''}`}
                onClick={() => setUserType('mental_health')}
              >
                <div className="card-icon">🧠</div>
                <div className="card-text">
                  <h3>I need mental health support</h3>
                  <p>Anonymous community, Soul Guides</p>
                </div>
              </button>

              <button 
                className={`onboarding-card ${userType === 'both' ? 'selected' : ''}`}
                onClick={() => setUserType('both')}
              >
                <div className="card-icon">💙</div>
                <div className="card-text">
                  <h3>Both — I'm a caretaker who needs support</h3>
                  <p>Get the full SoulThread experience</p>
                </div>
              </button>
            </div>
          </div>
          <div className="onboarding-footer">
            <button 
              className="onboarding-btn-primary" 
              onClick={handleNext}
              disabled={!userType}
            >
              Continue →
            </button>
          </div>
        </div>

        {/* SCREEN 3 */}
        <div className="onboarding-screen">
          <div className="onboarding-content-scroll">
            {(userType === 'caretaker' || userType === 'both') ? (
              <div className="onboarding-form">
                <h2 className="onboarding-heading">What is your patient's name?</h2>
                <p className="onboarding-label">We'll use this to personalize NEHA for you</p>
                <input 
                  type="text"
                  className="onboarding-input"
                  placeholder="Patient name"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                />
              </div>
            ) : (
              <div className="onboarding-form">
                <h2 className="onboarding-heading">What brings you here today?</h2>
                <div className="onboarding-pills">
                  {concerns.map(concern => (
                    <button
                      key={concern}
                      className={`onboarding-pill ${primaryConcern === concern ? 'selected' : ''}`}
                      onClick={() => setPrimaryConcern(concern)}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="onboarding-footer">
            <button 
              className="onboarding-btn-primary" 
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Finish →'}
            </button>
            <button 
              className="onboarding-btn-skip" 
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              Skip for now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
