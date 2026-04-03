import { NextRequest, NextResponse } from 'next/server';
import { processImage } from '@/lib/image';
import { getOrCreateWriter, getOrCreateCrew } from '@/lib/directus';

const DIRECTUS_URL = process.env.DIRECTUS_INTERNAL_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8056';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? '';

// bodyParser ist in Next.js App Router Route Handlers standardmäßig deaktiviert
export async function POST(req: NextRequest) {
  if (!DIRECTUS_TOKEN) {
    return NextResponse.json(
      { error: 'Upload nicht konfiguriert. DIRECTUS_TOKEN fehlt.' },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Kein Bild übermittelt.' }, { status: 400 });
    }

    const mimeType = file.type;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mimeType)) {
      return NextResponse.json(
        { error: 'Nicht unterstütztes Format. Erlaubt: JPEG, PNG, WebP, HEIC.' },
        { status: 415 }
      );
    }

    const MAX_SIZE_MB = 30;
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    if (rawBuffer.byteLength > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Datei zu groß. Maximum: ${MAX_SIZE_MB} MB.` },
        { status: 413 }
      );
    }

    // --- EXIF-Strip + WebP-Konvertierung ---
    const { buffer: processedBuffer } = await processImage(rawBuffer);

    // --- Upload zu Directus Files API ---
    const uploadForm = new FormData();
    const blob = new Blob([new Uint8Array(processedBuffer)], { type: 'image/webp' });
    const originalName = (file as File).name?.replace(/\.[^.]+$/, '') ?? 'upload';
    uploadForm.append('file', blob, `${originalName}.webp`);

    const uploadRes = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      },
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Directus upload error:', errText);
      return NextResponse.json({ error: 'Fehler beim Speichern der Datei.' }, { status: 502 });
    }

    const { data: directusFile } = await uploadRes.json();

    // --- Photo-Record in Directus anlegen ---
    const writer = formData.get('writer') as string | null;
    const crew = formData.get('crew') as string | null;
    const location_city = formData.get('location_city') as string | null;
    const location_country = formData.get('location_country') as string | null;
    const year = formData.get('year') as string | null;
    const is_legal_wall = formData.get('is_legal_wall') === 'true';
    const style_tag_ids = formData.getAll('style_tags') as string[];

    const photoPayload: Record<string, unknown> = {
      file: directusFile.id,
      moderation_status: 'pending',
      flagged: false,
      is_legal_wall,
    };

    if (writer) photoPayload.writer = writer;
    if (crew) photoPayload.crew = crew;
    if (location_city) photoPayload.location_city = location_city;
    if (location_country) photoPayload.location_country = location_country;
    if (year) photoPayload.year = parseInt(year, 10);
    if (style_tag_ids.length > 0) {
      photoPayload.style_tags = style_tag_ids.map((id) => ({ style_tags_id: id }));
    }

    const photoRes = await fetch(`${DIRECTUS_URL}/items/photos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(photoPayload),
    });

    if (!photoRes.ok) {
      const errText = await photoRes.text();
      console.error('Directus photo create error:', errText);
      return NextResponse.json({ error: 'Fehler beim Anlegen des Foto-Eintrags.' }, { status: 502 });
    }

    const { data: photo } = await photoRes.json();

    return NextResponse.json({
      success: true,
      photo_id: photo.id,
      file_id: directusFile.id,
      message: 'Foto eingereicht. Wird nach Moderation veröffentlicht.',
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Interner Fehler beim Upload.' }, { status: 500 });
  }
}
