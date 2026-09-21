import { CheckCircle, AlertOctagon } from 'lucide-react';
import type { SensorData } from '../types';

interface StatusBannerProps {
  sensorData: SensorData | null;
  activeEmergencyCount: number;
  isDemoMode: boolean;
}

export default function StatusBanner({
  sensorData,
  activeEmergencyCount,
  isDemoMode,
}: StatusBannerProps) {
  const isEmergency = sensorData?.status === 'EMERGENCY' || activeEmergencyCount > 0;

  if (isEmergency) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-red-950/60 px-5 py-4 flex items-start gap-4">
        {/* Pulsing icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
            <AlertOctagon className="relative w-7 h-7 text-red-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-red-400 font-bold text-xl tracking-wide">
              🔴 ACTIVE EMERGENCY
            </h2>
            {isDemoMode && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                DEMO
              </span>
            )}
          </div>
          <p className="text-red-300/80 text-sm mt-0.5">
            {activeEmergencyCount} active alert{activeEmergencyCount !== 1 ? 's' : ''} require
            {activeEmergencyCount === 1 ? 's' : ''} attention.
          </p>
        </div>

        <div className="flex-shrink-0 text-right hidden sm:block">
          <div className="text-red-300 text-xs font-mono bg-red-900/50 px-2 py-1 rounded">
            SOURCE: {isDemoMode ? 'DEMO MODE' : 'ARDUINO USB'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-green-500/30 bg-green-950/40 px-5 py-4 flex items-start gap-4">
      <div className="flex-shrink-0 mt-0.5">
        <CheckCircle className="w-7 h-7 text-green-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-green-400 font-bold text-xl tracking-wide">
            🟢 SYSTEM NORMAL
          </h2>
          {isDemoMode && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
              DEMO
            </span>
          )}
        </div>
        <p className="text-green-300/70 text-sm mt-0.5">
          No active emergencies detected. All sensors reporting normal.
        </p>
      </div>

      <div className="flex-shrink-0 text-right hidden sm:block">
        <div className="text-green-300 text-xs font-mono bg-green-900/30 px-2 py-1 rounded">
          SOURCE: {isDemoMode ? 'DEMO MODE' : 'ARDUINO USB'}
        </div>
      </div>
    </div>
  );
}
