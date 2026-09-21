import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AlertsPage from './pages/Alerts';
import SystemPage from './pages/System';

export default function App() {
  const { sensorData, alerts, wsStatus, arduinoConnected, refreshAlerts } =
    useWebSocket();

  const [isDemoMode, setIsDemoMode] = useState(false);

  const activeCount = alerts.filter((a) => a.status !== 'RESOLVED').length;

  function handleToggleDemoMode(enabled: boolean) {
    setIsDemoMode(enabled);
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Header
          wsStatus={wsStatus}
          arduinoConnected={arduinoConnected}
          activeEmergencyCount={activeCount}
          isDemoMode={isDemoMode}
        />

        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                sensorData={sensorData}
                alerts={alerts}
                wsStatus={wsStatus}
                arduinoConnected={arduinoConnected}
                isDemoMode={isDemoMode}
                onToggleDemoMode={handleToggleDemoMode}
                onAlertsRefresh={refreshAlerts}
              />
            }
          />
          <Route
            path="/alerts"
            element={
              <AlertsPage alerts={alerts} onAlertsRefresh={refreshAlerts} />
            }
          />
          <Route
            path="/system"
            element={
              <SystemPage
                wsStatus={wsStatus}
                arduinoConnected={arduinoConnected}
                lastTimestamp={sensorData?.timestamp ?? null}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
