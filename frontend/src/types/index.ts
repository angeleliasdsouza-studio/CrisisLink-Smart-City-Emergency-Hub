// ─────────────────────────────────────────────
// Shared frontend types — mirrors backend models
// ─────────────────────────────────────────────

export interface SensorData {
  temperature: number | null;
  humidity: number | null;
  vibration: 'LOW' | 'HIGH';
  status: 'NORMAL' | 'EMERGENCY';
  timestamp: string;
  connected: boolean;
}

export type AlertStatus = 'UNRESOLVED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  location: string;
  type: string;
  temperature: number | null;
  humidity: number | null;
  vibration: 'LOW' | 'HIGH';
  arduinoStatus: 'NORMAL' | 'EMERGENCY';
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  isDemo: boolean;
}

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
