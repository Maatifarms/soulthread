import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const ASPECT_RATIOS = [
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: 'Free', value: null }
];

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspectRatio, setAspectRatio] = useState(4 / 3);
    const [showGrid, setShowGrid] = useState(true);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((file) => {
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('Canvas is empty'));
                }
            }, 'image/jpeg', 0.95);
        });
    };

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Crop Image</h3>
                <button
                    onClick={handleRotate}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔄 Rotate
                </button>
            </div>

            {/* Cropper Area */}
            <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={onZoomChange}
                    onRotationChange={setRotation}
                    showGrid={showGrid}
                    style={{
                        containerStyle: {
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }
                    }}
                />
            </div>

            {/* Controls */}
            <div style={{
                padding: '16px',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {/* Aspect Ratio Selector */}
                <div>
                    <label style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
                        Aspect Ratio
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ASPECT_RATIOS.map((ratio) => (
                            <button
                                key={ratio.label}
                                onClick={() => setAspectRatio(ratio.value)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: aspectRatio === ratio.value ? '2px solid var(--color-primary, #6200ea)' : '1px solid #ddd',
                                    background: aspectRatio === ratio.value ? 'rgba(98, 0, 234, 0.1)' : 'white',
                                    color: aspectRatio === ratio.value ? 'var(--color-primary, #6200ea)' : '#333',
                                    cursor: 'pointer',
                                    fontWeight: aspectRatio === ratio.value ? '600' : '400',
                                    fontSize: '14px',
                                    minWidth: '60px'
                                }}
                            >
                                {ratio.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zoom Control */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#666' }}>Zoom</label>
                        <span style={{ fontSize: '12px', color: '#999' }}>{zoom.toFixed(2)}x</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            −
                        </button>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.01}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Grid Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="checkbox"
                        id="grid-toggle"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="grid-toggle" style={{ fontSize: '14px', color: '#666', cursor: 'pointer' }}>
                        Show grid overlay
                    </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '500',
                            minHeight: '44px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'var(--color-primary, #6200ea)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            minHeight: '44px'
                        }}
                    >
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
