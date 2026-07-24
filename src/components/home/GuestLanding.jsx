// GuestLanding — landing page for logged-out users
// Clean, text-first, no emojis, no icon cards. Human tone.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GuestLanding.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: 'Is my identity really anonymous?',
    a: 'Yes. You post under a randomly generated alias. Your real name and email are never visible to anyone on the platform.',
  },
  {
    q: 'How does the safety system work?',
    a: 'Content screening runs locally on your device. No text is sent to external servers for moderation.',
  },
  {
    q: 'Who can see my posts?',
    a: 'Posts marked public are visible to other members. You choose visibility every time you post.',
  },
  {
    q: 'How do I find a psychologist?',
    a: 'Go to the Get Support tab after signing in. Every psychologist is verified before appearing in the directory.',
  },
  {
    q: 'Is the community free?',
    a: 'The community feed, anonymous posting, and crisis resources are always free. Premium series and psychologist sessions are paid.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{q}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  );
}

export default function GuestLanding({ isNativeApp }) {
  return (
    <main className="gl-shell" style={{ background: 'var(--color-background)' }}>

      {/* ── HERO ── */}
      <section style={{ padding: '72px 24px 56px', textAlign: 'center', background: 'var(--hero-bg)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', fontWeight: '600' }}>
            India's mental health community
          </p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 8vw, 3.2rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '20px', color: 'var(--hero-text)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Some days are just a lot
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', maxWidth: '420px', margin: '0 auto 36px' }}>
            Say the thing you can't say out loud. Anonymous community, verified psychologists, zero judgment.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto 40px' }}>
            <Link to="/signup" style={{ display: 'block', padding: '15px 24px', borderRadius: '12px', background: 'var(--color-primary)', color: 'white', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
              Get Started — It's Free
            </Link>
            <Link to="/login" style={{ display: 'block', padding: '15px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: '600', textDecoration: 'none', textAlign: 'center', background: 'transparent' }}>
              Sign in
            </Link>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <p style={{ fontSize: '15px', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>
              "I talked about my anxiety here when I couldn't tell anyone else."
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', marginBottom: '20px' }}>— Anonymous member</p>
            <p style={{ fontSize: '15px', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', margin: 0 }}>
              "I found a therapist I could actually afford."
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>— Anonymous member</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '20px' }}>
              Representative examples, not verified reviews.
            </p>
          </div>
        </div>
      </section>

      {/* ── THREE THINGS ── */}
      <section style={{ padding: '56px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '32px', color: 'var(--color-text-primary)' }}>
          Three things in one place
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Community', title: "Say what you've been holding in", desc: 'Post anonymously. Real people respond. No advice unless you ask for it. No real name ever required.', tag: 'Always free' },
            { label: 'Psychologists', title: 'Talk to someone who is qualified', desc: 'Every psychologist is verified before they appear. Book a session. Pay per session — no subscription needed.', tag: 'From ₹300 / session' },
            { label: 'Series', title: 'Learn at your own pace', desc: 'Guided audio and visual programmes on anxiety, focus, ego, relationships, memory, and more.', tag: 'Premium' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '6px' }}>{item.label}</p>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.65', marginBottom: '10px' }}>{item.desc}</p>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>{item.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOPICS ── */}
      <section style={{ padding: '48px 24px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '12px' }}>What people talk about</p>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: 'var(--color-text-primary)' }}>One platform. Every real-life challenge.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              ['Mental Wellness', 'Anxiety, depression, burnout, grief'],
              ['Relationships', 'Family conflict, trust, attachment'],
              ['Caretaker Support', 'Hospital stress, home care, exhaustion'],
              ['Financial Stress', 'Debt, job loss, money anxiety'],
              ['Career & Purpose', 'Burnout, toxic work, purposelessness'],
              ['Physical Health', 'Chronic illness, surgery, chronic pain'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.5', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '12px' }}>Built for India</p>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '28px', color: 'var(--color-text-primary)' }}>Safe by design</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            ['Anonymous by default', 'No real name, no profile photo requirement. Your email is never visible to other users.'],
            ['Content screening runs on your device', 'Crisis detection and privacy guard run locally. Nothing is sent to an external server.'],
            ['Made for India', 'Hindi and English. Indian crisis helplines. Indian psychologists.'],
            ['Free for core features', 'Community posting, reading, and crisis resources are always free.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{title}</p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '48px 24px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: 'var(--color-text-primary)' }}>Frequently asked</h2>
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: '56px 24px', textAlign: 'center', background: 'var(--hero-bg)' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--hero-text)', marginBottom: '12px', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Ready to take the first step?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px', lineHeight: '1.6' }}>
            No real name. No judgment. Just people who understand.
          </p>
          <Link to="/signup" style={{ display: 'block', padding: '15px 24px', borderRadius: '12px', background: 'var(--color-primary)', color: 'white', fontSize: '15px', fontWeight: '700', textDecoration: 'none' }}>
            Join SoulThread — It's Free
          </Link>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '16px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Sign in</Link>
          </p>
        </div>
      </section>

    </main>
  );
}
