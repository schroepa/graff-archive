import { getApprovedPhotos } from '@/lib/directus';
import PhotoGrid from '@/components/PhotoGrid';

export const revalidate = 60;

export default async function FeedPage() {
  let photos: Awaited<ReturnType<typeof getApprovedPhotos>> = [];
  let error: string | null = null;

  try {
    photos = await getApprovedPhotos({ limit: 48 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    error = message.includes('ECONNREFUSED')
      ? 'Directus nicht erreichbar. Starte: docker compose up'
      : 'Fehler beim Laden des Archivs.';
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid var(--bg-border)' }}
        className="px-4 py-8 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                fontSize: '11px',
              }}
              className="uppercase tracking-widest mb-2"
            >
              Archiv
            </h1>
            <p
              style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
              className="uppercase tracking-widest"
            >
              {photos.length > 0
                ? `${photos.length} Einträge geladen`
                : error
                ? 'Offline'
                : 'Keine Einträge'}
            </p>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              fontSize: '10px',
              maxWidth: '420px',
              textAlign: 'right',
              lineHeight: '1.6',
            }}
            className="uppercase tracking-wide hidden sm:block"
          >
            Kein Algorithmus. Kein Like-System. Chronologisch.
          </p>
        </div>
      </div>

      {/* Fehler */}
      {error && (
        <div
          style={{
            background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.3)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--danger)',
            fontSize: '12px',
          }}
          className="max-w-7xl mx-auto m-4 px-4 py-3 uppercase tracking-widest"
        >
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <PhotoGrid
          photos={photos}
          emptyMessage="Archiv leer – erster Upload ausstehend."
        />
      </div>
    </div>
  );
}
