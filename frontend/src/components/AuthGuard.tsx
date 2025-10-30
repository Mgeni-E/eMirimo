import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Loading } from './Loading';
import { api } from '../lib/api';

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
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapped = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Bootstrap user on initial load if token exists but user is not in memory
    const bootstrap = async () => {
      if (bootstrapped.current) return;
      bootstrapped.current = true;
      if (token && !user) {
        try {
          const { data } = await api.get('/users/me');
          if (data?.user) setUser(data.user);
        } catch {
          // invalid token; clear and redirect if required
          localStorage.removeItem('token');
        }
      }
    };
    bootstrap();

    if (requireAuth && !user && !token) {
      navigate(redirectTo);
      return;
    }
    
    if (!requireAuth && user) {
      navigate('/dashboard');
      return;
    }
    
    setIsLoading(false);
  }, [user, requireAuth, navigate, redirectTo, setUser]);

  if (isLoading) {
    return <Loading size="lg" text="Checking authentication..." />;
  }

  return <>{children}</>;
};
