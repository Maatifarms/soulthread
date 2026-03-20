import React, { useState } from 'react';

const ShareMenu = ({ postId, authorId, onClose }) => {
    const [copied, setCopied] = useState(false);

    // Deep Linking mapping structure for Viral Growth (Task 23)
    const shareUrl = `https://soulthread.in/post/${postId}?ref=${authorId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareExternally = async (platform) => {
        const text = "A really profound post I read today on SoulThread. Take a look 🌿";
        if (platform === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`);
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`);
        } else if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SoulThread.in',
                    text: text,
                    url: shareUrl,
                });
            } catch (err) {
                console.warn('Native share failed', err);
            }
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.menu} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Share to the World</h3>
                    <button onClick={onClose} style={styles.closeBtn}>×</button>
                </div>

                <div style={styles.grid}>
                    <button onClick={() => handleShareExternally('whatsapp')} style={styles.shareBtn}>💬 WhatsApp</button>
                    <button onClick={() => handleShareExternally('twitter')} style={styles.shareBtn}>🐦 Twitter</button>
                    <button onClick={() => handleShareExternally('native')} style={styles.shareBtn}>📤 More</button>
                </div>

                <div style={styles.linkRow}>
                    <input type="text" value={shareUrl} readOnly style={styles.input} />
                    <button onClick={handleCopy} style={{ ...styles.copyBtn, background: copied ? 'var(--color-primary)' : 'var(--color-surface)' }}>
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', bottom: 0, left: 0, right: 0, top: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'flex-end' },
    menu: { background: 'var(--color-surface)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', width: '100%', color: 'var(--color-text-primary)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 24px 0' },
    closeBtn: { background: 'none', border: 'none', fontSize: '28px', color: 'var(--color-text-muted)', cursor: 'pointer', lineHeight: 1 },
    grid: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' },
    shareBtn: { flexShrink: 0, padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'transparent', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: 'var(--color-text-primary)' },
    linkRow: { display: 'flex', gap: '8px', marginTop: '16px' },
    input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)' },
    copyBtn: { padding: '0 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontWeight: 'bold', cursor: 'pointer', color: 'var(--color-text-primary)' }
};

export default ShareMenu;
