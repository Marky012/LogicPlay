import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ToastNotification.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Home from './pages/Home.jsx';
import Playground from './pages/Playground.jsx';
import Profile from './pages/Profile.jsx';
import TeacherLogin from './pages/TeacherLogin.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import PWAStatus from './components/PWAStatus.jsx';
import { useToast } from './components/ToastNotification.jsx';
import { getOfflineCircuits, deleteOfflineCircuit } from './utils/offlineSync.js';
import { syncCircuitToCloud } from './utils/api.js';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="var(--neon-blue)" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
      </svg>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  return children;
};

const TeacherRoute = ({ children }) => {
  const { user, loading, isTeacher } = useContext(AuthContext);
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
      </svg>
    </div>
  );
  if (!user || !isTeacher) return <Navigate to="/teacher-login" replace />;
  return children;
};

function AppRoutes() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  const [installPrompt, setInstallPrompt] = React.useState(null);
  const { user } = useContext(AuthContext);
  const addToast = useToast();

  React.useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      
      if (user && user.role !== 'teacher') {
        try {
          const offlineCircuits = await getOfflineCircuits();
          if (offlineCircuits && offlineCircuits.length > 0) {
            let syncedCount = 0;
            for (const c of offlineCircuits) {
              await syncCircuitToCloud(c, user.id);
              await deleteOfflineCircuit(c.id);
              syncedCount++;
            }
            if (syncedCount > 0) {
              addToast('success', `Back online! Seamlessly synced ${syncedCount} circuit${syncedCount > 1 ? 's' : ''}.`);
            }
          }
        } catch (e) {
          console.error("Auto-sync interrupted:", e);
        }
      }
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <OfflineBanner isOffline={isOffline} />
      <PWAStatus />

      <Routes>
        <Route path="/" element={<Home isOffline={isOffline} />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/playground" element={
          <ProtectedRoute><Playground /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/teacher" element={
          <TeacherRoute><TeacherDashboard /></TeacherRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
