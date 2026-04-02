import type { Photo } from '@/types/directus';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  emptyMessage?: string;
}

export default function PhotoGrid({ photos, emptyMessage = 'Keine Fotos gefunden.' }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            fontSize: '12px',
          }}
          className="uppercase tracking-widest"
        >
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[var(--bg-border)]">
      {photos.map((photo) => (
        <div key={photo.id} className="bg-[var(--bg)]">
          <PhotoCard photo={photo} />
        </div>
      ))}
    </div>
  );
}
