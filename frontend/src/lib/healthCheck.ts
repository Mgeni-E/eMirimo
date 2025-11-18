/**
 * Health check utility to verify server is ready before making requests
 */

let serverReady = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // Check every 30 seconds
const HEALTH_CHECK_TIMEOUT = 10000; // 10 second timeout for health check

export async function checkServerHealth(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached result if checked recently
  if (serverReady && (now - lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return true;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    // Determine health check URL based on environment
    const getHealthUrl = () => {
      // In development mode, ALWAYS use localhost:3000 (ignore VITE_API_URL if set)
      // This ensures local frontend always connects to local backend
      if (import.meta.env.DEV) {
        return 'http://localhost:3000';
      }
      // Production: use Render backend URL (from Vercel env vars)
      return import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://emirimo-backend1.onrender.com';
    };
    
    const response = await fetch(
      `${getHealthUrl()}/health`,
      {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache',
      }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      serverReady = true;
      lastHealthCheck = now;
      return true;
    }
    
    serverReady = false;
    return false;
  } catch (error) {
    console.warn('Health check failed:', error);
    serverReady = false;
    return false;
  }
}

export async function waitForServer(maxWait = 60000): Promise<boolean> {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  while (Date.now() - startTime < maxWait) {
    if (await checkServerHealth()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  return false;
}

