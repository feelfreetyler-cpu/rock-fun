import type { RockType } from "./types";

// List of available rock types used throughout the UI
export const ROCK_TYPES: RockType[] = ["Petoskey", "Quartz", "Copper", "Agate", "Other"];

// Maps a rock type to a consistent pin color for the Google map
export function pinColor(type: RockType) {
  // Blue, Green, Gold, Orange, Gray
  switch (type) {
    case "Petoskey": return "#2563EB"; // blue-600
    case "Quartz": return "#16A34A";   // green-600
    case "Copper": return "#D97706";   // amber-600 (reads as gold)
    case "Agate": return "#F97316";    // orange-500
    case "Other": return "#6B7280";    // gray-500
  }
}

// Simple passthrough to allow overriding labels later
export function label(type: RockType) {
  return type;
}
