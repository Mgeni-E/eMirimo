import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user, isInitialized, initialize } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for initialization if not done yet
      if (!isInitialized) {
        await initialize();
      }
      
      const token = localStorage.getItem('token');
      
      // If auth required but no user and no token, redirect to login
      if (requireAuth && !user && !token) {
        navigate(redirectTo, { replace: true });
        setIsLoading(false);
        return;
      }
      
      // If auth not required but user is logged in, redirect to dashboard
      if (!requireAuth && user) {
        navigate('/dashboard', { replace: true });
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [user, isInitialized, requireAuth, navigate, redirectTo, initialize]);

  if (isLoading || !isInitialized) {
    return <Loading size="lg" text="Checking authentication..." />;
  }

  return <>{children}</>;
};
