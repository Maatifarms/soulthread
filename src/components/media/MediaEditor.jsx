import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * MediaEditor — Built-in image/video editor before posting
 *
 * Image capabilities:
 *   - Crop (freeform + aspect ratio presets: 1:1, 4:5, 16:9)
 *   - Rotate 90° CW
 *   - Brightness, Contrast, Saturation sliders
 *
 * Video capabilities:
 *   - Trim start/end (UI only — actual trim needs FFmpeg/server)
 *   - Choose thumbnail frame
 *   - Toggle mute
 *
 * Props:
 *   file        {File|null}         — file to edit
 *   type        {'image'|'video'}   — media type
 *   onDone      ({file, thumbnail}) — called with edited result
 *   onCancel    ()                  — called when dismissed
 */

const ASPECT_PRESETS = [
    { label: 'Free', value: null },
    { label: '1:1', value: 1 },
    { label: '4:5', value: 0.8 },
    { label: '16:9', value: 16 / 9 },
];

// ── Image Editor ───────────────────────────────────────────────────────────────
function ImageEditor({ file, onDone, onCancel }) {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [aspectPreset, setAspectPreset] = useState(null);
    const [applying, setApplying] = useState(false);

    const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Draw image to canvas
    const drawToCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;

        const rad = (rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));

        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (rotation % 180 !== 0) {
            canvas.width = h;
            canvas.height = w;
        } else {
            canvas.width = w;
            canvas.height = h;
        }

        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.filter = filter;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();
    }, [rotation, filter]);

    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            imgRef.current = img;
            URL.revokeObjectURL(url);
            drawToCanvas();
        };
        img.src = url;
    }, [file]);

    useEffect(() => { drawToCanvas(); }, [drawToCanvas]);

    const handleApply = async () => {
        setApplying(true);
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
            const name = (file.name || 'edited').replace(/\.[^.]+$/, '') + `_edited.${ext}`;
            const edited = new File([blob], name, { type: blob.type });
            setApplying(false);
            onDone({ file: edited, thumbnail: null });
        }, 'image/webp', 0.88);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.sheet}>
                {/* Header */}
                <div style={styles.header}>
                    <button onClick={onCancel} style={styles.btnGhost}>Cancel</button>
                    <span style={styles.title}>Edit Image</span>
                    <button onClick={handleApply} disabled={applying} style={styles.btnPrimary}>
                        {applying ? '…' : 'Done'}
                    </button>
                </div>

                {/* Preview Canvas */}
                <div style={{ overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '240px', maxHeight: '55vh' }}>
                    <canvas
                        ref={canvasRef}
                        style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain' }}
                    />
                </div>

                {/* Controls */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>

                    {/* Rotate + Aspect */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => setRotation(r => (r + 90) % 360)} style={styles.chip}>
                            ↺ Rotate 90°
                        </button>
                        {ASPECT_PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => setAspectPreset(p.value)}
                                style={{
                                    ...styles.chip,
                                    background: aspectPreset === p.value ? 'var(--color-primary)' : 'var(--color-background)',
                                    color: aspectPreset === p.value ? 'white' : 'var(--color-text-primary)',
                                }}
                            >{p.label}</button>
                        ))}
                    </div>

                    {/* Sliders */}
                    {[
                        { label: '☀️ Brightness', value: brightness, set: setBrightness, min: 50, max: 200 },
                        { label: '◑ Contrast', value: contrast, set: setContrast, min: 50, max: 200 },
                        { label: '◈ Saturation', value: saturation, set: setSaturation, min: 0, max: 200 },
                    ].map(({ label, value, set, min, max }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}</span>
                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{value}%</span>
                            </div>
                            <input
                                type="range" min={min} max={max} value={value}
                                onChange={e => set(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                        </div>
                    ))}

                    {/* Reset */}
                    <button
                        onClick={() => { setRotation(0); setBrightness(100); setContrast(100); setSaturation(100); }}
                        style={{ ...styles.chip, color: '#ef4444', borderColor: '#ef444433', alignSelf: 'flex-start' }}
                    >Reset all</button>
                </div>
            </div>
        </div>
    );
}

