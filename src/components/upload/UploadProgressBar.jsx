import React, { useState, useEffect } from 'react';

/**
 * UploadProgressBar — floating global upload progress UI
 *
 * Shows all active upload jobs. Slides in from bottom-right.
 * Each job shows file name, progress bar, status, and cancel button.
 *
 * Usage:
 *   <UploadProgressBar jobs={activeJobs} onCancel={cancelUpload} />
 */
const statusColors = {
    compressing: '#f59e0b',
    uploading: '#3d8b7f',
    done: '#10b981',
    error: '#ef4444',
    cancelled: '#9ca3af',
};

const statusLabels = {
    compressing: 'Compressing…',
    uploading: 'Uploading…',
    done: '✓ Done',
    error: '✗ Failed',
    cancelled: 'Cancelled',
};

function UploadProgressBar({ jobs = [], onCancel }) {
    const visible = jobs.filter(j => j.status !== 'idle');
    if (visible.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            zIndex: 9000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '300px',
            width: 'calc(100vw - 32px)',
        }}>
            {visible.map((job) => {
                const color = statusColors[job.status] || '#9ca3af';
                const label = statusLabels[job.status] || job.status;
                const inFlight = job.status === 'uploading' || job.status === 'compressing';

                return (
                    <div
                        key={job.id}
                        style={{
                            background: 'var(--color-surface)',
                            border: `1px solid ${color}33`,
                            borderRadius: '14px',
                            padding: '12px 14px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            animation: 'slideInRight 0.25s ease-out',
                        }}
                    >
                        {/* File name row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{
                                fontSize: '13px', fontWeight: '600',
                                color: 'var(--color-text-primary)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                maxWidth: '200px',
                            }}>
                                {job.file?.name || 'media'}
                            </span>
                            {inFlight && onCancel && (
                                <button
                                    onClick={() => onCancel(job.id)}
                                    title="Cancel"
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#9ca3af', cursor: 'pointer',
                                        fontSize: '18px', padding: '0 0 0 8px', lineHeight: 1
                                    }}
                                >×</button>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div style={{
                            height: '4px', borderRadius: '99px',
                            background: 'var(--color-border)',
                            overflow: 'hidden', marginBottom: '6px',
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${job.status === 'done' ? 100 : job.progress}%`,
                                background: color,
                                borderRadius: '99px',
                                transition: 'width 0.2s ease',
                            }} />
                        </div>

                        {/* Status + percentage */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color }}>
                                {label}
                            </span>
                            {inFlight && (
                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                    {job.progress}%
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}

            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

export default UploadProgressBar;
