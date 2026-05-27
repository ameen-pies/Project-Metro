"use client";

import { useState } from "react";
import { MetroSighting, timeAgo, isStale, METRO_LINES } from "@/lib/types";

interface SidebarProps {
  sightings: MetroSighting[];
  selectedSighting: MetroSighting | null;
  onSelectSighting: (sighting: MetroSighting) => void;
  onFlagNew: () => void;
}

export default function Sidebar({
  sightings,
  selectedSighting,
  onSelectSighting,
  onFlagNew,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredSightings = sightings
    .filter((s) => {
      const matchesSearch =
        search === "" ||
        s.lineName.toLowerCase().includes(search.toLowerCase()) ||
        s.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
        s.note?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === null || s.lineName === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());

  const activeLines = [...new Set(sightings.map((s) => s.lineName))];

  return (
    <aside className="w-full h-full flex flex-col bg-metro-surface border-r border-metro-border">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Metro Tracker</h1>
            <p className="text-xs text-metro-muted mt-0.5">
              {sightings.length} active sighting{sightings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onFlagNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-metro-cyan text-metro-bg text-sm font-semibold rounded-2xl hover:bg-metro-cyan-dim transition-colors duration-150 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Flag
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-metro-muted"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search lines, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-metro-card border border-metro-border rounded-xl text-sm text-metro-text placeholder:text-metro-muted focus:outline-none focus:border-metro-cyan/40 transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
              activeFilter === null
                ? "bg-metro-cyan/15 text-metro-cyan border border-metro-cyan/30"
                : "bg-metro-card text-metro-muted border border-metro-border hover:border-metro-muted/30"
            }`}
          >
            All
          </button>
          {activeLines.map((line) => {
            const lineData = METRO_LINES.find((l) => l.name === line);
            return (
              <button
                key={line}
                onClick={() => setActiveFilter(activeFilter === line ? null : line)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                  activeFilter === line
                    ? "border"
                    : "bg-metro-card text-metro-muted border border-metro-border hover:border-metro-muted/30"
                }`}
                style={
                  activeFilter === line
                    ? {
                        background: `${lineData?.color}15`,
                        color: lineData?.color,
                        borderColor: `${lineData?.color}40`,
                      }
                    : undefined
                }
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: lineData?.color || "#888" }}
                />
                {line}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sighting list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {filteredSightings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-metro-card border border-metro-border flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-metro-muted">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-metro-muted">No sightings yet</p>
            <p className="text-xs text-metro-muted/60 mt-1">Be the first to flag a metro</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSightings.map((sighting) => {
              const stale = isStale(sighting.reportedAt);
              const isSelected = selectedSighting?.id === sighting.id;

              return (
                <button
                  key={sighting.id}
                  onClick={() => onSelectSighting(sighting)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150 border ${
                    isSelected
                      ? "bg-metro-cyan/8 border-metro-cyan/25"
                      : "bg-metro-card border-metro-border hover:border-metro-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Timeline node */}
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          background: stale ? "#555" : sighting.lineColor,
                          boxShadow: stale
                            ? "none"
                            : `0 0 8px ${sighting.lineColor}66`,
                        }}
                      />
                      <div className="w-px h-full bg-metro-border mt-1" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{sighting.lineName}</span>
                        <span className={`text-xs ${stale ? "text-metro-muted/50" : "text-metro-muted"}`}>
                          {timeAgo(sighting.reportedAt)}
                        </span>
                      </div>
                      {sighting.note && (
                        <p className="text-xs text-metro-muted truncate mb-1.5">{sighting.note}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-metro-muted/70">
                        <span>by {sighting.reportedBy}</span>
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5 4.5 4z"
                              fill="currentColor"
                            />
                          </svg>
                          {sighting.confirmations}
                        </span>
                        {sighting.photoUrl && (
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="1" y="2.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
                              <circle cx="4" cy="5.5" r="1" fill="currentColor" />
                              <path d="M1 8l3-2 2 1.5 2-2 3 2.5" stroke="currentColor" strokeWidth="1" />
                            </svg>
                            photo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
