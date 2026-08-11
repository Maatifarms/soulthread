import React from 'react';
import { Heart, AlertTriangle } from 'lucide-react';

// Shows gentle feedback as user types
// Only appears for medium+ risk — low risk is silent
export default function SafetyIndicator({ result, language = 'en' }) {
  if (!result) {
    return null;
  }

  if (result.riskLevel === 'medium') {
    return (
      <div className="safety-indicator safety-medium">
        <span><Heart size={16} /></span>
        <p>
          {language === 'hi'
            ? 'क्या आप ठीक हैं? हमारे Soul Guides बात करने के लिए उपलब्ध हैं।'
            : 'Are you doing okay? Our Soul Guides are available to talk.'}
        </p>
      </div>
    );
  }

  if (result.hasPersonalInfo) {
    return (
      <div className="safety-indicator safety-info">
        <span><AlertTriangle size={16} /></span>
        <p>
          {language === 'hi'
            ? 'आपकी पोस्ट में व्यक्तिगत जानकारी (फोन नंबर/ईमेल) है। क्या आप इसे हटाना चाहेंगे?'
            : 'Your post contains personal information (phone/email). Consider removing it for your privacy.'}
        </p>
      </div>
    );
  }

  return null;
}
