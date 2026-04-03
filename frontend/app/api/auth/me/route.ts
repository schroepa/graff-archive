import { NextResponse } from 'next/server';
import { getUserById, getSessionByTokenHash } from '@/lib/directus';
import { getTokenFromHeader, verifyToken, hashToken } from '@/lib/auth';

async function authenticate(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  // Session in DB prüfen + Ablaufdatum validieren
  const tokenHash = hashToken(token);
  const session = await getSessionByTokenHash(tokenHash);
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  return payload;
}

export async function GET(req: Request) {
  const payload = await authenticate(req);
  if (!payload) {
    return NextResponse.json({ error: 'Nicht authentifiziert oder Session abgelaufen.' }, { status: 401 });
  }

  const user = await getUserById(payload.sub);
  if (!user) {
    return NextResponse.json({ error: 'User nicht gefunden.' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    tag: user.tag,
    verified: user.verified,
    bio: user.bio,
    origin: user.origin,
    active_since: user.active_since,
  });
}

export async function PATCH(req: Request) {
  const payload = await authenticate(req);
  if (!payload) {
    return NextResponse.json({ error: 'Nicht authentifiziert oder Session abgelaufen.' }, { status: 401 });
  }

  const body = await req.json();

  const allowed = ['bio', 'origin', 'active_since'] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Keine gültigen Felder.' }, { status: 400 });
  }

  const { updateUser } = await import('@/lib/directus');
  await updateUser(payload.sub, update);

  return NextResponse.json({ ok: true });
}
