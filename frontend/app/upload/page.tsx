import { getAllStyleTags } from '@/lib/directus';
import UploadForm from '@/components/UploadForm';

export const metadata = {
  title: 'Upload – Streetfiles',
};

export default async function UploadPage() {
  let styleTags: Awaited<ReturnType<typeof getAllStyleTags>> = [];

  try {
    styleTags = await getAllStyleTags();
  } catch {
    // Kein harter Fehler – Form funktioniert auch ohne Tags
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div style={{ borderBottom: '1px solid var(--bg-border)' }} className="mb-10 pb-6">
        <h1
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}
          className="uppercase tracking-widest mb-3"
        >
          Upload
        </h1>
        <p
          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', lineHeight: 1.8 }}
          className="uppercase tracking-widest"
        >
          Fotos werden nach Einreichung manuell freigegeben.
          EXIF-Daten werden automatisch entfernt.
        </p>
      </div>

      <UploadForm styleTags={styleTags} />
    </div>
  );
}
