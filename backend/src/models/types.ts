// ─────────────────────────────────────────────
// Shared Types — CrisisLink
// ─────────────────────────────────────────────

/** Raw sensor reading from the Arduino */
export interface SensorData {
  temperature: number | null;  // °C, null when DHT11 returns ERR
  humidity: number | null;     // %, null when DHT11 returns ERR
  vibration: 'LOW' | 'HIGH';
  status: 'NORMAL' | 'EMERGENCY';
  timestamp: string;           // ISO-8601
  connected: boolean;          // Arduino serial connection state
}

/** Lifecycle state of a dashboard alert */
export type AlertStatus = 'UNRESOLVED' | 'ACKNOWLEDGED' | 'RESOLVED';

/** A dashboard emergency alert (created when Arduino reports EMERGENCY) */
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

/** WebSocket message envelope */
export type WsMessage =
  | { type: 'sensor_update'; data: SensorData }
  | { type: 'alert_update'; alerts: Alert[] }
  | { type: 'connection_status'; connected: boolean };
