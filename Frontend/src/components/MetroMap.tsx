"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import * as L from "leaflet";
import { MetroSighting, MetroStation, TrackCollection, timeAgo, isStale } from "@/lib/types";

// Sighting marker (pulsing glow)
function createSightingIcon(lineColor: string, stale: boolean): L.DivIcon {
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

// Station marker (small, static)
function createStationIcon(isInterchange: boolean): L.DivIcon {
  const size = isInterchange ? 14 : 10;
  const border = isInterchange ? 3 : 2;

  return L.divIcon({
    className: "station-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: #1e1e1e;
        border: ${border}px solid #555;
        position: relative;
      ">
        ${isInterchange ? `<div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #888;
        "></div>` : ""}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
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

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onMapClick]);

  return null;
}

// Renders GeoJSON track collection with per-feature styling
function TrackRenderer({ tracks }: { tracks: TrackCollection }) {
  const map = useMap();

  useEffect(() => {
    const geojson = L.geoJSON(tracks as unknown as GeoJSON.GeoJSON, {
      style: (feature) => {
        const props = feature?.properties;
        const isSplit = props?.name?.includes("Split");
        return {
          color: props?.color || "#E53935",
          weight: isSplit ? 3 : 5,
          opacity: isSplit ? 0.65 : 0.85,
          dashArray: isSplit ? "6 8" : undefined,
        };
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>${feature.properties.name}</b>`);
      },
    }).addTo(map);

    return () => {
      map.removeLayer(geojson);
    };
  }, [map, tracks]);

  return null;
}

interface MetroMapProps {
  sightings: MetroSighting[];
  selectedSighting: MetroSighting | null;
  stations: MetroStation[];
  tracks: TrackCollection;
  lineColor: string;
  onSelectSighting: (sighting: MetroSighting | null) => void;
  onFlagAtPosition: (lat: number, lng: number) => void;
  comingSoon?: boolean;
}

export default function MetroMap({
  sightings,
  selectedSighting,
  stations,
  tracks,
  lineColor,
  onSelectSighting,
  onFlagAtPosition,
  comingSoon = false,
}: MetroMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[36.805, 10.14]}
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
        <MapClickHandler onMapClick={onFlagAtPosition} />

        {/* Ground-level rail tracks */}
        <TrackRenderer tracks={tracks} />

        {/* Station markers */}
        {stations.map((station) => (
          <Marker
            key={station.name}
            position={station.position}
            icon={createStationIcon(!!station.interchange)}
          >
            <Popup>
              <div className="p-1 min-w-[160px]">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: lineColor }}
                  />
                  <span className="font-semibold text-sm">{station.name}</span>
                </div>
                {station.interchange && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {station.interchange.map((line) => (
                      <span
                        key={line}
                        className="px-2 py-0.5 bg-metro-card border border-metro-border rounded-full text-[10px] text-metro-muted"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Sighting markers */}
        {sightings.map((sighting) => (
          <Marker
            key={sighting.id}
            position={sighting.position}
            icon={createSightingIcon(sighting.lineColor, isStale(sighting.reportedAt))}
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
                {sighting.stationName && (
                  <p className="text-xs text-metro-cyan mb-1.5">
                    Near {sighting.stationName}
                  </p>
                )}
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

      {/* Coming soon overlay */}
      {comingSoon && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center backdrop-blur-md bg-metro-bg/60">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-metro-card border border-metro-border flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-metro-muted">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-metro-text mb-1">Coming Soon</h3>
            <p className="text-sm text-metro-muted">This metro line is not yet tracked</p>
          </div>
        </div>
      )}
    </div>
  );
}
