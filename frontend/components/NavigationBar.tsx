import Link from 'next/link';
import NavAuth from './NavAuth';

export default function NavigationBar() {
  return (
    <nav
      style={{
        borderBottom: '1px solid var(--bg-border)',
        backgroundColor: 'var(--bg)',
      }}
      className="sticky top-0 z-50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Wordmark – exakt die Farbe aus streetfiles.org 2011: #198f97 */}
        <Link
          href="/"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.12em' }}
          className="text-sm font-bold uppercase transition-opacity hover:opacity-75"
        >
          STREETFILES
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/archiv"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}
            className="uppercase tracking-widest transition-colors hover:text-[var(--accent)]"
          >
            Archiv
          </Link>
          <Link
            href="/karte"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}
            className="uppercase tracking-widest transition-colors hover:text-[var(--accent)] hidden sm:block"
          >
            Karte
          </Link>
          <NavAuth />
        </div>
      </div>
    </nav>
  );
}
