import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const { pathname } = useLocation();

  const getBackgroundImage = () => {
    if (pathname.startsWith('/history')) return '/bg-history.png';
    if (pathname.startsWith('/analytics')) return '/bg-analytics.png';
    return '/bg-generate.png';
  };

  const bgStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url('${getBackgroundImage()}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="min-h-screen text-studio-text transition-all duration-700 ease-in-out" style={bgStyle}>
      {/* Top decorative gradient bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-hero-gradient animate-pulse-glow" />

      <Navbar />

      <main className="pt-24 pb-12">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/history/:id" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-studio-border py-10 text-center text-xs text-studio-muted">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-lg">DIGIQUEST</span>
          <span className="font-display tracking-widest text-studio-neon text-lg">STUDIO</span>
        </div>
        <p className="opacity-60 tracking-wider">Premium AI Tools for Creators</p>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 30, 0.8)',
            backdropFilter: 'blur(12px)',
            color: '#F8FAFC',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px'
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
