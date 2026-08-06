import React from 'react';
import './PrivacyBanner.css';

/**
 * PrivacyBanner communicates explicit data security and encryption guarantees to the user,
 * increasing trust in sensitive contexts (Journals, Chat, Medical Records).
 * 
 * @param {Object} props
 * @param {'journal' | 'chat' | 'medical'} [props.type='journal'] - Determines the copy
 */
export const PrivacyBanner = ({ type = 'journal' }) => {
  const getCopy = () => {
    switch (type) {
      case 'chat':
        return {
          title: 'End-to-End Encrypted',
          message: 'Your messages are secured with military-grade encryption. Only you and your guide can read them.'
        };
      case 'medical':
        return {
          title: 'HIPAA Compliant',
          message: 'Your clinical data is stored in a secure, audited environment.'
        };
      case 'journal':
      default:
        return {
          title: 'Strictly Private & Encrypted',
          message: 'Your journal entries are for your eyes only. Guides and administrators cannot read them.'
        };
    }
  };

  const { title, message } = getCopy();

  return (
    <div className="st-privacy-banner">
      <div className="st-privacy-banner-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <div className="st-privacy-banner-content">
        <h4 className="st-privacy-banner-title">{title}</h4>
        <p className="st-privacy-banner-message">{message}</p>
      </div>
    </div>
  );
};
