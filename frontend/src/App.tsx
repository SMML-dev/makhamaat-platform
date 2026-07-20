import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PaymentSimulator from './pages/PaymentSimulator';
import { authService } from './services/api';

// Route for authenticated users based on roles
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If user tries to access unauthorized role-based route, redirect to their own dashboard
    // We return NULL to avoid rendering the protected content EVEN for a millisecond
    const redirectPath = user.role === 'SUPER_ADMIN' ? '/sa/dashboard' : 
                         user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
    
    // Trigger the navigation but return null for current render to prevent any flash of unauthorized UI
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = authService.getCurrentUser();
  if (user) {
    const redirectPath = user.role === 'SUPER_ADMIN' ? '/sa/dashboard' : 
                         user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};

function App() {
  const location = useLocation();

  // THE ULTIMATE NAVIGATION LOCK
  // This effect ensures that once authenticated, the user is trapped inside the app cockpit
  // and cannot slide back out, regardless of the device or gesture.
  useEffect(() => {
    const user = authService.getCurrentUser();
    
    if (user) {
      // 1. We start by ensuring there's a safety buffer state in the history
      // This prevents the "First Back" from reaching the page exterior
      window.history.pushState(null, '', window.location.href);

      const handlePopState = () => {
        // 2. If a popstate (back gesture) is detected, we immediately RE-PUSH 
        // the state to keep the history stack ahead of the exit boundary
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, []);

  // Secondary Guard: Real-time path checking for public routes
  const navigate = useNavigate();
  useEffect(() => {
    const user = authService.getCurrentUser();
    const publicPaths = ['/', '/about', '/services', '/contact', '/login', '/register'];
    
    if (user && publicPaths.includes(location.pathname)) {
      // If a user somehow lands on a public page while authenticated, bounce them back
      const redirectPath = user.role === 'SUPER_ADMIN' ? '/sa/dashboard' : 
                          user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
      
      // We use navigate for React Router to sync correctly, with replace: true to prune history
      navigate(redirectPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="about" element={<PublicRoute><About /></PublicRoute>} />
        <Route path="services" element={<PublicRoute><Services /></PublicRoute>} />
        <Route path="contact" element={<PublicRoute><Contact /></PublicRoute>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Dashboards */}
      <Route path="/user/dashboard" element={
        <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'SUPER_ADMIN']}>
          <UserDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/sa/dashboard" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/payment-simulator" element={
        <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'SUPER_ADMIN']}>
          <PaymentSimulator />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
