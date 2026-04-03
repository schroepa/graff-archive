import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/directus';
import { getTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
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
  const token = getTokenFromHeader(req);
  if (!token) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Ungültiger Token.' }, { status: 401 });
  }

  const body = await req.json();

  // Nur diese Felder darf der User selbst editieren
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
