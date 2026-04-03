import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPhoto, getFileUrl } from '@/lib/directus';
import { isWriter, isCrew, isStyleTag } from '@/types/directus';
import BurnerButton from '@/components/BurnerButton';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const photo = await getPhoto(id);
    const firstWriter = photo._allWriters?.[0]?.tag ?? (isWriter(photo.writer) ? photo.writer.tag : null);
    return {
      title: [firstWriter, photo.location_city, photo.year].filter(Boolean).join(' · ') + ' – Streetfiles',
    };
  } catch {
    return { title: 'Foto – Streetfiles' };
  }
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params;
  let photo;

  try {
    photo = await getPhoto(id);
  } catch {
    notFound();
  }

  if (photo.moderation_status !== 'approved') notFound();

  const fileId = typeof photo.file === 'string' ? photo.file : photo.file?.id;

  const allWriters = photo._allWriters ?? [];
  const allCrews = photo._allCrews ?? [];

  const styleTags = (photo.style_tags ?? [])
    .map((st) => {
      if (typeof st === 'string') return null;
      const tag = st.style_tags_id;
      return isStyleTag(tag) ? tag.name : null;
    })
    .filter(Boolean) as string[];

  const imageUrl = fileId ? getFileUrl(fileId) : null;

  const writersValue = allWriters.length > 0 ? (
    <span className="flex flex-wrap gap-x-2">
      {allWriters.map((w) => (
        <Link key={w.id} href={`/writer/${w.tag}`} style={{ color: 'var(--accent)' }} className="hover:opacity-80">
          {w.tag}
        </Link>
      ))}
    </span>
  ) : null;

  const crewsValue = allCrews.length > 0 ? (
    <span className="flex flex-wrap gap-x-2">
      {allCrews.map((c) => (
        <Link key={c.id} href={`/crew/${encodeURIComponent(c.name)}`} style={{ color: 'var(--text-secondary)' }} className="hover:text-[var(--text-primary)] transition-colors">
          {c.name}
        </Link>
      ))}
    </span>
  ) : null;

  const metaRows = [
    { label: 'Writer', value: writersValue },
    { label: 'Crew', value: crewsValue },
    { label: 'Stadt', value: photo.location_city },
    { label: 'Land', value: photo.location_country },
    { label: 'Jahr', value: photo.year },
    { label: 'Kontext', value: photo.is_legal_wall ? 'Legal Wall' : 'Illegal' },
    { label: 'Style', value: styleTags.length > 0 ? styleTags.join(', ') : null },
  ].filter((r) => r.value !== null && r.value !== undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Bild */}
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }} className="relative">
          {imageUrl ? (
            <div className="relative w-full" style={{ minHeight: '400px' }}>
              <Image
                src={imageUrl}
                alt={allWriters[0] ? allWriters[0].tag : 'Graffiti'}
                width={1200}
                height={800}
                className="w-full h-auto"
                unoptimized
                priority
              />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '11px' }}
                    className="uppercase tracking-widest">
                Kein Bild
              </span>
            </div>
          )}
        </div>

        {/* Metadaten */}
        <div className="space-y-6">
          {/* Back */}
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}
            className="uppercase tracking-widest hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Archiv
          </Link>

          {/* Tabelle */}
          <div style={{ border: '1px solid var(--bg-border)' }}>
            {metaRows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  borderBottom: i < metaRows.length - 1 ? '1px solid var(--bg-border)' : 'none',
                  padding: '10px 14px',
                }}
              >
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}
                  className="uppercase tracking-widest self-center"
                >
                  {row.label}
                </span>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Burner */}
          <div style={{ borderTop: '1px solid var(--bg-border)', paddingTop: '14px' }}>
            <BurnerButton photoId={photo.id} initialCount={photo.burner_count ?? 0} size="md" />
          </div>

          {/* Counter-Forensics Hinweis */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-dim)',
              lineHeight: 1.8,
              borderTop: '1px solid var(--bg-border)',
              paddingTop: '12px',
            }}
            className="uppercase tracking-widest"
          >
            EXIF-Daten (GPS, Kamera, Zeitstempel) wurden vor der Speicherung entfernt.
          </p>
        </div>
      </div>
    </div>
  );
}
