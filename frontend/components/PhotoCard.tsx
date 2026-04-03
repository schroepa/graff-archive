import Link from 'next/link';
import Image from 'next/image';
import type { Photo, Writer, Crew } from '@/types/directus';
import { isWriter, isCrew, isStyleTag } from '@/types/directus';
import { getFileUrl } from '@/lib/directus';
import BurnerButton from './BurnerButton';

interface PhotoCardProps {
  photo: Photo;
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  const fileId = typeof photo.file === 'string' ? photo.file : photo.file?.id;

  // Primär-Writer/-Crew + alle M2M-verknüpften
  const primaryWriter = isWriter(photo.writer) ? photo.writer : null;
  const allWriters: Writer[] = [
    ...(primaryWriter ? [primaryWriter] : []),
    ...(photo.writers ?? [])
      .map(j => (typeof j.writers_id === 'object' && j.writers_id !== null ? j.writers_id as Writer : null))
      .filter((w): w is Writer => w !== null && w.id !== primaryWriter?.id),
  ];

  const primaryCrew = isCrew(photo.crew) ? photo.crew : null;
  const allCrews: Crew[] = [
    ...(primaryCrew ? [primaryCrew] : []),
    ...(photo.crews ?? [])
      .map(j => (typeof j.crews_id === 'object' && j.crews_id !== null ? j.crews_id as Crew : null))
      .filter((c): c is Crew => c !== null && c.id !== primaryCrew?.id),
  ];

  const styleTags = (photo.style_tags ?? [])
    .map((st) => {
      if (typeof st === 'string') return null;
      const tag = st.style_tags_id;
      return isStyleTag(tag) ? tag.name : null;
    })
    .filter(Boolean) as string[];

  const imageUrl = fileId
    ? getFileUrl(fileId, { width: 600, quality: 80, format: 'webp' })
    : null;

  const meta = [
    photo.location_city,
    photo.location_country,
    photo.year ? String(photo.year) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}
      className="group relative overflow-hidden"
    >
      {/* Bild */}
      <Link href={`/photo/${photo.id}`} className="block relative aspect-[4/3] overflow-hidden bg-[var(--bg-border)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={writer ? `${writer.tag} – ${meta}` : meta || 'Graffiti'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              NO IMAGE
            </span>
          </div>
        )}

        {/* Legal/Illegal Badge */}
        {!photo.is_legal_wall && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--danger)',
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
            }}
            className="absolute top-2 right-2 uppercase tracking-widest"
          >
            ILLEGAL
          </span>
        )}
      </Link>

      {/* Metadaten */}
      <div className="p-3 space-y-2">
        {/* Writer / Crew */}
        <div className="flex items-baseline gap-2">
          {writer && (
            <Link
              href={`/writer/${writer.tag}`}
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '13px' }}
              className="font-bold hover:opacity-80 transition-opacity"
            >
              {writer.tag}
            </Link>
          )}
          {crew && (
            <Link
              href={`/crew/${encodeURIComponent(crew.name)}`}
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '11px' }}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {crew.name}
            </Link>
          )}
        </div>

        {/* Ort & Jahr */}
        {meta && (
          <p
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '10px' }}
            className="uppercase tracking-widest"
          >
            {meta}
          </p>
        )}

        {/* Style Tags + Burner */}
        <div className="flex items-center justify-between gap-2">
          {styleTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {styleTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--text-dim)',
                    border: '1px solid var(--bg-border)',
                    padding: '1px 5px',
                  }}
                  className="uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="ml-auto">
            <BurnerButton photoId={photo.id} initialCount={photo.burner_count ?? 0} size="sm" />
          </div>
        </div>
      </div>
    </article>
  );
}
