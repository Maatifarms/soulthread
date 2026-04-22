import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Quote, PenLine } from 'lucide-react';

const DailyPrompt = ({ dailyPrompt, isGuest = false }) => {
  const navigate = useNavigate();

  if (!dailyPrompt) return null;

  return (
    <div className="daily-prompt-elite animate-fade-up">
      <div className="prompt-backdrop-glow" />
      
      <div className="prompt-header-row">
        <div className="prompt-tag-premium">
            <Quote size={12} fill="currentColor" />
            <span>Introspection</span>
        </div>
        <div className="prompt-live-indicator">
            <span className="live-dot" />
            Live
        </div>
      </div>

      <div className="prompt-body">
        <h2 className="prompt-text-premium">
          {dailyPrompt.text}
        </h2>
        
        <div className="prompt-footer">
          {isGuest ? (
            <button
              onClick={() => navigate('/login')}
              className="premium-btn primary shadow-gold"
              style={{ padding: '12px 24px', borderRadius: '12px' }}
            >
              Sign In to Participate
            </button>
          ) : (
            <button
              onClick={() => navigate('/post', { state: { prefilledPrompt: dailyPrompt } })}
              className="premium-btn primary shadow-gold"
              style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PenLine size={18} />
              Share Your Narrative
            </button>
          )}
        </div>
      </div>

      <style>{`
        .daily-prompt-elite {
            position: relative;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            padding: 32px;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
            margin-bottom: 24px;
        }
        .prompt-backdrop-glow {
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(197,163,88,0.08) 0%, rgba(255,255,255,0) 70%);
            z-index: 0;
            pointer-events: none;
        }
        .prompt-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            position: relative;
            z-index: 1;
        }
        .prompt-tag-premium {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            background: var(--color-primary-soft);
            color: var(--color-primary);
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 1px solid var(--color-primary-border);
        }
        .prompt-live-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--color-text-muted);
            letter-spacing: 0.05em;
        }
        .live-dot {
            width: 6px;
            height: 6px;
            background: #ef4444;
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
            animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        .prompt-body {
            position: relative;
            z-index: 1;
        }
        .prompt-text-premium {
            font-family: var(--font-primary);
            font-size: 24px;
            font-weight: 700;
            line-height: 1.4;
            color: var(--color-text-primary);
            margin-bottom: 32px;
            letter-spacing: -0.01em;
        }
        .prompt-footer {
            display: flex;
            justify-content: flex-start;
        }
      `}</style>
    </div>
  );
};

export default DailyPrompt;

