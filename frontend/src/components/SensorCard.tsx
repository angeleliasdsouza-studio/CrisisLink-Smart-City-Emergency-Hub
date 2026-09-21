import { Thermometer, Droplets, Vibrate, AlertTriangle, CheckCircle } from 'lucide-react';
import type { SensorData } from '../types';

interface SensorCardProps {
  sensorData: SensorData | null;
  isDemoMode: boolean;
}

export default function SensorCard({ sensorData, isDemoMode }: SensorCardProps) {
  const isEmergency = sensorData?.status === 'EMERGENCY';

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        isEmergency
          ? 'border-red-500/50 bg-gray-900'
          : 'border-gray-700 bg-gray-900'
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 text-xs font-semibold tracking-widest uppercase">
          Live Sensor Data
        </h3>
        {isDemoMode && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold tracking-wide">
            DEMO
          </span>
        )}
      </div>

      {sensorData ? (
        <div className="grid grid-cols-2 gap-3">
          {/* Temperature */}
          <Metric
            icon={<Thermometer className="w-4 h-4 text-orange-400" />}
            label="Temperature"
            value={
              sensorData.temperature !== null
                ? `${sensorData.temperature}°C`
                : 'ERR'
            }
            danger={
              sensorData.temperature !== null && sensorData.temperature >= 38
            }
          />

          {/* Humidity */}
          <Metric
            icon={<Droplets className="w-4 h-4 text-blue-400" />}
            label="Humidity"
            value={
              sensorData.humidity !== null ? `${sensorData.humidity}%` : 'ERR'
            }
          />

          {/* Vibration */}
          <Metric
            icon={<Vibrate className="w-4 h-4 text-purple-400" />}
            label="Vibration"
            value={sensorData.vibration}
            danger={sensorData.vibration === 'HIGH'}
          />

          {/* System status */}
          <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-semibold tracking-wider uppercase">
              {isEmergency ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              )}
              System
            </div>
            <div
              className={`text-base font-bold tracking-wider ${
                isEmergency ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {sensorData.status}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-sm text-center py-6">
          Waiting for sensor data…
        </div>
      )}
    </div>
  );
}

// ── Individual metric cell ─────────────────────────────────────
function Metric({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-semibold tracking-wider uppercase">
        {icon}
        {label}
      </div>
      <div
        className={`text-xl font-bold tabular-nums ${
          value === 'ERR'
            ? 'text-gray-500'
            : danger
            ? 'text-red-400'
            : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
