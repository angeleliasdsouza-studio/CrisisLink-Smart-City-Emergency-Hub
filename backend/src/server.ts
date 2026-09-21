import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { dataStore } from './services/dataStore';
import { alertService } from './services/alertService';
import { serialService } from './serial/serialService';
import { createWsServer, broadcast } from './websocket/wsServer';
import apiRoutes from './api/routes';

// ─────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());

// Mount REST API
app.use('/api', apiRoutes);

// ─────────────────────────────────────────────
// HTTP + WebSocket Server
// ─────────────────────────────────────────────
const httpServer = http.createServer(app);
createWsServer(httpServer);

// ─────────────────────────────────────────────
// Serial Service Event Handlers
// ─────────────────────────────────────────────
serialService.on('sensorData', (data) => {
  // Skip real serial data when demo mode is active
  if (alertService.isDemoMode()) return;

  // Store latest reading
  dataStore.setSensorData(data);

  // Broadcast sensor update to all WS clients
  broadcast({ type: 'sensor_update', data });

  // Check for emergency transitions and create alerts
  const newAlert = alertService.processSensorData(data);
  if (newAlert) {
    console.log(`[ALERT] New emergency: ${newAlert.id}`);
    broadcast({ type: 'alert_update', alerts: alertService.getAll() });
  }
});

serialService.on('connected', () => {
  dataStore.setConnected(true);
  broadcast({ type: 'connection_status', connected: true });
  console.log('[Serial] Arduino connected — broadcasting status');
});

serialService.on('disconnected', () => {
  dataStore.setConnected(false);
  broadcast({ type: 'connection_status', connected: false });
  console.warn('[Serial] Arduino disconnected — broadcasting status');
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
httpServer.listen(config.backendPort, () => {
  console.log(`\n[Server] CrisisLink backend running on http://localhost:${config.backendPort}`);
  console.log(`[Server] WebSocket ready on  ws://localhost:${config.backendPort}`);
  console.log(`[Server] REST API at        http://localhost:${config.backendPort}/api\n`);
});

// Start listening to the Arduino
serialService.start().catch((err) => {
  console.error('Failed to start serial service:', err);
});
