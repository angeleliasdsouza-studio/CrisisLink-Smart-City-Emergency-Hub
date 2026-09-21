import type { SensorData } from '../models/types';

// ─────────────────────────────────────────────
// In-Memory Data Store
//
// Single source of truth for the latest sensor
// reading and the Arduino connection state.
// ─────────────────────────────────────────────

const defaultSensorData: SensorData = {
  temperature: null,
  humidity: null,
  vibration: 'LOW',
  status: 'NORMAL',
  timestamp: new Date().toISOString(),
  connected: false,
};

let currentSensorData: SensorData = { ...defaultSensorData };

export const dataStore = {
  /** Get a snapshot of the latest sensor data */
  getSensorData(): SensorData {
    return { ...currentSensorData };
  },

  /** Replace the current sensor data (called on every Arduino reading) */
  setSensorData(data: SensorData): void {
    currentSensorData = { ...data };
  },

  /** Update just the connection flag (Arduino plugged/unplugged) */
  setConnected(connected: boolean): void {
    currentSensorData = { ...currentSensorData, connected };
    if (!connected) {
      currentSensorData.timestamp = new Date().toISOString();
    }
  },
};
