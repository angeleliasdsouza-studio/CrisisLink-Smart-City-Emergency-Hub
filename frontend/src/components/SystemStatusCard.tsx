import { useEffect, useState } from 'react';
import { Cpu, Server, Wifi, Clock, WifiOff, AlertTriangle } from 'lucide-react';
import type { WsConnectionStatus } from '../types';

interface SystemStatusCardProps {
  wsStatus: WsConnectionStatus;
  arduinoConnected: boolean;
  lastTimestamp: string | null;
}

export default function SystemStatusCard({
  wsStatus,
  arduinoConnected,
  lastTimestamp,
}: SystemStatusCardProps) {
  const [lastUpdateText, setLastUpdateText] = useState('—');

  // Refresh "X seconds ago" display every second
  useEffect(() => {
    function update() {
      if (!lastTimestamp) { setLastUpdateText('—'); return; }
      const diff = Math.floor((Date.now() - new Date(lastTimestamp).getTime()) / 1000);
      if (diff < 5) setLastUpdateText('Just now');
      else if (diff < 60) setLastUpdateText(`${diff}s ago`);
      else setLastUpdateText(`${Math.floor(diff / 60)}m ago`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastTimestamp]);

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
      <h3 className="text-gray-300 text-xs font-semibold tracking-widest uppercase mb-4">
        System Status
      </h3>

      <div className="space-y-3">
        <StatusRow
          icon={<Cpu className="w-4 h-4" />}
          label="Arduino"
          ok={arduinoConnected}
          okText="CONNECTED"
          badText="DISCONNECTED"
          badIcon={<AlertTriangle className="w-3 h-3" />}
        />

        <StatusRow
          icon={<Server className="w-4 h-4" />}
          label="Backend"
          ok={wsStatus === 'connected'}
          okText="ONLINE"
          badText={wsStatus === 'reconnecting' ? 'RECONNECTING…' : 'OFFLINE'}
        />

        <StatusRow
          icon={<Wifi className="w-4 h-4" />}
          label="WebSocket"
          ok={wsStatus === 'connected'}
          okText="CONNECTED"
          badText={wsStatus === 'reconnecting' ? 'RECONNECTING…' : 'DISCONNECTED'}
        />

        <div className="flex items-center justify-between py-1 border-t border-gray-800 mt-2 pt-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            Last Update
          </div>
          <span className="text-gray-300 text-sm font-mono">{lastUpdateText}</span>
        </div>
      </div>

      {/* Disconnected warning */}
      {!arduinoConnected && (
        <div className="mt-4 p-3 rounded-lg bg-orange-900/30 border border-orange-700/40">
          <div className="flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-300 text-xs font-semibold">Arduino Disconnected</p>
              <p className="text-orange-300/70 text-[11px] mt-0.5 leading-relaxed">
                Reconnect the USB cable and the system will attempt to reconnect automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusRow({
  icon,
  label,
  ok,
  okText,
  badText,
  badIcon,
}: {
  icon: React.ReactNode;
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
  badIcon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        {icon}
        {label}
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          ok
            ? 'bg-green-900/50 text-green-400'
            : 'bg-red-900/50 text-red-400'
        }`}
      >
        {!ok && badIcon}
        {ok ? okText : badText}
      </div>
    </div>
  );
}
