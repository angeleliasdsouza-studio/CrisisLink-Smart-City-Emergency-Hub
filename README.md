# CrisisLink — Smart City Emergency Hub

A real-time emergency monitoring dashboard for Arduino-based smart city sensor nodes.

```
Arduino UNO ──USB Serial──► Node.js Backend ──WebSocket──► React Dashboard
(DHT11 + MPU-6050)            (Express + ws)               (Vite + Tailwind)
```

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js     | 18 or later |
| npm         | 9 or later |
| Arduino IDE | For uploading the sketch |
| Browser     | Chrome, Firefox, Edge |

---

## Hardware

- Arduino UNO
- DHT11 temperature/humidity sensor
- MPU-6050 accelerometer/vibration sensor
- Red LED (pin 8)
- Green LED (pin 9)
- Passive buzzer (pin 10)
- USB cable (Arduino → Computer)

---

## Project Structure

```
crisislink/
├── backend/               Node.js backend
│   ├── src/
│   │   ├── config/        Environment config
│   │   ├── models/        TypeScript types
│   │   ├── serial/        Arduino serial listener & parser
│   │   ├── services/      Alert state machine, data store
│   │   ├── websocket/     WebSocket broadcast server
│   │   ├── api/           REST API routes
│   │   └── server.ts      Entry point
│   ├── .env               Environment variables
│   └── package.json
├── frontend/              React dashboard
│   ├── src/
│   │   ├── components/    UI components
│   │   ├── hooks/         useWebSocket hook
│   │   ├── pages/         Dashboard, Alerts, System
│   │   ├── services/      API client
│   │   └── types/         TypeScript types
│   └── package.json
├── package.json           Root — concurrently script
└── README.md
```

---

## Installation

### 1. Install all dependencies

From the project root:

```bash
npm run install:all
```

This installs root, backend, and frontend dependencies in one command.

Or manually:

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Arduino Setup

### Upload the Sketch

1. Open Arduino IDE
2. Open the provided `.ino` sketch file
3. Connect your Arduino UNO via USB
4. Select the correct **Board**: `Arduino UNO`
5. Select the correct **Port** (e.g., `COM3`)
6. Click **Upload**

### Verify Serial Output

Open the Arduino IDE Serial Monitor at **9600 baud**. You should see:

```
TEMP:27.0|HUMIDITY:61|VIBRATION:LOW|STATUS:NORMAL
TEMP:27.0|HUMIDITY:61|VIBRATION:LOW|STATUS:NORMAL
```

---

## Find Your Arduino Serial Port

### Windows

1. Open Arduino IDE
2. Go to **Tools → Port**
3. Note the port — usually `COM3`, `COM4`, or `COM5`

Or in Device Manager: look under **Ports (COM & LPT)** for `USB Serial Device`.

### Linux

```bash
ls /dev/ttyUSB* /dev/ttyACM*
```

Usually `/dev/ttyUSB0` or `/dev/ttyACM0`.

### macOS

```bash
ls /dev/cu.*
```

Usually `/dev/cu.usbmodem...` or `/dev/cu.usbserial...`.

---

## Configure the Arduino Port

Edit `backend/.env`:

```env
# Leave blank for auto-detection (recommended)
ARDUINO_PORT=

# Or set explicitly (Windows example)
ARDUINO_PORT=COM3

# Linux example
ARDUINO_PORT=/dev/ttyUSB0

# macOS example
ARDUINO_PORT=/dev/cu.usbmodem14201

# Backend port
BACKEND_PORT=3001
```

> **Auto-detection**: If `ARDUINO_PORT` is blank, the backend will scan all available serial ports and pick the most likely Arduino device automatically.

---

## Run the Application

### Option A — One command (recommended)

From the project root:

```bash
npm run dev
```

This starts both the backend and frontend simultaneously using `concurrently`.

### Option B — Two terminals

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

---

## Open the Dashboard

Once both servers are running, open your browser:

```
http://localhost:5173
```

### Pages

| URL | Description |
|-----|-------------|
| `http://localhost:5173/` | Main dashboard |
| `http://localhost:5173/alerts` | Alert management |
| `http://localhost:5173/system` | System information |

---

## Demo Mode

If the Arduino is not connected, use **Demo Mode** to simulate sensor data:

1. Open the dashboard → `http://localhost:5173`
2. In the right sidebar, click **Demo Mode → ON**
3. Click **Trigger Emergency** to simulate an emergency
4. Click **Acknowledge** and then **Resolve Alert**
5. Click **Reset to Normal** to return to normal state

Demo data is clearly labelled `DEMO` so it is never confused with real Arduino readings.

---

## REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server and Arduino status |
| GET | `/api/status` | Current sensor reading |
| GET | `/api/alerts` | All alerts (newest first) |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| POST | `/api/alerts/:id/resolve` | Resolve an alert |
| POST | `/api/demo/mode` | `{ "enabled": true/false }` |
| POST | `/api/demo/trigger` | Simulate emergency |
| POST | `/api/demo/normal` | Reset to normal |

---

## Serial Protocol

The backend parses this exact format from the Arduino:

```
TEMP:27.0|HUMIDITY:61|VIBRATION:LOW|STATUS:NORMAL
TEMP:39.0|HUMIDITY:58|VIBRATION:HIGH|STATUS:EMERGENCY
```

| Field | Values |
|-------|--------|
| TEMP | `27.0`, `39.0`, `ERR` |
| HUMIDITY | `61`, `58`, `ERR` |
| VIBRATION | `LOW`, `HIGH` |
| STATUS | `NORMAL`, `EMERGENCY` |

---

## Troubleshooting

### "No Arduino detected"

- Check USB cable connection
- Verify Arduino IDE shows the correct port under Tools → Port
- Set `ARDUINO_PORT=COM3` (or your port) in `backend/.env`
- Restart the backend

### "Cannot find module 'serialport'"

```bash
cd backend
npm install
```

### Dashboard not updating

- Check that the backend is running on port 3001
- Check browser console for WebSocket errors
- Verify `http://localhost:3001/api/health` returns `{"server":"OK",...}`

### DHT11 shows ERR

- Check DHT11 wiring (data pin → Arduino pin 2)
- The backend handles `ERR` gracefully — the dashboard shows `ERR` instead of a value

---

## Emergency Alert Lifecycle

```
Arduino STATUS:NORMAL
         │
         │ (vibration or temperature threshold exceeded)
         ▼
Arduino STATUS:EMERGENCY
         │
         │ (backend detects NORMAL→EMERGENCY transition)
         ▼
     UNRESOLVED  ◄── Dashboard shows emergency card
         │
         │ (user clicks Acknowledge)
         ▼
    ACKNOWLEDGED
         │
         │ (user clicks Resolve Alert)
         ▼
      RESOLVED   ◄── Moved to alert history
         │
         │ (system resets — next emergency creates new alert)
         ▼
Arduino STATUS:NORMAL
```

---

## License

Educational project — WMC Smart City Emergency Monitoring System.
