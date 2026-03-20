import { useEffect, useRef, useCallback } from 'react';

/**
 * useVideoAutoPlay — IntersectionObserver-based video auto-play hook
 *
 * Behaviour:
 *  - Video plays when >= 60% visible in the viewport
 *  - Video pauses the moment it drops below threshold
 *  - Muted by default (browser autoplay policy requires this)
 *  - Global singleton manager prevents multiple videos playing simultaneously
 *  - Preloads metadata for faster start on mobile
 *  - Cleans up observer on unmount (no memory leaks)
 *
 * Usage:
 *   const { videoRef, muted, setMuted, playing } = useVideoAutoPlay();
 *   <video ref={videoRef} muted={muted} ... />
 *
 * @param {Object} options
 * @param {number}  [options.threshold=0.6]    - Fraction visible to trigger play
 * @param {string}  [options.rootMargin='0px'] - IntersectionObserver root margin
 * @param {boolean} [options.loop=true]        - Loop the video
 * @returns {{ videoRef, muted, setMuted, playing, isInView }}
 */

// ── Global "now playing" tracker (one video at a time) ───────────────────────
const activeVideoRef = { current: null };

const pauseActive = () => {
    const v = activeVideoRef.current;
    if (v && !v.paused) {
        try { v.pause(); } catch (e) { /* ignore */ }
    }
    activeVideoRef.current = null;
};

// ── Hook ─────────────────────────────────────────────────────────────────────
import { useState } from 'react';

const useVideoAutoPlay = ({
    threshold = 0.6,
    rootMargin = '0px',
    loop = true,
} = {}) => {
    const videoRef = useRef(null);
    const observerRef = useRef(null);
    const [muted, setMuted] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [isInView, setIsInView] = useState(false);

    const playVideo = useCallback(async (video) => {
        if (!video || !video.paused) return;

        // Pause any other playing video first
        if (activeVideoRef.current && activeVideoRef.current !== video) {
            pauseActive();
        }

        try {
            // Ensure muted for autoplay policy compliance
            video.muted = true;
            await video.play();
            activeVideoRef.current = video;
            setPlaying(true);
        } catch (e) {
            // Autoplay blocked (page not focused, etc.) — silently skip
            setPlaying(false);
        }
    }, []);

    const pauseVideo = useCallback((video) => {
        if (!video || video.paused) return;
        try {
            video.pause();
            if (activeVideoRef.current === video) {
                activeVideoRef.current = null;
            }
            setPlaying(false);
        } catch (e) { /* ignore */ }
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Preload metadata only — saves bandwidth on mobile
        video.preload = 'metadata';
        video.loop = loop;
        video.playsInline = true;
        video.muted = true;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    setIsInView(entry.isIntersecting && entry.intersectionRatio >= threshold);

                    if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                        playVideo(video);
                    } else {
                        pauseVideo(video);
                    }
                });
            },
            {
                threshold: [0, threshold, 1.0],
                rootMargin,
            }
        );

        observer.observe(video);
        observerRef.current = observer;

        // Cleanup: pause and disconnect
        return () => {
            observer.disconnect();
            pauseVideo(video);
            // Free browser memory: remove src when offscreen
            // Only do this if the video is not in view at unmount
            if (!isInView) {
                video.src = '';
                video.load();
            }
        };
    }, [playVideo, pauseVideo, threshold, rootMargin, loop]);

    return { videoRef, muted, setMuted, playing, isInView };
};

export default useVideoAutoPlay;
