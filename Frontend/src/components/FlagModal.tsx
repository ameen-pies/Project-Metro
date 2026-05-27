"use client";

import { useState, useRef } from "react";
import { METRO_LINES, MetroSighting } from "@/lib/types";

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sighting: Omit<MetroSighting, "id" | "confirmations">) => void;
  initialPosition?: [number, number];
}

export default function FlagModal({
  isOpen,
  onClose,
  onSubmit,
  initialPosition,
}: FlagModalProps) {
  const [selectedLine, setSelectedLine] = useState(METRO_LINES[0]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!initialPosition) return;
    onSubmit({
      lineName: selectedLine.name,
      lineColor: selectedLine.color,
      position: initialPosition,
      reportedBy: "you",
      reportedAt: new Date(),
      photoUrl: photo || undefined,
      note: note.trim() || undefined,
    });
    setNote("");
    setPhoto(null);
    setPhotoFile(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md">
        <div className="bg-metro-surface border border-metro-border rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Flag Metro Sighting</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-metro-card border border-metro-border flex items-center justify-center text-metro-muted hover:text-metro-text transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Line selector */}
          <div className="mb-4">
            <label className="text-xs text-metro-muted mb-2 block">Metro Line</label>
            <div className="grid grid-cols-4 gap-2">
              {METRO_LINES.map((line) => (
                <button
                  key={line.name}
                  onClick={() => setSelectedLine(line)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${
                    selectedLine.name === line.name
                      ? "border-current"
                      : "border-metro-border bg-metro-card hover:border-metro-muted/30"
                  }`}
                  style={
                    selectedLine.name === line.name
                      ? { color: line.color, background: `${line.color}12`, borderColor: `${line.color}50` }
                      : undefined
                  }
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: line.color }} />
                  {line.name.replace("Line ", "L")}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div className="mb-4">
            <label className="text-xs text-metro-muted mb-2 block">Photo (optional)</label>
            {photo ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-metro-card border border-metro-border">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPhotoFile(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-metro-border bg-metro-card hover:border-metro-cyan/30 hover:bg-metro-cyan/5 transition-colors duration-150 flex flex-col items-center justify-center gap-2"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-metro-muted">
                  <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 22l7-5 4 3 5-4 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs text-metro-muted">Tap to add photo</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Note */}
          <div className="mb-5">
            <label className="text-xs text-metro-muted mb-2 block">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Heading north, slight delay..."
              className="w-full px-4 py-2.5 bg-metro-card border border-metro-border rounded-xl text-sm text-metro-text placeholder:text-metro-muted focus:outline-none focus:border-metro-cyan/40 transition-colors"
            />
          </div>

          {/* Position info */}
          {initialPosition && (
            <div className="mb-5 px-3 py-2 bg-metro-card rounded-xl border border-metro-border">
              <p className="text-xs text-metro-muted">
                Position: {initialPosition[0].toFixed(4)}, {initialPosition[1].toFixed(4)}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!initialPosition}
            className="w-full py-3 bg-metro-cyan text-metro-bg font-semibold rounded-2xl hover:bg-metro-cyan-dim transition-colors duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Sighting
          </button>
        </div>
      </div>
    </>
  );
}
