'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SfUser {
  id: string;
  tag: string;
  verified: boolean;
  bio: string | null;
  origin: string | null;
  active_since: number | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SfUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [origin, setOrigin] = useState('');
  const [activeSince, setActiveSince] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('sf_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          localStorage.removeItem('sf_token');
          localStorage.removeItem('sf_user');
          router.replace('/login');
          return;
        }
        setUser(data);
        setBio(data.bio ?? '');
        setOrigin(data.origin ?? '');
        setActiveSince(data.active_since ? String(data.active_since) : '');
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');

    const token = localStorage.getItem('sf_token');
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bio: bio || null,
        origin: origin || null,
        active_since: activeSince ? parseInt(activeSince) : null,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setUser(prev => prev ? { ...prev, bio: bio || null, origin: origin || null, active_since: activeSince ? parseInt(activeSince) : null } : null);
      setSaveMsg('Gespeichert.');
      setEditing(false);
    } else {
      setSaveMsg('Fehler beim Speichern.');
    }
  }

  async function logout() {
    const token = localStorage.getItem('sf_token');
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    router.push('/');
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 font-mono text-[var(--text-dim)]">
        Lade...
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="mb-10 flex justify-between items-center">
        <Link href="/" className="text-[var(--text-dim)] hover:text-[var(--text)] font-mono text-sm">
          ← Archiv
        </Link>
        <button
          onClick={logout}
          className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--danger)] transition-colors uppercase tracking-widest"
        >
          Logout
        </button>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="font-mono text-2xl font-bold tracking-tight uppercase">
            {user.tag}
          </h1>
          {user.verified ? (
            <span className="font-mono text-xs text-[var(--accent)] border border-[var(--accent)] px-2 py-0.5 uppercase tracking-widest">
              Verifiziert
            </span>
          ) : (
            <span className="font-mono text-xs text-[var(--text-dim)] border border-[var(--border)] px-2 py-0.5 uppercase tracking-widest">
              Ausstehend
            </span>
          )}
        </div>
        {!user.verified && (
          <p className="font-mono text-xs text-[var(--text-dim)] leading-relaxed">
            Dein Handstyle-Upload wird geprüft. Nach Verifikation kannst du Fotos hochladen
            und kommentieren. Das kann einige Tage dauern.
          </p>
        )}
      </div>

      {/* Profil-Info / Edit-Form */}
      <div className="border border-[var(--border)] p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <p className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest">
            Profil
          </p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--text)] uppercase tracking-widest"
            >
              Bearbeiten
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-1">
                Aktiv seit (Jahr)
              </label>
              <input
                type="number"
                value={activeSince}
                onChange={e => setActiveSince(e.target.value)}
                placeholder="z.B. 1998"
                min={1970}
                max={new Date().getFullYear()}
                className="w-full bg-transparent border border-[var(--border)] font-mono text-sm px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-1">
                Origin (Stadt)
              </label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="z.B. Hamburg"
                maxLength={100}
                className="w-full bg-transparent border border-[var(--border)] font-mono text-sm px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Optional"
                maxLength={500}
                rows={4}
                className="w-full bg-transparent border border-[var(--border)] font-mono text-sm px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="font-mono text-xs uppercase tracking-widest py-2 px-4 bg-[var(--accent)] text-black font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {saving ? 'Speichere...' : 'Speichern'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setSaveMsg(''); }}
                className="font-mono text-xs uppercase tracking-widest py-2 px-4 border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
              >
                Abbrechen
              </button>
            </div>
            {saveMsg && (
              <p className="font-mono text-xs text-[var(--text-dim)]">{saveMsg}</p>
            )}
          </form>
        ) : (
          <dl className="font-mono text-sm space-y-4">
            <div className="flex gap-6">
              <dt className="text-[var(--text-dim)] w-28 shrink-0">Tag</dt>
              <dd className="text-[var(--text)] uppercase">{user.tag}</dd>
            </div>
            <div className="flex gap-6">
              <dt className="text-[var(--text-dim)] w-28 shrink-0">Aktiv seit</dt>
              <dd className="text-[var(--text)]">{user.active_since ?? '—'}</dd>
            </div>
            <div className="flex gap-6">
              <dt className="text-[var(--text-dim)] w-28 shrink-0">Origin</dt>
              <dd className="text-[var(--text)]">{user.origin ?? '—'}</dd>
            </div>
            {user.bio && (
              <div className="flex gap-6">
                <dt className="text-[var(--text-dim)] w-28 shrink-0">Bio</dt>
                <dd className="text-[var(--text)] leading-relaxed">{user.bio}</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* Upload-Link – nur für verifizierte Writer */}
      {user.verified && (
        <div className="border border-[var(--border)] p-6 mb-8">
          <p className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest mb-4">
            Archiv
          </p>
          <div className="space-y-3">
            <Link
              href="/upload"
              className="block font-mono text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors"
            >
              → Foto hochladen
            </Link>
            <Link
              href={`/writer/${encodeURIComponent(user.tag)}`}
              className="block font-mono text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors"
            >
              → Künstlerseite ansehen
            </Link>
          </div>
        </div>
      )}

      {/* Sicherheits-Hinweis */}
      <div className="font-mono text-xs text-[var(--text-dim)] border-t border-[var(--border)] pt-6 space-y-1">
        <p>Kein Klarname. Keine E-Mail. Kein Passwort-Reset.</p>
        <p>Recovery-Phrase verloren = Account verloren.</p>
      </div>
    </main>
  );
}
