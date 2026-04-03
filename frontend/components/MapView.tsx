'use client';

import { useRouter } from 'next/navigation';
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from '@/components/ui/map';
import type { GeocodedLocation } from '@/lib/geocode';

interface MapViewProps {
  locations: GeocodedLocation[];
}

// Marker-Größe skaliert logarithmisch zur Foto-Anzahl
function markerSize(count: number): number {
  return Math.min(8 + Math.log2(count + 1) * 5, 28);
}

export default function MapView({ locations }: MapViewProps) {
  const router = useRouter();

  // Mittelpunkt: arithmetisches Mittel aller Marker-Koordinaten
  const center: [number, number] =
    locations.length > 0
      ? [
          locations.reduce((s, l) => s + l.lng, 0) / locations.length,
          locations.reduce((s, l) => s + l.lat, 0) / locations.length,
        ]
      : [10, 51]; // Default: Europa-Mitte

  return (
    <div style={{ height: '520px', width: '100%', position: 'relative' }}>
      <Map
        center={center}
        zoom={locations.length === 1 ? 10 : 3}
        theme="dark"
        styles={{
          dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          light: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        }}
      >
        <MapControls position="bottom-right" showZoom showFullscreen />

        {locations.map((loc) => {
          const size = markerSize(loc.photoCount);
          return (
            <MapMarker key={`${loc.city}-${loc.country}`} longitude={loc.lng} latitude={loc.lat}>
              <MarkerContent>
                <button
                  onClick={() =>
                    router.push(
                      `/archiv?city=${encodeURIComponent(loc.city)}`
                    )
                  }
                  title={`${loc.city} – ${loc.photoCount} Fotos`}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    boxShadow: `0 0 ${size}px rgba(25,143,151,0.5)`,
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.3)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </MarkerContent>

              <MarkerPopup>
                <div
                  className="font-mono"
                  style={{
                    background: '#111',
                    border: '1px solid #272727',
                    padding: '10px 14px',
                    minWidth: '160px',
                  }}
                >
                  <p
                    style={{
                      color: 'var(--accent)',
                      fontWeight: 700,
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '4px',
                    }}
                  >
                    {loc.city}
                  </p>
                  {loc.country && (
                    <p style={{ color: '#7a7a7a', fontSize: '11px', marginBottom: '8px' }}>
                      {loc.country}
                    </p>
                  )}
                  <p style={{ color: '#e2e2e2', fontSize: '11px', marginBottom: '10px' }}>
                    {loc.photoCount} {loc.photoCount === 1 ? 'Foto' : 'Fotos'}
                  </p>
                  <button
                    onClick={() =>
                      router.push(`/archiv?city=${encodeURIComponent(loc.city)}`)
                    }
                    style={{
                      fontFamily: 'inherit',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#111',
                      background: 'var(--accent)',
                      border: 'none',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Fotos ansehen →
                  </button>
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
}
