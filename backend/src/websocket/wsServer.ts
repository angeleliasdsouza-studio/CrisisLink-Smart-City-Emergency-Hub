import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WsMessage } from '../models/types';

// ─────────────────────────────────────────────
// WebSocket Server
//
// Attached to the existing HTTP server so both
// REST and WS share the same port.
//
// Broadcasts structured messages to ALL connected
// browser clients on every Arduino reading.
// ─────────────────────────────────────────────

let wss: WebSocketServer | null = null;

export function createWsServer(httpServer: Server): WebSocketServer {
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected');

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });

    // Send a ping every 30 seconds to keep the connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30_000);

    ws.on('close', () => clearInterval(pingInterval));
  });

  console.log('[WS] WebSocket server ready');
  return wss;
}

/** Broadcast a message to all connected WebSocket clients */
export function broadcast(message: WsMessage): void {
  if (!wss) return;

  const payload = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
