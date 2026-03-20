import React, { useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy, startAt, endAt, doc, updateDoc, arrayUnion, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import ConnectModal from '../components/common/ConnectModal';

const SearchUsers = () => {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [connectModalTarget, setConnectModalTarget] = useState(null); // Modal State
    const navigate = useNavigate();

    // Load initial users
    React.useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true);

            try {
                const usersRef = collection(db, 'users');
                // Fetch recent users (removed server-side incognito filter to support legacy users)
                const q = query(
                    usersRef,
                    orderBy('createdAt', 'desc'),
                    limit(20) // Increased limit to ensure we get enough users after client-side filtering
                );
                const snapshot = await getDocs(q);
                const users = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.id !== currentUser?.uid)
                    .filter(user => {
                        const isSuper = currentUser?.role === 'admin' || currentUser?.role === 'psychologist';
                        if (isSuper) return true;
                        // R87.1: Only hide if explicitly Incognito. 
                        // Show Paused/Anonymous to keep community populated as requested.
                        return user.isIncognito !== true;
                    });

                setResults(users);
            } catch (error) {
                console.warn("Initial load failed", error);
            } finally {
                setLoading(false);
            }
        };

        if (!hasSearched) fetchInitial();
    }, [currentUser, hasSearched]);

    // Open Modal
    const initiateConnect = (e, user) => {
        e.stopPropagation();
        if (!currentUser) return navigate('/login');
        setConnectModalTarget(user);
    };

    // Actual Logic
    const confirmConnect = async (note) => {
        if (!currentUser || !connectModalTarget) return;
        const targetUserId = connectModalTarget.id;

        try {
            const userRef = doc(db, 'users', targetUserId);
            const myRef = doc(db, 'users', currentUser.uid);

            // 1. Add to their pending requests
            await setDoc(userRef, {
                pendingRequests: arrayUnion(currentUser.uid)
            }, { merge: true });

            // 2. Add to my sent requests
            await setDoc(myRef, {
                sentRequests: arrayUnion(targetUserId)
            }, { merge: true });

            // 3. Create a notification for them
            const isAnon = currentUser.isIncognito || currentUser.isAnonymous;
            await addDoc(collection(db, 'notifications'), {
                recipientId: targetUserId,
                senderId: currentUser.uid,
                senderName: isAnon ? 'Anonymous Soul' : (currentUser.displayName || 'Someone'),
                senderPhoto: isAnon ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' : (currentUser.photoURL || ''),
                type: 'connection_request',
                message: `${isAnon ? 'Someone' : (currentUser.displayName || 'Someone')} wants to connect with you.`, // System message
                note: note || '', // Personal Note
                read: false,
                createdAt: serverTimestamp()
            });

            alert("Connection request sent!");

            // Update local state to show 'Request Sent'
            setResults(prev => prev.map(u =>
                u.id === targetUserId ? { ...u, isPending: true } : u
            ));

        } catch (error) {
            console.error("Connect failed", error);
            alert("Failed to send request. Rule issue?");
        } finally {
            setConnectModalTarget(null); // Close Modal
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);
        try {
            const usersRef = collection(db, 'users');

            // MERGED SEARCH: Try multiple versions to handle case sensitivity
            const variants = new Set([
                searchTerm,
                searchTerm.toLowerCase(),
                searchTerm.toUpperCase(),
                searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase()
            ]);

            const promises = Array.from(variants).map(term => {
                const q = query(
                    usersRef,
                    orderBy('displayName'),
                    startAt(term),
                    endAt(term + '\uf8ff'),
                    limit(20)
                );
                return getDocs(q);
            });

            const snapshots = await Promise.all(promises);
            let mergedUsersMap = new Map();

            snapshots.forEach(snap => {
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    if (doc.id !== currentUser?.uid) {
                        mergedUsersMap.set(doc.id, { id: doc.id, ...data });
                    }
                });
            });

            let users = Array.from(mergedUsersMap.values());

            // FALLBACK: If server prefix search missed it, or failed, try client-side filtering
            // on the current results or fetch all if count is low.
            if (users.length === 0 && results.length > 0) {
                const termLower = searchTerm.toLowerCase();
                users = results.filter(u =>
                    u.displayName?.toLowerCase().includes(termLower) ||
                    u.email?.toLowerCase().includes(termLower)
                );
            }

            // SUPER VIEW: Admin & Counselors can see Incognito/Paused/Anonymous users
            users = users.filter(user => {
                const isSuper = currentUser?.role === 'admin' || currentUser?.role === 'psychologist';
                if (isSuper) return true;
                // R87.1: Only hide if explicitly Incognito.
                return user.isIncognito !== true;
            });

            setResults(users);
        } catch (error) {
            console.error("Search error:", error);
            alert("Search issue. Try a simpler name.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '1000px', padding: '16px', paddingBottom: '100px', overflowX: 'hidden' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '24px', fontWeight: '800' }}>Find People</h2>

            {/* INCOGNITO LOCKOUT */}
            {currentUser?.isIncognito && currentUser.role !== 'admin' && currentUser.role !== 'psychologist' ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div className="container" style={{ maxWidth: 'var(--app-max-width)', margin: '0 auto', padding: '0 16px', paddingBottom: '100px' }}>
                    </div>
                    <h3 style={{ marginBottom: '10px' }}>You are in Incognito Mode</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
                        While incognito, you are invisible to others, but you also cannot search for or connect with new people.
                    </p>
                    <button
                        onClick={async () => {
                            if (window.confirm("Turn off Incognito Mode to connect with others?")) {
                                try {
                                    await updateDoc(doc(db, 'users', currentUser.uid), { isIncognito: false });
                                    window.location.reload();
                                } catch (e) { console.error(e); }
                            }
                        }}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '24px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Turn Off Incognito
                    </button>
                </div>
            ) : (
                <>
                    {/* SERIES PROMO */}
                    <div style={{
                        marginBottom: '30px',
                        padding: '24px',
                        background: 'linear-gradient(135deg, #000 0%, #222 100%)',
                        borderRadius: '20px',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '1px solid #333'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem', fontWeight: '900' }}>⚡️ Mental Mastery Series</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Structured paths to upgrade your focused mind.</p>
                        </div>
                        <Link to="/series" style={{
                            background: 'white',
                            color: 'black',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            textDecoration: 'none',
                            fontWeight: '800',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            View All Series
                        </Link>
                    </div>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '12px 20px',
                                borderRadius: '25px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-primary)',
                                fontSize: '16px'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 30px',
                                borderRadius: '25px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '16px'
                            }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {results.map(user => (
                            <div key={user.id} onClick={() => navigate(`/profile/${user.id}`)} style={{
                                padding: '20px',
                                background: 'var(--color-surface)',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column', // Changed to column for button space
                                alignItems: 'center',
                                gap: '15px',
                                transition: 'transform 0.2s',
                                boxShadow: 'var(--shadow-sm)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: 'var(--color-primary-dark)',
                                    border: '1px solid var(--color-border)',
                                    flexShrink: 0,
                                    textTransform: 'uppercase'
                                }}>
                                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {user.isAnonymous ? 'Anonymous' : (user.displayName || 'Anonymous')}
                                        {user.isIncognito && (currentUser?.role === 'admin' || currentUser?.role === 'psychologist') && (
                                            <span style={{ fontSize: '10px', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '1px 4px', borderRadius: '4px' }}>
                                                INCOGNITO
                                            </span>
                                        )}
                                        {user.isAnonymous && (currentUser?.role === 'admin') && (
                                            <span style={{ fontSize: '10px', color: '#dc2626', border: '1px solid #dc2626', padding: '1px 4px', borderRadius: '4px' }}>
                                                ANON
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {user.role === 'psychologist' ? 'Counselor' : 'Member'}
                                    </div>
                                </div>

                                {currentUser && (
                                    <div style={{ marginTop: 'auto' }}>
                                        {currentUser.connections?.includes(user.id) ? (
                                            <span style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: 'bold' }}>Connected</span>
                                        ) : (currentUser.sentRequests?.includes(user.id) || user.isPending) ? (
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Request Sent</span>
                                        ) : currentUser.pendingRequests?.includes(user.id) ? (
                                            <span style={{ color: 'var(--color-primary)', fontSize: '12px' }}>Check Profile</span>
                                        ) : (
                                            <button
                                                onClick={(e) => initiateConnect(e, user)}
                                                style={{
                                                    background: 'var(--color-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px 16px',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Connect
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {hasSearched && results.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-text-secondary)' }}>
                            No users found.
                        </div>
                    )}

                    {/* Load More Trigger (Optional) */}
                    {!loading && hasSearched && results.length >= 20 && (
                        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--color-text-secondary)' }}>
                            Try a more specific search...
                        </div>
                    )}
                </>
            )}
            {/* Connect Modal */}
            {connectModalTarget && (
                <ConnectModal
                    targetName={connectModalTarget.isAnonymous ? 'Anonymous' : (connectModalTarget.displayName || 'User')}
                    onConfirm={confirmConnect}
                    onClose={() => setConnectModalTarget(null)}
                />
            )}
        </div>
    );
};


export default SearchUsers;
