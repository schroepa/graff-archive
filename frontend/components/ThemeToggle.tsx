'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('sf_theme') as 'dark' | 'light' | null;
    setTheme(stored ?? 'dark');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sf_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        letterSpacing: '0.1em',
        transition: 'color 0.15s',
      }}
      className="uppercase hover:text-[var(--accent)] transition-colors hidden sm:block"
    >
      {theme === 'dark' ? '○' : '●'}
    </button>
  );
}
