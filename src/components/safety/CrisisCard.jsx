import React from 'react';
import { CRISIS_RESOURCES } from '../../services/safetyEngine';
import './CrisisCard.css';

export default function CrisisCard({ language = 'en', onClose, onContinue }) {
  return (
    <div className="crisis-card-overlay">
      <div className="crisis-card">

        {/* Header */}
        <div className="crisis-card-header">
          <span className="crisis-card-icon">💙</span>
          <div>
            <h3 className="crisis-card-title">
              {language === 'hi'
                ? 'हम यहाँ हैं — आप अकेले नहीं हैं'
                : "We're here — you're not alone"}
            </h3>
            <p className="crisis-card-subtitle">
              {language === 'hi'
                ? 'आपने जो लिखा उससे लगा कि आप बहुत कठिन समय से गुज़र रहे हैं। कृपया किसी से बात करें।'
                : "What you wrote suggests you may be going through something very difficult. Please reach out to someone who can help."}
            </p>
          </div>
        </div>

        {/* Crisis resources */}
        <div className="crisis-card-resources">
          {CRISIS_RESOURCES.map((resource, i) => (
            <a
              key={i}
              href={`tel:${resource.phone.replace(/-/g, '')}`}
              className="crisis-resource-item"
            >
              <div className="crisis-resource-info">
                <p className="crisis-resource-name">{resource.name}</p>
                <p className="crisis-resource-desc">
                  {language === 'hi' ? resource.description_hi : resource.description}
                </p>
                <p className="crisis-resource-hours">
                  {language === 'hi' ? resource.hours_hi : resource.hours}
                </p>
              </div>
              <div className="crisis-resource-call">
                <span className="crisis-call-icon">📞</span>
                <span className="crisis-call-number">{resource.phone}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="crisis-card-actions">
          <button className="crisis-btn-primary" onClick={onClose}>
            {language === 'hi' ? 'मैं ठीक हूं, वापस जाएं' : "I'm okay, go back"}
          </button>
          {onContinue && (
            <button className="crisis-btn-ghost" onClick={onContinue}>
              {language === 'hi' ? 'फिर भी पोस्ट करना चाहता हूं' : 'I still want to post'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
