import { NavLink } from 'react-router-dom';
import { Activity, AlertTriangle, Settings, Wifi, WifiOff, Radio } from 'lucide-react';
import type { WsConnectionStatus } from '../types';

interface HeaderProps {
  wsStatus: WsConnectionStatus;
  arduinoConnected: boolean;
  activeEmergencyCount: number;
  isDemoMode: boolean;
}

export default function Header({
  wsStatus,
  arduinoConnected,
  activeEmergencyCount,
  isDemoMode,
}: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-red-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none tracking-wider">
                CRISISLINK
              </div>
              <div className="text-gray-400 text-[10px] tracking-widest uppercase">
                Smart City Emergency Hub
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Demo badge */}
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Radio className="w-3 h-3" />
                DEMO MODE
              </span>
            )}

            {/* Active emergency count */}
            {activeEmergencyCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs font-bold">
                  {activeEmergencyCount} EMERGENCY
                </span>
              </div>
            )}

            {/* WS / Arduino status */}
            <ConnectionBadgeSmall wsStatus={wsStatus} arduinoConnected={arduinoConnected} />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-1 pb-0 -mb-px">
          {[
            { to: '/', label: 'Dashboard', icon: Activity },
            { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
            { to: '/system', label: 'System', icon: Settings },
          ].map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
                  isActive
                    ? 'border-red-500 text-white font-medium'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ── Compact connection badge for the header ────────────────────
function ConnectionBadgeSmall({
  wsStatus,
  arduinoConnected,
}: {
  wsStatus: WsConnectionStatus;
  arduinoConnected: boolean;
}) {
  if (wsStatus === 'reconnecting' || wsStatus === 'connecting') {
    return (
      <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium">
        <WifiOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">RECONNECTING…</span>
      </div>
    );
  }

  if (!arduinoConnected) {
    return (
      <div className="flex items-center gap-1.5 text-orange-400 text-xs font-medium">
        <WifiOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">ARDUINO OFFLINE</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
      <Wifi className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">LIVE</span>
    </div>
  );
}
