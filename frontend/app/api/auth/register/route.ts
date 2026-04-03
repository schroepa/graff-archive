import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByTag, createUser } from '@/lib/directus';
import { generateChallengeCode, generateWeekHash } from '@/lib/auth';

const TAG_REGEX = /^[a-zA-Z0-9_\-]{2,24}$/;

export async function POST(req: Request) {
  try {
    const { tag } = await req.json();

    if (!tag || typeof tag !== 'string' || !TAG_REGEX.test(tag)) {
      return NextResponse.json(
        { error: 'Ungültiger Tag. 2–24 Zeichen, nur Buchstaben, Zahlen, _ und -.' },
        { status: 400 }
      );
    }

    const existing = await getUserByTag(tag);
    if (existing) {
      return NextResponse.json({ error: 'Tag bereits vergeben.' }, { status: 409 });
    }

    // Recovery-Phrase generieren (16 Hex-Zeichen)
    const { randomBytes } = await import('crypto');
    const recoveryPhrase = randomBytes(8).toString('hex').toUpperCase();
    const passwordHash = await bcrypt.hash(recoveryPhrase, 12);

    const challengeCode = generateChallengeCode();
    const weekHash = generateWeekHash(
      process.env.WEEK_HASH_SECRET ?? 'dev-week-secret'
    );

    const user = await createUser({
      tag,
      password_hash: passwordHash,
      challenge_code: challengeCode,
      created_week_hash: weekHash,
    });

    // Recovery-Phrase wird NUR einmal zurückgegeben, nie wieder
    return NextResponse.json({
      userId: user.id,
      tag: user.tag,
      challengeCode,
      recoveryPhrase,
    });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
