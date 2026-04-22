import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    collection, query, where, onSnapshot, orderBy,
    addDoc, deleteDoc, doc, updateDoc, arrayUnion,
    arrayRemove, serverTimestamp, getDocs, limit,
    getDoc, runTransaction, setDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, ShieldCheck, Calendar } from 'lucide-react';
import { SUBSCRIPTION_TIERS, sustainability } from '../services/sustainabilityModel';
import { paymentService } from '../services/paymentService';
import { analytics } from '../services/analytics';
import FeedList from '../components/feed/FeedList';
import CreatePost from '../components/post/CreatePost';
import CircleMembersModal from '../components/circles/CircleMembersModal';
import DesktopLayoutWrapper from '../components/layout/DesktopLayoutWrapper';
import SEO from '../components/common/SEO';
import Breadcrumbs from '../components/common/Breadcrumbs';

import './Circles.css';

const Circles = () => {
    const { circleId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [myCircles, setMyCircles] = useState([]);
    const [discoverCircles, setDiscoverCircles] = useState([]);
    const [invites, setInvites] = useState([]);
    const [activeCircle, setActiveCircle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [circleType, setCircleType] = useState('community'); 
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState(0);

    const [sessions, setSessions] = useState([]);
    const [userAttendance, setUserAttendance] = useState({});
    const [showSchedule, setShowSchedule] = useState(false);
    const [sessionData, setSessionData] = useState({ title: '', desc: '', date: '', time: '', duration: 60 });

    const [showInvite, setShowInvite] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [memberStatus, setMemberStatus] = useState(null);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [memberProfiles, setMemberProfiles] = useState([]);
    const [showFullMembers, setShowFullMembers] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        // Check if user is Pro
        const checkProStatus = async () => {
            const hasPro = await sustainability.verifyAccess(currentUser, SUBSCRIPTION_TIERS.PRO);
            setIsPro(hasPro);
        };
        checkProStatus();

        const qCircles = query(
            collection(db, 'circles'),
            where('memberIds', 'array-contains', currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        const unsubCircles = onSnapshot(qCircles, (snap) => {
            setMyCircles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        // Discoverable Expert-Led Circles
        const qDiscover = query(
            collection(db, 'circles'),
            where('circleType', '==', 'counselor'),
            limit(10)
        );
        getDocs(qDiscover).then(snap => {
            setDiscoverCircles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qInvites = query(
            collection(db, 'circle_invites'),
            where('targetUserId', '==', currentUser.uid),
            where('status', '==', 'pending')
        );
        const unsubInvites = onSnapshot(qInvites, (snap) => {
            setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubCircles(); unsubInvites(); };
    }, [currentUser]);

    useEffect(() => {
        if (!circleId || !currentUser) return;

        const qSessions = query(
            collection(db, 'circle_sessions'),
            where('circleId', '==', circleId),
            orderBy('scheduledAt', 'asc')
        );
        const unsubSessions = onSnapshot(qSessions, (snap) => {
            setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qAttendance = query(
            collection(db, 'session_attendance'),
            where('userId', '==', currentUser.uid)
        );
        const unsubAttendance = onSnapshot(qAttendance, (snap) => {
            const map = {};
            snap.docs.forEach(d => {
                const data = d.data();
                map[data.sessionId] = data.status;
            });
            setUserAttendance(map);
        });

        return () => { unsubSessions(); unsubAttendance(); };
    }, [circleId, currentUser]);

    useEffect(() => {
        if (!activeCircle || !activeCircle.memberIds) return;

        const fetchMembers = async () => {
            try {
                const profiles = [];
                const memberIds = activeCircle.memberIds;
                const chunks = [];
                for (let i = 0; i < memberIds.length; i += 10) {
                    chunks.push(memberIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const q = query(collection(db, 'users'), where('__name__', 'in', chunk));
                    const snap = await getDocs(q);
                    snap.forEach(doc => profiles.push({ id: doc.id, ...doc.data() }));
                }
                setMemberProfiles(profiles);
            } catch (err) {
                console.error("Failed to fetch member profiles:", err);
            }
        };

        fetchMembers();
    }, [activeCircle]);

    useEffect(() => {
        if (!circleId || !currentUser) return;
        const memberDocId = `member_${circleId}_${currentUser.uid}`;
        const unsubMember = onSnapshot(doc(db, 'circle_members', memberDocId), (snap) => {
            if (snap.exists()) {
                setMemberStatus({ id: snap.id, ...snap.data() });
            } else {
                setMemberStatus(null);
            }
        });
        return () => unsubMember();
    }, [circleId, currentUser]);

    useEffect(() => {
        if (circleId) {
            fetchActiveCircle();
        } else {
            setActiveCircle(null);
            setSessions([]);
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
                } else {
                    alert("Access Denied: You are not a member of this circle.");
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

    const handleUpgradeToPro = async () => {
        setIsProcessing(true);
        try {
            const tier = sustainability.getTierDetails(SUBSCRIPTION_TIERS.PRO);
            await paymentService.initializeRazorpay(currentUser, { ...tier, id: SUBSCRIPTION_TIERS.PRO }, tier.price);
            setIsPro(true);
            analytics.logEvent('subscription_upgrade_success', { tier: 'soul_pro' });
        } catch (error) {
            console.error("Upgrade failed:", error);
            alert("Subscription could not be completed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleJoinCircle = async (circle) => {
        if (circle.circleType === 'counselor' && !isPro) {
            alert("This Expert-Led Circle is part of the Soul Pro membership.");
            return;
        }

        try {
            const circleRef = doc(db, 'circles', circle.id);
            await updateDoc(circleRef, {
                memberIds: arrayUnion(currentUser.uid),
                memberCount: (circle.memberCount || 0) + 1
            });

            const memberRef = doc(db, 'circle_members', `member_${circle.id}_${currentUser.uid}`);
            await setDoc(memberRef, {
                circleId: circle.id,
                userId: currentUser.uid,
                role: 'member',
                paymentStatus: circle.circleType === 'counselor' ? 'subscription' : 'free',
                joinedAt: serverTimestamp()
            });

            navigate(`/circles/${circle.id}`);
        } catch (e) {
            alert("Failed to join: " + e.message);
        }
    };

    const handleRegisterSession = async (sessionId) => {
        try {
            await setDoc(doc(db, 'session_attendance', `${sessionId}_${currentUser.uid}`), {
                sessionId,
                userId: currentUser.uid,
                circleId: activeCircle.id,
                status: 'registered',
                registeredAt: serverTimestamp()
            });
            alert("Registered! A quiet reminder will be sent.");
        } catch (e) { alert(e.message); }
    };

    const getCalendarLink = (session) => {
        const start = session.scheduledAt.toDate();
        const end = new Date(start.getTime() + session.durationMinutes * 60000);
        const fmt = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(session.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(session.description)}`;
    };

    if (!currentUser) return (
        <DesktopLayoutWrapper>
            <div className="circles-container animate-fade-in" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="empty-icon"><Users size={48} /></div>
                <h2 className="empty-title">Welcome Home</h2>
                <p className="empty-desc">Please login to join your private healing spaces.</p>
                <Link to="/login" className="premium-btn">Login to Continue</Link>
            </div>
        </DesktopLayoutWrapper>
    );

    return (
        <DesktopLayoutWrapper>
            <SEO title={activeCircle ? `${activeCircle.name} | SoulThread` : 'Circles Hub | SoulThread'} />
            
            <div className="circles-container animate-fade-in">
                <Breadcrumbs />

                <div className="circles-header">
                    <h1 className="circles-title">
                        {activeCircle ? activeCircle.name : 'Your Circles'}
                    </h1>
                    {!activeCircle && (
                        <button onClick={() => setShowCreate(true)} className="book-btn-premium">
                            + Craft a Space
                        </button>
                    )}
                    {activeCircle && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleLeaveCircle || (() => navigate('/circles'))} className="auth-secondary-btn" style={{ padding: '8px 20px', fontSize: '12px' }}>
                                Leave Space
                            </button>
                        </div>
                    )}
                </div>

                {!activeCircle ? (
                    <div className="circles-dashboard">
                        <div className="circles-list">
                            {loading && <div className="chat-loading-shimmer" style={{ height: '100px', borderRadius: '24px' }} />}
                            {!loading && myCircles.length === 0 && (
                                <div className="circles-empty-state">
                                    <span className="empty-icon"><Users size={48} /></span>
                                    <h3 className="empty-title">Deep Healing Starts Here</h3>
                                    <p className="empty-desc">
                                        Circles are intimate, invite-only sanctuaries of up to 15 members.
                                        Share deeply, grow together, and find your tribe.
                                    </p>
                                    <button onClick={() => setShowCreate(true)} className="book-btn-premium" style={{ padding: '12px 32px' }}>
                                        Start Your First Circle
                                    </button>
                                </div>
                            )}
                            {myCircles.map(c => (
                                <Link key={c.id} to={`/circles/${c.id}`} className="circle-card-link">
                                    <div className="circle-info-main">
                                        <h4>{c.name}</h4>
                                        <p className="circle-meta">
                                            <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {c.memberCount || 0}/15 members · {c.circleType === 'counselor' ? <><ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Soul Pro Circle</> : 'Community'}
                                        </p>
                                    </div>
                                    <span className="enter-arrow">Enter Space →</span>
                                </Link>
                            ))}
                        </div>

                        <div className="discovery-section">
                            <h4 className="sidebar-title">Discover Expert-Led Sanctuaries</h4>
                            <div className="discover-grid">
                                {discoverCircles.filter(c => !c.memberIds.includes(currentUser.uid)).map(c => (
                                    <div key={c.id} className="discover-card">
                                        <div className="discover-info">
                                            <h5>{c.name}</h5>
                                            <p>{c.description?.substring(0, 60)}...</p>
                                            <div className="pro-tag">SOUL PRO</div>
                                        </div>
                                        <button 
                                            onClick={() => handleJoinCircle(c)} 
                                            className="auth-secondary-btn"
                                            style={{ fontSize: '11px', padding: '6px 12px' }}
                                        >
                                            Join Sanctuary
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="circles-sidebar">
                            {invites.length > 0 && (
                                <div className="sidebar-box animate-slide-up">
                                    <h4 className="sidebar-title">Pending Invitations</h4>
                                    {invites.map(inv => (
                                        <div key={inv.id} className="invite-card">
                                            <span className="invite-name">{inv.circleName}</span>
                                            <button onClick={() => handleAcceptInvite(inv)} className="book-btn-premium" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                                                Accept Invitation
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="sidebar-box">
                                <h4 className="sidebar-title">The Circle Oath</h4>
                                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                                    <li>Total Confidentiality</li>
                                    <li>Empathetic Listening</li>
                                    <li>Judgment-Free Support</li>
                                    <li>Shared Growth Path</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="active-circle-view">
                        {activeCircle.circleType === 'counselor' && !isPro && 
                         currentUser.uid !== activeCircle.counselorId && (
                            <div className="locked-overlay">
                                <span style={{ marginBottom: '16px' }}><ShieldCheck size={48} /></span>
                                <h3 className="empty-title">Soul Pro Sanctuary</h3>
                                <p className="empty-desc" style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
                                    This expert-led circle is exclusive to <strong>Soul Pro</strong> members. 
                                    Join the tribe to access weekly sessions, private check-ins, and deeper healing.
                                </p>
                                <div className="pro-perks-list">
                                    <div className="pro-perk">✓ 4x Expert-Led Sessions/Mo</div>
                                    <div className="pro-perk">✓ Unlimited Mental Toughness Series</div>
                                    <div className="pro-perk">✓ Priority Support & Counseling</div>
                                </div>
                                <button 
                                    className="book-btn-premium" 
                                    style={{ padding: '14px 40px', marginTop: '24px' }}
                                    onClick={handleUpgradeToPro}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Connecting...' : 'Upgrade to Soul Pro — ₹499/mo'}
                                </button>
                                <p className="secure-text">Secure Subscription via Razorpay</p>
                            </div>
                        )}

                        <div className="circle-description-panel">
                            <p style={{ margin: '0 0 16px', fontSize: '15px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                                {activeCircle.description}
                            </p>
                            
                            <div className="members-flow">
                                {memberProfiles.map(member => (
                                    <div key={member.id} className="member-avatar-stack">
                                        <div className="member-img-ring" onClick={() => navigate(`/profile/${member.id}`)}>
                                            {member.photoURL ? (
                                                <img src={member.photoURL} alt={member.displayName} style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', borderRadius: '16px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', color: 'var(--color-primary-dark)' }}>
                                                    {member.displayName?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="member-name-mini">{member.displayName?.split(' ')[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {sessions.length > 0 && (
                            <div style={{ marginBottom: '32px' }}>
                                <h3 className="sidebar-title" style={{ marginBottom: '16px' }}>Sacred Sessions</h3>
                                <div className="sessions-list">
                                    {sessions.map(s => (
                                        <div key={s.id} className="session-card">
                                            <div className="session-header">
                                                <h4>{s.title}</h4>
                                                <div className="session-time-badge">
                                                    <Calendar size={14} style={{ marginRight: '6px' }} /> {s.scheduledAt?.toDate().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>{s.description}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                {userAttendance[s.id] ? (
                                                    <button disabled className="auth-secondary-btn" style={{ fontSize: '11px', padding: '6px 16px', opacity: 0.7 }}>
                                                        ✓ {userAttendance[s.id] === 'attended' ? 'Attended' : 'Registered'}
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleRegisterSession(s.id)} className="book-btn-premium" style={{ fontSize: '11px', padding: '6px 20px' }}>
                                                        Join Session
                                                    </button>
                                                )}
                                                <a href={getCalendarLink(s)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', fontSize: '11px', fontWeight: '800', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', border: '1.5px solid var(--color-primary-soft)', padding: '6px 16px', borderRadius: '999px' }}>
                                                    Add to Calendar
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <CreatePost circleId={activeCircle.id} />
                        <FeedList circleId={activeCircle.id} />
                    </div>
                )}
            </div>

            {showCreate && (
                <div className="circle-modal-backdrop" onClick={() => setShowCreate(false)}>
                    <div className="circle-modal-card animate-scale-up" onClick={e => e.stopPropagation()}>
                        <h3 className="empty-title">Craft a New Circle</h3>
                        <form onSubmit={handleCreateCircle}>
                            {currentUser.role === 'psychologist' && (
                                <div className="circle-type-toggle">
                                    <button type="button" onClick={() => setCircleType('community')} className={`type-toggle-btn ${circleType === 'community' ? 'active' : ''}`}>Community</button>
                                    <button type="button" onClick={() => setCircleType('counselor')} className={`type-toggle-btn ${circleType === 'counselor' ? 'active' : ''}`}>Expert Led</button>
                                </div>
                            )}
                            <input
                                placeholder="Space Name (e.g. Hope Collective)"
                                value={newName} onChange={e => setNewName(e.target.value)}
                                className="auth-input"
                                style={{ marginBottom: '16px' }}
                            />
                            <textarea
                                placeholder="Describe the focus of this sanctuary..."
                                value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                className="auth-input"
                                style={{ minHeight: '100px', resize: 'none', marginBottom: '24px' }}
                            />
                            <button type="submit" className="auth-submit-btn">Begin Creation →</button>
                        </form>
                    </div>
                </div>
            )}
        </DesktopLayoutWrapper>
    );
};

export default Circles;
