import React from 'react';
import { useNavigate } from 'react-router-dom';

const DailyPrompt = ({ dailyPrompt }) => {
  const navigate = useNavigate();

  if (!dailyPrompt) return null;

  return (
    <div className="daily-prompt-card animate-fade-up">
      {/* Decorative circle */}
      <div className="prompt-decoration" />

      <div className="prompt-content">
        <div className="prompt-label">
          Today's Introspection
        </div>
        <h2 className="prompt-text">
          "{dailyPrompt.text}"
        </h2>
        <button
          onClick={() => navigate('/post', { state: { prefilledPrompt: dailyPrompt } })}
          className="prompt-btn animate-float"
        >
          Write Your Story
        </button>
      </div>
    </div>
  );
};

export default DailyPrompt;
