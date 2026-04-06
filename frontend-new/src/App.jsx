// src/App.jsx — Router + Auth setup
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import HomePage     from './pages/HomePage';
import ResultsPage  from './pages/ResultsPage';
import DashboardPage from './pages/DashboardPage';
import MyTripsPage  from './pages/MyTripsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route path="/" element={
              <ProtectedRoute><HomePage /></ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute><ResultsPage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/my-trips" element={
              <ProtectedRoute><MyTripsPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
