import { useEffect, useState } from 'react';
import { Cpu, Server, Wifi, Clock, Hash, Gauge } from 'lucide-react';
import { fetchHealth } from '../services/api';
import type { WsConnectionStatus } from '../types';

interface SystemPageProps {
  wsStatus: WsConnectionStatus;
  arduinoConnected: boolean;
  lastTimestamp: string | null;
}

interface HealthData {
  server: string;
  arduino: string;
  port: string | null;
}

export default function SystemPage({
  wsStatus,
  arduinoConnected,
  lastTimestamp,
}: SystemPageProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [lastUpdate, setLastUpdate] = useState('—');

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => {});
    const id = setInterval(() => fetchHealth().then(setHealth).catch(() => {}), 10_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function update() {
      if (!lastTimestamp) { setLastUpdate('—'); return; }
      const diff = Math.floor((Date.now() - new Date(lastTimestamp).getTime()) / 1000);
      if (diff < 5) setLastUpdate('Just now');
      else if (diff < 60) setLastUpdate(`${diff} seconds ago`);
      else setLastUpdate(`${Math.floor(diff / 60)} minutes ago`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastTimestamp]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-white font-bold text-xl tracking-wide">System Information</h1>
        <p className="text-gray-400 text-sm mt-1">
          Hardware and software connection status for CrisisLink.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={<Cpu className="w-5 h-5 text-blue-400" />}
          label="Arduino"
          value={arduinoConnected ? 'CONNECTED' : 'DISCONNECTED'}
          valueClass={arduinoConnected ? 'text-green-400' : 'text-red-400'}
        />
        <InfoCard
          icon={<Hash className="w-5 h-5 text-gray-400" />}
          label="Serial Port"
          value={health?.port ?? (arduinoConnected ? 'Detecting…' : 'Not connected')}
          valueClass="text-white font-mono"
        />
        <InfoCard
          icon={<Gauge className="w-5 h-5 text-purple-400" />}
          label="Baud Rate"
          value="9600"
          valueClass="text-white font-mono"
        />
        <InfoCard
          icon={<Server className="w-5 h-5 text-cyan-400" />}
          label="Backend"
          value={health?.server ?? 'Checking…'}
          valueClass={health?.server === 'OK' ? 'text-green-400' : 'text-red-400'}
        />
        <InfoCard
          icon={<Wifi className="w-5 h-5 text-green-400" />}
          label="WebSocket"
          value={
            wsStatus === 'connected'
              ? 'CONNECTED'
              : wsStatus === 'reconnecting'
              ? 'RECONNECTING…'
              : 'DISCONNECTED'
          }
          valueClass={
            wsStatus === 'connected'
              ? 'text-green-400'
              : wsStatus === 'reconnecting'
              ? 'text-yellow-400'
              : 'text-red-400'
          }
        />
        <InfoCard
          icon={<Clock className="w-5 h-5 text-orange-400" />}
          label="Last Sensor Update"
          value={lastUpdate}
          valueClass="text-white"
        />
      </div>

      {/* Protocol info */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <h2 className="text-gray-300 text-xs font-semibold tracking-widest uppercase mb-4">
          Arduino Serial Protocol
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="text-gray-500 w-28 flex-shrink-0">Format</span>
            <code className="text-green-300 font-mono text-xs break-all">
              TEMP:27.0|HUMIDITY:61|VIBRATION:LOW|STATUS:NORMAL
            </code>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-28 flex-shrink-0">Emergency</span>
            <code className="text-red-300 font-mono text-xs break-all">
              TEMP:39.0|HUMIDITY:58|VIBRATION:HIGH|STATUS:EMERGENCY
            </code>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-28 flex-shrink-0">Interval</span>
            <span className="text-white">~500 ms</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-28 flex-shrink-0">Baud Rate</span>
            <span className="text-white font-mono">9600</span>
          </div>
        </div>
      </div>

      {/* Port config instructions */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <h2 className="text-gray-300 text-xs font-semibold tracking-widest uppercase mb-3">
          Configure Arduino Port
        </h2>
        <p className="text-gray-400 text-sm mb-3">
          Edit <code className="text-gray-200 bg-gray-800 px-1 rounded">backend/.env</code> to set
          the port manually, or leave it blank for auto-detection.
        </p>
        <pre className="text-green-300 text-xs bg-gray-800 rounded-lg p-3 overflow-x-auto">
{`# Windows
ARDUINO_PORT=COM3

# Linux
ARDUINO_PORT=/dev/ttyUSB0

# macOS
ARDUINO_PORT=/dev/cu.usbmodem14201

# Leave blank for auto-detection
ARDUINO_PORT=`}
        </pre>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 flex items-center gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-gray-500 text-xs font-semibold tracking-wider uppercase">
          {label}
        </div>
        <div className={`text-base font-bold mt-0.5 truncate ${valueClass ?? 'text-white'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
