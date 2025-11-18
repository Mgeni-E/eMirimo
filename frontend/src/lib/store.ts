import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type User = { 
  id: string; 
  name: string; 
  email: string; 
  role: 'seeker' | 'employer' | 'admin'; 
  token?: string;
} | null;

type AuthState = { 
  user: User; 
  isInitialized: boolean;
  lastRoute: string | null;
  setUser: (u: User) => void; 
  setLastRoute: (route: string | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearSession: () => void;
};

// Get user from localStorage if available (for initial state)
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.user || null;
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      lastRoute: null,
      
      setUser: (u: User) => {
        set({ user: u, isInitialized: true });
        // Also store token separately for API interceptor
        if (u?.token) {
          localStorage.setItem('token', u.token);
        }
      },
      
      setLastRoute: (route: string | null) => {
        set({ lastRoute: route });
      },
      
      initialize: async () => {
        // Skip if already initialized
        if (get().isInitialized) return;
        
        const token = localStorage.getItem('token');
        const storedUser = getStoredUser();
        
        // If we have a stored user and token, verify it's still valid
        if (token && storedUser) {
          try {
            const { api } = await import('./api.js');
            const { data } = await api.get('/users/me');
            if (data?.user && data.user.role) {
              set({ 
                user: { 
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
                  role: data.user.role,
                  token 
                }, 
                isInitialized: true 
              });
              return;
            }
          } catch (error) {
            // Token invalid, clear everything
            console.warn('Session validation failed:', error);
            get().clearSession();
            return;
          }
        } else if (token && !storedUser) {
          // Token exists but no user data, fetch it
          try {
            const { api } = await import('./api.js');
            const { data } = await api.get('/users/me');
            if (data?.user && data.user.role) {
              set({ 
                user: { 
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
                  role: data.user.role,
                  token 
                }, 
                isInitialized: true 
              });
              return;
            }
          } catch (error) {
            // Token invalid, clear everything
            console.warn('Session validation failed:', error);
            get().clearSession();
            return;
          }
        }
        
        // No valid session - mark as initialized with null user
        set({ user: null, isInitialized: true });
      },
      
      logout: async () => {
        try {
          // Call backend logout endpoint if token exists
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const { api } = await import('./api.js');
              await api.post('/auth/logout', {}, { 
                headers: { Authorization: `Bearer ${token}` } 
              });
            } catch (error) {
              // Ignore logout API errors, still clear local session
              console.warn('Logout API call failed, clearing local session anyway');
            }
          }
        } catch (error) {
          // Ignore errors during logout
        } finally {
          get().clearSession();
        }
      },
      
      clearSession: () => {
        localStorage.removeItem('token');
        set({ user: null, isInitialized: true, lastRoute: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user ? {
          id: state.user.id,
          name: state.user.name,
          email: state.user.email,
          role: state.user.role
          // Don't persist token in Zustand storage, keep it separate
        } : null,
        lastRoute: state.lastRoute // Persist last route for session restoration
      }),
    }
  )
);
