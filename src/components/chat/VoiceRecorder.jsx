import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * VoiceRecorder — Production-grade voice message component
 *
 * Interaction model:
 *   - Hold mic button → recording starts
 *   - Release → sends automatically
 *   - Slide finger left while holding → cancels recording
 *   - Tap mic (not hold) → opens review mode (play / delete / send)
 *
 * Audio: records WebM/Opus (best compression), falls back to any supported format.
 * Max recording duration: configurable via maxDuration (default 120s).
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const getBestMimeType = () => {
    const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
    ];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
};

// ─── WaveformBars — animated recording indicator ─────────────────────────────

const WaveformBars = ({ active }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '28px' }}>
        {Array.from({ length: 12 }, (_, i) => (
            <div
                key={i}
                style={{
                    width: '3px',
                    borderRadius: '2px',
                    background: 'var(--color-primary)',
                    height: active ? `${8 + Math.sin((i / 12) * Math.PI * 2) * 10 + 8}px` : '4px',
                    animation: active ? `voiceBar 0.8s ease-in-out infinite` : 'none',
                    animationDelay: `${i * 0.07}s`,
                    transition: 'height 0.15s ease',
                }}
            />
        ))}
        <style>{`
            @keyframes voiceBar {
                0%, 100% { transform: scaleY(0.4); }
                50%       { transform: scaleY(1.4); }
            }
        `}</style>
    </div>
);

// ─── AudioPreview — mini playback player ────────────────────────────────────

const AudioPreview = ({ blob, duration }) => {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const url = useRef(null);

    useEffect(() => {
        if (!blob) return;
        url.current = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.src = url.current;
        return () => URL.revokeObjectURL(url.current);
    }, [blob]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) { audio.pause(); setPlaying(false); }
        else { audio.play().then(() => setPlaying(true)).catch(() => { }); }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={togglePlay} style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--color-primary)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                {playing ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                )}
            </button>
            {/* Progress bar */}
            <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.1s linear' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {formatDuration(duration)}
            </span>
            {/* Hidden audio el */}
            <audio ref={audioRef} onTimeUpdate={e => {
                const a = e.target;
                if (a.duration) setProgress((a.currentTime / a.duration) * 100);
            }} onEnded={() => { setPlaying(false); setProgress(0); }} style={{ display: 'none' }} />
        </div>
    );
};

// ─── VoiceRecorder ───────────────────────────────────────────────────────────

