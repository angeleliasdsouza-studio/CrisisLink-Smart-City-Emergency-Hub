import { Router } from 'express';
import { dataStore } from '../services/dataStore';
import { alertService } from '../services/alertService';
import { serialService } from '../serial/serialService';
import { broadcast } from '../websocket/wsServer';
import type { SensorData } from '../models/types';

const router = Router();

// ─────────────────────────────────────────────
// GET /api
// API overview and endpoint directory
// ─────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json({
    name: 'CrisisLink — Smart City Emergency Hub API',
    status: 'ONLINE',
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      alerts: '/api/alerts',
      acknowledge: 'POST /api/alerts/:id/acknowledge',
      resolve: 'POST /api/alerts/:id/resolve',
      demoMode: 'POST /api/demo/mode',
      demoTrigger: 'POST /api/demo/trigger',
      demoNormal: 'POST /api/demo/normal',
    },
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// GET /api/health
// Server health + Arduino connection status
// ─────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    server: 'OK',
    arduino: serialService.getIsConnected() ? 'CONNECTED' : 'DISCONNECTED',
    port: serialService.getConnectedPort() || null,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// GET /api/status
// Current sensor reading
// ─────────────────────────────────────────────
router.get('/status', (_req, res) => {
  res.json(dataStore.getSensorData());
});

// ─────────────────────────────────────────────
// GET /api/alerts
// All alerts (newest first)
// ─────────────────────────────────────────────
router.get('/alerts', (_req, res) => {
  res.json(alertService.getAll());
});

// ─────────────────────────────────────────────
// POST /api/alerts/:id/acknowledge
// Move alert UNRESOLVED → ACKNOWLEDGED
// ─────────────────────────────────────────────
router.post('/alerts/:id/acknowledge', (req, res) => {
  const alert = alertService.acknowledge(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found or cannot be acknowledged' });
    return;
  }

  // Broadcast updated alert list to all WS clients
  broadcast({ type: 'alert_update', alerts: alertService.getAll() });
  res.json(alert);
});

// ─────────────────────────────────────────────
// POST /api/alerts/:id/resolve
// Move alert → RESOLVED
// ─────────────────────────────────────────────
router.post('/alerts/:id/resolve', (req, res) => {
  const alert = alertService.resolve(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found or already resolved' });
    return;
  }

  broadcast({ type: 'alert_update', alerts: alertService.getAll() });
  res.json(alert);
});

// ─────────────────────────────────────────────
// Demo Mode endpoints
// ─────────────────────────────────────────────

/** POST /api/demo/mode  { enabled: boolean } */
router.post('/demo/mode', (req, res) => {
  const { enabled } = req.body as { enabled: boolean };
  alertService.setDemoMode(!!enabled);

  if (enabled) {
    // Push a NORMAL demo sensor reading so dashboard reflects demo state
    const demoNormal: SensorData = {
      temperature: 27,
      humidity: 61,
      vibration: 'LOW',
      status: 'NORMAL',
      timestamp: new Date().toISOString(),
      connected: false,
    };
    dataStore.setSensorData(demoNormal);
    broadcast({ type: 'sensor_update', data: demoNormal });
  }

  res.json({ demoMode: alertService.isDemoMode() });
});

/** POST /api/demo/trigger — simulate an EMERGENCY reading */
router.post('/demo/trigger', (_req, res) => {
  if (!alertService.isDemoMode()) {
    res.status(400).json({ error: 'Demo mode is not active' });
    return;
  }

  const demoEmergency: SensorData = {
    temperature: 39,
    humidity: 58,
    vibration: 'HIGH',
    status: 'EMERGENCY',
    timestamp: new Date().toISOString(),
    connected: false,
  };

  dataStore.setSensorData(demoEmergency);
  broadcast({ type: 'sensor_update', data: demoEmergency });

  const alert = alertService.triggerDemoEmergency();
  broadcast({ type: 'alert_update', alerts: alertService.getAll() });

  res.json({ sensorData: demoEmergency, alert });
});

/** POST /api/demo/normal — reset demo to NORMAL */
router.post('/demo/normal', (_req, res) => {
  if (!alertService.isDemoMode()) {
    res.status(400).json({ error: 'Demo mode is not active' });
    return;
  }

  alertService.resetDemo();

  const demoNormal: SensorData = {
    temperature: 27,
    humidity: 61,
    vibration: 'LOW',
    status: 'NORMAL',
    timestamp: new Date().toISOString(),
    connected: false,
  };

  dataStore.setSensorData(demoNormal);
  broadcast({ type: 'sensor_update', data: demoNormal });

  res.json({ sensorData: demoNormal });
});

export default router;
