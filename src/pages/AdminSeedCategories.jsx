import React, { useState } from 'react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../services/categories';
import { 
    AlertCircle, 
    CheckCircle, 
    CloudLightning, 
    Hash, 
    LayoutDashboard, 
    ArrowLeft,
    HeartPulse,
    Brain,
    Volume2,
    Wrench,
    Sparkles,
    Rainbow,
    Users,
    Heart,
    Flame,
    PenLine,
    Sprout,
    Loader2
} from 'lucide-react';

const ICON_MAP = {
    HeartPulse,
    Brain,
    Volume2,
    Wrench,
    Sparkles,
    Rainbow,
    Users,
    Heart,
    Flame,
    PenLine,
    Sprout
};

/**
 * AdminSeedCategories — One-time admin page to seed Firestore categories.
 * Route: /admin/seed-categories
 * 
 * Protected: Admin only. Visit once → categories are written to Firestore.
 * Remove this route after seeding is confirmed.
 */
const AdminSeedCategories = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle | running | done | error
    const [log, setLog] = useState([]);
    const [error, setError] = useState(null);

    const appendLog = (msg) => setLog(prev => [...prev, msg]);

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-error)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={48} />
                <span>Admin access required</span>
            </div>
        );
    }

    const runSeed = async () => {
        setStatus('running');
        setLog([]);
        setError(null);
        try {
            appendLog('[INIT] Starting category seed...');
            for (const cat of CATEGORIES) {
                const ref = doc(collection(db, 'categories'), cat.id);
                await setDoc(ref, {
                    ...cat,
                    slug: cat.id,
                    isActive: true,
                    postCount: 0,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                }, { merge: true });
                appendLog(`[SUCCESS] [${cat.order}] ${cat.name} (${cat.icon})`);
            }
            appendLog(`[DONE] ${CATEGORIES.length} categories seeded.`);
            appendLog('[INFO] Document IDs = slug (ready for AI categorization).');
            setStatus('done');
        } catch (err) {
            setError(err.message);
            appendLog(`[ERROR] ${err.message}`);
            setStatus('error');
        }
    };

    return (
        <div style={{
            maxWidth: '600px', margin: '40px auto', padding: '32px',
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-border)', boxShadow: 'var(--shadow-md)',
        }}>
            <h2 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sprout size={24} /> Seed Categories
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                This is a one-time operation. It writes all 9 SoulThread categories to Firestore.<br />
                Safe to re-run — uses <code>setDoc merge: true</code>.
            </p>

            <div style={{ marginBottom: '16px' }}>
                {CATEGORIES.map(c => (
                    <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 0', borderBottom: '1px solid var(--color-border)',
                        fontSize: '14px',
                    }}>
                        <span style={{ color: 'var(--color-primary)', display: 'flex' }}>
                            {(() => {
                                const IconComp = ICON_MAP[c.icon];
                                return IconComp ? <IconComp size={18} /> : <PenLine size={18} />;
                            })()}
                        </span>
                        <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{c.name}</span>
                        <span style={{
                            marginLeft: 'auto', fontSize: '11px', fontFamily: 'monospace',
                            color: 'var(--color-text-muted)', background: 'var(--color-surface-2)',
                            padding: '2px 8px', borderRadius: '6px',
                        }}>{c.id}</span>
                    </div>
                ))}
            </div>

            {status !== 'done' && (
                <button
                    onClick={runSeed}
                    disabled={status === 'running'}
                    style={{
                        width: '100%', padding: '14px',
                        background: status === 'running' ? 'var(--color-border)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        color: status === 'running' ? 'var(--color-text-muted)' : 'white',
                        border: 'none', borderRadius: 'var(--radius-full)',
                        fontWeight: '700', fontSize: '15px', cursor: status === 'running' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {status === 'running' ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Loader2 className="animate-spin" size={20} /> Seeding...
                        </span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <CloudLightning size={20} /> Seed All 9 Categories to Firestore
                        </span>
                    )}
                </button>
            )}

            {log.length > 0 && (
                <pre style={{
                    marginTop: '20px', padding: '16px',
                    background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)',
                    fontSize: '13px', lineHeight: '1.8',
                    color: status === 'done' ? 'var(--color-primary-dark)' : status === 'error' ? 'var(--color-error)' : 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                    maxHeight: '300px', overflowY: 'auto',
                }}>
                    {log.join('\n')}
                </pre>
            )}

            {status === 'done' && (
                <button
                    onClick={() => navigate('/admin')}
                    style={{
                        marginTop: '16px', width: '100%', padding: '12px',
                        background: 'none', border: '1.5px solid var(--color-primary)',
                        color: 'var(--color-primary)', borderRadius: 'var(--radius-full)',
                        fontWeight: '700', cursor: 'pointer',
                    }}
                >
                    <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Admin Dashboard
                </button>
            )}
        </div>
    );
};

export default AdminSeedCategories;