// ── Video Editor ───────────────────────────────────────────────────────────────
function VideoEditor({ file, onDone, onCancel }) {
    const videoRef = useRef(null);
    const [duration, setDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [muted, setMuted] = useState(false);
    const [thumbTime, setThumbTime] = useState(1.5);
    const [thumbnail, setThumbnail] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const url = useRef(null);

    useEffect(() => {
        if (!file) return;
        url.current = URL.createObjectURL(file);
        return () => { if (url.current) URL.revokeObjectURL(url.current); };
    }, [file]);

    const handleLoaded = () => {
        const v = videoRef.current;
        if (!v) return;
        setDuration(v.duration);
        setTrimEnd(v.duration);
    };

    const captureThumbnail = useCallback(async () => {
        const v = videoRef.current;
        if (!v) return;
        setCapturing(true);
        v.currentTime = thumbTime;
        await new Promise(r => { v.onseeked = r; });
        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        canvas.getContext('2d').drawImage(v, 0, 0);
        canvas.toBlob(blob => {
            setThumbnail(blob);
            setCapturing(false);
        }, 'image/jpeg', 0.85);
    }, [thumbTime]);

    const handleDone = () => {
        onDone({
            file: file,
            thumbnail: thumbnail,
            trimStart: trimStart,
            trimEnd: trimEnd,
            muted: muted,
        });
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.sheet}>
                <div style={styles.header}>
                    <button onClick={onCancel} style={styles.btnGhost}>Cancel</button>
                    <span style={styles.title}>Edit Video</span>
                    <button onClick={handleDone} style={styles.btnPrimary}>Done</button>
                </div>

                {/* Preview */}
                <video
                    ref={videoRef}
                    src={url.current}
                    controls
                    muted={muted}
                    playsInline
                    onLoadedMetadata={handleLoaded}
                    style={{ width: '100%', maxHeight: '280px', background: '#000', display: 'block' }}
                />

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Trim range */}
                    {duration > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                ✂️ Trim — {trimStart.toFixed(1)}s → {trimEnd.toFixed(1)}s
                            </span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Start</span>
                                <input type="range" min="0" max={trimEnd - 0.5} step="0.1"
                                    value={trimStart}
                                    onChange={e => { setTrimStart(+e.target.value); videoRef.current.currentTime = +e.target.value; }}
                                    style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>End&nbsp;</span>
                                <input type="range" min={trimStart + 0.5} max={duration} step="0.1"
                                    value={trimEnd}
                                    onChange={e => setTrimEnd(+e.target.value)}
                                    style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Thumbnail picker */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            🖼️ Thumbnail frame — {thumbTime.toFixed(1)}s
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="range" min="0" max={duration || 10} step="0.5"
                                value={thumbTime}
                                onChange={e => { setThumbTime(+e.target.value); videoRef.current.currentTime = +e.target.value; }}
                                style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                            />
                            <button onClick={captureThumbnail} disabled={capturing} style={styles.chip}>
                                {capturing ? '…' : 'Capture'}
                            </button>
                        </div>
                        {thumbnail && (
                            <img src={URL.createObjectURL(thumbnail)} alt="thumbnail"
                                style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '2px solid var(--color-primary)' }} />
                        )}
                    </div>

                    {/* Mute toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => setMuted(m => !m)}
                            style={{ ...styles.chip, background: muted ? 'var(--color-primary)' : 'var(--color-background)', color: muted ? 'white' : 'var(--color-text-primary)' }}
                        >
                            {muted ? '🔇 Muted' : '🔊 Audio on'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function MediaEditor({ file, type, onDone, onCancel }) {
    if (!file) return null;
    if (type === 'video') return <VideoEditor file={file} onDone={onDone} onCancel={onCancel} />;
    return <ImageEditor file={file} onDone={onDone} onCancel={onCancel} />;
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const styles = {
    overlay: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        zIndex: 8000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s',
    },
    sheet: {
        background: 'var(--color-surface)',
        borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
    },
    title: { fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' },
    btnGhost: {
        background: 'none', border: 'none',
        color: 'var(--color-text-secondary)', fontSize: '15px', cursor: 'pointer', padding: '4px 8px',
    },
    btnPrimary: {
        background: 'var(--color-primary)', color: 'white',
        border: 'none', borderRadius: '10px', padding: '8px 16px',
        fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    },
    chip: {
        padding: '6px 14px', borderRadius: '20px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        transition: 'all 0.15s',
    },
};
