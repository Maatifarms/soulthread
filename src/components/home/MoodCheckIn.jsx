import React from 'react';

const MOODS = [
    { m: 'Calm', emoji: '😌' },
    { m: 'Overwhelmed', emoji: '😰' },
    { m: 'Grateful', emoji: '🙏' },
    { m: 'Confused', emoji: '😕' },
    { m: 'Hopeful', emoji: '✨' },
];

const MoodCheckIn = ({ handleMoodSelect, selectedMood }) => {
  return (
    <div className="premium-card animate-fade-up mood-checkin-card">
      <div className="mood-header">
        <div className="mood-icon-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <h3 className="mood-title">
          Current Energy
        </h3>
      </div>
      <div className="mood-grid">
        {MOODS.map(mood => (
          <button
            key={mood.m}
            onClick={() => handleMoodSelect(mood.m)}
            className={`mood-btn ${selectedMood === mood.m ? 'active' : ''}`}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">
              {mood.m}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodCheckIn;
