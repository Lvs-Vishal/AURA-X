import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import { SimulationProvider, useSimulation } from './state/SimulationContext';
import AppShell from './components/shell/AppShell';

import Onboarding from './screens/Onboarding';
import CreateProfile from './screens/CreateProfile';
import Login from './screens/Login';
import Signup from './screens/Signup';
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
  const { profileStatus } = useSimulation();
  if (profileStatus === 'loading') {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-pulse border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono text-text-secondary">Initializing AURA-X...</span>
        </div>
      </div>
    );
  }
  if (profileStatus === 'not_found') return <Navigate to="/create-profile" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
      }, (err) => {
        console.warn('Firebase Auth error, falling back to local session:', err);
        setUser({ uid: 'demo_user', isAnonymous: true });
      });
    } catch (err) {
      console.warn('Firebase Auth init exception:', err);
      setUser({ uid: 'demo_user', isAnonymous: true });
    }
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pulse border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeUid = user ? user.uid : 'demo_user';

  return (
    <SimulationProvider uid={activeUid}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SimulationProvider>
  );
}

export default App;

