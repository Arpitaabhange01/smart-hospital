import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protect a route — redirect to login if not authenticated
export function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Redirect logged-in users away from auth pages
export function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    const paths = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard', receptionist: '/receptionist/dashboard' };
    return <Navigate to={paths[user.role] || '/'} replace />;
  }
  return children;
}
