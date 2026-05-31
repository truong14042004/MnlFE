import { StrictMode } from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Challenges from './pages/Challenges';
import { getActiveUserId } from './lib/api';
import './index.css';

/**
 * Guards private routes: anonymous mode is gone, so any page that reads or
 * writes user data requires a logged-in session. getActiveUserId() also picks
 * up a token passed via URL (when the extension opens the dashboard).
 */
function RequireAuth({ children }: { children: JSX.Element }) {
  const [userId] = useState(() => getActiveUserId());
  if (!userId || userId === 'anon') {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Landing />} />
          <Route path="auth" element={<Auth />} />
          <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="insights" element={<RequireAuth><Insights /></RequireAuth>} />
          <Route path="challenges" element={<RequireAuth><Challenges /></RequireAuth>} />
          <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
