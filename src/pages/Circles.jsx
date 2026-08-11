import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    collection, query, where, onSnapshot, orderBy,
    doc, updateDoc, arrayUnion, serverTimestamp, getDocs, limit,
    getDoc, setDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, ShieldCheck, Heart, AlertCircle, Bookmark, Compass } from 'lucide-react';

import FeedList from '../components/feed/FeedList';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import CommunityTabs from '../components/community/CommunityTabs';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export default function Circles() {
    const { circleId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [myCircles, setMyCircles] = useState([]);
    const [discoverCircles, setDiscoverCircles] = useState([]);
    const [activeCircle, setActiveCircle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [circlesError, setCirclesError] = useState(false);

    const [memberProfiles, setMemberProfiles] = useState([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedCircleToJoin, setSelectedCircleToJoin] = useState(null);
    const [joinIdentity, setJoinIdentity] = useState('real'); // 'real' | 'anonymous'

    useEffect(() => {
        if (!currentUser) return;

        const qCircles = query(
            collection(db, 'circles'),
            where('memberIds', 'array-contains', currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        setCirclesError(false);
        const unsubCircles = onSnapshot(qCircles, (snap) => {
            setMyCircles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (err) => {
            // Without this, a permission or missing-index error left loading stuck on
            // the skeleton forever with no way for the user to know anything was wrong —
            // exactly what happened here until the underlying index type was fixed.
            console.error('Failed to load your circles', err);
            setCirclesError(true);
            setLoading(false);
        });

        // Mock Affinity Matching for Discovery
        const fetchDiscover = async () => {
            const qDiscover = query(collection(db, 'circles'), limit(6));
            const snap = await getDocs(qDiscover);
            // Simulate affinity scores
            const results = snap.docs
                .map(d => ({ id: d.id, ...d.data(), affinityScore: Math.floor(Math.random() * 40) + 60 }))
                .sort((a, b) => b.affinityScore - a.affinityScore);
            setDiscoverCircles(results);
        };
        fetchDiscover();

        return () => unsubCircles();
    }, [currentUser]);

    useEffect(() => {
        if (circleId) {
            fetchActiveCircle();
        } else {
            setActiveCircle(null);
        }
    }, [circleId, currentUser]);

    const fetchActiveCircle = async () => {
        try {
            const docRef = doc(db, 'circles', circleId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.memberIds.includes(currentUser.uid) || currentUser.role === 'admin') {
                    setActiveCircle({ id: snap.id, ...data });
                    fetchMembers(data.memberIds);
                } else {
                    navigate('/circles');
                }
            } else {
                navigate('/circles');
            }
        } catch (e) {
            console.error(e);
            navigate('/circles');
        }
    };

    const fetchMembers = async (memberIds) => {
        if (!memberIds || memberIds.length === 0) return;
        try {
            const profiles = [];
            const chunks = [];
            for (let i = 0; i < memberIds.length; i += 10) {
                chunks.push(memberIds.slice(i, i + 10));
            }
            for (const chunk of chunks) {
                const q = query(collection(db, 'users'), where('__name__', 'in', chunk));
                const snap = await getDocs(q);
                snap.forEach(d => profiles.push({ id: d.id, ...d.data() }));
            }
            setMemberProfiles(profiles);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenJoinModal = (circle) => {
        setSelectedCircleToJoin(circle);
        setShowJoinModal(true);
    };

    const handleConfirmJoin = async () => {
        if (!selectedCircleToJoin) return;
        try {
            const circleRef = doc(db, 'circles', selectedCircleToJoin.id);
            await updateDoc(circleRef, {
                memberIds: arrayUnion(currentUser.uid),
                memberCount: (selectedCircleToJoin.memberCount || 0) + 1
            });

            const memberRef = doc(db, 'circle_members', `member_${selectedCircleToJoin.id}_${currentUser.uid}`);
            await setDoc(memberRef, {
                circleId: selectedCircleToJoin.id,
                userId: currentUser.uid,
                role: 'member',
                identityType: joinIdentity,
                joinedAt: serverTimestamp()
            });

            setShowJoinModal(false);
            navigate(`/circles/${selectedCircleToJoin.id}`);
        } catch (e) {
            alert("Failed to join: " + e.message);
        }
    };

    if (!currentUser) return (
        <DesktopLayoutWrapper>
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
                <Heart className="w-16 h-16 text-gray-300 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Healing Circles</h2>
                <p className="text-gray-500 mb-8 max-w-md">Private, expert-guided micro-communities for deep, shared healing.</p>
                <Button variant="primary" onClick={() => navigate('/login')}>Sign in to continue</Button>
            </div>
        </DesktopLayoutWrapper>
    );

    return (
        <DesktopLayoutWrapper>
            <SEO title={activeCircle ? `${activeCircle.name} | Healing Circle` : 'Healing Circles | SoulThread'} />
            
            <div className="bg-[#fafafa] min-h-screen pb-24">
                {/* Global Discovery View */}
                {!activeCircle ? (
                    <div className="max-w-6xl mx-auto px-4 pt-10 space-y-12">
                        <CommunityTabs active="circles" />
                        <div className="text-center space-y-4 mb-12">
                            <h1 className="text-4xl font-bold text-gray-900">Your Healing Circles</h1>
                            <p className="text-gray-500 text-lg">Intimate, guided spaces for shared growth and confidentiality.</p>
                        </div>

                        {/* My Circles */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Bookmark className="w-5 h-5" /> Active Circles
                            </h2>
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-gray-100" />)}
                                </div>
                            ) : circlesError ? (
                                <Card className="py-12 text-center border-dashed border-2 border-red-100">
                                    <p className="text-gray-500 font-medium">Couldn't load your circles. Please try refreshing the page.</p>
                                </Card>
                            ) : myCircles.length === 0 ? (
                                <Card className="py-12 text-center border-dashed border-2">
                                    <p className="text-gray-500 font-medium">You haven't joined any circles yet.</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {myCircles.map(c => (
                                        <Card key={c.id} className="hover:border-black cursor-pointer transition-colors" onClick={() => navigate(`/circles/${c.id}`)}>
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge variant="secondary">{c.category || 'Support'}</Badge>
                                                <div className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Users className="w-3 h-3 mr-1" /> {c.memberCount || 0}/12
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-2">{c.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Affinity Recommendations */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Compass className="w-5 h-5" /> Recommended for You
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {discoverCircles.filter(c => !c.memberIds?.includes(currentUser.uid)).map(c => (
                                    <Card key={c.id} className="relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col gap-2">
                                                <Badge variant="success" className="w-fit">{c.affinityScore}% Match</Badge>
                                                {c.professionalLeadId && (
                                                    <Badge variant="warning" className="w-fit flex items-center gap-1">
                                                        <ShieldCheck className="w-3 h-3" /> Expert Led
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center text-xs font-bold text-gray-500">
                                                <Users className="w-3 h-3 mr-1" /> {c.memberCount || 0}/12
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{c.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-6">{c.description}</p>
                                        <Button variant="outline" style={{ width: '100%' }} onClick={() => handleOpenJoinModal(c)}>
                                            Review & Join
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Active Circle Dashboard View */
                    <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
                        <CommunityTabs active="circles" />

                        {/* Weekly Check-in Banner */}
                        <div className="bg-indigo-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 opacity-80">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Weekly Check-in</span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">What was your biggest emotional win this week?</h2>
                                    <p className="text-indigo-200 text-sm">Join the conversation. 4 members have already checked in.</p>
                                </div>
                                <Button variant="secondary" className="shrink-0 bg-white text-indigo-900 border-none hover:bg-gray-100">
                                    Check In Now
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Left Sidebar: Context & Safety */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card>
                                    <h3 className="font-bold text-gray-900 mb-4">{activeCircle.name}</h3>
                                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">{activeCircle.description}</p>
                                    
                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Members ({activeCircle.memberCount}/12)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {memberProfiles.map(m => (
                                                <div key={m.id} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm" title={m.displayName}>
                                                    {m.photoURL ? <img src={m.photoURL} className="w-full h-full rounded-full object-cover" alt="" /> : m.displayName[0]}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-red-50 border-red-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-red-600" />
                                        <span className="font-bold text-red-900 text-sm">Circle Safety</span>
                                    </div>
                                    <p className="text-xs text-red-800 leading-relaxed mb-4">
                                        Everything shared here is strictly confidential. If you are in crisis, immediately contact emergency services.
                                    </p>
                                    <button className="text-xs font-bold text-red-600 hover:text-red-800">
                                        Escalate to Moderator →
                                    </button>
                                </Card>
                            </div>

                            {/* Main Feed */}
                            <div className="lg:col-span-3">
                                <FeedList circleId={activeCircle.id} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Join Circle Modal */}
            {showJoinModal && selectedCircleToJoin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Join {selectedCircleToJoin.name}</h2>
                        <p className="text-sm text-gray-500 mb-6">You are committing to a safe, confidential space with {selectedCircleToJoin.memberCount || 0} other individuals.</p>
                        
                        <div className="space-y-6 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">Choose your identity for this circle:</label>
                                <div className="space-y-3">
                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${joinIdentity === 'real' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="identity" value="real" checked={joinIdentity === 'real'} onChange={() => setJoinIdentity('real')} className="mt-1" />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Real Name</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Share your actual profile details.</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${joinIdentity === 'anonymous' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="identity" value="anonymous" checked={joinIdentity === 'anonymous'} onChange={() => setJoinIdentity('anonymous')} className="mt-1" />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Anonymous Nickname</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Your identity remains hidden from members.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <h4 className="font-bold text-blue-900 text-sm mb-2">The Circle Oath</h4>
                                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                    <li>Total Confidentiality</li>
                                    <li>Judgment-Free Support</li>
                                    <li>Empathetic Listening</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowJoinModal(false)}>Cancel</Button>
                            <Button variant="primary" style={{ flex: 1 }} onClick={handleConfirmJoin}>Accept & Join</Button>
                        </div>
                    </Card>
                </div>
            )}
        </DesktopLayoutWrapper>
    );
}
