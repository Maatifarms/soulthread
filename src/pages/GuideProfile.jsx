import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GuideRepository } from '../repositories/GuideRepository';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import { Languages, IndianRupee, ArrowLeft } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';

export default function GuideProfile() {
    const { guideId } = useParams();
    const navigate = useNavigate();
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const fetchGuide = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await GuideRepository.findById(guideId);
                if (!cancelled) setGuide(result);
            } catch (err) {
                console.error('[GuideProfile] Failed to fetch guide:', err);
                if (!cancelled) setError('Failed to load this profile. Please try again later.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchGuide();
        return () => { cancelled = true; };
    }, [guideId]);

    if (loading) {
        return (
            <DesktopLayoutWrapper>
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (error) {
        return (
            <DesktopLayoutWrapper>
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button variant="secondary" onClick={() => navigate('/experts')}>Back to Discover</Button>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    if (!guide) {
        return (
            <DesktopLayoutWrapper>
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h1>
                    <p className="text-gray-500 mb-6">This guide may no longer be available.</p>
                    <Button variant="secondary" onClick={() => navigate('/experts')}>Back to Discover</Button>
                </div>
            </DesktopLayoutWrapper>
        );
    }

    const specializations = (guide.specialization || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    return (
        <DesktopLayoutWrapper>
            <SEO title={`${guide.name} | SoulThread`} description={guide.bio} />
            <div className="bg-[#fafafa] min-h-screen pb-24 pt-8 px-6">
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => navigate('/experts')} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Discover
                    </button>

                    <Card className="p-8">
                        <div className="flex items-start gap-6 mb-6">
                            {guide.photoURL ? (
                                <img src={guide.photoURL} alt={guide.name} className="w-24 h-24 rounded-full object-cover border border-gray-100 shadow-sm" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-3xl font-bold text-emerald-600 border border-emerald-100">
                                    {guide.name?.[0] || '?'}
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">{guide.name}</h1>
                                <p className="text-sm text-gray-400 uppercase tracking-wide font-semibold mt-1">
                                    {guide.title || 'Clinical Psychologist'}
                                </p>
                            </div>
                        </div>

                        {specializations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {specializations.map((spec, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        )}

                        {guide.bio && (
                            <p className="text-gray-600 leading-relaxed mb-6">{guide.bio}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {guide.languages?.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Languages className="w-4 h-4 text-gray-400" />
                                    {guide.languages.join(', ')}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                ₹{guide.sessionRate || 1000} / session
                            </div>
                        </div>

                        <Button variant="primary" onClick={() => navigate(`/book/${guide.id}`)} style={{ width: '100%', padding: '14px 0' }}>
                            Book a Session
                        </Button>
                    </Card>
                </div>
            </div>
        </DesktopLayoutWrapper>
    );
}
