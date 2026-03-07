import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Playground from './pages/Playground';
import Profile from './pages/Profile';
import OfflineBanner from './components/OfflineBanner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
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
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  return (
    <>
      <OfflineBanner isOffline={isOffline} />
      {installPrompt && (
          <div className="fixed bottom-4 right-4 bg-surface p-4 rounded-lg shadow-2xl border border-gray-700 z-50 flex flex-col gap-2">
             <p className="font-bold">Install LogicPlay App</p>
             <p className="text-sm text-gray-400">Install for a better offline experience.</p>
             <button onClick={handleInstallClick} className="btn-primary py-1 mt-2">Install</button>
             <button onClick={() => setInstallPrompt(null)} className="text-gray-500 text-xs mt-1 hover:text-white">Dismiss</button>
          </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/playground" 
          element={
            <ProtectedRoute>
              <Playground />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
