import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production-32chars'
);

const TOKEN_TTL_DAYS = 30;

export interface JWTPayload {
  sub: string;   // user id
  tag: string;
  iat: number;
  exp: number;
}

export async function signToken(userId: string, tag: string): Promise<string> {
  return new SignJWT({ tag })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_DAYS}d`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateChallengeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SF-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateWeekHash(secret: string): string {
  const now = new Date();
  const week = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const raw = `${week}-${now.getFullYear()}-${secret}`;
  return createHash('sha256').update(raw).digest('hex');
}

export function getTokenFromHeader(req: Request): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}
