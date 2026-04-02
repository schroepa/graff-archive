import Link from 'next/link';

export default function NavigationBar() {
  return (
    <nav
      style={{
        borderBottom: '1px solid var(--bg-border)',
        backgroundColor: 'var(--bg)',
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link
          href="/"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
          className="text-sm font-bold tracking-widest uppercase hover:opacity-80 transition-opacity"
        >
          STREETFILES
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}
            className="uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
          >
            Archiv
          </Link>
          <Link
            href="/upload"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--bg)',
              background: 'var(--accent)',
              padding: '4px 12px',
              letterSpacing: '0.1em',
            }}
            className="uppercase font-bold hover:opacity-90 transition-opacity"
          >
            Upload
          </Link>
        </div>
      </div>
    </nav>
  );
}
