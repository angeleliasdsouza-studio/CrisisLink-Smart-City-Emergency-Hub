import { randomUUID } from 'crypto';
import type { Alert, AlertStatus, SensorData } from '../models/types';

// ─────────────────────────────────────────────
// Alert Service
//
// Manages the emergency alert lifecycle:
//
//   NORMAL → EMERGENCY detected
//     └─ creates UNRESOLVED alert
//
//   UNRESOLVED → ACKNOWLEDGED (user action)
//   ACKNOWLEDGED → RESOLVED   (user action)
//   RESOLVED → (closed, next emergency creates new alert)
//
// Deduplication: while Arduino keeps reporting EMERGENCY
// every 500 ms, we do NOT create duplicate alerts.
// A new alert is created only when:
//   1. Transition from NORMAL → EMERGENCY
//   2. Previous active alert is RESOLVED and new EMERGENCY occurs
// ─────────────────────────────────────────────

const LOCATION = 'Hostel Block A';
const EMERGENCY_TYPE = 'Structural Disturbance';
const MAX_ALERTS = 100;

let alerts: Alert[] = [];
let lastArduinoStatus: 'NORMAL' | 'EMERGENCY' = 'NORMAL';
let isDemoMode = false;

export const alertService = {
  /** Called on every sensor update to decide whether to create a new alert */
  processSensorData(data: SensorData): Alert | null {
    const currentStatus = data.status;

    // Detect NORMAL → EMERGENCY transition
    const isNewEmergency =
      currentStatus === 'EMERGENCY' &&
      (lastArduinoStatus === 'NORMAL' || !hasActiveAlert());

    lastArduinoStatus = currentStatus;

    if (!isNewEmergency) return null;

    const alert: Alert = {
      id: `alert-${randomUUID()}`,
      location: LOCATION,
      type: EMERGENCY_TYPE,
      temperature: data.temperature,
      humidity: data.humidity,
      vibration: data.vibration,
      arduinoStatus: data.status,
      status: 'UNRESOLVED',
      createdAt: new Date().toISOString(),
      acknowledgedAt: null,
      resolvedAt: null,
      isDemo: false,
    };

    addAlert(alert);
    return alert;
  },

  /** Acknowledge an alert — move UNRESOLVED → ACKNOWLEDGED */
  acknowledge(id: string): Alert | null {
    const alert = alerts.find((a) => a.id === id);
    if (!alert || alert.status !== 'UNRESOLVED') return null;
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = new Date().toISOString();
    return { ...alert };
  },

  /** Resolve an alert — move ACKNOWLEDGED → RESOLVED */
  resolve(id: string): Alert | null {
    const alert = alerts.find((a) => a.id === id);
    if (!alert || alert.status === 'RESOLVED') return null;
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    // Allow next emergency to create a fresh alert
    lastArduinoStatus = 'NORMAL';
    return { ...alert };
  },

  /** Get all alerts, newest first */
  getAll(): Alert[] {
    return [...alerts].reverse();
  },

  /** Get the current active (unresolved/acknowledged) alert, if any */
  getActive(): Alert | null {
    return alerts.find((a) => a.status !== 'RESOLVED') ?? null;
  },

  // ── Demo mode ──────────────────────────────

  setDemoMode(enabled: boolean): void {
    isDemoMode = enabled;
    if (!enabled) {
      // Reset Arduino status tracking when leaving demo mode
      lastArduinoStatus = 'NORMAL';
    }
  },

  isDemoMode(): boolean {
    return isDemoMode;
  },

  /** Simulate an EMERGENCY reading for demo purposes */
  triggerDemoEmergency(): Alert | null {
    if (!isDemoMode) return null;

    // Only create if no active alert already exists
    if (hasActiveAlert()) return alertService.getActive();

    const alert: Alert = {
      id: `alert-${randomUUID()}`,
      location: LOCATION,
      type: EMERGENCY_TYPE,
      temperature: 39,
      humidity: 58,
      vibration: 'HIGH',
      arduinoStatus: 'EMERGENCY',
      status: 'UNRESOLVED',
      createdAt: new Date().toISOString(),
      acknowledgedAt: null,
      resolvedAt: null,
      isDemo: true,
    };

    addAlert(alert);
    lastArduinoStatus = 'EMERGENCY';
    return alert;
  },

  /** Reset demo state back to NORMAL */
  resetDemo(): void {
    lastArduinoStatus = 'NORMAL';
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function hasActiveAlert(): boolean {
  return alerts.some((a) => a.status !== 'RESOLVED');
}

function addAlert(alert: Alert): void {
  alerts.push(alert);
  // Cap history
  if (alerts.length > MAX_ALERTS) {
    alerts = alerts.slice(alerts.length - MAX_ALERTS);
  }
}
