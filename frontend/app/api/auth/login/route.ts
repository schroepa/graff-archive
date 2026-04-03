import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByTag, storeSession } from '@/lib/directus';
import { signToken, hashToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { tag, recoveryPhrase } = await req.json();

    if (!tag || !recoveryPhrase || typeof tag !== 'string' || typeof recoveryPhrase !== 'string') {
      return NextResponse.json({ error: 'Tag und Recovery-Phrase erforderlich.' }, { status: 400 });
    }

    const user = await getUserByTag(tag);
    if (!user) {
      // Timing-sicherer Fake-Compare um User-Enumeration zu verhindern
      await bcrypt.compare('dummy', '$2b$12$invalidhashpadding000000000000000000000000000000000000');
      return NextResponse.json({ error: 'Ungültiger Tag oder Recovery-Phrase.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(recoveryPhrase.toUpperCase(), user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Ungültiger Tag oder Recovery-Phrase.' }, { status: 401 });
    }

    const token = await signToken(user.id, user.tag);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await storeSession(user.id, tokenHash, expiresAt);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        tag: user.tag,
        verified: user.verified,
        bio: user.bio,
        origin: user.origin,
        active_since: user.active_since,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
