import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap, Shield, Sparkles, HeartHandshake, Eye, BookOpen } from 'lucide-react';

const SHOWCASE_SERIES = [
  {
    id: 'hyperfocus-architect',
    title: 'Hyperfocus Architect',
    subtitle: 'Attention training',
    desc: 'Science-based focus protocols and observation training to reclaim control of attention.',
    count: '30 Chapters',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    path: '/hyperfocus-series',
    tag: 'Focus'
  },
  {
    id: 'never-finished',
    title: 'Never Finished',
    subtitle: 'Mental Toughness',
    desc: 'An emotional bootcamp inspired by Goggins philosophy of resilience.',
    count: '30 Chapters',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    path: '/never-finished-series',
    tag: 'Psychology'
  },
  {
    id: 'inner-bloom',
    title: 'Inner Bloom Meditation',
    subtitle: 'Sensory journey',
    desc: '3-level mindfulness series taking you from the neon bustle of Seoul to countryside stillness.',
    count: '3 Levels',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
    path: '/meditation-series',
    tag: 'Mindfulness'
  },
  {
    id: 'relationship-mastery',
    title: 'Relationship Mastery',
    subtitle: 'The Heart\'s Journey',
    desc: 'Navigate modern relationships, attachment patterns, and the psychology of connection.',
    count: '10 Chapters',
    icon: HeartHandshake,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    path: '/relationship-series',
    tag: 'Love'
  },
  {
    id: 'lust-decoded',
    title: 'Lust Decoded',
    subtitle: 'Intimacy & Attraction',
    desc: 'Understand the quiet shifts in intimacy, biology of desire, and attachment signals.',
    count: '17 Chapters',
    icon: Eye,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
    path: '/lust-decoded',
    tag: 'Intimacy'
  }
];

const SanctuarySeriesShowcase = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="showcase-section">
      <div className="showcase-header">
        <div>
          <span className="showcase-pre">Stuff That Actually Helps</span>
          <h2 className="showcase-title">Guides for the stuff <em className="h-grad-text">no one explains.</em></h2>
          <p className="showcase-desc">
            Focus, breakups, burnout, overthinking, attraction — bite-sized series that get straight to the point. No fluff, no endless scrolling.
          </p>
        </div>

        <div className="showcase-nav-btns">
          <button onClick={() => scroll('left')} aria-label="Scroll left" className="showcase-nav-btn">
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} aria-label="Scroll right" className="showcase-nav-btn">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="showcase-scroll-container hide-scrollbar">
        <div className="showcase-track">
          {SHOWCASE_SERIES.map((series, idx) => {
            const Icon = series.icon;
            return (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="showcase-card"
              >
                <Link to={series.path} className="showcase-card-link">
                  <div className="showcase-card-visual" style={{ background: series.gradient }}>
                    <div className="showcase-card-visual-overlay" />
                    <div className="showcase-icon-wrapper">
                      <Icon size={28} />
                    </div>
                    <span className="showcase-card-tag">{series.tag}</span>
                  </div>

                  <div className="showcase-card-content">
                    <div className="showcase-card-meta">
                      <span className="showcase-card-count">
                        <BookOpen size={12} style={{ marginRight: '4px' }} />
                        {series.count}
                      </span>
                    </div>
                    
                    <h3 className="showcase-card-title">{series.title}</h3>
                    <h4 className="showcase-card-subtitle">{series.subtitle}</h4>
                    <p className="showcase-card-desc">{series.desc}</p>
                    
                    <div className="showcase-card-footer">
                      <span className="showcase-read-btn">Explore Episodes</span>
                      <ArrowRight size={14} className="showcase-arrow" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .showcase-section {
          padding: 100px 24px;
          max-width: 1300px;
          margin: 0 auto;
          overflow: hidden;
        }

        .showcase-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 50px;
          gap: 24px;
        }

        .showcase-pre {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 11px;
          font-weight: 800;
          color: var(--color-primary);
          margin-bottom: 16px;
          display: block;
        }

        .showcase-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 950;
          margin-bottom: 16px;
          letter-spacing: -0.04em;
          color: var(--color-text-primary);
          line-height: 1.1;
        }

        .showcase-desc {
          font-size: 16px;
          color: var(--color-text-secondary);
          max-width: 600px;
          line-height: 1.6;
          margin: 0;
        }

        .showcase-nav-btns {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        .showcase-nav-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-surface);
          border: 1.5px solid var(--color-border);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .showcase-nav-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: scale(1.05);
        }

        .showcase-scroll-container {
          overflow-x: auto;
          padding: 16px 4px 32px 4px;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
        }

        .showcase-track {
          display: flex;
          gap: 28px;
          width: max-content;
        }

        .showcase-card {
          width: 340px;
          background: var(--color-surface);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          scroll-snap-align: start;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-sm);
        }

        .showcase-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-primary);
        }

        .showcase-card-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .showcase-card-visual {
          position: relative;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          overflow: hidden;
        }

        .showcase-card-visual-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 30%, rgba(0, 0, 0, 0.15) 100%);
          mix-blend-mode: multiply;
        }

        .showcase-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          position: relative;
          z-index: 2;
        }

        .showcase-card-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
          border-radius: var(--radius-sm);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          z-index: 2;
        }

        .dark-mode .showcase-card-tag {
          background: #1e293b;
          color: white;
        }

        .showcase-card-content {
          padding: 28px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .showcase-card-meta {
          margin-bottom: 12px;
        }

        .showcase-card-count {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 800;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .showcase-card-title {
          font-size: 20px;
          font-weight: 900;
          color: var(--color-text-primary);
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .showcase-card-subtitle {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-muted);
          margin: 0 0 16px 0;
        }

        .showcase-card-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin: 0 0 24px 0;
          flex-grow: 1;
        }

        .showcase-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-primary);
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: gap 0.2s ease;
        }

        .showcase-card:hover .showcase-card-footer {
          gap: 10px;
        }

        /* Temp gradients since Tailwind isn't fully set up in CSS */
        .bg-gradient-to-br {
          background-size: 200% 200%;
          animation: gradient-flow 10s ease infinite;
        }
        .from-amber-500 { background-image: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); }
        .from-indigo-500 { background-image: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
        .from-teal-500 { background-image: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); }
        .from-pink-500 { background-image: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); }
        .from-red-500 { background-image: linear-gradient(135deg, #ef4444 0%, #ec4899 100%); }

        @media (max-width: 768px) {
          .showcase-header {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 30px;
          }
          .showcase-nav-btns {
            display: none;
          }
          .showcase-card {
            width: 280px;
          }
          .showcase-scroll-container {
            padding-bottom: 16px;
          }
        }
      `}</style>
    </section>
  );
};

export default SanctuarySeriesShowcase;
