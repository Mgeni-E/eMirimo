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
      let errorTitle = t('loginFailed');
      let errorMessage = t('unexpectedError');
      
      if (errorData) {
        if (errorData.error === 'Invalid credentials') {
          errorTitle = t('invalidCredentials');
          errorMessage = t('checkEmailPassword');
        } else if (errorData.error === 'User not found') {
          errorTitle = t('accountNotFound');
          errorMessage = t('noAccountFound');
        } else if (errorData.error === 'Account not verified') {
          errorTitle = t('accountNotVerified');
          errorMessage = t('verifyAccount');
        } else {
          errorTitle = errorData.error || t('loginFailed');
          errorMessage = errorData.message || t('unexpectedError');
        }
      } else {
        errorTitle = t('connectionFailed');
        errorMessage = t('unableToConnect');
      }
      
      setError(errorTitle);
      setErrorDetails(errorMessage);
      
      showNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 15000 // 15 seconds for critical login errors
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
          {t('signIn')}
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
                {errorDetails && (
                  <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {errorDetails}
                  </div>
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
  );
}
