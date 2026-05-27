"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import FlagModal from "@/components/FlagModal";
import { MetroSighting, METRO_LINES, LINE4_STATIONS, LINE4_TRACKS, LINE4_RETURN_TRACKS } from "@/lib/types";
import { MOCK_SIGHTINGS } from "@/lib/store";

const MetroMap = dynamic(() => import("@/components/MetroMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-metro-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-metro-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-metro-muted">Loading map...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [sightings, setSightings] = useState<MetroSighting[]>(MOCK_SIGHTINGS);
  const [selectedSighting, setSelectedSighting] =
    useState<MetroSighting | null>(null);
  const [currentLine, setCurrentLine] = useState("Line 4");
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagPosition, setFlagPosition] = useState<[number, number] | null>(
    null
  );
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const currentLineData = METRO_LINES.find((l) => l.name === currentLine);
  const isAvailable = currentLineData?.available ?? false;

  // Route polyline for Line 4 (with road waypoints)

  const stations = LINE4_STATIONS; // expand when more lines added

  const handleFlagNew = useCallback(() => {
    // Use Line 4 Tunis Marine area as default
    const basePos = LINE4_STATIONS[0].position;
    const lat = basePos[0] + (Math.random() - 0.5) * 0.01;
    const lng = basePos[1] + (Math.random() - 0.5) * 0.01;
    setFlagPosition([lat, lng]);
    setFlagModalOpen(true);
  }, []);

  const handleFlagAtPosition = useCallback(
    (lat: number, lng: number) => {
      if (!isAvailable) return;
      setFlagPosition([lat, lng]);
      setFlagModalOpen(true);
    },
    [isAvailable]
  );

  const handleSubmitSighting = useCallback(
    (newSighting: Omit<MetroSighting, "id" | "confirmations">) => {
      const sighting: MetroSighting = {
        ...newSighting,
        id: Date.now().toString(),
        confirmations: 0,
      };
      setSightings((prev) => [sighting, ...prev]);
      setSelectedSighting(sighting);
    },
    []
  );

  const handleSwitchLine = useCallback((lineName: string) => {
    setCurrentLine(lineName);
    setSelectedSighting(null);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-[380px] shrink-0">
        <Sidebar
          sightings={sightings}
          selectedSighting={selectedSighting}
          currentLine={currentLine}
          onSelectSighting={setSelectedSighting}
          onFlagNew={handleFlagNew}
          onSwitchLine={handleSwitchLine}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[380px]">
            <Sidebar
              sightings={sightings}
              selectedSighting={selectedSighting}
              currentLine={currentLine}
              onSelectSighting={(s) => {
                setSelectedSighting(s);
                setShowMobileSidebar(false);
              }}
              onFlagNew={() => {
                handleFlagNew();
                setShowMobileSidebar(false);
              }}
              onSwitchLine={handleSwitchLine}
            />
          </div>
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="md:hidden w-10 h-10 rounded-2xl bg-metro-surface border border-metro-border flex items-center justify-center shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 4h14M2 9h14M2 14h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Line indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-metro-surface/90 backdrop-blur-sm border border-metro-border rounded-xl">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: currentLineData?.color || "#E3000B" }}
            />
            <span className="text-xs font-medium text-metro-text">
              {currentLine}
            </span>
            <span className="text-xs text-metro-muted">
              · {filteredCount(sightings, currentLine)} active
            </span>
          </div>

          <button
            onClick={handleFlagNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-metro-bg text-xs font-semibold rounded-xl"
            style={{ background: currentLineData?.color || "#E3000B" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Flag
          </button>
        </div>

        {/* Map */}
        <MetroMap
          sightings={sightings.filter((s) => s.lineName === currentLine)}
          selectedSighting={selectedSighting}
          stations={stations}
          tracks={LINE4_TRACKS}
          returnTracks={LINE4_RETURN_TRACKS}
          lineColor={currentLineData?.color || "#E3000B"}
          onSelectSighting={setSelectedSighting}
          onFlagAtPosition={handleFlagAtPosition}
          comingSoon={!isAvailable}
        />
      </div>

      {/* Flag Modal */}
      <FlagModal
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSubmit={handleSubmitSighting}
        initialPosition={flagPosition || undefined}
        currentLine={currentLine}
      />
    </div>
  );
}

function filteredCount(sightings: MetroSighting[], line: string): number {
  return sightings.filter((s) => s.lineName === line).length;
}
