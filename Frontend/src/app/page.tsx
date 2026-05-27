"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import FlagModal from "@/components/FlagModal";
import { MetroSighting } from "@/lib/types";
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
  const [selectedSighting, setSelectedSighting] = useState<MetroSighting | null>(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagPosition, setFlagPosition] = useState<[number, number] | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const handleFlagNew = useCallback(() => {
    // Use a random position near Paris center for demo
    const lat = 48.8566 + (Math.random() - 0.5) * 0.02;
    const lng = 2.3522 + (Math.random() - 0.5) * 0.02;
    setFlagPosition([lat, lng]);
    setFlagModalOpen(true);
  }, []);

  const handleFlagAtPosition = useCallback((lat: number, lng: number) => {
    setFlagPosition([lat, lng]);
    setFlagModalOpen(true);
  }, []);

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

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-[380px] shrink-0">
        <Sidebar
          sightings={sightings}
          selectedSighting={selectedSighting}
          onSelectSighting={setSelectedSighting}
          onFlagNew={handleFlagNew}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[380px]">
            <Sidebar
              sightings={sightings}
              selectedSighting={selectedSighting}
              onSelectSighting={(s) => {
                setSelectedSighting(s);
                setShowMobileSidebar(false);
              }}
              onFlagNew={() => {
                handleFlagNew();
                setShowMobileSidebar(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="md:hidden absolute top-4 left-4 z-30 w-10 h-10 rounded-2xl bg-metro-surface border border-metro-border flex items-center justify-center shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Stats bar */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <div className="px-3 py-1.5 bg-metro-surface/90 backdrop-blur-sm border border-metro-border rounded-xl text-xs text-metro-muted">
            <span className="text-metro-cyan font-semibold">{sightings.length}</span> active
          </div>
          <button
            onClick={handleFlagNew}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-metro-cyan text-metro-bg text-xs font-semibold rounded-xl"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Flag
          </button>
        </div>

        {/* Map */}
        <MetroMap
          sightings={sightings}
          selectedSighting={selectedSighting}
          onSelectSighting={setSelectedSighting}
          onFlagAtPosition={handleFlagAtPosition}
        />
      </div>

      {/* Flag Modal */}
      <FlagModal
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onSubmit={handleSubmitSighting}
        initialPosition={flagPosition || undefined}
      />
    </div>
  );
}
