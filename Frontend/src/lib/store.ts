import { MetroSighting } from "./types";

// Mock data for demo
export const MOCK_SIGHTINGS: MetroSighting[] = [
  {
    id: "1",
    lineName: "Line 1",
    lineColor: "#FFCD00",
    position: [48.8566, 2.3522],
    reportedBy: "commuter_42",
    reportedAt: new Date(Date.now() - 5 * 60000),
    confirmations: 12,
    note: "Heading north, on time",
  },
  {
    id: "2",
    lineName: "Line 4",
    lineColor: "#CF009E",
    position: [48.8600, 2.3400],
    reportedBy: "metro_fan",
    reportedAt: new Date(Date.now() - 12 * 60000),
    confirmations: 7,
  },
  {
    id: "3",
    lineName: "Line 6",
    lineColor: "#6EC867",
    position: [48.8500, 2.3600],
    reportedBy: "daily_rider",
    reportedAt: new Date(Date.now() - 45 * 60000),
    confirmations: 3,
    note: "Slight delay at station",
  },
  {
    id: "4",
    lineName: "Line 9",
    lineColor: "#B0BD00",
    position: [48.8700, 2.3300],
    reportedBy: "night_owl",
    reportedAt: new Date(Date.now() - 2 * 60000),
    confirmations: 18,
    photoUrl: undefined,
  },
  {
    id: "5",
    lineName: "Line 14",
    lineColor: "#62259D",
    position: [48.8450, 2.3700],
    reportedBy: "express_rider",
    reportedAt: new Date(Date.now() - 120 * 60000),
    confirmations: 1,
    note: "Last seen near Châtelet",
  },
];
