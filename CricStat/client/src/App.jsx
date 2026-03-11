import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CreateMatch from './pages/admin/CreateMatch';
import ScoringPanel from './pages/admin/ScoringPanel';

// Public Pages
import Matches from './pages/public/Matches';
import LiveMatch from './pages/public/LiveMatch';
import Header from './components/Header';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cricketAdminToken');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <div className="flex-grow container mx-auto px-4 py-6">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Matches />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/match/:id" element={<LiveMatch />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/create-match" 
                  element={
                    <ProtectedRoute>
                      <CreateMatch />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/scoring/:id" 
                  element={
                    <ProtectedRoute>
                      <ScoringPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <footer className="bg-gray-100 py-4 border-t">
              <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                © {new Date().getFullYear()} Cricket Live Score Tracker
              </div>
            </footer>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;