import { useState } from 'react';
import { Radio, Play, RotateCcw, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { setDemoMode, triggerDemoEmergency, resetDemoNormal } from '../services/api';

interface DemoControlsProps {
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
}

export default function DemoControls({ isDemoMode, onToggleDemoMode }: DemoControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  async function handleToggle() {
    setLoading('toggle');
    setError(null);
    try {
      await setDemoMode(!isDemoMode);
      onToggleDemoMode(!isDemoMode);
      setLastAction(isDemoMode ? 'Exited demo mode' : 'Entered demo mode');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function handleTriggerEmergency() {
    setLoading('trigger');
    setError(null);
    try {
      await triggerDemoEmergency();
      setLastAction('Emergency triggered');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function handleReset() {
    setLoading('reset');
    setError(null);
    try {
      await resetDemoNormal();
      setLastAction('Reset to NORMAL');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        isDemoMode
          ? 'border-amber-500/40 bg-amber-950/20'
          : 'border-gray-700 bg-gray-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isDemoMode ? 'text-amber-400' : 'text-gray-500'}`} />
          <h3 className={`text-xs font-semibold tracking-widest uppercase ${
            isDemoMode ? 'text-amber-400' : 'text-gray-400'
          }`}>
            Demo Mode
          </h3>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={loading !== null}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            isDemoMode
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          } disabled:opacity-50`}
        >
          {isDemoMode ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
          {loading === 'toggle' ? 'Switching…' : isDemoMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs leading-relaxed mb-4">
        Demo mode simulates Arduino sensor data without real hardware. Useful for
        presentations and testing.
      </p>

      {/* Demo action buttons (only shown when demo is active) */}
      {isDemoMode && (
        <div className="space-y-2">
          <button
            onClick={handleTriggerEmergency}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            <Zap className="w-4 h-4" />
            {loading === 'trigger' ? 'Triggering…' : 'Trigger Emergency'}
          </button>

          <button
            onClick={handleReset}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {loading === 'reset' ? 'Resetting…' : 'Reset to Normal'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-red-400 text-xs bg-red-900/30 p-2 rounded">{error}</p>
      )}

      {/* Last action */}
      {lastAction && !error && (
        <p className="mt-3 text-gray-400 text-xs flex items-center gap-1">
          <Play className="w-3 h-3" />
          {lastAction}
        </p>
      )}
    </div>
  );
}
