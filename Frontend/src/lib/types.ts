export interface MetroSighting {
  id: string;
  lineName: string;
  lineColor: string;
  stationName?: string;
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
  available: boolean;
}

export interface MetroStation {
  name: string;
  position: [number, number];
  interchange?: string[];
}

export const METRO_LINES: MetroLine[] = [
  { name: "Line 1", color: "#FFCD00", available: false },
  { name: "Line 2", color: "#003DA5", available: false },
  { name: "Line 3", color: "#8B4513", available: false },
  { name: "Line 4", color: "#E3000B", available: true },
  { name: "Line 5", color: "#FF6600", available: false },
  { name: "Line 6", color: "#6EC867", available: false },
];

export const LINE4_STATIONS: MetroStation[] = [
  { name: "Tunis Marine", position: [36.8005, 10.1845], interchange: ["TGM"] },
  { name: "Farhat Hached", position: [36.7985, 10.1810] },
  { name: "Place de Barcelone", position: [36.7965, 10.1775], interchange: ["Line 1", "Line 2", "Line 3", "Line 5", "Line 6", "SNCFT"] },
  { name: "Habib Thameur", position: [36.7980, 10.1740] },
  { name: "Place de la République", position: [36.8000, 10.1710], interchange: ["Line 2", "Line 3", "Line 5"] },
  { name: "Bab El Khadra", position: [36.8035, 10.1670] },
  { name: "Bab Laassal", position: [36.8060, 10.1635] },
  { name: "Bab Saadoun", position: [36.8085, 10.1600], interchange: ["Line 3", "Line 5"] },
  { name: "Bouchoucha", position: [36.8110, 10.1555] },
  { name: "20 Mars", position: [36.8130, 10.1510] },
  { name: "Bardo", position: [36.8105, 10.1420] },
  { name: "Essaidia", position: [36.8080, 10.1365] },
  { name: "Khaznadar", position: [36.8060, 10.1315] },
  { name: "L'Artisanat", position: [36.8045, 10.1265] },
  { name: "Den Den", position: [36.8055, 10.1195] },
  { name: "Manouba", position: [36.8085, 10.1115] },
  { name: "Slimane Kahia", position: [36.8100, 10.1060] },
  { name: "Moncef Bey", position: [36.8110, 10.1005] },
  { name: "Aboubaker El Razi", position: [36.8115, 10.0955] },
  { name: "Le Pôle Technologique", position: [36.8110, 10.0900] },
  { name: "Ksar El Warda", position: [36.8100, 10.0850] },
  { name: "Campus de Manouba", position: [36.8090, 10.0800] },
  { name: "Kheireddine", position: [36.8080, 10.0750] },
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

export function findNearestStation(
  position: [number, number],
  stations: MetroStation[]
): MetroStation | null {
  let nearest: MetroStation | null = null;
  let minDist = Infinity;

  for (const station of stations) {
    const dx = station.position[0] - position[0];
    const dy = station.position[1] - position[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = station;
    }
  }

  return nearest;
}
