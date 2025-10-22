import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Loading } from './Loading';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Check if user is authenticated
    if (!user && !token) {
      console.log('No user or token, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Check if user has admin role
    if (user && user.role !== 'admin') {
      console.log('User is not admin, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    
    // If we have a token but no user, wait a bit for user to load
    if (token && !user) {
      console.log('Have token but no user, waiting...');
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    setIsLoading(false);
  }, [user, navigate]);

  if (isLoading) {
    return <Loading size="lg" text="Checking admin access..." />;
  }

  return <>{children}</>;
};
