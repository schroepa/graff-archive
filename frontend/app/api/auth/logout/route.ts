import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/directus';
import { getTokenFromHeader, hashToken } from '@/lib/auth';

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (token) {
    const tokenHash = hashToken(token);
    await deleteSession(tokenHash).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
