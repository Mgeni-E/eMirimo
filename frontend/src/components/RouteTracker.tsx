import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../lib/store';

/**
 * RouteTracker component
 * Tracks the current route and saves it to session storage
 * so users can be redirected back to their last page after refresh
 */
export const RouteTracker = () => {
  const location = useLocation();
  const { user, setLastRoute } = useAuth();

  useEffect(() => {
    // Only track routes for authenticated users
    if (!user) {
      return;
    }

    const currentPath = location.pathname;
    
    // Don't track login, register, or other auth pages
    const excludedPaths = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/',
      '/privacy-policy',
      '/terms-and-conditions'
    ];
    
    if (excludedPaths.includes(currentPath)) {
      return;
    }
    
    // Track all dashboard routes (including dynamic routes with IDs)
    // This ensures we can restore to the exact page the user was on
    const trackableRoutePrefixes = [
      '/dashboard',
      '/jobs',
      '/learning',
      '/recommendations',
      '/applications',
      '/profile',
      '/employer',
      '/admin'
    ];
    
    // Check if current path matches any trackable route prefix
    const isTrackable = trackableRoutePrefixes.some(prefix => 
      currentPath.startsWith(prefix)
    );
    
    if (isTrackable) {
      // Always update the last route when user navigates to a trackable route
      setLastRoute(currentPath);
    }
  }, [location.pathname, user, setLastRoute]);

  return null; // This component doesn't render anything
};

