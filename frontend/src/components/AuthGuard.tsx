import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Loading } from './Loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) => {
  const { user, isInitialized, initialize, lastRoute, setLastRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const hasRestoredRoute = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for initialization if not done yet
      if (!isInitialized) {
        await initialize();
      }
      
      const token = localStorage.getItem('token');
      
      // If auth required but no user and no token, redirect to login
      if (requireAuth && !user && !token) {
        // Save the current route before redirecting to login (if it's a protected route)
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          setLastRoute(location.pathname);
        }
        navigate(redirectTo, { replace: true });
        setIsLoading(false);
        return;
      }
      
      // If auth not required but user is logged in, restore last route or go to dashboard
      if (!requireAuth && user) {
        // Restore last route if available and valid, otherwise go to dashboard
        if (lastRoute && lastRoute !== '/login' && lastRoute !== '/register') {
          navigate(lastRoute, { replace: true });
        } else {
        navigate('/dashboard', { replace: true });
        }
        setIsLoading(false);
        return;
      }
      
      // If user is authenticated and we have a last route, restore it on first load
      if (requireAuth && user && !hasRestoredRoute.current && lastRoute) {
        // Restore if the last route is different from current route
        // This handles refresh scenarios where user was on a specific page
        const shouldRestore = lastRoute !== location.pathname;
        
        if (shouldRestore) {
          // Validate the route is appropriate for the user's role
          const isAdminRoute = lastRoute.startsWith('/admin');
          const isEmployerRoute = lastRoute.startsWith('/employer');
          
          if (isAdminRoute && user.role !== 'admin') {
            // User is not admin, don't restore admin route
            setLastRoute(null);
          } else if (isEmployerRoute && user.role !== 'employer') {
            // User is not employer, don't restore employer route
            setLastRoute(null);
          } else {
            // Restore the route
            navigate(lastRoute, { replace: true });
            hasRestoredRoute.current = true;
          }
        } else {
          // Route matches, mark as restored to prevent loops
          hasRestoredRoute.current = true;
        }
      } else if (requireAuth && user && !hasRestoredRoute.current) {
        // No last route to restore, mark as initialized
        hasRestoredRoute.current = true;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [user, isInitialized, requireAuth, navigate, redirectTo, initialize, lastRoute, location.pathname, setLastRoute]);

  if (isLoading || !isInitialized) {
    return <Loading size="lg" text="Checking authentication..." />;
  }

  return <>{children}</>;
};
