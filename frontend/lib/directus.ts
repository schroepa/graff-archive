import { createDirectus, rest, staticToken, readItems, readItem, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk';
import type { Photo, Writer, Crew, StyleTag, SfUser } from '@/types/directus';

// Im Docker-Netzwerk: DIRECTUS_INTERNAL_URL (directus:8055), sonst Public-URL
const DIRECTUS_URL =
  process.env.DIRECTUS_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_DIRECTUS_URL ??
  'http://localhost:8056';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? '';

// Öffentlicher Client (kein Token) – für approved-Fotos im Frontend
export const directusPublic = createDirectus(DIRECTUS_URL).with(rest());

// Server-seitiger Client mit Token – für geschützte Operationen
export const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : directusPublic;

// Öffentliche URL für Browser – niemals DIRECTUS_INTERNAL_URL verwenden
const DIRECTUS_PUBLIC_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8056';

export function getFileUrl(fileId: string, params?: Record<string, string | number>): string {
  const base = `${DIRECTUS_PUBLIC_URL}/assets/${fileId}`;
  if (!params) return base;
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return `${base}?${qs}`;
}

// --- Foto-Queries ---

export async function getApprovedPhotos(options?: {
  limit?: number;
  offset?: number;
  city?: string;
  year?: number;
  writerTag?: string;
}): Promise<Photo[]> {
  const { limit = 48, offset = 0, city, year, writerTag } = options ?? {};

  const filter: Record<string, unknown> = {
    moderation_status: { _eq: 'approved' },
  };

  if (city) filter['location_city'] = { _icontains: city };
  if (year) filter['year'] = { _eq: year };
  if (writerTag) filter['writer'] = { tag: { _eq: writerTag } };

  const photos = await directus.request(
    readItems('photos', {
      filter,
      limit,
      offset,
      sort: ['-uploaded_at'],
      fields: [
        'id',
        'file',
        'location_city',
        'location_country',
        'year',
        'is_legal_wall',
        'uploaded_at',
        'burner_count',
        'writer.id',
        'writer.tag',
        'crew.id',
        'crew.name',
        'writers.writers_id.id',
        'writers.writers_id.tag',
        'crews.crews_id.id',
        'crews.crews_id.name',
        'style_tags.style_tags_id.id',
        'style_tags.style_tags_id.name',
      ],
    })
  );

  return photos as unknown as Photo[];
}

export async function getPhoto(id: string): Promise<Photo> {
  const photo = await directus.request(
    readItem('photos', id, {
      fields: [
        'id',
        'file',
        'moderation_status',
        'location_city',
        'location_country',
        'year',
        'is_legal_wall',
        'uploaded_at',
        'burner_count',
        'writer.id',
        'writer.tag',
        'writer.active_since',
        'crew.id',
        'crew.name',
        'style_tags.style_tags_id.id',
        'style_tags.style_tags_id.name',
      ],
    })
  );

  return photo as unknown as Photo;
}

// --- Writer-Queries ---

export async function getWriter(tag: string): Promise<Writer | null> {
  const writers = await directus.request(
    readItems('writers', {
      filter: { tag: { _eq: tag } },
      limit: 1,
      fields: ['id', 'tag', 'active_since', 'bio', 'crew.id', 'crew.name'],
    })
  );

  return (writers[0] as unknown as Writer) ?? null;
}

// --- Crew-Queries ---

export async function getCrew(name: string): Promise<Crew | null> {
  const crews = await directus.request(
    readItems('crews', {
      filter: { name: { _eq: name } },
      limit: 1,
      fields: ['id', 'name', 'founded', 'origin_city'],
    })
  );

  return (crews[0] as unknown as Crew) ?? null;
}

export async function getAllStyleTags(): Promise<StyleTag[]> {
  const tags = await directus.request(
    readItems('style_tags', {
      sort: ['name'],
      fields: ['id', 'name'],
    })
  );

  return tags as unknown as StyleTag[];
}

// --- Stats ---

export async function getArchiveStats(): Promise<{
  photos: number;
  cities: number;
  writers: number;
}> {
  const [photoCount, writerCount] = await Promise.all([
    directus.request(
      aggregate('photos', {
        aggregate: { count: ['id'] },
        query: { filter: { moderation_status: { _eq: 'approved' } } },
      })
    ),
    directus.request(
      aggregate('writers', { aggregate: { count: ['id'] } })
    ),
  ]);

  // Für Städte: alle approved Photos mit location_city laden und deduplizieren
  const photosWithCity = await directus.request(
    readItems('photos', {
      filter: {
        moderation_status: { _eq: 'approved' },
        location_city: { _nnull: true },
      },
      fields: ['location_city'],
      limit: 1000,
    })
  );
  const cities = new Set(
    (photosWithCity as Array<{ location_city: string }>)
      .map(p => p.location_city)
      .filter(Boolean)
  );

  return {
    photos: Number((photoCount[0] as { count: { id: string } }).count.id) || 0,
    cities: cities.size,
    writers: Number((writerCount[0] as { count: { id: string } }).count.id) || 0,
  };
}

// --- Writer/Crew upsert (für Upload-Pipeline) ---

export async function getOrCreateWriter(tag: string): Promise<string> {
  const existing = await getWriter(tag);
  if (existing) return existing.id;
  const created = await directus.request(createItem('writers', { tag }));
  return (created as { id: string }).id;
}

export async function getOrCreateCrew(name: string): Promise<string> {
  const crews = await directus.request(
    readItems('crews', {
      filter: { name: { _eq: name } },
      limit: 1,
      fields: ['id'],
    })
  );
  if (crews[0]) return (crews[0] as { id: string }).id;
  const created = await directus.request(createItem('crews', { name }));
  return (created as { id: string }).id;
}

// --- User-Queries ---

export async function getUserByTag(tag: string): Promise<SfUser | null> {
  const users = await directus.request(
    readItems('sf_users', {
      filter: { tag: { _eq: tag } },
      limit: 1,
      fields: ['id', 'tag', 'password_hash', 'verified', 'challenge_code', 'handstyle_file', 'bio', 'origin', 'active_since', 'created_week_hash'],
    })
  );
  return (users[0] as unknown as SfUser) ?? null;
}

export async function getUserById(id: string): Promise<SfUser | null> {
  try {
    const user = await directus.request(
      readItem('sf_users', id, {
        fields: ['id', 'tag', 'verified', 'challenge_code', 'bio', 'origin', 'active_since', 'created_week_hash'],
      })
    );
    return user as unknown as SfUser;
  } catch {
    return null;
  }
}

export async function createUser(data: {
  tag: string;
  password_hash: string;
  challenge_code: string;
  created_week_hash: string;
}): Promise<SfUser> {
  const user = await directus.request(
    createItem('sf_users', { ...data, verified: false })
  );
  return user as unknown as SfUser;
}

export async function updateUser(id: string, data: Partial<SfUser>): Promise<void> {
  await directus.request(updateItem('sf_users', id, data));
}

export async function storeSession(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
  await directus.request(
    createItem('sf_sessions', {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    })
  );
}

export async function deleteSession(tokenHash: string): Promise<void> {
  const sessions = await directus.request(
    readItems('sf_sessions', {
      filter: { token_hash: { _eq: tokenHash } },
      limit: 1,
      fields: ['id'],
    })
  );
  if (sessions[0]) {
    await directus.request(deleteItem('sf_sessions', (sessions[0] as { id: string }).id));
  }
}
