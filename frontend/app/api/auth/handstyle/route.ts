import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/directus';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: Request) {
  try {
    // Auth: Token aus Header (Writer muss registriert, aber nicht verified sein)
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Ungültiger Token.' }, { status: 401 });
    }

    const user = await getUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: 'User nicht gefunden.' }, { status: 404 });
    }
    if (user.verified) {
      return NextResponse.json({ error: 'Bereits verifiziert.' }, { status: 409 });
    }
    if (!user.challenge_code) {
      return NextResponse.json({ error: 'Kein Challenge-Code.' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Kein gültiges Bild.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Datei zu groß (max 20MB).' }, { status: 413 });
    }

    // Upload zu Directus (EXIF wird nicht extra gestripped – das ist ein Handstyle-Beweis,
    // der sowieso nach Verifikation kryptografisch überschrieben wird)
    const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8056';
    const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? '';

    const uploadForm = new FormData();
    uploadForm.append('file', file, `handstyle_${user.id}.jpg`);
    uploadForm.append('folder', ''); // Root-Folder, versteckt via Directus-Berechtigungen

    const uploadRes = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'Upload fehlgeschlagen.' }, { status: 502 });
    }

    const uploadData = await uploadRes.json();
    const fileId: string = uploadData?.data?.id;

    if (!fileId || !UUID_REGEX.test(fileId)) {
      return NextResponse.json({ error: 'Upload-Antwort ungültig.' }, { status: 502 });
    }

    // Referenz in sf_users speichern – Admin sieht das Foto in Directus
    await updateUser(payload.sub, { handstyle_file: fileId });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[handstyle]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
