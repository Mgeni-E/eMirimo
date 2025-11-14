import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '../../components/icons';
import { useNotification } from '../../contexts/NotificationContext';

const REMEMBER_ME_KEY = 'remembered_email';
const REMEMBER_ME_CHECKED_KEY = 'remember_me_checked';

export function Login(){
  const nav = useNavigate();
  const setUser = useAuth(s=>s.setUser);
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [form,setForm] = useState({email:'',password:''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_ME_KEY);
    const rememberMeChecked = localStorage.getItem(REMEMBER_ME_CHECKED_KEY) === 'true';
    
    if (rememberedEmail && rememberMeChecked) {
      setForm(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check server health before making request (only in production)
    if (import.meta.env.PROD) {
      try {
        const { checkServerHealth, waitForServer } = await import('../../lib/healthCheck');
        const isReady = await checkServerHealth();
        if (!isReady) {
          // Wait for server to be ready (up to 60 seconds)
          const serverReady = await waitForServer(60000);
          if (!serverReady) {
            setError(t('connectionFailed') || 'Connection Failed');
            setErrorDetails('Server is taking longer than expected to respond. Please try again in a moment.');
            setLoading(false);
            return;
          }
        }
      } catch (healthError) {
        console.warn('Health check error:', healthError);
        // Continue with request even if health check fails
      }
    }
    setErrorDetails('');
    
    try {
      const { data } = await api.post('/auth/login', form);
      const token = data.token;
      const userData = data.user;
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // Handle "Remember Me" - save email to localStorage (NOT password for security)
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, form.email);
        localStorage.setItem(REMEMBER_ME_CHECKED_KEY, 'true');
      } else {
        // Clear remembered email if checkbox is unchecked
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(REMEMBER_ME_CHECKED_KEY);
      }
      
      // Update auth state with user data and token
      setUser({ ...userData, token });
      
      showNotification({
        type: 'success',
        title: t('loginSuccessful'),
        message: t('welcomeBack', { name: userData.name }),
        duration: 4000
      });
      
      // Navigate based on role
      if (userData.role === 'admin') {
        nav('/admin');
      } else {
        nav('/dashboard');
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorTitle = t('loginFailed') || 'Login Failed';
      let errorMessage = t('unexpectedError') || 'An unexpected error occurred. Please try again.';
      
      // Handle network errors
      if (!err.response) {
        errorTitle = t('connectionFailed') || 'Connection Failed';
        errorMessage = t('unableToConnect') || 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (errorData) {
        // Handle specific error cases
        if (errorData.error === 'Invalid credentials' || errorData.error === 'Authentication failed') {
          errorTitle = t('invalidCredentials') || 'Invalid Credentials';
          errorMessage = errorData.message || t('checkEmailPassword') || 'The email or password you entered is incorrect. Please check your credentials and try again.';
        } else if (errorData.error === 'Invalid email format') {
          errorTitle = 'Invalid Email Format';
          errorMessage = errorData.message || 'Please provide a valid email address.';
        } else if (errorData.error === 'Login failed') {
          errorTitle = t('loginFailed') || 'Login Failed';
          errorMessage = errorData.message || 'Please provide both email and password.';
        } else if (errorData.error === 'Account deactivated') {
          errorTitle = 'Account Deactivated';
          errorMessage = errorData.message || 'Your account has been deactivated. Please contact support for assistance.';
        } else if (errorData.error === 'Account pending approval') {
          errorTitle = 'Account Pending Approval';
          errorMessage = errorData.message || 'Your account is pending approval. Please wait for admin approval or contact support.';
        } else {
          // Use backend error message if available, otherwise use generic message
          errorTitle = errorData.error || t('loginFailed') || 'Login Failed';
          errorMessage = errorData.message || t('unexpectedError') || 'An unexpected error occurred. Please try again.';
        }
      }
      
      setError(errorTitle);
      setErrorDetails(errorMessage);
      
      showNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 8000 // 8 seconds for login errors
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center -mt-16 pb-8 px-4">
      <div className="w-full max-w-md mx-auto box-border">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-5 sm:p-6 md:p-8 box-border">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
          {t('signIn')}
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  {error}
                </h3>
                {errorDetails && (
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                    {errorDetails}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={submit} name="login-form" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('email')}
            </label>
            <input 
              id="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              type="email" 
              autoComplete="username"
              placeholder={t('email')}
              value={form.email} 
              onChange={e=>setForm({...form,email:e.target.value})}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <input 
                id="password"
                name="password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t('password')}
                value={form.password} 
                onChange={e=>setForm({...form,password:e.target.value})}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          
          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setRememberMe(isChecked);
                // Clear saved email if user unchecks the box
                if (!isChecked) {
                  localStorage.removeItem(REMEMBER_ME_KEY);
                  localStorage.removeItem(REMEMBER_ME_CHECKED_KEY);
                }
              }}
              className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t('rememberMe') || 'Remember Me'}
            </label>
          </div>
          
          <button 
            className="w-full px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            type="submit"
            disabled={loading}
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
        
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium">
              {t('forgotPassword')}
            </Link>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium">
              {t('createAccount')}
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
