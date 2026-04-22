import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const GrowthOutreach = () => {
    const [platform, setPlatform] = useState('Instagram');
    const [postContent, setPostContent] = useState('');
    const [context, setContext] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState({});

    const handleGenerate = async () => {
        if (!postContent.trim()) return;
        setLoading(true);
        setResults(null);
        try {
            const generateSocialOutreach = httpsCallable(functions, 'generateSocialOutreach');
            const result = await generateSocialOutreach({ 
                platform, 
                postContent, 
                context 
            });
            setResults(result.data);
        } catch (error) {
            console.error("Generation Error:", error);
            alert("Failed to generate outreach. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopyStatus({ ...copyStatus, [key]: true });
        setTimeout(() => setCopyStatus({ ...copyStatus, [key]: false }), 2000);
    };

    return (
        <div className="growth-outreach-container" style={styles.container}>
            <div style={styles.inputSection}>
                <h3 style={styles.sectionTitle}>Growth Outreach Intelligence</h3>
                <p style={styles.subtitle}>Generate highly empathetic, non-spammy outreach for social media leads.</p>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Target Platform</label>
                    <select 
                        value={platform} 
                        onChange={(e) => setPlatform(e.target.value)}
                        style={styles.select}
                    >
                        <option>Instagram</option>
                        <option>LinkedIn</option>
                        <option>Twitter/X</option>
                        <option>Reddit</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Post Content / Context</label>
                    <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Paste the person's post content here..."
                        style={styles.textarea}
                        rows={5}
                    />
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={loading || !postContent.trim()}
                    style={{
                        ...styles.generateBtn,
                        opacity: (loading || !postContent.trim()) ? 0.6 : 1
                    }}
                >
                    {loading ? 'Generating...' : 'Generate Outreach Options'}
                </button>
            </div>

            <div style={styles.resultSection}>
                <AnimatePresence>
                    {results && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={styles.resultsList}
                        >
                            <OutreachCard 
                                title="Public Comment" 
                                text={results.comment} 
                                onCopy={() => copyToClipboard(results.comment, 'comment')}
                                wasCopied={copyStatus.comment}
                            />
                            <OutreachCard 
                                title="Direct Message / Note" 
                                text={results.dm} 
                                onCopy={() => copyToClipboard(results.dm, 'dm')}
                                wasCopied={copyStatus.dm}
                            />
                            <OutreachCard 
                                title="Safe Space Check-in" 
                                text={results.checkin} 
                                onCopy={() => copyToClipboard(results.checkin, 'checkin')}
                                wasCopied={copyStatus.checkin}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {!results && !loading && (
                    <div style={styles.emptyState}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                        <p>Waiting for post analysis...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const OutreachCard = ({ title, text, onCopy, wasCopied }) => (
    <div style={styles.card}>
        <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>{title}</h4>
            <button onClick={onCopy} style={styles.copyBtn}>
                {wasCopied ? '✓ Copied' : 'Copy'}
            </button>
        </div>
        <p style={styles.cardText}>{text}</p>
    </div>
);

const styles = {
    container: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', padding: '24px', background: '#fcfaff', borderRadius: '32px', border: '1px solid var(--color-border)' },
    inputSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sectionTitle: { fontSize: '20px', fontWeight: '950', margin: 0, color: 'var(--color-primary)' },
    subtitle: { fontSize: '13px', color: 'var(--color-text-muted)', margin: 0, fontWeight: '600' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' },
    select: { padding: '12px', borderRadius: '12px', border: '1.5px solid var(--color-border)', outline: 'none', fontWeight: '700' },
    textarea: { padding: '16px', borderRadius: '16px', border: '1.5px solid var(--color-border)', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6' },
    generateBtn: { padding: '16px', background: 'var(--grad-primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: 'var(--shadow-glow-sm)' },
    resultSection: { minHeight: '400px', display: 'flex', flexDirection: 'column' },
    resultsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    cardTitle: { margin: 0, fontSize: '14px', fontWeight: '900', color: 'var(--color-text-muted)', textTransform: 'uppercase' },
    copyBtn: { padding: '6px 12px', background: 'var(--color-primary-soft)', border: 'none', borderRadius: '999px', fontSize: '11px', fontWeight: '900', color: 'var(--color-primary)', cursor: 'pointer' },
    cardText: { margin: 0, fontSize: '15px', lineHeight: '1.7', color: 'var(--color-text-primary)', fontWeight: '500' },
    emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontWeight: '700' }
};

export default GrowthOutreach;
