import React from 'react';
import { 
    Smile, 
    AlertCircle, 
    Heart, 
    HelpCircle, 
    Sparkles 
} from 'lucide-react';

const MOODS = [
    { m: 'Calm', icon: <Smile size={20} strokeWidth={1.5} />, color: '#10b981' },
    { m: 'Overwhelmed', icon: <AlertCircle size={20} strokeWidth={1.5} />, color: '#f59e0b' },
    { m: 'Grateful', icon: <Heart size={20} strokeWidth={1.5} />, color: '#ec4899' },
    { m: 'Confused', icon: <HelpCircle size={20} strokeWidth={1.5} />, color: '#64748b' },
    { m: 'Hopeful', icon: <Sparkles size={20} strokeWidth={1.5} />, color: '#c5a358' },
];

const MoodCheckIn = ({ handleMoodSelect, selectedMood }) => {
  return (
    <div className="premium-card animate-fade-up mood-checkin-card">
      <div className="mood-header">
        <div className="mood-icon-wrapper-premium">
          <Sparkles size={18} strokeWidth={2.5} className="mood-spark-icon" />
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
            className={`mood-btn-premium ${selectedMood === mood.m ? 'active' : ''}`}
            style={{ '--mood-accent': mood.color }}
          >
            <span className="mood-icon-shell">{mood.icon}</span>
            <span className="mood-label">
              {mood.m}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .mood-checkin-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            padding: 24px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-soft);
        }
        .mood-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .mood-icon-wrapper-premium {
            width: 32px;
            height: 32px;
            background: var(--color-primary-soft);
            color: var(--color-primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .mood-title {
            font-size: 16px;
            font-weight: 800;
            color: var(--color-text-primary);
            letter-spacing: -0.02em;
            margin: 0;
        }
        .mood-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 12px;
        }
        .mood-btn-premium {
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: 14px;
            padding: 12px 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mood-btn-premium:hover {
            border-color: var(--mood-accent);
            transform: translateY(-4px);
            background: white;
            box-shadow: var(--shadow-md);
        }
        .mood-btn-premium.active {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: white;
        }
        .mood-icon-shell {
            color: var(--mood-accent);
            transition: color 0.3s ease;
        }
        .mood-btn-premium.active .mood-icon-shell {
            color: white;
        }
        .mood-label {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default MoodCheckIn;

