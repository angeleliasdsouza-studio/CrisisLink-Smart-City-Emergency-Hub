import { useEffect, useRef, useState, useCallback } from 'react';
import type { Alert, SensorData, WsConnectionStatus } from '../types';
import { fetchAlerts, fetchStatus } from '../services/api';

// ─────────────────────────────────────────────
// useWebSocket
//
// Connects to the backend WebSocket server and
// keeps sensorData + alerts in sync in real time.
//
// Handles:
//  • Automatic reconnection with exponential backoff
//  • Initial REST fetch to hydrate state before WS connects
//  • Clean disconnect on unmount
// ─────────────────────────────────────────────

const WS_URL = `ws://${window.location.hostname}:3001`;
const MAX_BACKOFF_MS = 30_000;

interface UseWebSocketResult {
  sensorData: SensorData | null;
  alerts: Alert[];
  wsStatus: WsConnectionStatus;
  arduinoConnected: boolean;
  refreshAlerts: () => Promise<void>;
}

export function useWebSocket(): UseWebSocketResult {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('connecting');
  const [arduinoConnected, setArduinoConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1000); // start at 1 s
  const unmountedRef = useRef(false);

  const refreshAlerts = useCallback(async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch {
      // silently ignore; WS will deliver updates
    }
  }, []);

  // Hydrate state from REST on first load
  useEffect(() => {
    Promise.all([fetchStatus(), fetchAlerts()])
      .then(([status, alertList]) => {
        setSensorData(status);
        setAlerts(alertList);
        setArduinoConnected(status.connected);
      })
      .catch(() => {
        // Backend may not be ready yet; WS will catch up
      });
  }, []);

  // WebSocket connection
  useEffect(() => {
    function connect() {
      if (unmountedRef.current) return;

      setWsStatus('connecting');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmountedRef.current) { ws.close(); return; }
        setWsStatus('connected');
        backoffRef.current = 1000; // reset backoff on success
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);

          switch (msg.type) {
            case 'sensor_update':
              setSensorData(msg.data);
              setArduinoConnected(msg.data.connected);
              break;
            case 'alert_update':
              setAlerts(msg.alerts);
              break;
            case 'connection_status':
              setArduinoConnected(msg.connected);
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        setWsStatus('reconnecting');
        const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS);
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
        setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      wsRef.current?.close();
    };
  }, []);

  return { sensorData, alerts, wsStatus, arduinoConnected, refreshAlerts };
}
