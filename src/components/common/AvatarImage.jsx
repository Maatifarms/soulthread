import React, { useState, useEffect } from 'react';

/**
 * Renders `src` as an image, falling back to `fallback` if the URL is empty
 * OR the image fails to load. The `photoURL ? <img> : <fallback>` pattern
 * used at every guide-avatar call site before this only checked truthiness —
 * a present-but-dead URL (e.g. a Storage object that's since been deleted,
 * confirmed live for the rupesh_ojha guide doc) rendered the browser's
 * broken-image icon instead of ever reaching the fallback.
 */
export default function AvatarImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false);

  // Reset on a new src — otherwise a component instance that stays mounted
  // across a src change (e.g. SessionsManager's list re-rendering with fresh
  // data) would keep showing the fallback for a guide whose photo is fine.
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) return fallback;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
