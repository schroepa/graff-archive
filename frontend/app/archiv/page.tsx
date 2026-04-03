import Link from 'next/link';
import { getApprovedPhotos } from '@/lib/directus';
import PhotoGrid from '@/components/PhotoGrid';

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ city?: string; country?: string; year?: string }>;
}

export default async function ArchivPage({ searchParams }: Props) {
  const params = await searchParams;
  const city = params.city;
  const country = params.country;
  const year = params.year ? parseInt(params.year) : undefined;

  let photos: Awaited<ReturnType<typeof getApprovedPhotos>> = [];
  let error: string | null = null;

  try {
    photos = await getApprovedPhotos({ limit: 96, city, year });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    error = message.includes('ECONNREFUSED')
      ? 'Directus nicht erreichbar. Starte: docker compose up'
      : 'Fehler beim Laden des Archivs.';
  }

  const isFiltered = city || country || year;
  const filterLabel = [city, country, year].filter(Boolean).join(' · ');

  return (
    <div>
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid var(--bg-border)' }}
        className="px-4 py-6 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <h1
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '11px' }}
              className="uppercase tracking-widest"
            >
              {isFiltered ? (
                <>
                  <Link href="/archiv" style={{ color: 'var(--text-dim)' }} className="hover:text-[var(--accent)] transition-colors">
                    Archiv
                  </Link>
                  <span style={{ color: 'var(--text-dim)' }}> / </span>
                  <span style={{ color: 'var(--accent)' }}>{filterLabel}</span>
                </>
              ) : (
                'Archiv'
              )}
            </h1>
            <span style={{ color: 'var(--text-dim)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              {error ? 'Offline' : `${photos.length} Einträge`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/karte"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '10px' }}
              className="uppercase tracking-widest hover:text-[var(--accent)] transition-colors"
            >
              → Karte
            </Link>
            <span
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '10px' }}
              className="uppercase tracking-widest hidden sm:block"
            >
              Kein Algorithmus. Chronologisch.
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(193,0,0,0.08)',
            border: '1px solid rgba(193,0,0,0.3)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--danger)',
            fontSize: '12px',
          }}
          className="max-w-7xl mx-auto m-4 px-4 py-3 uppercase tracking-widest"
        >
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <PhotoGrid photos={photos} emptyMessage="Keine Fotos für diesen Filter." />
      </div>
    </div>
  );
}
