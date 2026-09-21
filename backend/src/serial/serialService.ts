import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { EventEmitter } from 'events';
import { config } from '../config';
import type { SensorData } from '../models/types';

// ─────────────────────────────────────────────
// Serial Service
//
// Responsibilities:
//  1. Auto-detect the Arduino serial port.
//  2. Open the port at 9600 baud.
//  3. Parse every line in the format:
//       TEMP:27.0|HUMIDITY:61|VIBRATION:LOW|STATUS:NORMAL
//  4. Emit "sensorData" events with parsed SensorData objects.
//  5. Emit "connected" / "disconnected" events.
//  6. Reconnect automatically if the Arduino is unplugged.
// ─────────────────────────────────────────────

/** Keywords used to identify Arduino/USB serial devices */
const ARDUINO_IDENTIFIERS = [
  'arduino',
  'usbmodem',
  'usbserial',
  'ttyacm',
  'ttyusb',
  'ch340',
  'cp210',
  'ftdi',
  'wch',
];

class SerialService extends EventEmitter {
  private port: SerialPort | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private detectedPort = '';

  /** Start the service: detect port then connect */
  async start(): Promise<void> {
    printBanner();
    const portPath = await this.resolvePort();

    if (!portPath) {
      printNoArduino();
      this.scheduleReconnect();
      return;
    }

    this.detectedPort = portPath;
    this.connect(portPath);
  }

  /** Find the port to use: env variable → auto-detect */
  private async resolvePort(): Promise<string | null> {
    // Manual override via environment variable
    if (config.arduinoPort) {
      console.log(`Using configured port: ${config.arduinoPort}`);
      return config.arduinoPort;
    }

    return this.autoDetect();
  }

  /** Scan available serial ports and pick the most likely Arduino one */
  private async autoDetect(): Promise<string | null> {
    console.log('Searching for Arduino...');

    let ports: Awaited<ReturnType<typeof SerialPort.list>>;
    try {
      ports = await SerialPort.list();
    } catch (err) {
      console.error('Failed to list serial ports:', err);
      return null;
    }

    if (ports.length === 0) {
      console.log('No serial ports found.');
      return null;
    }

    // Prefer ports whose path or description matches known Arduino identifiers
    const arduino = ports.find((p) => {
      const text = `${p.path} ${p.manufacturer ?? ''} ${p.pnpId ?? ''}`.toLowerCase();
      return ARDUINO_IDENTIFIERS.some((id) => text.includes(id));
    });

    if (arduino) {
      console.log(`Arduino detected on ${arduino.path}`);
      return arduino.path;
    }

    // Fallback: return the first available COM/tty port
    const fallback = ports[0];
    console.log(`No Arduino identifier found. Trying first available port: ${fallback.path}`);
    return fallback.path;
  }

  /** Open a serial connection to the given port */
  private connect(portPath: string): void {
    console.log(`\nOpening serial port: ${portPath}`);
    console.log(`Baud rate: ${config.baudRate}\n`);

    this.port = new SerialPort({
      path: portPath,
      baudRate: config.baudRate,
      autoOpen: false,
    });

    const parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

    // ── Open ──────────────────────────────────
    this.port.open((err) => {
      if (err) {
        console.error(`Failed to open ${portPath}: ${err.message}`);
        this.handleDisconnect();
        return;
      }
      this.isConnected = true;
      console.log('Serial connection established');
      console.log('Waiting for sensor data...\n');
      this.emit('connected');
    });

    // ── Data ──────────────────────────────────
    parser.on('data', (line: string) => {
      const data = parseLine(line.trim());
      if (data) {
        this.emit('sensorData', data);
      }
    });

    // ── Disconnect ────────────────────────────
    this.port.on('close', () => {
      console.warn('\nArduino disconnected.');
      this.handleDisconnect();
    });

    this.port.on('error', (err) => {
      console.error(`Serial error: ${err.message}`);
      this.handleDisconnect();
    });
  }

  private handleDisconnect(): void {
    if (this.isConnected) {
      this.isConnected = false;
      this.emit('disconnected');
    }
    this.port?.removeAllListeners();
    this.port = null;
    this.scheduleReconnect();
  }

  /** Try to reconnect every 5 seconds */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return; // already scheduled
    console.log('Reconnect attempt in 5 seconds...');
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      await this.start();
    }, 5000);
  }

  getConnectedPort(): string {
    return this.isConnected ? this.detectedPort : '';
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// ─────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────

/**
 * Parse a raw Arduino serial line into a SensorData object.
 *
 * Expected format:
 *   TEMP:27.0|HUMIDITY:61|VIBRATION:LOW|STATUS:NORMAL
 *
 * Returns null if the line does not match the expected format.
 */
function parseLine(line: string): SensorData | null {
  if (!line || !line.includes('|')) return null;

  const parts = line.split('|');
  const map: Record<string, string> = {};

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) return null;
    const key = part.slice(0, colonIdx).trim();
    const val = part.slice(colonIdx + 1).trim();
    map[key] = val;
  }

  // Validate required keys
  if (!('TEMP' in map && 'HUMIDITY' in map && 'VIBRATION' in map && 'STATUS' in map)) {
    return null;
  }

  const temperature = map['TEMP'] === 'ERR' ? null : parseFloat(map['TEMP']);
  const humidity = map['HUMIDITY'] === 'ERR' ? null : parseInt(map['HUMIDITY'], 10);
  const vibration = map['VIBRATION'] === 'HIGH' ? 'HIGH' : 'LOW';
  const status = map['STATUS'] === 'EMERGENCY' ? 'EMERGENCY' : 'NORMAL';

  // Guard against NaN
  if (map['TEMP'] !== 'ERR' && isNaN(temperature as number)) return null;
  if (map['HUMIDITY'] !== 'ERR' && isNaN(humidity as number)) return null;

  return {
    temperature: isNaN(temperature as number) ? null : (temperature as number),
    humidity: isNaN(humidity as number) ? null : (humidity as number),
    vibration,
    status,
    timestamp: new Date().toISOString(),
    connected: true,
  };
}

// ─────────────────────────────────────────────
// Console output helpers
// ─────────────────────────────────────────────

function printBanner(): void {
  console.log('\nCrisisLink Backend');
  console.log('─'.repeat(36));
}

function printNoArduino(): void {
  console.warn('No Arduino detected.\n');
  console.warn('Please:');
  console.warn('  1. Connect Arduino through USB');
  console.warn('  2. Check the USB cable');
  console.warn('  3. Verify the serial port (set ARDUINO_PORT in .env)');
  console.warn('\nThe server will keep trying to reconnect...\n');
}

// ─────────────────────────────────────────────
// Singleton export
// ─────────────────────────────────────────────
export const serialService = new SerialService();
