import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoModeBar } from './components/DemoModeBar';
import { VoiceAssistant } from './components/VoiceAssistant';
import { MedicalDisclaimer } from './components/MedicalDisclaimer';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { NursePriorityPage } from './pages/NursePriorityPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { VitalPassPage } from './pages/VitalPassPage';
import { AccessLogsPage } from './pages/AccessLogsPage';
import { DevicesPage } from './pages/DevicesPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { FuturePage } from './pages/FuturePage';
import { SettingsPage } from './pages/SettingsPage';

// Patient Portal Pages
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';
import { PatientHealthPage } from './pages/patient/PatientHealthPage';
import { PatientDevicesPage } from './pages/patient/PatientDevicesPage';
import { PatientReportsPage } from './pages/patient/PatientReportsPage';
import { PatientMedicationsPage } from './pages/patient/PatientMedicationsPage';
import { PatientVitalPassPage } from './pages/patient/PatientVitalPassPage';
import { PatientVitalCirclePage } from './pages/patient/PatientVitalCirclePage';
import { PatientPermissionsPage } from './pages/patient/PatientPermissionsPage';
import { PatientContactsPage } from './pages/patient/PatientContactsPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';

// Family Portal Pages
import { FamilyDashboardPage } from './pages/family/FamilyDashboardPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading VitalGuard Security...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const location = useLocation();

  if (location.pathname === '/login') {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <Navbar onToggleVoice={() => setVoiceActive(!voiceActive)} isVoiceActive={voiceActive} />

        {/* Demo Mode Controller Bar */}
        <DemoModeBar />

        {/* Core Layout */}
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-slate-950/60 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/nurse-priority" element={<NursePriorityPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/vitalpass" element={<VitalPassPage />} />
              <Route path="/access-logs" element={<AccessLogsPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
              <Route path="/future" element={<FuturePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Patient Portal Routes */}
              <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
              <Route path="/patient/health" element={<PatientHealthPage />} />
              <Route path="/patient/devices" element={<PatientDevicesPage />} />
              <Route path="/patient/reports" element={<PatientReportsPage />} />
              <Route path="/patient/medications" element={<PatientMedicationsPage />} />
              <Route path="/patient/vitalpass" element={<PatientVitalPassPage />} />
              <Route path="/patient/vitalcircle" element={<PatientVitalCirclePage />} />
              <Route path="/patient/vitalcircle/:memberId/permissions" element={<PatientPermissionsPage />} />
              <Route path="/patient/emergency-contacts" element={<PatientContactsPage />} />
              <Route path="/patient/profile" element={<PatientProfilePage />} />

              {/* Family Portal Routes */}
              <Route path="/family/dashboard" element={<FamilyDashboardPage />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* Medical Disclaimer Footer */}
            <MedicalDisclaimer />
          </main>
        </div>

        {/* Voice Assistant Floating Modal */}
        <VoiceAssistant isOpen={voiceActive} onClose={() => setVoiceActive(false)} />
      </div>
    </ProtectedRoute>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;
