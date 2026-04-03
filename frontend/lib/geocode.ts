export interface GeocodedLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
  photoCount: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Geocodiert eine Stadt via Nominatim (OpenStreetMap).
 * Nominatim-ToS: max 1 req/s, User-Agent Pflicht, kein Missbrauch.
 * Da dies nur server-seitig im ISR-Kontext läuft (1x/Stunde),
 * sind die Rate-Limits problemlos einzuhalten.
 */
async function geocodeCity(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  const q = encodeURIComponent(`${city}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=0`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Streetfiles-Graffiti-Archive/1.0 (https://github.com/schroepa/graff-archive)',
        'Accept-Language': 'de,en',
      },
      next: { revalidate: 86400 }, // 24h Cache auf Nominatim-Ergebnis
    });

    if (!res.ok) return null;

    const data: NominatimResult[] = await res.json();
    if (!data[0]) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

/**
 * Geocodiert eine Liste von Städten sequenziell mit 1s Delay
 * (Nominatim Rate-Limit: 1 req/s).
 */
export async function geocodeLocations(
  locations: Array<{ city: string; country: string; photoCount: number }>
): Promise<GeocodedLocation[]> {
  const results: GeocodedLocation[] = [];

  for (const loc of locations) {
    const coords = await geocodeCity(loc.city, loc.country);
    if (coords) {
      results.push({ ...loc, ...coords });
    }
    // Nominatim Rate-Limit: 1 req/s
    await new Promise(r => setTimeout(r, 1100));
  }

  return results;
}

/**
 * Aggregiert Foto-Locations zu eindeutigen Stadt-Einträgen
 * und sortiert nach Anzahl (absteigend).
 */
export function aggregateCityLocations(
  photos: Array<{ location_city: string | null; location_country: string | null }>
): Array<{ city: string; country: string; photoCount: number }> {
  const map = new Map<string, { city: string; country: string; photoCount: number }>();

  for (const p of photos) {
    if (!p.location_city) continue;
    const key = `${p.location_city}|${p.location_country ?? ''}`;
    const existing = map.get(key);
    if (existing) {
      existing.photoCount++;
    } else {
      map.set(key, {
        city: p.location_city,
        country: p.location_country ?? '',
        photoCount: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.photoCount - a.photoCount);
}

/**
 * Aggregiert nach Land.
 */
export function aggregateCountries(
  photos: Array<{ location_country: string | null }>
): Array<{ country: string; photoCount: number }> {
  const map = new Map<string, number>();

  for (const p of photos) {
    if (!p.location_country) continue;
    map.set(p.location_country, (map.get(p.location_country) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([country, photoCount]) => ({ country, photoCount }))
    .sort((a, b) => b.photoCount - a.photoCount);
}
