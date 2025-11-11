import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '../../components/icons';
import { useNotification } from '../../contexts/NotificationContext';

export function Register(){
  const nav = useNavigate();
  const setUser = useAuth(s=>s.setUser);
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [form,setForm] = useState({name:'',email:'',password:'',role:'seeker'});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorDetails('');
    
    if (!agreedToTerms) {
      setError('Terms agreement required');
      setErrorDetails('Please agree to the Terms and Conditions and Privacy Policy to continue.');
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      showNotification({
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome to eMirimo, ${data.user.name}!`,
        duration: 5000
      });
      
      nav('/dashboard');
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorTitle = 'Registration Failed';
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Handle network errors
      if (!err.response) {
        errorTitle = 'Connection Failed';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (errorData) {
        // Handle specific error cases
        if (errorData.error === 'Email already registered' || errorData.error === 'Email already exists') {
          errorTitle = 'Email Already Registered';
          errorMessage = errorData.message || 'An account with this email address already exists. Please use a different email or try logging in.';
        } else if (errorData.error === 'Invalid email format') {
          errorTitle = 'Invalid Email Format';
          errorMessage = errorData.message || 'Please provide a valid email address.';
        } else if (errorData.error === 'Password too weak') {
          errorTitle = 'Password Too Weak';
          errorMessage = errorData.message || 'Password must be at least 6 characters long.';
        } else if (errorData.error === 'Registration failed') {
          errorTitle = 'Registration Failed';
          errorMessage = errorData.message || 'Please provide all required fields.';
        } else if (errorData.error === 'Invalid role') {
          errorTitle = 'Invalid Role';
          errorMessage = errorData.message || 'Please select a valid role.';
        } else {
          // Use backend error message if available, otherwise use generic message
          errorTitle = errorData.error || 'Registration Failed';
          errorMessage = errorData.message || 'An unexpected error occurred. Please try again.';
        }
      }
      
      setError(errorTitle);
      setErrorDetails(errorMessage);
      
      showNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 8000 // 8 seconds for registration errors
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md mx-auto box-border">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 sm:p-6 md:p-8 box-border">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center font-display">
          {t('createAccount')}
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
        
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {form.role === 'employer' ? 'Your Name or Company Name' : t('name')}
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              placeholder={form.role === 'employer' ? 'Enter your name (e.g., John Doe) or company name (e.g., ABC Company)' : t('name')}
              value={form.name} 
              onChange={e=>setForm({...form,name:e.target.value})}
              required
            />
            {form.role === 'employer' && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You can use your personal name (for HR/recruiting staff) or company name. You can add company details in your profile after registration.
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('email')}
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              type="email" 
              placeholder={t('email')}
              value={form.email} 
              onChange={e=>setForm({...form,email:e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <input 
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
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
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('role')}
            </label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              value={form.role} 
              onChange={e=>setForm({...form,role:e.target.value})}
            >
              <option value="seeker">{t('seeker')}</option>
              <option value="employer">{t('employer')}</option>
            </select>
          </div>
          
          {/* Privacy Policy and Terms Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms-agreement"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms-agreement" className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <Link 
                to="/terms-and-conditions" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
              >
                Terms and Conditions
              </Link>
              {' '}and{' '}
              <Link 
                to="/privacy-policy" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <button 
            className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg" 
            type="submit"
            disabled={loading || !agreedToTerms}
          >
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
            {t('login')}
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
