import React from 'react';

const Skeleton = ({ width, height, borderRadius = '4px', style = {} }) => {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: 'var(--color-surface-hover, #eee)',
                backgroundImage: 'linear-gradient(90deg, var(--color-surface-hover, #eee) 0px, var(--color-background, #f5f5f5) 40px, var(--color-surface-hover, #eee) 80px)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite linear',
                ...style
            }}
        >
            <style>
                {`
                    @keyframes skeleton-loading {
                        0% { background-position: -200px 0; }
                        100% { background-position: calc(200px + 100%) 0; }
                    }
                `}
            </style>
        </div>
    );
};

export default Skeleton;
