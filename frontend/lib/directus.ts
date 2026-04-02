import { createDirectus, rest, staticToken, readItems, readItem } from '@directus/sdk';
import type { Photo, Writer, Crew, StyleTag } from '@/types/directus';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? '';

// Öffentlicher Client (kein Token) – für approved-Fotos im Frontend
export const directusPublic = createDirectus(DIRECTUS_URL).with(rest());

// Server-seitiger Client mit Token – für geschützte Operationen
export const directus = DIRECTUS_TOKEN
  ? createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_TOKEN)).with(rest())
  : directusPublic;

export function getFileUrl(fileId: string, params?: Record<string, string | number>): string {
  const base = `${DIRECTUS_URL}/assets/${fileId}`;
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
