import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../api/authService';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * PublicRoute component - redirects authenticated users away from public pages
 * Used for login/onboarding pages that authenticated users shouldn't see
 */
export function PublicRoute({ children, redirectTo = '/main' }: PublicRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  // If user is authenticated, don't render children (will redirect)
  if (isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
