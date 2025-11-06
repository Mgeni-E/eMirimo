import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Loading } from './Loading';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const { user, isInitialized, initialize } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for initialization if not done yet
      if (!isInitialized) {
        await initialize();
      }
      
      const token = localStorage.getItem('token');
      
      // Check if user is authenticated
      if (!user && !token) {
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
      
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [user, isInitialized, navigate, initialize]);

  if (isLoading || !isInitialized) {
    return <Loading size="lg" text="Checking admin access..." />;
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect
  }

  return <>{children}</>;
};
