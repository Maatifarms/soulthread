import React, { useState } from 'react';
import useVideoAutoPlay from '../../hooks/useVideoAutoPlay';

/**
 * AutoPlayVideo — Production video player for feed posts.
 *
 * Features:
 * - IntersectionObserver: auto-play at 60% viewport visibility
 * - Auto-pause + memory cleanup when scrolled offscreen
 * - Muted by default (browser autoplay policy)
 * - Tap to toggle mute / tap centre to play/pause
 * - Mute/unmute button (bottom-right)
 * - Progress bar (bottom)
 * - Only one video plays at a time globally
 */

const AutoPlayVideo = ({ src, poster, style = {} }) => {
    const { videoRef, muted, setMuted, playing } = useVideoAutoPlay({
        threshold: 0.6,
        loop: true,
    });

    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(false);

    const handleTapCenter = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => { });
        } else {
            video.pause();
        }
        // Flash controls briefly when tapped
        setShowControls(true);
        setTimeout(() => setShowControls(false), 1500);
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        const newMuted = !muted;
        video.muted = newMuted;
        setMuted(newMuted);
    };

    return (
        <div
            style={{
                position: 'relative',
                background: '#000',
                width: '100%',
                overflow: 'hidden',
                ...style,
            }}
            onClick={handleTapCenter}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                muted={muted}
                playsInline
                loop
                preload="metadata"
                onTimeUpdate={(e) => {
                    const v = e.target;
                    if (v.duration) setProgress((v.currentTime / v.duration) * 100);
                }}
                style={{
                    width: '100%',
                    maxHeight: '480px',
                    objectFit: 'contain',
                    display: 'block',
                }}
            />

            {/* Play overlay — shown when paused */}
            {!playing && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Mute / Unmute button */}
            <button
                onClick={toggleMute}
                aria-label={muted ? 'Unmute video' : 'Mute video'}
                style={{
                    position: 'absolute', bottom: '14px', right: '12px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', backdropFilter: 'blur(4px)',
                    transition: 'transform 0.15s ease',
                    zIndex: 2,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {muted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                )}
            </button>

            {/* Progress bar */}
            {progress > 0 && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '3px', background: 'rgba(255,255,255,0.2)',
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'var(--color-primary, #3d8b7f)',
                        transition: 'width 0.1s linear',
                    }} />
                </div>
            )}
        </div>
    );
};

export default AutoPlayVideo;
