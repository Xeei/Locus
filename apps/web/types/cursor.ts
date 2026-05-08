export interface CursorPulse {
  id: string;         // Unique Client ID
  username: string;   // e.g., "Earth" or "Guest_01"
  lng: number;        // Map Longitude
  lat: number;        // Map Latitude
  color: string;      // HEX code for the "Porsche-line" cursor accent
  timestamp: number;  // For handling jitter/latency
  isBusy?: boolean;   // Optional flag for the active interaction state (Electric Purple)
}
