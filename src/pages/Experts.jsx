import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuideService } from '../services/clinical/guideService';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { ShieldCheck, HeartHandshake, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

// `specialization` is stored as a single comma-separated string (not an array).
const parseSpecializations = (specialization) =>
    (specialization || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

export default function Experts() {
    const navigate = useNavigate();
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [specializationFilter, setSpecializationFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');

    const fetchGuides = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await GuideService.getVerifiedGuides(12);
            setGuides(list);
        } catch (err) {
            console.error('Error fetching guides:', err);
            setError(err.message || 'Failed to load professionals. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGuides();
    }, [fetchGuides]);

    const specializationOptions = useMemo(() => {
        const set = new Set();
        guides.forEach(g => parseSpecializations(g.specialization).forEach(s => set.add(s)));
        return Array.from(set).sort();
    }, [guides]);

    const languageOptions = useMemo(() => {
        const set = new Set();
        guides.forEach(g => (g.languages || []).forEach(l => set.add(l)));
        return Array.from(set).sort();
    }, [guides]);

    const filteredGuides = useMemo(() => {
        return guides.filter(g => {
            const matchesSpecialization = specializationFilter === 'all'
                || parseSpecializations(g.specialization).includes(specializationFilter);
            const matchesLanguage = languageFilter === 'all'
                || (g.languages || []).includes(languageFilter);
            return matchesSpecialization && matchesLanguage;
        });
    }, [guides, specializationFilter, languageFilter]);

    return (
        <DesktopLayoutWrapper>
            <div className="bg-[#fafafa] min-h-screen pb-24 font-sans text-[#111827]">
                <SEO
                    title="Browse Verified Therapists | SoulThread"
                    description="Find the right clinical psychologist for your journey. 100% verified."
                />

                {/* Hero Header */}
                <div className="bg-white border-b border-gray-100 pt-20 pb-16 px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <span className="text-emerald-600 font-semibold tracking-widest text-sm uppercase mb-4 block">
                            Clinical Directory
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                            Find the right guide for your journey.
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                            Every expert is a strictly verified clinical psychologist. Take your time, read their philosophies, and find someone who understands you.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                {!loading && !error && guides.length > 0 && (
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-10 flex flex-wrap gap-4">
                        <select
                            value={specializationFilter}
                            onChange={e => setSpecializationFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700"
                        >
                            <option value="all">All specializations</option>
                            {specializationOptions.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                        <select
                            value={languageFilter}
                            onChange={e => setLanguageFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700"
                        >
                            <option value="all">All languages</option>
                            {languageOptions.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Grid Layout */}
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-white p-8 rounded-3xl border border-gray-100 h-96 shadow-sm"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="max-w-xl mx-auto mt-16 text-center bg-white p-12 rounded-3xl border border-red-100 shadow-sm">
                            <AlertCircle className="w-16 h-16 text-red-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>Something went wrong</h3>
                            <p className="text-gray-500 mb-8 text-lg">{error}</p>
                            <Button variant="primary" onClick={fetchGuides} className="px-8 py-3 rounded-full bg-[#111827] text-white hover:bg-black font-semibold">
                                Try Again
                            </Button>
                        </div>
                    ) : guides.length === 0 ? (
                        <div className="max-w-xl mx-auto mt-16 text-center bg-white p-12 rounded-3xl border border-gray-100 shadow-sm">
                            <HeartHandshake className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>We are here for you</h3>
                            <p className="text-gray-500 mb-8 text-lg">
                                Our Care Coordinators can help match you with the perfect Guide for your specific journey.
                            </p>
                            <Button variant="primary" onClick={() => navigate('/messages?support=true')} className="px-8 py-3 rounded-full bg-[#111827] text-white hover:bg-black font-semibold">
                                Speak to a Coordinator
                            </Button>
                        </div>
                    ) : filteredGuides.length === 0 ? (
                        <div className="max-w-xl mx-auto mt-16 text-center bg-white p-12 rounded-3xl border border-gray-100 shadow-sm">
                            <HeartHandshake className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>No matches for these filters</h3>
                            <p className="text-gray-500 mb-8 text-lg">Try a different specialization or language.</p>
                            <Button variant="secondary" onClick={() => { setSpecializationFilter('all'); setLanguageFilter('all'); }} className="px-8 py-3 rounded-full font-semibold">
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredGuides.map(guide => {
                                const firstName = guide.name ? guide.name.split(' ')[0] : 'Guide';
                                const specialties = parseSpecializations(guide.specialization).slice(0, 2);

                                return (
                                    <div key={guide.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 group">

                                        <div className="flex items-start justify-between mb-6">
                                            {guide.photoURL ? (
                                                <img src={guide.photoURL} alt={guide.name} className="w-20 h-20 rounded-full object-cover shadow-sm border border-gray-100 ring-4 ring-white" loading="lazy" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-2xl font-bold text-emerald-600 border border-emerald-100 ring-4 ring-white shadow-sm">
                                                    {firstName[0]}
                                                </div>
                                            )}
                                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                                                <ShieldCheck className="w-4 h-4" /> Verified
                                            </span>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Georgia, serif' }}>{guide.name}</h2>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                                                {guide.title || guide.degree || 'Clinical Psychologist'}
                                            </p>

                                            {specialties.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {specialties.map((spec, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-gray-600 leading-relaxed text-sm line-clamp-3 mb-8 flex-1">
                                                {guide.bio || `Specializing in compassionate, evidence-based therapy to help you navigate life's challenges. I believe in a holistic approach to mental wellness.`}
                                            </p>

                                            <Button
                                                variant="secondary"
                                                onClick={() => navigate(`/experts/${guide.id}`)}
                                                className="w-full justify-between items-center bg-white border-2 border-gray-100 text-gray-700 hover:border-[#111827] hover:text-[#111827] group-hover:bg-gray-50 py-3 rounded-xl font-semibold transition-all"
                                            >
                                                View Profile <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#111827] transition-colors" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
