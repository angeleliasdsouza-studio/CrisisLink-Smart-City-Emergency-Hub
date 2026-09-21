import { useState } from 'react';
import StatusBanner from '../components/StatusBanner';
import SensorCard from '../components/SensorCard';
import EmergencyCard from '../components/EmergencyCard';
import SystemStatusCard from '../components/SystemStatusCard';
import AlertHistory from '../components/AlertHistory';
import DemoControls from '../components/DemoControls';
import type { Alert, SensorData, WsConnectionStatus } from '../types';

interface DashboardProps {
  sensorData: SensorData | null;
  alerts: Alert[];
  wsStatus: WsConnectionStatus;
  arduinoConnected: boolean;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  onAlertsRefresh: () => void;
}

export default function Dashboard({
  sensorData,
  alerts,
  wsStatus,
  arduinoConnected,
  isDemoMode,
  onToggleDemoMode,
  onAlertsRefresh,
}: DashboardProps) {
  const activeAlert = alerts.find((a) => a.status !== 'RESOLVED') ?? null;
  const activeCount = alerts.filter((a) => a.status !== 'RESOLVED').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Active emergency count summary */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <StatusBanner
            sensorData={sensorData}
            activeEmergencyCount={activeCount}
            isDemoMode={isDemoMode}
          />
        </div>
        <div className="flex-shrink-0 text-center hidden sm:block">
          <div
            className={`text-4xl font-black tabular-nums ${
              activeCount > 0 ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {activeCount}
          </div>
          <div className="text-gray-500 text-[10px] font-semibold tracking-widest uppercase">
            Active
          </div>
        </div>
      </div>

      {/* Normal state location preview */}
      {!activeAlert && sensorData && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Hostel Block A — All Clear
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-500 text-xs block">Temperature</span>
              <span className="text-white font-medium">
                {sensorData.temperature !== null ? `${sensorData.temperature}°C` : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Humidity</span>
              <span className="text-white font-medium">
                {sensorData.humidity !== null ? `${sensorData.humidity}%` : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Vibration</span>
              <span className="text-white font-medium">{sensorData?.vibration ?? '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active emergency card */}
      {activeAlert && (
        <EmergencyCard
          alert={activeAlert}
          onUpdated={onAlertsRefresh}
        />
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          <SensorCard sensorData={sensorData} isDemoMode={isDemoMode} />
          <AlertHistory alerts={alerts} />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <SystemStatusCard
            wsStatus={wsStatus}
            arduinoConnected={arduinoConnected}
            lastTimestamp={sensorData?.timestamp ?? null}
          />
          <DemoControls
            isDemoMode={isDemoMode}
            onToggleDemoMode={onToggleDemoMode}
          />
        </div>
      </div>
    </main>
  );
}
