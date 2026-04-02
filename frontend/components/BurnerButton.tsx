'use client';

import { useRef, useState, useEffect } from 'react';
import { FlameIcon, type FlameIconHandle } from './FlameIcon';

const STORAGE_KEY = 'sf_burners';

function getLikedPhotos(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveLike(photoId: string) {
  const liked = getLikedPhotos();
  liked.add(photoId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...liked]));
}

interface BurnerButtonProps {
  photoId: string;
  initialCount: number;
  size?: 'sm' | 'md';
}

export default function BurnerButton({ photoId, initialCount, size = 'md' }: BurnerButtonProps) {
  const flameRef = useRef<FlameIconHandle>(null);
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLiked(getLikedPhotos().has(photoId));
  }, [photoId]);

  async function handleClick() {
    if (liked || pending) return;

    setPending(true);
    flameRef.current?.startAnimation();

    try {
      const res = await fetch(`/api/burner/${photoId}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const { burner_count } = await res.json();
      setCount(burner_count);
      setLiked(true);
      saveLike(photoId);
    } catch {
      flameRef.current?.stopAnimation();
    } finally {
      setPending(false);
    }
  }

  const iconSize = size === 'sm' ? 16 : 20;
  const isActive = liked;

  return (
    <button
      onClick={handleClick}
      disabled={liked || pending}
      title={liked ? 'Bereits geburnt' : 'Burner vergeben'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'transparent',
        border: 'none',
        cursor: liked ? 'default' : 'pointer',
        padding: '4px 6px',
        color: isActive ? '#ff6b1a' : 'var(--text-dim)',
        transition: 'color 0.2s',
        opacity: pending ? 0.6 : 1,
      }}
      aria-label={`${count} Burner${count !== 1 ? 's' : ''}`}
    >
      <FlameIcon
        ref={flameRef}
        size={iconSize}
        style={{
          color: isActive ? '#ff6b1a' : 'var(--text-dim)',
          fill: isActive ? 'rgba(255,107,26,0.2)' : 'none',
          transition: 'color 0.2s, fill 0.2s',
        }}
      />
      {count > 0 && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: size === 'sm' ? '9px' : '11px',
            letterSpacing: '0.05em',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
