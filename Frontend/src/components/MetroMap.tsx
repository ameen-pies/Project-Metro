"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MetroSighting, timeAgo, isStale } from "@/lib/types";

function createMetroIcon(lineColor: string, stale: boolean): L.DivIcon {
  const glowColor = stale ? "rgba(85,85,85,0.3)" : `${lineColor}66`;
  const bgColor = stale ? "#555" : lineColor;
  const shadowColor = stale ? "rgba(85,85,85,0.3)" : `${lineColor}99`;

  return L.divIcon({
    className: "metro-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${bgColor};
        border: 3px solid #121212;
        box-shadow: 0 0 16px ${shadowColor}, 0 0 32px ${glowColor};
        ${stale ? "" : "animation: pulse-glow 2s ease-in-out infinite;"}
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${stale ? "#333" : "#fff"};
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function FlyToSelected({ sighting }: { sighting: MetroSighting | null }) {
  const map = useMap();

  useEffect(() => {
    if (sighting) {
      map.flyTo(sighting.position, 15, { duration: 0.8 });
    }
  }, [sighting, map]);

  return null;
}

interface MetroMapProps {
  sightings: MetroSighting[];
  selectedSighting: MetroSighting | null;
  onSelectSighting: (sighting: MetroSighting | null) => void;
  onFlagAtPosition: (lat: number, lng: number) => void;
}

export default function MetroMap({
  sightings,
  selectedSighting,
  onSelectSighting,
  onFlagAtPosition,
}: MetroMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={13}
      className="w-full h-full"
      zoomControl={true}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <FlyToSelected sighting={selectedSighting} />

      {sightings.map((sighting) => (
        <Marker
          key={sighting.id}
          position={sighting.position}
          icon={createMetroIcon(sighting.lineColor, isStale(sighting.reportedAt))}
          eventHandlers={{
            click: () => onSelectSighting(sighting),
          }}
        >
          <Popup>
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: sighting.lineColor }}
                />
                <span className="font-semibold text-sm">{sighting.lineName}</span>
              </div>
              {sighting.photoUrl && (
                <div className="rounded-lg overflow-hidden mb-2 aspect-video bg-metro-surface">
                  <img
                    src={sighting.photoUrl}
                    alt={`${sighting.lineName} sighting`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {sighting.note && (
                <p className="text-xs text-metro-muted mb-2">{sighting.note}</p>
              )}
              <div className="flex items-center justify-between text-xs text-metro-muted">
                <span>by {sighting.reportedBy}</span>
                <span>{timeAgo(sighting.reportedAt)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-metro-cyan">{sighting.confirmations}</span>
                <span className="text-metro-muted">confirmations</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
