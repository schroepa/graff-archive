'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StoredUser {
  tag: string;
  verified: boolean;
}

export default function NavAuth() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem('sf_user');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  if (!mounted) return null;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/account"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}
          className="uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
        >
          {user.verified && (
            <span style={{ color: 'var(--accent)', fontSize: '8px' }}>●</span>
          )}
          {user.tag}
        </Link>
        {user.verified && (
          <Link
            href="/upload"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#181818',
              background: 'var(--accent)',
              padding: '4px 12px',
              letterSpacing: '0.1em',
            }}
            className="uppercase font-bold hover:opacity-90 transition-opacity"
          >
            Upload
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}
        className="uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
      >
        Login
      </Link>
      <Link
        href="/register"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: '#181818',
          background: 'var(--accent)',
          padding: '4px 12px',
          letterSpacing: '0.1em',
        }}
        className="uppercase font-bold hover:opacity-90 transition-opacity"
      >
        Zugang
      </Link>
    </div>
  );
}
