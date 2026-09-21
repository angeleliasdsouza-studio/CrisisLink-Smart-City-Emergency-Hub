import { Clock, CheckCheck, XCircle, AlertOctagon } from 'lucide-react';
import type { Alert } from '../types';

interface AlertHistoryProps {
  alerts: Alert[];
}

export default function AlertHistory({ alerts }: AlertHistoryProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <h3 className="text-gray-300 text-xs font-semibold tracking-widest uppercase mb-4">
          Alert History
        </h3>
        <p className="text-gray-500 text-sm text-center py-6">
          No alerts recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
      <h3 className="text-gray-300 text-xs font-semibold tracking-widest uppercase mb-4">
        Alert History
        <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 text-[10px] font-bold">
          {alerts.length}
        </span>
      </h3>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  const statusCfg = {
    UNRESOLVED: {
      color: 'text-red-400',
      bg: 'bg-red-900/30 border-red-800/50',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-red-400" />,
    },
    ACKNOWLEDGED: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20 border-yellow-800/40',
      icon: <CheckCheck className="w-3.5 h-3.5 text-yellow-400" />,
    },
    RESOLVED: {
      color: 'text-green-400',
      bg: 'bg-gray-800/60 border-gray-700/50',
      icon: <XCircle className="w-3.5 h-3.5 text-green-400" />,
    },
  }[alert.status];

  return (
    <div className={`rounded-lg border p-3 ${statusCfg.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-white text-sm font-semibold truncate">
              {alert.location}
            </span>
            {alert.isDemo && (
              <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400 font-bold flex-shrink-0">
                DEMO
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs">{alert.type}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {alert.temperature !== null && (
              <span className="text-gray-300 text-xs">
                {alert.temperature}°C
              </span>
            )}
            <span
              className={`text-xs font-medium ${
                alert.vibration === 'HIGH' ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {alert.vibration} vibration
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className={`flex items-center gap-1 text-[11px] font-bold ${statusCfg.color}`}>
            {statusCfg.icon}
            {alert.status}
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-[10px]">
            <Clock className="w-3 h-3" />
            {formatTime(alert.createdAt)}
          </div>
        </div>
      </div>

      {alert.resolvedAt && (
        <p className="text-gray-500 text-[10px] mt-1.5 border-t border-gray-700 pt-1.5">
          Resolved at {formatTime(alert.resolvedAt)}
        </p>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
