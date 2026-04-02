import { notFound } from 'next/navigation';
import { getCrew, getApprovedPhotos } from '@/lib/directus';
import PhotoGrid from '@/components/PhotoGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return { title: `${decodeURIComponent(name)} – Streetfiles` };
}

export default async function CrewPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const crew = await getCrew(decodedName).catch(() => null);
  if (!crew) notFound();

  // Crew-Fotos: Filter über crew-ID
  const photos = await getApprovedPhotos({ limit: 100 }).catch(() => []);
  const crewPhotos = photos.filter((p) => {
    if (typeof p.crew === 'string') return p.crew === crew.id;
    return p.crew?.id === crew.id;
  });

  return (
    <div>
      {/* Crew Header */}
      <div
        style={{ borderBottom: '1px solid var(--bg-border)' }}
        className="px-4 py-10 max-w-7xl mx-auto"
      >
        <h1
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', lineHeight: 1 }}
          className="font-bold uppercase tracking-tight"
        >
          {crew.name}
        </h1>
        <div className="mt-4 flex flex-wrap gap-6">
          {crew.founded && (
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}
              className="uppercase tracking-widest"
            >
              Gegründet {crew.founded}
            </span>
          )}
          {crew.origin_city && (
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}
              className="uppercase tracking-widest"
            >
              {crew.origin_city}
            </span>
          )}
          <span
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}
            className="uppercase tracking-widest"
          >
            {crewPhotos.length} {crewPhotos.length === 1 ? 'Foto' : 'Fotos'}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <PhotoGrid photos={crewPhotos} emptyMessage="Keine freigegebenen Fotos." />
      </div>
    </div>
  );
}
