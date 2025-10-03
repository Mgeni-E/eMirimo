import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Register(){
  const nav = useNavigate();
  const setUser = useAuth(s=>s.setUser);
  const { t } = useTranslation();
  const [form,setForm] = useState({name:'',email:'',password:'',role:'seeker'});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      nav('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center font-display">
          {t('createAccount')}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('name')}
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              placeholder={t('name')}
              value={form.name} 
              onChange={e=>setForm({...form,name:e.target.value})}
              required
            />
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
            <input 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              type="password" 
              placeholder={t('password')}
              value={form.password} 
              onChange={e=>setForm({...form,password:e.target.value})}
              required
            />
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
              <option value="mentor">{t('mentor')}</option>
            </select>
          </div>
          
          <button 
            className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : t('createAccount')}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
