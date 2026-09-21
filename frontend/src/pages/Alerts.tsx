import AlertHistory from '../components/AlertHistory';
import EmergencyCard from '../components/EmergencyCard';
import type { Alert } from '../types';

interface AlertsPageProps {
  alerts: Alert[];
  onAlertsRefresh: () => void;
}

export default function AlertsPage({ alerts, onAlertsRefresh }: AlertsPageProps) {
  const active = alerts.filter((a) => a.status !== 'RESOLVED');
  const resolved = alerts.filter((a) => a.status === 'RESOLVED');

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-white font-bold text-xl tracking-wide">Alert Management</h1>
        <p className="text-gray-400 text-sm mt-1">
          View and manage all emergency alerts. Active alerts require acknowledgement and resolution.
        </p>
      </div>

      {/* Active alerts */}
      <section>
        <h2 className="text-red-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Active Alerts ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
            <p className="text-green-400 text-lg font-semibold">✓ No active alerts</p>
            <p className="text-gray-500 text-sm mt-1">All clear. System is operating normally.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((alert) => (
              <EmergencyCard key={alert.id} alert={alert} onUpdated={onAlertsRefresh} />
            ))}
          </div>
        )}
      </section>

      {/* Resolved history */}
      <section>
        <h2 className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Resolved History ({resolved.length})
        </h2>
        <AlertHistory alerts={resolved} />
      </section>
    </main>
  );
}
