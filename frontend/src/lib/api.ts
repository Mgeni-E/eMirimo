import axios from 'axios';

// Increase timeout for production (Render.com cold starts can take 30-60s)
const isProduction = import.meta.env.PROD;
const API_TIMEOUT = isProduction ? 60000 : 10000; // 60s for production, 10s for dev

// Determine API URL based on environment
const getApiUrl = () => {
  // In development mode, ALWAYS use localhost:3000 (ignore VITE_API_URL if set)
  // This ensures local frontend always connects to local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  // Production: use environment variable (set in Vercel) or Render backend URL
  return import.meta.env.VITE_API_URL || 'https://emirimo-backend1.onrender.com/api';
};

export const api = axios.create({
  baseURL: getApiUrl(),
  timeout: API_TIMEOUT,
  withCredentials: true,
});

api.interceptors.request.use(cfg=>{
  const token = localStorage.getItem('token');
  if(token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  pendingQueue.forEach(cb => cb(token));
  pendingQueue = [];
}

// Retry logic for network errors and timeouts
const retryRequest = async (config: any, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await api(config);
    } catch (error: any) {
      const isLastAttempt = i === retries - 1;
      const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
      
      if (isLastAttempt || !isNetworkError) {
        throw error;
      }
      
      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Retry on network errors (no response) or timeouts
    if (!error.response && !originalRequest._retry && originalRequest.retry !== false) {
      const isNetworkError = error.code === 'ECONNABORTED' || 
                           error.code === 'ETIMEDOUT' || 
                           error.message?.includes('Network Error') ||
                           error.message?.includes('timeout');
      
      if (isNetworkError) {
        originalRequest._retry = true;
        try {
          return await retryRequest(originalRequest, 2); // Retry 2 more times (3 total)
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push((newToken) => {
            if (newToken) originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
        const newToken = data?.token as string | undefined;
        if (newToken) {
          localStorage.setItem('token', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          
          // Update user state if token refreshed and user data provided
          if (data?.user) {
            const { useAuth } = await import('./store.js');
            useAuth.getState().setUser({ ...data.user, token: newToken });
          }
          
          processQueue(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        // Clear session on refresh failure
        localStorage.removeItem('token');
        const { useAuth } = await import('./store.js');
        useAuth.getState().clearSession();
        processQueue(null);
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
