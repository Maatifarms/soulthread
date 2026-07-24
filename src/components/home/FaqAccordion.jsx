import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Is it actually anonymous?',
    answer: 'Yes. No real name, no email shown to anyone, no way for other users to figure out who you are. You get a random made-up name when you sign up, and screenshots are blocked inside the app so your posts can\'t be shared around without your say.'
  },
  {
    question: 'What stops this from turning into a toxic comment section?',
    answer: 'Real people check every report within 24 hours, backed by 50+ mentors who actually know this stuff. Harassment, trying to figure out who someone is, and hate speech get you banned — no exceptions. This is for support, not for fighting.'
  },
  {
    question: 'Is it free to use?',
    answer: 'Yes — posting, venting, and connecting with the community costs nothing and always will. We also offer optional in-depth series under "Soul Basic" and "Soul Pro" if you want more structured guidance, but you never need to pay to use the core app.'
  },
  {
    question: 'Can I delete what I posted?',
    answer: 'Any time. Delete a single post, a comment, or your whole account whenever you want — it\'s gone for good, instantly.'
  },
  {
    question: 'Is this a replacement for therapy?',
    answer: 'No — think of it as peer support, not treatment. It\'s a place to be heard between therapy sessions, or if you\'re not ready for therapy yet. If you\'re in crisis right now, go straight to our Crisis Help page (/crisis) for real hotline numbers.'
  }
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className={`faq-item-card ${isOpen ? 'active' : ''}`}>
      <button 
        onClick={onClick} 
        className="faq-question-btn"
        aria-expanded={isOpen}
      >
        <span className="faq-question-text">{item.question}</span>
        <div className="faq-toggle-icon-wrapper">
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="faq-answer-wrapper"
          >
            <p className="faq-answer-text">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FaqAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-header">
        <div className="faq-badge">
          <HelpCircle size={14} />
          <span>Faq</span>
        </div>
        <h2 className="faq-title">Questions people <em className="h-grad-text">actually ask.</em></h2>
        <p className="faq-subtitle">The stuff you're probably wondering before you sign up.</p>
      </div>

      <div className="faq-accordion-container">
        {FAQ_ITEMS.map((item, idx) => (
          <AccordionItem
            key={idx}
            item={item}
            isOpen={openIndex === idx}
            onClick={() => handleToggle(idx)}
          />
        ))}
      </div>

      <style>{`
        .faq-section {
          padding: 100px 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .faq-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--color-primary-soft);
          color: var(--color-primary);
          border: 1px solid var(--color-primary-light);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .dark-mode .faq-badge {
          background: rgba(13, 148, 136, 0.15);
          border-color: rgba(13, 148, 136, 0.3);
        }

        .faq-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 950;
          margin-bottom: 16px;
          letter-spacing: -0.04em;
          color: var(--color-text-primary);
          line-height: 1.15;
        }

        .faq-subtitle {
          font-size: 16px;
          color: var(--color-text-secondary);
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .faq-accordion-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .faq-item-card {
          background: var(--color-surface);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dark-mode .faq-item-card {
          background: rgba(15, 23, 42, 0.4);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .faq-item-card:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-sm);
        }

        .faq-item-card.active {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
          background: var(--color-surface);
        }

        .faq-question-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .faq-question-text {
          font-size: 17px;
          font-weight: 800;
          color: var(--color-text-primary);
          letter-spacing: -0.015em;
          padding-right: 16px;
          line-height: 1.4;
        }

        .faq-toggle-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-surface-2);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .dark-mode .faq-toggle-icon-wrapper {
          background: rgba(255, 255, 255, 0.05);
        }

        .faq-item-card.active .faq-toggle-icon-wrapper {
          background: var(--color-primary);
          color: white;
          transform: rotate(180deg);
        }

        .faq-answer-wrapper {
          overflow: hidden;
        }

        .faq-answer-text {
          padding: 0 28px 24px 28px;
          margin: 0;
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-text-secondary);
        }
      `}</style>
    </section>
  );
};

export default FaqAccordion;
