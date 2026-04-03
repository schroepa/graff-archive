import { NextRequest, NextResponse } from 'next/server';
import { getComments, createComment } from '@/lib/directus';
import { getTokenFromHeader, verifyToken, hashToken } from '@/lib/auth';
import { getSessionByTokenHash, getUserById } from '@/lib/directus';

// GET /api/comments?photo_id=xxx
export async function GET(req: NextRequest) {
  const photoId = req.nextUrl.searchParams.get('photo_id');
  if (!photoId) {
    return NextResponse.json({ error: 'photo_id fehlt.' }, { status: 400 });
  }

  const comments = await getComments(photoId);
  return NextResponse.json({ comments });
}

// POST /api/comments  – nur für verifizierte User
export async function POST(req: NextRequest) {
  // Auth prüfen
  const token = getTokenFromHeader(req);
  if (!token) {
    return NextResponse.json({ error: 'Login erforderlich.' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Ungültiger Token.' }, { status: 401 });
  }

  const tokenHash = hashToken(token);
  const session = await getSessionByTokenHash(tokenHash);
  if (!session || new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Session abgelaufen. Bitte erneut einloggen.' }, { status: 401 });
  }

  // User und Verifizierung prüfen
  const user = await getUserById(payload.sub);
  if (!user) {
    return NextResponse.json({ error: 'User nicht gefunden.' }, { status: 404 });
  }
  if (!user.verified) {
    return NextResponse.json({ error: 'Nur verifizierte Accounts können kommentieren.' }, { status: 403 });
  }

  // Body validieren
  const body = await req.json();
  const { photo_id, text } = body;

  if (!photo_id && photo_id !== 0) {
    return NextResponse.json({ error: 'photo_id fehlt.' }, { status: 400 });
  }
  const photoIdStr = String(photo_id);
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Kommentar darf nicht leer sein.' }, { status: 400 });
  }
  if (text.trim().length > 500) {
    return NextResponse.json({ error: 'Kommentar zu lang (max. 500 Zeichen).' }, { status: 400 });
  }

  try {
    const comment = await createComment({
      photo_id,
      author_tag: user.tag,
      body: text.trim(),
    });
    return NextResponse.json({ comment });
  } catch (err) {
    console.error('[comments POST]', err);
    return NextResponse.json({ error: 'Kommentar konnte nicht gespeichert werden.' }, { status: 500 });
  }
}
