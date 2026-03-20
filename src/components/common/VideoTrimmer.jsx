import React, { useState, useRef, useEffect } from 'react';

const VideoTrimmer = ({ videoSrc, onTrimComplete, onCancel }) => {
    const videoRef = useRef(null);
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            setEndTime(video.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (video.currentTime >= endTime) {
                video.pause();
                video.currentTime = startTime;
                setIsPlaying(false);
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [endTime, startTime]);

    // Format time helper (MM:SS.ms)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms < 10 ? '0' : ''}${ms}`;
    };

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.currentTime = Math.max(startTime, currentTime);
                videoRef.current.play();
            }
        }
    };

    const handleStartTimeChange = (value) => {
        const newStart = Math.max(0, Math.min(parseFloat(value) || 0, endTime - 0.1));
        setStartTime(newStart);
        if (videoRef.current && !isPlaying) {
            videoRef.current.currentTime = newStart;
        }
    };

    const handleEndTimeChange = (value) => {
        const newEnd = Math.max(startTime + 0.1, Math.min(parseFloat(value) || duration, duration));
        setEndTime(newEnd);
    };

    const handleSave = () => {
        onTrimComplete(startTime, endTime);
    };

    const trimDuration = endTime - startTime;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '700px',
                backgroundColor: '#1e1e1e',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>Trim Video</h3>
                    <div style={{ color: '#aaa', fontSize: '13px' }}>
                        Duration: {formatTime(trimDuration)}
                    </div>
                </div>

                {/* Video Preview */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    backgroundColor: 'black',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                    />
                    {!isPlaying && (
                        <div
                            onClick={handlePlayPause}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                fontSize: '48px',
                                color: 'white',
                                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                                transition: 'transform 0.2s',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            ▶
                        </div>
                    )}
                </div>

                {/* Playback Controls */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={handlePlayPause}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: '1px solid #555',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            minHeight: '44px',
                            minWidth: '100px'
                        }}
                    >
                        {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <div style={{
                        flex: 1,
                        height: '4px',
                        background: '#333',
                        borderRadius: '2px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${(currentTime / duration) * 100}%`,
                            background: 'var(--color-primary, #6200ea)',
                            borderRadius: '2px',
                            transition: 'width 0.1s'
                        }} />
                    </div>
                    <div style={{ color: '#aaa', fontSize: '13px', minWidth: '80px', textAlign: 'right' }}>
                        {formatTime(currentTime)}
                    </div>
                </div>

                {/* Trim Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Start Time */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '13px', color: '#aaa', fontWeight: '500' }}>Start Time</label>
                            <input
                                type="number"
                                value={startTime.toFixed(2)}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                                step="0.01"
                                min="0"
                                max={endTime - 0.1}
                                style={{
                                    width: '100px',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #555',
                                    background: '#2a2a2a',
                                    color: 'white',
                                    fontSize: '13px',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.01}
                            value={startTime}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            style={{
                                width: '100%',
                                height: '6px',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {formatTime(startTime)}
                        </div>
                    </div>

                    {/* End Time */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '13px', color: '#aaa', fontWeight: '500' }}>End Time</label>
                            <input
                                type="number"
                                value={endTime.toFixed(2)}
                                onChange={(e) => handleEndTimeChange(e.target.value)}
                                step="0.01"
                                min={startTime + 0.1}
                                max={duration}
                                style={{
                                    width: '100px',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #555',
                                    background: '#2a2a2a',
                                    color: 'white',
                                    fontSize: '13px',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.01}
                            value={endTime}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            style={{
                                width: '100%',
                                height: '6px',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {formatTime(endTime)}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '10px',
                            border: '1px solid #555',
                            background: 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '500',
                            minHeight: '48px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'var(--color-primary, #6200ea)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            minHeight: '48px'
                        }}
                    >
                        Apply Trim
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoTrimmer;