const VoiceRecorder = ({
    onSend,                 // (blob: Blob, durationSecs: number) => void
    onCancel,               // () => void
    maxDuration = 120,      // seconds
    disabled = false,
}) => {
    // ── State machine: idle | requesting | recording | paused | review ────────
    const [phase, setPhase] = useState('idle');
    const [elapsed, setElapsed] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [finalDuration, setFinalDuration] = useState(0);
    const [cancelZone, setCancelZone] = useState(false);      // slide-to-cancel active
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [error, setError] = useState(null);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    const timerRef = useRef(null);
    const startXRef = useRef(null);
    const micBtnRef = useRef(null);

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => () => {
        clearInterval(timerRef.current);
        stopStream();
    }, []);

    const stopStream = () => {
        try {
            mediaRecorder.current?.stream?.getTracks().forEach(t => t.stop());
        } catch (e) { /* ignore */ }
    };

    // ── Timer ─────────────────────────────────────────────────────────────────
    const startTimer = useCallback(() => {
        const start = Date.now();
        timerRef.current = setInterval(() => {
            const secs = (Date.now() - start) / 1000;
            setElapsed(secs);
            if (secs >= maxDuration) stopRecording(false);
        }, 200);
    }, [maxDuration]);

    const stopTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    };

    // ── Recording lifecycle ───────────────────────────────────────────────────
    const startRecording = useCallback(async () => {
        if (disabled) return;
        setError(null);
        setPhase('requesting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermissionDenied(false);

            const mimeType = getBestMimeType();
            const options = mimeType ? { mimeType } : {};

            const mr = new MediaRecorder(stream, options);
            mediaRecorder.current = mr;
            chunks.current = [];

            mr.ondataavailable = e => {
                if (e.data && e.data.size > 0) chunks.current.push(e.data);
            };

            mr.onstop = () => {
                const mtype = mimeType || 'audio/webm';
                const blob = new Blob(chunks.current, { type: mtype });
                setRecordedBlob(blob);
                setFinalDuration(elapsed);
                setPhase('review');
                stopStream();
            };

            mr.start(100); // collect 100ms chunks for streaming compatibility
            setElapsed(0);
            setPhase('recording');
            startTimer();
        } catch (err) {
            stopTimer();
            setPhase('idle');
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionDenied(true);
            } else {
                setError('Microphone unavailable');
            }
        }
    }, [disabled, elapsed, startTimer]);

    const stopRecording = useCallback((cancelled = false) => {
        stopTimer();
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            if (cancelled) {
                // Don't fire onstop callback — manually cleanup
                mediaRecorder.current.onstop = null;
                mediaRecorder.current.stop();
                stopStream();
                chunks.current = [];
                setPhase('idle');
                setElapsed(0);
                onCancel?.();
            } else {
                // Normal stop → onstop fires → sets review phase
                mediaRecorder.current.stop();
            }
        }
    }, [onCancel]);

    const togglePause = useCallback(() => {
        if (!mediaRecorder.current) return;
        if (phase === 'recording') {
            mediaRecorder.current.pause();
            stopTimer();
            setPhase('paused');
        } else if (phase === 'paused') {
            mediaRecorder.current.resume();
            startTimer();
            setPhase('recording');
        }
    }, [phase, startTimer]);

    const discardRecording = () => {
        setRecordedBlob(null);
        setElapsed(0);
        setFinalDuration(0);
        setPhase('idle');
    };

    const sendRecording = () => {
        if (!recordedBlob || !onSend) return;
        onSend(recordedBlob, finalDuration);
        discardRecording();
    };

    // ── Pointer events for hold-to-record + slide-to-cancel ──────────────────
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        startXRef.current = e.clientX;
        startRecording();
    }, [startRecording]);

    const handlePointerMove = useCallback((e) => {
        if (phase !== 'recording') return;
        const dx = (startXRef.current || 0) - e.clientX;
        setCancelZone(dx > 60);
    }, [phase]);

    const handlePointerUp = useCallback((e) => {
        const dx = (startXRef.current || 0) - e.clientX;
        startXRef.current = null;
        setCancelZone(false);
        if (phase === 'recording' || phase === 'requesting') {
            if (dx > 60) {
                stopRecording(true);   // slide to cancel
            } else if (elapsed < 0.5) {
                // Very short tap → don't send, just stop and enter review anyway
                stopRecording(false);
            } else {
                stopRecording(false);  // normal release → send review
            }
        }
    }, [phase, elapsed, stopRecording]);

    // ─── Render ────────────────────────────────────────────────────────────────

    // PHASE: review
    if (phase === 'review' && recordedBlob) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px',
                background: 'var(--color-primary-soft)',
                borderRadius: '24px',
                flex: 1,
            }}>
                {/* Discard */}
                <button onClick={discardRecording} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#ef4444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }} title="Discard">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                </button>

                {/* Playback */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <AudioPreview blob={recordedBlob} duration={finalDuration} />
                </div>

                {/* Send */}
                <button onClick={sendRecording} style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--color-primary)', border: 'none',
                    color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }} title="Send voice message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        );
    }

    // PHASE: recording / paused
    if (phase === 'recording' || phase === 'paused') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                {/* Cancel hint */}
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '8px 14px',
                    background: cancelZone ? 'rgba(239,68,68,0.08)' : 'var(--color-surface-2)',
                    border: `1px solid ${cancelZone ? 'rgba(239,68,68,0.25)' : 'var(--color-border)'}`,
                    borderRadius: '24px',
                    transition: 'all 0.15s ease',
                }}>
                    {/* Recording dot + timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: phase === 'recording' ? '#ef4444' : 'var(--color-text-muted)',
                            animation: phase === 'recording' ? 'recDot 1s ease-in-out infinite' : 'none',
                        }} />
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                            {formatDuration(elapsed)}
                        </span>
                    </div>

                    {/* Waveform */}
                    <WaveformBars active={phase === 'recording'} />

                    {/* Slide-to-cancel label */}
                    <span style={{
                        fontSize: '12px', color: cancelZone ? '#ef4444' : 'var(--color-text-muted)',
                        flex: 1, textAlign: 'right', transition: 'color 0.15s',
                        whiteSpace: 'nowrap',
                    }}>
                        {cancelZone ? '↙ Release to cancel' : '← Slide to cancel'}
                    </span>
                </div>

                {/* Pause/Resume */}
                <button onClick={togglePause} style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'var(--color-text-secondary)',
                }}>
                    {phase === 'recording' ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>

                {/* Stop → send review */}
                <button
                    onPointerUp={() => stopRecording(false)}
                    style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: 'var(--color-primary)', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, boxShadow: '0 0 0 4px rgba(61,139,127,0.2)',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                    </svg>
                </button>

                <style>{`
                    @keyframes recDot {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.2; }
                    }
                `}</style>
            </div>
        );
    }

    // PHASE: idle / requesting
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Permission denied warning */}
            {permissionDenied && (
                <div style={{
                    fontSize: '11px', color: '#ef4444', textAlign: 'center',
                    padding: '4px 8px', background: 'rgba(239,68,68,0.08)',
                    borderRadius: '8px', marginBottom: '4px',
                }}>
                    Microphone access denied. Please allow it in browser settings.
                </div>
            )}
            {error && (
                <div style={{ fontSize: '11px', color: '#ef4444', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {/* Mic button — hold to record */}
            <button
                ref={micBtnRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                disabled={disabled || phase === 'requesting'}
                style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: phase === 'requesting'
                        ? 'var(--color-border)'
                        : 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    touchAction: 'none',
                    userSelect: 'none',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    boxShadow: '0 2px 8px rgba(61,139,127,0.25)',
                    opacity: disabled ? 0.5 : 1,
                }}
                title="Hold to record voice message"
            >
                {phase === 'requesting' ? (
                    <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default VoiceRecorder;
