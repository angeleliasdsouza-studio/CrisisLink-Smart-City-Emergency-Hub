import type { Alert, SensorData } from '../types';

const API_BASE = '/api';

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ── Alert actions ──────────────────────────────────────────────
export const acknowledgeAlert = (id: string) =>
  post<Alert>(`/alerts/${id}/acknowledge`);

export const resolveAlert = (id: string) =>
  post<Alert>(`/alerts/${id}/resolve`);

// ── Fetch ──────────────────────────────────────────────────────
export const fetchAlerts = () => get<Alert[]>('/alerts');
export const fetchStatus = () => get<SensorData>('/status');
export const fetchHealth = () =>
  get<{ server: string; arduino: string; port: string | null }>('/health');

// ── Demo mode ──────────────────────────────────────────────────
export const setDemoMode = (enabled: boolean) =>
  post<{ demoMode: boolean }>('/demo/mode', { enabled });

export const triggerDemoEmergency = () =>
  post<{ sensorData: SensorData; alert: Alert | null }>('/demo/trigger');

export const resetDemoNormal = () =>
  post<{ sensorData: SensorData }>('/demo/normal');
