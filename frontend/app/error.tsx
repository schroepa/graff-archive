'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 font-mono">
      <p
        className="uppercase tracking-widest mb-2"
        style={{ color: 'var(--accent)', fontSize: '10px' }}
      >
        Serverfehler
      </p>
      <h1
        className="font-bold uppercase mb-6"
        style={{ fontSize: '24px', color: 'var(--text-primary)' }}
      >
        Seite nicht ladbar
      </h1>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Möglicherweise ist der Backend-Service (Directus) nicht erreichbar
        oder ein Konfigurationsfehler liegt vor.
      </p>
      {error?.digest && (
        <p className="text-xs mb-8" style={{ color: 'var(--text-dim)' }}>
          Fehler-ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="uppercase tracking-widest text-xs px-6 py-3 font-bold transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)', color: '#181818' }}
      >
        Erneut versuchen
      </button>
    </div>
  );
}
