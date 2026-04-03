import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = process.env.DIRECTUS_INTERNAL_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8056';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? '';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$|^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });
  }

  if (!DIRECTUS_TOKEN) {
    return NextResponse.json({ error: 'Nicht konfiguriert.' }, { status: 503 });
  }

  // Aktuellen Wert lesen
  const readRes = await fetch(
    `${DIRECTUS_URL}/items/photos/${id}?fields=burner_count,moderation_status`,
    { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } }
  );

  if (!readRes.ok) {
    return NextResponse.json({ error: 'Foto nicht gefunden.' }, { status: 404 });
  }

  const { data } = await readRes.json();

  if (data.moderation_status !== 'approved') {
    return NextResponse.json({ error: 'Foto nicht verfügbar.' }, { status: 403 });
  }

  const newCount = (data.burner_count ?? 0) + 1;

  // Inkrementieren
  const updateRes = await fetch(`${DIRECTUS_URL}/items/photos/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ burner_count: newCount }),
  });

  if (!updateRes.ok) {
    return NextResponse.json({ error: 'Update fehlgeschlagen.' }, { status: 502 });
  }

  return NextResponse.json({ burner_count: newCount });
}
