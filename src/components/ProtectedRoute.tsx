import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authenticated = isAuthenticated();
  
  return authenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default ProtectedRoute;
