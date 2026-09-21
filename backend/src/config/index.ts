import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  /** Arduino serial port. Empty string = auto-detect. */
  arduinoPort: process.env.ARDUINO_PORT ?? '',

  /** HTTP + WebSocket server port */
  backendPort: parseInt(process.env.BACKEND_PORT ?? '3001', 10),

  /** Serial baud rate — must match Arduino sketch */
  baudRate: 9600,
} as const;
