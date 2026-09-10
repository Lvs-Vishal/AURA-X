import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider, useSimulation } from './state/SimulationContext';
import AppShell from './components/shell/AppShell';

import Onboarding from './screens/Onboarding';
import CreateProfile from './screens/CreateProfile';
import BaselineLoading from './screens/BaselineLoading';
import Home from './screens/Home';
import LiveMonitoring from './screens/LiveMonitoring';
import RiskDashboard from './screens/RiskDashboard';
import RiskExplainability from './screens/RiskExplainability';
import Context from './screens/Context';
import Timeline from './screens/Timeline';
import History from './screens/History';
import Emergency from './screens/Emergency';
import Privacy from './screens/Privacy';
import ProfileSettings from './screens/ProfileSettings';
import Medications from './screens/Medications';

const ProtectedRoute = ({ children }) => {
  const { onboardingComplete } = useSimulation();
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/create-profile" element={<CreateProfile />} />
      <Route path="/loading-baseline" element={<BaselineLoading />} />
      
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="live" element={<LiveMonitoring />} />
        <Route path="risk" element={<RiskDashboard />} />
        <Route path="risk/:riskId" element={<RiskExplainability />} />
        <Route path="context" element={<Context />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="history" element={<History />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="medications" element={<Medications />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SimulationProvider>
  );
}

export default App;
