'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Step = 'tag' | 'challenge' | 'phrase';

interface RegisterResult {
  userId: string;
  tag: string;
  challengeCode: string;
  recoveryPhrase: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('tag');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [token, setToken] = useState('');
  const [handstyleFile, setHandstyleFile] = useState<File | null>(null);
  const [phraseCopied, setPhraseCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submitTag(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: tag.trim() }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Fehler beim Registrieren.');
      return;
    }

    setResult(data);
    // Direkt einloggen und Token speichern
    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: data.tag, recoveryPhrase: data.recoveryPhrase }),
    });
    const loginData = await loginRes.json();
    if (loginData.token) {
      localStorage.setItem('sf_token', loginData.token);
      localStorage.setItem('sf_user', JSON.stringify(loginData.user));
      setToken(loginData.token);
    }

    setStep('challenge');
  }

  async function submitHandstyle(e: React.FormEvent) {
    e.preventDefault();
    if (!handstyleFile) {
      setError('Bitte wähle ein Foto aus.');
      return;
    }
    setError('');
    setLoading(true);

    const form = new FormData();
    form.append('file', handstyleFile);

    const res = await fetch('/api/auth/handstyle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Upload fehlgeschlagen.');
      return;
    }

    setStep('phrase');
  }

  function copyPhrase() {
    if (result?.recoveryPhrase) {
      navigator.clipboard.writeText(result.recoveryPhrase);
      setPhraseCopied(true);
    }
  }

  function finish() {
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
        Zugang beantragen
      </h1>
      <p className="text-[var(--text-dim)] text-sm font-mono mb-10">
        Kein Name. Keine E-Mail. Kein OAuth.<br />
        Identität = Tag + Recovery-Phrase.
      </p>

      {/* Step-Indicator */}
      <div className="flex gap-2 mb-10 font-mono text-xs">
        {(['tag', 'challenge', 'phrase'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-2 ${s === step ? 'text-[var(--accent)]' : step === 'phrase' && i < 2 ? 'text-[var(--text-dim)]' : i < (['tag','challenge','phrase'] as Step[]).indexOf(step) ? 'text-[var(--text-dim)]' : 'text-[var(--text-dim)] opacity-40'}`}
          >
            <span className={`w-5 h-5 flex items-center justify-center border ${s === step ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)]'}`}>
              {i + 1}
            </span>
            <span className="hidden sm:inline uppercase tracking-widest">
              {s === 'tag' ? 'Tag' : s === 'challenge' ? 'Handstyle' : 'Phrase'}
            </span>
            {i < 2 && <span className="text-[var(--border)] mx-1">—</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="border border-[var(--danger)] text-[var(--danger)] font-mono text-sm p-3 mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Tag wählen */}
      {step === 'tag' && (
        <form onSubmit={submitTag} className="space-y-6">
          <div>
            <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-2">
              Dein Tag
            </label>
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              placeholder="z.B. SEAK, DAIM, OZER"
              maxLength={24}
              pattern="[a-zA-Z0-9_\-]{2,24}"
              required
              className="w-full bg-transparent border border-[var(--border)] font-mono text-lg px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] uppercase"
              autoFocus
            />
            <p className="font-mono text-xs text-[var(--text-dim)] mt-2">
              2–24 Zeichen. Nur Buchstaben, Zahlen, _ und -. Nicht mehr änderbar.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || tag.trim().length < 2}
            className="w-full font-mono text-sm uppercase tracking-widest py-3 bg-[var(--accent)] text-black font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Prüfe...' : 'Tag beanspruchen →'}
          </button>
        </form>
      )}

      {/* Step 2: Handstyle-Upload */}
      {step === 'challenge' && result && (
        <form onSubmit={submitHandstyle} className="space-y-8">
          <div className="border border-[var(--border)] p-6 font-mono">
            <p className="text-xs text-[var(--text-dim)] uppercase tracking-widest mb-3">
              Dein Challenge-Code
            </p>
            <p className="text-3xl font-bold text-[var(--accent)] tracking-widest">
              {result.challengeCode}
            </p>
            <p className="text-xs text-[var(--text-dim)] mt-4 leading-relaxed">
              Schreibe deinen Tag <strong className="text-[var(--text)]">{result.tag}</strong> und
              den Code <strong className="text-[var(--text)]">{result.challengeCode}</strong> auf
              Papier oder eine Wand. Fotografiere beides zusammen und lade das Foto hoch.
            </p>
            <p className="text-xs text-[var(--text-dim)] mt-3 border-t border-[var(--border)] pt-3">
              Das Foto wird nach Verifikation durch den Admin kryptografisch überschrieben.
              Es bleibt kein Beweisfoto im System.
            </p>
          </div>

          <div>
            <label className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-widest block mb-2">
              Handstyle-Foto
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={e => setHandstyleFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border border-dashed border-[var(--border)] hover:border-[var(--accent)] font-mono text-sm py-8 text-center text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
            >
              {handstyleFile ? (
                <span className="text-[var(--text)]">{handstyleFile.name}</span>
              ) : (
                '+ Foto auswählen'
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !handstyleFile}
            className="w-full font-mono text-sm uppercase tracking-widest py-3 bg-[var(--accent)] text-black font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Lade hoch...' : 'Einreichen →'}
          </button>
        </form>
      )}

      {/* Step 3: Recovery-Phrase sichern */}
      {step === 'phrase' && result && (
        <div className="space-y-8">
          <div className="border border-[var(--accent)] p-6 font-mono">
            <p className="text-xs text-[var(--accent)] uppercase tracking-widest mb-4">
              ⚠ Einmalige Anzeige – jetzt sichern
            </p>
            <p className="text-xs text-[var(--text-dim)] mb-4 leading-relaxed">
              Das ist deine Recovery-Phrase. Sie wird <strong className="text-[var(--text)]">nie wieder angezeigt</strong> und
              ist der einzige Weg, dich einzuloggen. Kein Reset-Flow. Kein Support.
              Verlorene Phrase = verlorener Account.
            </p>
            <div
              className="bg-[#1a1a1a] border border-[var(--border)] p-4 text-xl font-bold tracking-[0.3em] text-[var(--accent)] text-center cursor-pointer select-all"
              onClick={copyPhrase}
            >
              {result.recoveryPhrase}
            </div>
            <button
              onClick={copyPhrase}
              className="w-full mt-3 font-mono text-xs text-[var(--text-dim)] hover:text-[var(--text)] py-2 border border-[var(--border)] transition-colors"
            >
              {phraseCopied ? '✓ Kopiert' : 'In Zwischenablage kopieren'}
            </button>
          </div>

          <div className="border border-[var(--border)] p-4 font-mono text-xs text-[var(--text-dim)] leading-relaxed">
            <p className="text-[var(--text)] mb-2">Was jetzt?</p>
            <p>
              Dein Antrag wurde eingereicht. Ein Admin prüft deinen Handstyle und setzt deinen
              Account auf verifiziert. Das kann einige Tage dauern. Du kannst dich bereits jetzt
              einloggen, aber erst nach Verifikation Fotos uploaden und kommentieren.
            </p>
          </div>

          <button
            onClick={finish}
            className="w-full font-mono text-sm uppercase tracking-widest py-3 bg-[var(--accent)] text-black font-bold hover:opacity-90 transition-opacity"
          >
            Zum Account →
          </button>
        </div>
      )}
    </main>
  );
}
