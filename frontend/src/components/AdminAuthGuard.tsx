import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Loading } from './Loading';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const { user, isInitialized, initialize, lastRoute, setLastRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const hasRestoredRoute = useRef(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for initialization if not done yet
      if (!isInitialized) {
        await initialize();
      }
      
      const token = localStorage.getItem('token');
      
      // Check if user is authenticated
      if (!user && !token) {
        // Save the current route before redirecting to login
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          setLastRoute(location.pathname);
        }
        navigate('/login', { replace: true });
        setIsLoading(false);
        return;
      }
      
      // Check if user has admin role
      if (user && user.role !== 'admin') {
        navigate('/dashboard', { replace: true });
        setIsLoading(false);
        return;
      }
      
      // If we have a token but no user after initialization, redirect to login
      if (token && !user && isInitialized) {
        navigate('/login', { replace: true });
        setIsLoading(false);
        return;
      }
      
      // If user is authenticated admin and we have a last route, restore it on first load
      if (user && user.role === 'admin' && !hasRestoredRoute.current && lastRoute) {
        // Only restore if we're on a default admin route or the route doesn't match
        const isDefaultAdminRoute = location.pathname === '/admin';
        const shouldRestore = isDefaultAdminRoute && lastRoute !== location.pathname && lastRoute.startsWith('/admin');
        
        if (shouldRestore) {
          navigate(lastRoute, { replace: true });
          hasRestoredRoute.current = true;
        }
      }
      
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [user, isInitialized, navigate, initialize, lastRoute, location.pathname, setLastRoute]);

  if (isLoading || !isInitialized) {
    return <Loading size="lg" text="Checking admin access..." />;
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect
  }

  return <>{children}</>;
};
