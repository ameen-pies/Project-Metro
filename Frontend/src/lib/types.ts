export interface MetroSighting {
  id: string;
  lineName: string;
  lineColor: string;
  position: [number, number]; // [lat, lng]
  reportedBy: string;
  reportedAt: Date;
  photoUrl?: string;
  note?: string;
  confirmations: number;
}

export interface MetroLine {
  name: string;
  color: string;
}

export const METRO_LINES: MetroLine[] = [
  { name: "Line 1", color: "#FFCD00" },
  { name: "Line 2", color: "#003DA5" },
  { name: "Line 3", color: "#8B4513" },
  { name: "Line 4", color: "#CF009E" },
  { name: "Line 5", color: "#FF6600" },
  { name: "Line 6", color: "#6EC867" },
  { name: "Line 7", color: "#FA9ABA" },
  { name: "Line 8", color: "#CEADD2" },
  { name: "Line 9", color: "#B0BD00" },
  { name: "Line 10", color: "#E4B327" },
  { name: "Line 11", color: "#7B4F28" },
  { name: "Line 12", color: "#A08D2E" },
  { name: "Line 13", color: "#6EC867" },
  { name: "Line 14", color: "#62259D" },
];

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function isStale(date: Date): boolean {
  const now = new Date();
  const minutes = (now.getTime() - date.getTime()) / 60000;
  return minutes > 30;
}
