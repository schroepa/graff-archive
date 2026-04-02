import { notFound } from 'next/navigation';
import { getWriter, getApprovedPhotos } from '@/lib/directus';
import PhotoGrid from '@/components/PhotoGrid';
import type { Metadata } from 'next';

export const revalidate = 300;

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `${decodeURIComponent(tag)} – Streetfiles` };
}

export default async function WriterPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const [writer, photos] = await Promise.all([
    getWriter(decodedTag).catch(() => null),
    getApprovedPhotos({ writerTag: decodedTag, limit: 100 }).catch(() => []),
  ]);

  if (!writer) notFound();

  return (
    <div>
      {/* Writer Header */}
      <div
        style={{ borderBottom: '1px solid var(--bg-border)' }}
        className="px-4 py-10 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {/* Tag */}
          <div>
            <h1
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1 }}
              className="font-bold uppercase tracking-tight"
            >
              {writer.tag}
            </h1>
            <div className="mt-3 flex flex-wrap gap-4">
              {writer.active_since && (
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}
                  className="uppercase tracking-widest"
                >
                  Aktiv seit {writer.active_since}
                </span>
              )}
              {typeof writer.crew === 'object' && writer.crew && (
                <a
                  href={`/crew/${encodeURIComponent(writer.crew.name)}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}
                  className="uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
                >
                  {writer.crew.name}
                </a>
              )}
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}
                className="uppercase tracking-widest"
              >
                {photos.length} {photos.length === 1 ? 'Foto' : 'Fotos'}
              </span>
            </div>
          </div>

          {/* Bio */}
          {writer.bio && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                maxWidth: '480px',
                borderLeft: '2px solid var(--bg-border)',
                paddingLeft: '16px',
              }}
            >
              {writer.bio}
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <PhotoGrid photos={photos} emptyMessage="Keine freigegebenen Fotos." />
      </div>
    </div>
  );
}
