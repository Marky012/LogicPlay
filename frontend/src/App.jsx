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
import logo from './assets/L0g1cPLAYicon001.png';

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

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => setInstallPrompt(null));
    }
  };

  return (
    <>
      <OfflineBanner isOffline={isOffline} />

      {/* PWA install prompt */}
      {installPrompt && (
        <div className="fixed bottom-6 left-6 z-[9990] animate-slide-up glass-panel p-4 flex flex-col gap-2 max-w-[240px]"
          style={{ border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 24px rgba(0,212,255,0.15)' }}>
          <div className="flex items-center gap-2">
            <img src={logo} alt="LogicPlay Logo" className="h-8 object-contain drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
            <div>
              <p className="text-sm font-bold text-white leading-none">Install LogicPlay</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Better offline experience</p>
            </div>
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleInstallClick} className="btn-primary flex-1 py-1.5 text-xs">Install</button>
            <button onClick={() => setInstallPrompt(null)} className="btn-ghost flex-1 py-1.5 text-xs">Dismiss</button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
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
