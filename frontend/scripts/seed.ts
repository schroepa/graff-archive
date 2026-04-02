/**
 * Streetfiles – Seed Script
 * Legt Beispieldaten in Directus an:
 *   - Style Tags
 *   - Crews
 *   - Writers
 *   - Fotos (mit synthetisch generierten WebP-Bildern)
 *
 * Voraussetzung: Directus läuft auf :8055, DIRECTUS_TOKEN gesetzt in .env.local
 * Aufruf: npx tsx scripts/seed.ts
 */

import sharp from 'sharp';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

// ─── Config ───────────────────────────────────────────────────────────────────

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN ?? '';

if (!TOKEN) {
  console.error('❌ DIRECTUS_TOKEN fehlt. Trage ihn in frontend/.env.local ein.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function post(path: string, body: unknown) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`POST ${path} failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function getItems(collection: string) {
  const res = await fetch(`${DIRECTUS_URL}/items/${collection}?limit=-1`, { headers });
  const json = await res.json();
  return json.data ?? [];
}

async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/webp' });
  form.append('file', blob, filename);

  const res = await fetch(`${DIRECTUS_URL}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Upload failed: ${JSON.stringify(json)}`);
  return json.data.id as string;
}

/**
 * Generiert ein synthetisches Graffiti-ähnliches WebP-Bild.
 * Kein EXIF – Sharp schreibt standardmäßig keine Metadaten.
 */
