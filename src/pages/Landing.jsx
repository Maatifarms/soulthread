import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/common/SEO';
import { Button } from '../components/common/Button';
import Footer from '../components/layout/Footer';
import { 
    Shield, 
    Lock, 
    Users, 
    HeartPulse, 
    ArrowRight,
    Brain,
    Battery,
    Heart,
    Zap,
    Quote,
    BookOpen,
    MessageCircle,
    Calendar
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                 SECTION 1                                  */
/* -------------------------------------------------------------------------- */

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-[1280px] mx-auto px-6 flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                    <span className="font-medium text-[16px] tracking-tight text-gray-900">SoulThread</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/login" className="font-medium text-[16px] text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                        Sign In
                    </Link>
                    <Link to="/signup">
                        <Button variant="primary" className="rounded-full px-6 py-2 shadow-sm font-medium text-[16px]">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN PAGE                                   */
/* -------------------------------------------------------------------------- */

export default function Landing() {
    const { currentUser, loading } = useAuth();

    if (!loading && currentUser) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#111827] selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
            <SEO 
                title="SoulThread | Your Clinical Mental Health Sanctuary" 
                description="Clinical Care meets Peer Support. A completely anonymous sanctuary for your mental health."
            />
            
            <Navigation />

            <main className="flex-1 flex flex-col w-full">
                
                {/* SECTION 2: Hero */}
                <section className="relative pt-[120px] md:pt-[160px] pb-[96px] md:pb-[140px] px-6">
                    <div className="max-w-[880px] mx-auto relative z-10">
                        <span className="text-teal-700 font-semibold tracking-[0.02em] text-[14px] uppercase mb-6 block">
                            Clinical Care meets Peer Support
                        </span>
                        <h1 className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[88px] font-black leading-[1.05] tracking-[-0.04em] mb-8 text-[#111827] max-w-[900px]">
                            You don't have to carry it all alone.
                        </h1>
                        <p className="text-[18px] md:text-[20px] font-normal leading-[1.6] tracking-[-0.01em] text-[#6B7280] mb-12 max-w-xl">
                            A completely anonymous sanctuary for your mental health. Journal privately, connect with a supportive community, and consult verified clinical psychologists.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                            <Link to="/signup" className="w-full sm:w-auto">
                                <Button variant="primary" className="w-full sm:w-auto px-10 py-5 text-[18px] font-semibold rounded-full bg-[#111827] text-white hover:bg-black transition-all">
                                    Start Healing Now
                                </Button>
                            </Link>
                            <Link to="/experts" className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-5 font-semibold text-[18px] text-[#374151] bg-white border border-gray-200 hover:border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all">
                                Browse Therapists <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-400 group-hover:text-gray-900" />
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] font-medium text-[#6B7280]">
                            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" /> RCI Verified Psychologists</div>
                            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /> 100% On-Device Privacy</div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: Clinical Trust Strip */}
                <section className="py-[64px] bg-white border-y border-gray-100">
                    <div className="max-w-[1024px] mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 text-center">
                            <div className="flex items-center gap-3 text-[14px] font-semibold uppercase tracking-[0.02em] text-[#6B7280]">
                                <Shield className="w-5 h-5 text-gray-400" /> RCI Verified
                            </div>
                            <div className="flex items-center gap-3 text-[14px] font-semibold uppercase tracking-[0.02em] text-[#6B7280]">
                                <Lock className="w-5 h-5 text-gray-400" /> 100% Anonymous
                            </div>
                            <div className="flex items-center gap-3 text-[14px] font-semibold uppercase tracking-[0.02em] text-[#6B7280]">
                                <HeartPulse className="w-5 h-5 text-gray-400" /> Zero Data Selling
                            </div>
                            <div className="flex items-center gap-3 text-[14px] font-semibold uppercase tracking-[0.02em] text-[#6B7280]">
                                <Users className="w-5 h-5 text-gray-400" /> Private Journaling
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4: The Sanctuary */}
                <section className="py-[160px] bg-[#FAFAFA] relative">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                            {/* Left: 40% (Sticky) */}
                            <div className="lg:col-span-5 lg:sticky lg:top-40 mb-12 lg:mb-0">
                                <h2 className="text-[48px] font-bold text-[#111827] mb-6 tracking-[-0.03em] leading-tight">
                                    Your complete care toolkit.
                                </h2>
                                <p className="text-[20px] text-[#6B7280] leading-[1.6] font-normal tracking-[-0.01em]">
                                    Everything you need to process trauma, manage anxiety, and find peace—built into one seamless ecosystem.
                                </p>
                            </div>

                            {/* Right: 60% (Scrolling) */}
                            <div className="lg:col-span-7 flex flex-col gap-16">
                                
                                {/* Card 1 */}
                                <div className="bg-white rounded-3xl p-10 md:p-14 border border-gray-100 shadow-sm">
                                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                                        <BookOpen className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-[24px] font-semibold text-[#111827] mb-4 tracking-[-0.02em]">Private Journaling</h3>
                                    <p className="text-[16px] text-[#6B7280] leading-relaxed">
                                        Your journal is yours alone. Stored locally on your device. Track your mood and reflect without worrying about prying eyes.
                                    </p>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white rounded-3xl p-10 md:p-14 border border-gray-100 shadow-sm">
                                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                                        <MessageCircle className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-[24px] font-semibold text-[#111827] mb-4 tracking-[-0.02em]">Anonymous Community</h3>
                                    <p className="text-[16px] text-[#6B7280] leading-relaxed">
                                        Join an anonymous, supportive community. Share experiences, find healing circles, and connect with people who truly understand.
                                    </p>
                                </div>

                                {/* Card 3 */}
                                <div className="bg-white rounded-3xl p-10 md:p-14 border border-gray-100 shadow-sm">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-[24px] font-semibold text-[#111827] mb-4 tracking-[-0.02em]">Expert Clinical Care</h3>
                                    <p className="text-[16px] text-[#6B7280] leading-relaxed mb-6">
                                        When peer support isn't enough, connect with verified psychologists. Book secure video consultations instantly.
                                    </p>
                                    <Link to="/experts" className="text-teal-700 font-medium hover:text-teal-800 flex items-center gap-2">
                                        Find a Therapist <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: Specializations */}
                <section className="py-[120px] bg-white">
                    <div className="max-w-[1280px] mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Large Hero Card. min-h-[400px] only matters once this sits
                                side-by-side with the 4-card bento grid at lg: — below that it
                                collapses to full-width and the forced height plus
                                justify-between left a large empty gap before the link. */}
                            <div className="lg:col-span-6 bg-[#FAFAFA] rounded-3xl p-12 border border-gray-100 flex flex-col justify-between lg:min-h-[400px]">
                                <div>
                                    <h2 className="text-[48px] font-bold text-[#111827] tracking-[-0.03em] leading-tight mb-4">Support for every mind.</h2>
                                    <p className="text-[20px] text-[#6B7280] leading-[1.6]">Whether dealing with a diagnosis or a tough phase, we have specialized resources ready.</p>
                                </div>
                                {/* Was linking to /explore, which isn't a registered route (404) —
                                    /experts is the real page this content maps to. */}
                                <Link to="/experts" className="text-teal-700 font-medium hover:text-teal-800 flex items-center gap-2 mt-8">
                                    See all specializations <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Bento Grid */}
                            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { title: 'Anxiety', icon: Brain, color: 'text-blue-600 bg-blue-50' },
                                    { title: 'Depression', icon: Battery, color: 'text-teal-600 bg-teal-50' },
                                    { title: 'Relationships', icon: Heart, color: 'text-rose-600 bg-rose-50' },
                                    { title: 'Burnout', icon: Zap, color: 'text-amber-600 bg-amber-50' }
                                ].map((condition, i) => {
                                    const Icon = condition.icon;
                                    return (
                                        <div key={i} className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-300 transition-colors cursor-pointer`}>
                                            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Icon className="w-24 h-24" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${condition.color}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-[24px] font-semibold text-[#111827] tracking-[-0.02em]">{condition.title}</h3>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: The Privacy Pledge */}
                <section className="py-[160px] bg-[#0F172A] text-white flex flex-col items-center justify-center">
                    <div className="max-w-[800px] mx-auto px-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-2xl mb-8 shadow-inner border border-gray-700">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        {/* Explicit text-white, not inherited: a sitewide base rule
                            (index.css, h1-h6 { color: var(--color-text-primary) }) sets a
                            dark color directly on every heading tag, which beats simple
                            inheritance from this dark section — without this, the heading
                            was rendering almost invisibly dark-on-navy. */}
                        <h2 className="text-white text-[48px] font-bold mb-6 tracking-[-0.03em] leading-tight">Your privacy is our product.</h2>
                        <p className="text-[20px] text-gray-400 mb-10 leading-[1.6] font-light">
                            We don't sell data. We don't run ads. Your journal entries never leave your device. You are completely anonymous to the community.
                        </p>
                        <Link to="/privacy">
                            <Button variant="secondary" className="bg-transparent border-gray-700 text-white hover:bg-gray-800 rounded-full px-8 py-4 text-[16px]">
                                Read our Privacy Manifesto
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* SECTION 7: Testimonial / Story */}
                <section className="py-[120px] bg-[#FAFAFA] border-y border-gray-100">
                    <div className="max-w-[720px] mx-auto px-6">
                        <Quote className="w-12 h-12 text-teal-200 mb-8" />
                        {/* Unified with the real sitewide headline serif (--font-header,
                            'DM Serif Display') instead of a separately hardcoded Georgia,
                            so the page uses one deliberate serif choice, not two. */}
                        <h3 className="text-[28px] md:text-[36px] italic font-normal text-[#111827] leading-[1.4] mb-8" style={{ fontFamily: 'var(--font-header)' }}>
                            "I spent years afraid to talk about my panic attacks because I thought it would ruin my career. SoulThread gave me an anonymous space to finally breathe, share, and heal with a clinical professional."
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center font-semibold text-teal-700">S</div>
                            <span className="font-semibold text-[16px] text-[#111827]">S. — Verified Member</span>
                        </div>
                    </div>
                </section>

                {/* SECTION 8: Final Conversion */}
                <section className="py-[160px] bg-white border-t border-gray-100 flex flex-col items-center justify-center">
                    <div className="max-w-[1024px] mx-auto px-6 text-center">
                        <h2 className="text-[56px] font-black text-[#111827] mb-8 tracking-[-0.03em] leading-tight">Ready to find your peace?</h2>
                        {/* Was "Join thousands of others" — checked the real registered-user
                            count (156). Not just unverifiable, actually false, so removing
                            the number rather than rounding down to something still shaky. */}
                        <p className="text-[20px] text-[#6B7280] mb-12">Join the people finding steady support on SoulThread.</p>
                        <Link to="/signup">
                            <Button variant="primary" className="px-12 py-6 text-[20px] font-semibold rounded-full bg-[#111827] hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all">
                                Join SoulThread Today
                            </Button>
                        </Link>
                    </div>
                </section>

            </main>

            {/* SECTION 9: Footer */}
            <Footer />
        </div>
    );
}
