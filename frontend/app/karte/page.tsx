import { Suspense } from 'react';
import Link from 'next/link';
import { getApprovedPhotos } from '@/lib/directus';
import { aggregateCityLocations, aggregateCountries, geocodeLocations } from '@/lib/geocode';
import type { GeocodedLocation } from '@/lib/geocode';
import MapView from '@/components/MapView';

// Karte revalidiert einmal täglich – Geocoding ist langsam (1 req/s Nominatim)
export const revalidate = 86400;

async function fetchMapData(): Promise<{
  locations: GeocodedLocation[];
  topCities: Array<{ city: string; country: string; photoCount: number }>;
  topCountries: Array<{ country: string; photoCount: number }>;
}> {
  const photos = await getApprovedPhotos({ limit: 500 }); // Directus: -1 nicht zuverlässig im SDK

  const cityAgg = aggregateCityLocations(
    photos.map(p => ({
      location_city: typeof p.location_city === 'string' ? p.location_city : null,
      location_country: typeof p.location_country === 'string' ? p.location_country : null,
    }))
  );

  const countryAgg = aggregateCountries(
    photos.map(p => ({
      location_country: typeof p.location_country === 'string' ? p.location_country : null,
    }))
  );

  // Nur Städte mit mindestens 1 Foto geocodieren (max 50 um Rate-Limit zu respektieren)
  const toGeocode = cityAgg.slice(0, 50);
  const locations = await geocodeLocations(toGeocode);

  return {
    locations,
    topCities: cityAgg.slice(0, 20),
    topCountries: countryAgg.slice(0, 20),
  };
}

async function MapSection() {
  const { locations, topCities, topCountries } = await fetchMapData();

  return (
    <>
      {/* Karte */}
      <div style={{ borderBottom: '1px solid var(--bg-border)' }}>
        {locations.length > 0 ? (
          <MapView locations={locations} />
        ) : (
          <div
            className="flex items-center justify-center font-mono uppercase tracking-widest"
            style={{ height: '520px', color: 'var(--text-dim)', fontSize: '11px' }}
          >
            Noch keine geocodierbaren Locations im Archiv.
          </div>
        )}
      </div>

      {/* Top-Listen */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--bg-border)' }}>

          {/* Top Städte */}
          <div style={{ background: 'var(--bg)' }} className="p-8">
            <h2
              className="font-mono font-bold uppercase tracking-widest mb-6"
              style={{ color: 'var(--text-primary)', fontSize: '11px' }}
            >
              Top Städte
            </h2>
            {topCities.length === 0 ? (
              <p className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
                Noch keine Locations eingetragen.
              </p>
            ) : (
              <ol className="space-y-1">
                {topCities.map((c, i) => (
                  <li key={`${c.city}-${c.country}`}>
                    <Link
                      href={`/archiv?city=${encodeURIComponent(c.city)}`}
                      className="flex items-baseline justify-between gap-4 group py-1.5"
                      style={{ borderBottom: '1px solid var(--bg-border)' }}
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span
                          className="font-mono shrink-0"
                          style={{ color: 'var(--text-dim)', fontSize: '10px', width: '20px' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="font-mono font-bold uppercase truncate transition-colors group-hover:text-[var(--accent)]"
                          style={{ color: 'var(--text-primary)', fontSize: '12px' }}
                        >
                          {c.city}
                        </span>
                        {c.country && (
                          <span
                            className="font-mono hidden sm:inline truncate"
                            style={{ color: 'var(--text-dim)', fontSize: '10px' }}
                          >
                            {c.country}
                          </span>
                        )}
                      </div>
                      <span
                        className="font-mono shrink-0"
                        style={{ color: 'var(--accent)', fontSize: '11px' }}
                      >
                        {c.photoCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Top Länder */}
          <div style={{ background: 'var(--bg)' }} className="p-8">
            <h2
              className="font-mono font-bold uppercase tracking-widest mb-6"
              style={{ color: 'var(--text-primary)', fontSize: '11px' }}
            >
              Top Länder
            </h2>
            {topCountries.length === 0 ? (
              <p className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
                Noch keine Locations eingetragen.
              </p>
            ) : (
              <>
                {/* Balken-Diagramm */}
                <div className="mb-8">
                  {topCountries.slice(0, 8).map((c) => {
                    const max = topCountries[0].photoCount;
                    const pct = Math.round((c.photoCount / max) * 100);
                    return (
                      <Link
                        key={c.country}
                        href={`/archiv?country=${encodeURIComponent(c.country)}`}
                        className="flex items-center gap-3 mb-2 group"
                      >
                        <span
                          className="font-mono shrink-0 w-24 text-right truncate transition-colors group-hover:text-[var(--accent)]"
                          style={{ color: 'var(--text-secondary)', fontSize: '10px' }}
                        >
                          {c.country}
                        </span>
                        <div className="flex-1 h-px relative" style={{ background: 'var(--bg-border)' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '3px',
                              background: 'var(--accent)',
                              marginTop: '-1px',
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </div>
                        <span
                          className="font-mono shrink-0 w-6 text-right"
                          style={{ color: 'var(--accent)', fontSize: '11px' }}
                        >
                          {c.photoCount}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Restliche als Liste */}
                {topCountries.length > 8 && (
                  <ol className="space-y-1">
                    {topCountries.slice(8).map((c, i) => (
                      <li key={c.country}>
                        <Link
                          href={`/archiv?country=${encodeURIComponent(c.country)}`}
                          className="flex items-baseline justify-between gap-4 group py-1.5"
                          style={{ borderBottom: '1px solid var(--bg-border)' }}
                        >
                          <div className="flex items-baseline gap-3">
                            <span
                              className="font-mono shrink-0"
                              style={{ color: 'var(--text-dim)', fontSize: '10px', width: '20px' }}
                            >
                              {String(i + 9).padStart(2, '0')}
                            </span>
                            <span
                              className="font-mono uppercase transition-colors group-hover:text-[var(--accent)]"
                              style={{ color: 'var(--text-secondary)', fontSize: '11px' }}
                            >
                              {c.country}
                            </span>
                          </div>
                          <span className="font-mono shrink-0" style={{ color: 'var(--accent)', fontSize: '11px' }}>
                            {c.photoCount}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function KartePage() {
  return (
    <div>
      {/* Header */}
      <div
        style={{ borderBottom: '1px solid var(--bg-border)' }}
        className="px-4 py-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <Link
              href="/archiv"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '11px' }}
              className="uppercase tracking-widest hover:text-[var(--accent)] transition-colors"
            >
              Archiv
            </Link>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <h1
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '11px' }}
              className="uppercase tracking-widest"
            >
              Karte
            </h1>
          </div>
          <span
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '10px' }}
            className="uppercase tracking-widest hidden sm:block"
          >
            Städte ohne GPS-Koordinaten – nur Stadtname
          </span>
        </div>
      </div>

      <Suspense
        fallback={
          <div
            className="flex items-center justify-center font-mono uppercase tracking-widest"
            style={{ height: '520px', color: 'var(--text-dim)', fontSize: '11px', borderBottom: '1px solid var(--bg-border)' }}
          >
            Lade Karte...
          </div>
        }
      >
        <MapSection />
      </Suspense>
    </div>
  );
}
