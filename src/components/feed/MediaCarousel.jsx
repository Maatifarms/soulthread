import React, { useState, useRef, useCallback } from 'react';
import AutoPlayVideo from './AutoPlayVideo';

/**
 * MediaCarousel — Instagram-style carousel for multi-media posts.
 * Features:
 * - Touch swipe support (no library needed)
 * - Dot indicators with active state
 * - IntersectionObserver video auto-play / auto-pause
 * - Keyboard navigation support
 */

// VideoSlide replaced by AutoPlayVideo (IntersectionObserver-based)

const MediaCarousel = ({ mediaItems }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    const goNext = useCallback(() => setActiveIndex(i => Math.min(i + 1, mediaItems.length - 1)), [mediaItems.length]);
    const goPrev = useCallback(() => setActiveIndex(i => Math.max(i - 1, 0)), []);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only swipe horizontally (ignore vertical scroll gestures)
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
            if (dx < 0) goNext();
            else goPrev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    if (!mediaItems || mediaItems.length === 0) return null;

    // Single item — no carousel chrome needed
    if (mediaItems.length === 1) {
        const item = mediaItems[0];
        return item.type === 'video' ? (
            <AutoPlayVideo src={item.url} />
        ) : (
            <img
                src={item.url} alt="post media"
                loading="lazy" decoding="async"
                style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
        );
    }

    return (
        <div
            style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Slides */}
            <div style={{
                display: 'flex',
                width: `${mediaItems.length * 100}%`,
                transform: `translateX(-${activeIndex * (100 / mediaItems.length)}%)`,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform',
            }}>
                {mediaItems.map((item, idx) => (
                    <div key={idx} style={{ width: `${100 / mediaItems.length}%`, flexShrink: 0 }}>
                        {item.type === 'video' ? (
                            <AutoPlayVideo src={item.url} />
                        ) : (
                            <img
                                src={item.url} alt={`media ${idx + 1}`}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Left / Right arrows (desktop) */}
            {activeIndex > 0 && (
                <button
                    onClick={goPrev}
                    aria-label="Previous"
                    style={{
                        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 2,
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="3">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            )}
            {activeIndex < mediaItems.length - 1 && (
                <button
                    onClick={goNext}
                    aria-label="Next"
                    style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 2,
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="3">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )}

            {/* Media count badge (top right) */}
            <div style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                fontSize: '11px', fontWeight: '700',
                padding: '3px 8px', borderRadius: '999px',
                backdropFilter: 'blur(4px)',
            }}>
                {activeIndex + 1}/{mediaItems.length}
            </div>

            {/* Dot indicators */}
            <div style={{
                position: 'absolute', bottom: '10px', left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: '5px', pointerEvents: 'none',
            }}>
                {mediaItems.map((_, i) => (
                    <div key={i} style={{
                        width: i === activeIndex ? '18px' : '6px',
                        height: '6px',
                        borderRadius: '999px',
                        background: i === activeIndex ? 'white' : 'rgba(255,255,255,0.55)',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                ))}
            </div>
        </div>
    );
};

export default MediaCarousel;