async function generateGraffitiImage(opts: {
  bgColor: string;
  colors: string[];
  width?: number;
  height?: number;
}): Promise<Buffer> {
  const { bgColor, colors, width = 800, height = 600 } = opts;

  // SVG mit abstrakten Formen, die Graffiti-Layering simulieren
  const shapes = colors.map((color, i) => {
    const x = 60 + i * 110;
    const y = 80 + (i % 3) * 90;
    const rx = 120 + (i * 37) % 80;
    const ry = 60 + (i * 29) % 50;
    const rotate = (i * 23) % 45 - 22;
    return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.85" transform="rotate(${rotate} ${x} ${y})"/>`;
  }).join('\n');

  // Outline-Buchstaben simulieren
  const letters = colors.map((color, i) => {
    const x = 80 + i * 130;
    const fontSize = 120 + (i * 17) % 60;
    return `<text x="${x}" y="${height - 60}" font-size="${fontSize}" fill="none" stroke="${color}" stroke-width="3" opacity="0.6" font-family="serif" font-weight="bold">${String.fromCharCode(65 + (i * 7) % 26)}</text>`;
  }).join('\n');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="multiply" result="blend"/>
  </filter>
  <rect width="${width}" height="${height}" fill="${bgColor}" filter="url(#grain)" opacity="0.3"/>
  ${shapes}
  ${letters}
  <line x1="0" y1="${height * 0.6}" x2="${width}" y2="${height * 0.58}" stroke="${colors[0]}" stroke-width="2" opacity="0.4"/>
</svg>`.trim();

  return sharp(Buffer.from(svg))
    .webp({ quality: 82 })
    .toBuffer();
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const STYLE_TAGS = [
  'throwup',
  'piece',
  'burner',
  'tag',
  'wildstyle',
  'blockbuster',
  'stencil',
];

const CREWS = [
  { name: 'MAD', founded: 1994, origin_city: 'Berlin' },
  { name: 'TKO', founded: 1998, origin_city: 'Hamburg' },
  { name: 'FX', founded: 2001, origin_city: 'Wien' },
  { name: 'CBS', founded: 1990, origin_city: 'New York' },
];

const WRITERS = [
  { tag: 'SEAK', active_since: 1991, bio: 'Einer der einflussreichsten deutschen Writer. Bekannt für komplexe 3D-Styles und Buchstabenarchitektur.' },
  { tag: 'DAIM', active_since: 1989, bio: 'Hamburg-basierter Writer, international anerkannt für fotorealistischen 3D-Graffiti.' },
  { tag: 'KANN', active_since: 1995, bio: null },
  { tag: 'OZER', active_since: 1997, bio: null },
  { tag: 'LOOMIT', active_since: 1986, bio: 'Münchener Pionier, zählt zur ersten Generation europäischer Writer.' },
  { tag: 'NEON', active_since: 2003, bio: null },
  { tag: 'STOHEAD', active_since: 1990, bio: 'Berlin. Bekannt für typografisch reduzierten, präzisen Stil.' },
];

// Foto-Szenarien: verschiedene Styles und Orte
const PHOTO_SCENARIOS = [
  { writerTag: 'SEAK', crewName: 'MAD', city: 'Berlin', country: 'DE', year: 2009, tags: ['burner', 'wildstyle'], legal: false, bg: '#1a1a2e', colors: ['#e94560', '#f5a623', '#00d4ff', '#ff6b6b'] },
  { writerTag: 'DAIM', crewName: 'TKO', city: 'Hamburg', country: 'DE', year: 2007, tags: ['piece'], legal: false, bg: '#0d0d0d', colors: ['#7b2fff', '#ff2fff', '#2fff7b'] },
  { writerTag: 'KANN', crewName: 'MAD', city: 'Berlin', country: 'DE', year: 2011, tags: ['throwup'], legal: false, bg: '#1c1c1c', colors: ['#ff6600', '#ffffff', '#ff6600'] },
  { writerTag: 'LOOMIT', crewName: 'FX', city: 'München', country: 'DE', year: 2005, tags: ['burner', 'piece'], legal: true, bg: '#0a2a1a', colors: ['#00ff88', '#ffcc00', '#ff4488', '#00ccff'] },
  { writerTag: 'OZER', crewName: 'TKO', city: 'Hamburg', country: 'DE', year: 2013, tags: ['wildstyle'], legal: false, bg: '#1a0a0a', colors: ['#ff2200', '#ff8800', '#ffee00'] },
  { writerTag: 'STOHEAD', crewName: 'MAD', city: 'Berlin', country: 'DE', year: 2008, tags: ['piece', 'blockbuster'], legal: false, bg: '#050510', colors: ['#4444ff', '#8888ff', '#ccccff', '#ffffff'] },
  { writerTag: 'NEON', crewName: 'FX', city: 'Wien', country: 'AT', year: 2015, tags: ['stencil'], legal: true, bg: '#111111', colors: ['#ff0066', '#ffffff', '#ff0066'] },
  { writerTag: 'SEAK', crewName: 'MAD', city: 'Paris', country: 'FR', year: 2010, tags: ['burner'], legal: false, bg: '#1a1500', colors: ['#ffd700', '#ff8c00', '#dc143c', '#4169e1'] },
  { writerTag: 'DAIM', crewName: 'TKO', city: 'Amsterdam', country: 'NL', year: 2006, tags: ['piece', 'wildstyle'], legal: false, bg: '#001a00', colors: ['#00ff00', '#88ff00', '#ccff00'] },
  { writerTag: 'KANN', crewName: 'MAD', city: 'Köln', country: 'DE', year: 2012, tags: ['throwup', 'tag'], legal: false, bg: '#1a001a', colors: ['#cc00cc', '#ff00ff', '#ffffff'] },
  { writerTag: 'LOOMIT', crewName: 'FX', city: 'Barcelona', country: 'ES', year: 2003, tags: ['burner', 'piece'], legal: true, bg: '#001a1a', colors: ['#00ffcc', '#00ccff', '#0088ff'] },
  { writerTag: 'STOHEAD', crewName: null, city: 'Berlin', country: 'DE', year: 2016, tags: ['piece'], legal: false, bg: '#0a0a0a', colors: ['#f0f0f0', '#888888', '#444444'] },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🎨 Streetfiles Seed\n${'─'.repeat(40)}`);
  console.log(`Directus: ${DIRECTUS_URL}\n`);

  // 1. Style Tags
  console.log('→ Style Tags...');
  const existingTags = await getItems('style_tags');
  const tagMap: Record<string, string> = {};

  for (const name of STYLE_TAGS) {
    const existing = existingTags.find((t: { name: string; id: string }) => t.name === name);
    if (existing) {
      tagMap[name] = existing.id;
      process.stdout.write(`  · ${name} (existiert)\n`);
    } else {
      const tag = await post('/items/style_tags', { name });
      tagMap[name] = tag.id;
      process.stdout.write(`  + ${name}\n`);
    }
  }

  // 2. Crews
  console.log('\n→ Crews...');
  const existingCrews = await getItems('crews');
  const crewMap: Record<string, string> = {};

  for (const crew of CREWS) {
    const existing = existingCrews.find((c: { name: string; id: string }) => c.name === crew.name);
    if (existing) {
      crewMap[crew.name] = existing.id;
      process.stdout.write(`  · ${crew.name} (existiert)\n`);
    } else {
      const created = await post('/items/crews', crew);
      crewMap[crew.name] = created.id;
      process.stdout.write(`  + ${crew.name}\n`);
    }
  }

  // 3. Writers
  console.log('\n→ Writers...');
  const existingWriters = await getItems('writers');
  const writerMap: Record<string, string> = {};

  for (const writer of WRITERS) {
    const existing = existingWriters.find((w: { tag: string; id: string }) => w.tag === writer.tag);
    if (existing) {
      writerMap[writer.tag] = existing.id;
      process.stdout.write(`  · ${writer.tag} (existiert)\n`);
    } else {
      // Crew dem Writer zuweisen (erste Crew, die zu diesem Writer passt)
      const scenario = PHOTO_SCENARIOS.find((s) => s.writerTag === writer.tag && s.crewName);
      const crewId = scenario?.crewName ? crewMap[scenario.crewName] : undefined;
      const created = await post('/items/writers', {
        ...writer,
        crew: crewId ?? null,
      });
      writerMap[writer.tag] = created.id;
      process.stdout.write(`  + ${writer.tag}\n`);
    }
  }

  // 4. Fotos
  console.log('\n→ Fotos generieren und hochladen...');

  for (let i = 0; i < PHOTO_SCENARIOS.length; i++) {
    const scenario = PHOTO_SCENARIOS[i];
    process.stdout.write(`  [${i + 1}/${PHOTO_SCENARIOS.length}] ${scenario.writerTag} / ${scenario.city} ${scenario.year}... `);

    try {
      // Synthetisches Bild generieren
      const imageBuffer = await generateGraffitiImage({
        bgColor: scenario.bg,
        colors: scenario.colors,
        width: 900,
        height: 675,
      });

      // Upload zu Directus
      const filename = `seed_${scenario.writerTag.toLowerCase()}_${scenario.city.toLowerCase()}_${scenario.year}.webp`;
      const fileId = await uploadImage(imageBuffer, filename);

      // Photo-Record
      const payload = {
        file: fileId,
        writer: writerMap[scenario.writerTag] ?? null,
        crew: scenario.crewName ? (crewMap[scenario.crewName] ?? null) : null,
        location_city: scenario.city,
        location_country: scenario.country,
        year: scenario.year,
        is_legal_wall: scenario.legal,
        moderation_status: 'approved', // Seed-Daten direkt freigeben
        flagged: false,
        style_tags: scenario.tags
          .filter((t) => tagMap[t])
          .map((t) => ({ style_tags_id: tagMap[t] })),
      };

      await post('/items/photos', payload);
      console.log('✓');
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('\n✅ Seed abgeschlossen.\n');
  console.log(`   Writers:    ${Object.keys(writerMap).length}`);
  console.log(`   Crews:      ${Object.keys(crewMap).length}`);
  console.log(`   Style Tags: ${Object.keys(tagMap).length}`);
  console.log(`   Fotos:      ${PHOTO_SCENARIOS.length}\n`);
  console.log('   → http://localhost:3000\n');
}

seed().catch((err) => {
  console.error('\n❌ Seed-Fehler:', err.message);
  process.exit(1);
});
