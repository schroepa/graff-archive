import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getApprovedPhotos, getArchiveStats, getFileUrl } from '@/lib/directus';
import type { Photo } from '@/types/directus';
import { isWriter, isDirectusFile } from '@/types/directus';

export const revalidate = 3600;

// Deterministischer Shuffle – wechselt jede Stunde (ISR-freundlich)
function pickFeatured(photos: Photo[], n: number): Photo[] {
  const hour = Math.floor(Date.now() / 3_600_000);
  const seed = hour % Math.max(photos.length, 1);
  const shuffled = [...photos];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (i * 2654435761 + seed) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

async function FeaturedMosaic() {
  const photos = await getApprovedPhotos({ limit: 48 });
  const featured = pickFeatured(photos, 5);
  if (featured.length === 0) return null;

  return (
    <div
      className="grid gap-px"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(2, 240px)',
        background: 'var(--bg-border)',
      }}
    >
      {featured.map((photo, i) => {
        const fileId = typeof photo.file === 'string' ? photo.file : (photo.file as { id: string })?.id;
        const writer = isWriter(photo.writer) ? photo.writer : null;
        const imageUrl = fileId ? getFileUrl(fileId, { width: 900, quality: 85, format: 'webp' }) : null;

        const gridStyles: React.CSSProperties[] = [
          { gridColumn: '1 / 4', gridRow: '1 / 3' }, // Großes Bild links
          { gridColumn: '4 / 6', gridRow: '1 / 2' },
          { gridColumn: '6 / 7', gridRow: '1 / 2' },
          { gridColumn: '4 / 5', gridRow: '2 / 3' },
          { gridColumn: '5 / 7', gridRow: '2 / 3' },
        ];

        return (
          <Link
            key={photo.id}
            href={`/photo/${photo.id}`}
            className="relative overflow-hidden group block"
            style={{ ...gridStyles[i], background: 'var(--bg-card)' }}
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={writer ? writer.tag : 'Graffiti'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                unoptimized
              />
            )}
            {/* Overlay mit Metadaten */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
            >
              {writer && (
                <span
                  className="font-mono font-bold uppercase tracking-widest"
                  style={{ color: 'var(--accent)', fontSize: i === 0 ? '18px' : '12px' }}
                >
                  {writer.tag}
                </span>
              )}
              {photo.location_city && (
                <span
                  className="font-mono uppercase tracking-widest"
                  style={{ color: 'var(--text-secondary)', fontSize: '10px' }}
                >
                  {photo.location_city}
                  {photo.year ? ` · ${photo.year}` : ''}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

async function ArchiveStats() {
  const stats = await getArchiveStats();
  return (
    <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--bg-border)' }}>
      {[
        { value: stats.photos, label: 'Fotos' },
        { value: stats.cities, label: 'Städte' },
        { value: stats.writers, label: 'Writer' },
      ].map(({ value, label }) => (
        <div
          key={label}
          className="text-center py-10"
          style={{ background: 'var(--bg)' }}
        >
          <div
            className="font-mono font-bold"
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', color: 'var(--accent)', lineHeight: 1 }}
          >
            {value}
          </div>
          <div
            className="font-mono uppercase tracking-widest mt-2"
            style={{ color: 'var(--text-secondary)', fontSize: '10px' }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

const PRINCIPLES = [
  {
    glyph: '01',
    title: 'Kein Algorithmus',
    body: 'Chronologisch. Keine Empfehlungen. Keine Bubble. Das Archiv entscheidet nicht, was du siehst – du entscheidest es.',
  },
  {
    glyph: '02',
    title: 'Keine Monetarisierung',
    body: 'Kein Tracking. Keine Werbung. Keine Investoren. Der einzige Wert, der hier zählt, ist die Arbeit an der Wand.',
  },
  {
    glyph: '03',
    title: 'Counter-Forensics',
    body: 'EXIF-Daten werden beim Upload automatisch entfernt. Kein GPS. Kein Zeitstempel. Keine IP-Logs. Privatsphäre by Design.',
  },
  {
    glyph: '04',
    title: 'Pseudonyme Identität',
    body: 'Kein Klarname, keine E-Mail, kein OAuth. Du bist dein Tag. Verifiziert durch Handstyle, nicht durch Biometrie.',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ borderBottom: '1px solid var(--bg-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl">
            {/* Wordmark */}
            <div className="mb-6">
              <span
                className="font-mono font-bold uppercase tracking-[0.15em]"
                style={{ color: 'var(--accent)', fontSize: '11px' }}
              >
                STREETFILES · Archiv seit 2008
              </span>
            </div>
            <h1
              className="font-mono font-black uppercase leading-none mb-8"
              style={{
                fontSize: 'clamp(40px, 8vw, 96px)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Graffiti.
              <br />
              <span style={{ color: 'var(--accent)' }}>Archiviert.</span>
              <br />
              Autonom.
            </h1>
            <p
              className="font-mono leading-relaxed mb-10"
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'clamp(13px, 1.8vw, 16px)',
                maxWidth: '540px',
              }}
            >
              Ein unabhängiges digitales Archiv der Writing-Kultur.
              Kein Social Network. Kein Like-Algorithmus.
              Keine Datenverwertung. Volle Datensouveränität.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/archiv"
                className="font-mono font-bold uppercase tracking-widest px-8 py-4 transition-opacity hover:opacity-85"
                style={{
                  background: 'var(--accent)',
                  color: '#181818',
                  fontSize: '12px',
                }}
              >
                Archiv öffnen →
              </Link>
              <Link
                href="/register"
                className="font-mono uppercase tracking-widest px-8 py-4 transition-colors"
                style={{
                  border: '1px solid var(--bg-border)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                }}
              >
                Zugang beantragen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mosaic */}
      <section>
        <div
          className="px-4 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--bg-border)' }}
        >
          <span
            className="font-mono uppercase tracking-widest"
            style={{ color: 'var(--text-dim)', fontSize: '10px' }}
          >
            Aus dem Archiv
          </span>
          <Link
            href="/archiv"
            className="font-mono uppercase tracking-widest transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-secondary)', fontSize: '10px' }}
          >
            Alles ansehen →
          </Link>
        </div>
        <Suspense
          fallback={
            <div
              style={{ height: '480px', background: 'var(--bg-card)' }}
              className="animate-pulse"
            />
          }
        >
          <FeaturedMosaic />
        </Suspense>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid var(--bg-border)' }}>
        <Suspense
          fallback={
            <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--bg-border)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="py-10" style={{ background: 'var(--bg)' }} />
              ))}
            </div>
          }
        >
          <ArchiveStats />
        </Suspense>
      </section>

      {/* Manifesto */}
      <section
        style={{ borderTop: '1px solid var(--bg-border)' }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <span
              className="font-mono uppercase tracking-widest"
              style={{ color: 'var(--accent)', fontSize: '10px' }}
            >
              Unser Ansatz
            </span>
            <h2
              className="font-mono font-bold uppercase mt-3"
              style={{
                fontSize: 'clamp(22px, 4vw, 40px)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Archiv, nicht Plattform.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ background: 'var(--bg-border)' }}>
            {PRINCIPLES.map(({ glyph, title, body }) => (
              <div
                key={glyph}
                className="p-8"
                style={{ background: 'var(--bg)' }}
              >
                <div
                  className="font-mono font-bold mb-6"
                  style={{ color: 'var(--accent)', fontSize: '28px', lineHeight: 1 }}
                >
                  {glyph}
                </div>
                <h3
                  className="font-mono font-bold uppercase tracking-wide mb-4"
                  style={{ color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  {title}
                </h3>
                <p
                  className="font-mono leading-relaxed"
                  style={{ color: 'var(--text-secondary)', fontSize: '12px' }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wer wir suchen */}
      <section
        style={{
          borderTop: '1px solid var(--bg-border)',
          background: 'var(--bg-raised)',
        }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <span
              className="font-mono uppercase tracking-widest"
              style={{ color: 'var(--accent)', fontSize: '10px' }}
            >
              Für Writer
            </span>
            <h2
              className="font-mono font-bold uppercase mt-3 mb-6"
              style={{
                fontSize: 'clamp(20px, 3.5vw, 36px)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Das Archiv gehört
              <br />den Künstlern.
            </h2>
            <p
              className="font-mono leading-relaxed mb-8"
              style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
            >
              Streetfiles ist kein Publikum. Kein Ruhm-Generator.
              Es ist ein kollektives Gedächtnis der Writing-Kultur –
              gebaut von Writers, für Writers.
              Du entscheidest, was hochgeladen wird.
              Du behältst die Kontrolle über dein Material.
              Wir protokollieren keine IP-Adressen und speichern keine EXIF-Daten.
            </p>
            <div
              className="font-mono leading-loose mb-10"
              style={{ color: 'var(--text-secondary)', fontSize: '12px', borderLeft: '2px solid var(--accent)', paddingLeft: '20px' }}
            >
              <p>→ Pseudonymes Profil per Proof-of-Handstyle</p>
              <p>→ Upload nur für verifizierte Writer</p>
              <p>→ EXIF wird beim Upload automatisch entfernt</p>
              <p>→ Kein Like-Algorithmus, kein Engagement-Tracking</p>
              <p>→ Open Source, einsehbar auf GitHub</p>
            </div>
            <Link
              href="/register"
              className="font-mono font-bold uppercase tracking-widest px-8 py-4 inline-block transition-opacity hover:opacity-85"
              style={{
                background: 'var(--accent)',
                color: '#181818',
                fontSize: '12px',
              }}
            >
              Jetzt Zugang beantragen →
            </Link>
          </div>
        </div>
      </section>

      {/* Streetfiles-Geschichte */}
      <section
        style={{ borderTop: '1px solid var(--bg-border)' }}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 max-w-2xl">
          <span
            className="font-mono uppercase tracking-widest"
            style={{ color: 'var(--text-dim)', fontSize: '10px' }}
          >
            Geschichte
          </span>
          <p
            className="font-mono leading-relaxed mt-4"
            style={{ color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '560px' }}
          >
            Streetfiles.org wurde 2008 gegründet und war bis zur Schließung 2013
            eines der bedeutendsten Graffiti-Archive des deutschsprachigen Raums.
            Dieses Projekt führt die Idee weiter – mit denselben Werten,
            aber modernerer Infrastruktur und konsequenterem Datenschutz.
          </p>
        </div>
      </section>
    </div>
  );
}
