import { useState } from 'react';
import {
  MapPin,
  AlertOctagon,
  Thermometer,
  Vibrate,
  Clock,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import type { Alert } from '../types';
import { acknowledgeAlert, resolveAlert } from '../services/api';

interface EmergencyCardProps {
  alert: Alert;
  onUpdated: () => void;
}

export default function EmergencyCard({ alert, onUpdated }: EmergencyCardProps) {
  const [loading, setLoading] = useState<'ack' | 'resolve' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAcknowledge() {
    setLoading('ack');
    setError(null);
    try {
      await acknowledgeAlert(alert.id);
      onUpdated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function handleResolve() {
    setLoading('resolve');
    setError(null);
    try {
      await resolveAlert(alert.id);
      onUpdated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-red-500/50 bg-red-950/30 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-25 animate-ping" />
            <AlertOctagon className="relative w-5 h-5 text-red-400" />
          </div>
          <span className="text-red-400 font-bold text-sm tracking-wider uppercase">
            Active Emergency
          </span>
          {alert.isDemo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
              DEMO
            </span>
          )}
        </div>
        <StatusBadge status={alert.status} />
      </div>

      {/* Location + type */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-white font-bold text-lg">
          <MapPin className="w-4 h-4 text-red-400" />
          {alert.location.toUpperCase()}
        </div>
        <div className="text-red-300/80 text-sm ml-5">{alert.type}</div>
      </div>

      {/* Sensor values */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        <InfoChip
          icon={<Thermometer className="w-3.5 h-3.5 text-orange-400" />}
          label="Temperature"
          value={alert.temperature !== null ? `${alert.temperature}°C` : 'ERR'}
          danger={alert.temperature !== null && alert.temperature >= 38}
        />
        <InfoChip
          icon={<Vibrate className="w-3.5 h-3.5 text-purple-400" />}
          label="Vibration"
          value={alert.vibration}
          danger={alert.vibration === 'HIGH'}
        />
        <InfoChip
          icon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
          label="Detected"
          value={formatTime(alert.createdAt)}
        />
      </div>

      {/* Acknowledged time */}
      {alert.acknowledgedAt && (
        <p className="text-xs text-gray-400 mb-3">
          Acknowledged at {formatTime(alert.acknowledgedAt)}
        </p>
      )}

      {/* Error */}
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {alert.status === 'UNRESOLVED' && (
          <button
            onClick={handleAcknowledge}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {loading === 'ack' ? 'Acknowledging…' : 'Acknowledge'}
          </button>
        )}
        {alert.status !== 'RESOLVED' && (
          <button
            onClick={handleResolve}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            <XCircle className="w-4 h-4" />
            {loading === 'resolve' ? 'Resolving…' : 'Resolve Alert'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Alert['status'] }) {
  const cfg = {
    UNRESOLVED: 'bg-red-600/30 text-red-300 border-red-600/50',
    ACKNOWLEDGED: 'bg-yellow-600/30 text-yellow-300 border-yellow-600/50',
    RESOLVED: 'bg-green-600/30 text-green-300 border-green-600/50',
  }[status];

  return (
    <span className={`text-[11px] px-2 py-0.5 rounded border font-bold tracking-wider ${cfg}`}>
      {status}
    </span>
  );
}

function InfoChip({
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
    <div className="bg-gray-900/70 rounded-lg p-2.5">
      <div className="flex items-center gap-1 text-gray-500 text-[10px] font-semibold tracking-wider uppercase mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-sm font-bold ${danger ? 'text-red-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
