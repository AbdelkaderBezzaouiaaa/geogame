'use client';

import { useEffect, useRef, useState } from 'react';

interface MapDisplayProps {
  lat: number;
  lng: number;
}

export default function MapDisplay({ lat, lng }: MapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const maplibregl = (await import('maplibre-gl')).default;

        if (cancelled || !mapContainerRef.current) return;

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: [
                  'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
                ],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
              },
            },
            layers: [
              {
                id: 'osm-tiles-layer',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
          center: [lng, lat],
          zoom: 4.5,
          interactive: false,
          renderWorldCopies: false,
        });

        // Add marker
        const markerEl = document.createElement('div');
        markerEl.style.width = '20px';
        markerEl.style.height = '20px';
        markerEl.style.borderRadius = '50%';
        markerEl.style.backgroundColor = 'hsl(160, 84%, 39%)';
        markerEl.style.border = '3px solid white';
        markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        new maplibregl.Marker({ element: markerEl })
          .setLngLat([lng, lat])
          .addTo(map);

        mapRef.current = map;
        setLoaded(true);
      } catch (e: any) {
        console.error('Map load error:', e);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove?.();
    };
  }, [lat, lng]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="w-full h-[250px] md:h-[300px] rounded-xl"
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-xl">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
