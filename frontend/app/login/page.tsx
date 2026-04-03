'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [tag, setTag] = useState('');
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: tag.trim(), recoveryPhrase: phrase.trim() }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Login fehlgeschlagen.');
      return;
    }

    localStorage.setItem('sf_token', data.token);
    localStorage.setItem('sf_user', JSON.stringify(data.user));
    router.push('/account');
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="mb-10">
        <Link href="/" className="text-[var(--text-dim)] hover:text-[var(--text)] font-mono text-sm">
          ← Archiv
        </Link>
      </div>

      <h1 className="font-mono text-2xl font-bold mb-2 tracking-tight uppercase">
        Einloggen
      </h1>
      <p className="text-[var(--text-dim)] text-sm font-mono mb-10">
        Tag + Recovery-Phrase. Kein Passwort-Reset.
      </p>

      {error && (
        <div className="border border-[var(--danger)] text-[var(--danger)] font-mono text-sm p-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-2">
            Tag
          </label>
          <input
            type="text"
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="Dein Tag"
            required
            autoFocus
            className="w-full bg-transparent border border-[var(--border)] font-mono text-base px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] uppercase"
          />
        </div>

        <div>
          <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-2">
            Recovery-Phrase
          </label>
          <input
            type="text"
            value={phrase}
            onChange={e => setPhrase(e.target.value)}
            placeholder="16 Zeichen"
            required
            maxLength={16}
            className="w-full bg-transparent border border-[var(--border)] font-mono text-base px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] tracking-widest"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !tag.trim() || !phrase.trim()}
          className="w-full font-mono text-sm uppercase tracking-widest py-3 bg-[var(--accent)] text-black font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {loading ? 'Prüfe...' : 'Einloggen →'}
        </button>
      </form>

      <div className="mt-10 font-mono text-xs text-[var(--text-dim)] border-t border-[var(--border)] pt-6 space-y-2">
        <p>Noch keinen Account?{' '}
          <Link href="/register" className="text-[var(--accent)] hover:underline">
            Zugang beantragen →
          </Link>
        </p>
        <p>Recovery-Phrase verloren = Account verloren. Kein Reset-Flow.</p>
      </div>
    </main>
  );
}
