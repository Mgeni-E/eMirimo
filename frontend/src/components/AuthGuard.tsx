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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (requireAuth && !user && !token) {
      navigate(redirectTo);
      return;
    }
    
    if (!requireAuth && user) {
      navigate('/dashboard');
      return;
    }
    
    setIsLoading(false);
  }, [user, requireAuth, navigate, redirectTo]);

  if (isLoading) {
    return <Loading size="lg" text="Checking authentication..." />;
  }

  return <>{children}</>;
};
