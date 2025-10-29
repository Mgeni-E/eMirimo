import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '../../components/icons';
import { useNotification } from '../../contexts/NotificationContext';

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

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorDetails('');
    
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      showNotification({
        type: 'success',
        title: t('loginSuccessful'),
        message: t('welcomeBack', { name: data.user.name }),
        duration: 4000
      });
      
      nav('/dashboard');
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
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-8">
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
        
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('email')}
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              type="email" 
              placeholder={t('email')}
              value={form.email} 
              onChange={e=>setForm({...form,email:e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <input 
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                type={showPassword ? "text" : "password"}
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
          
          <button 
            className="w-full px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : t('signIn')}
          </button>
        </form>
        
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium">
              {t('forgotPassword')}
            </Link>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium">
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
