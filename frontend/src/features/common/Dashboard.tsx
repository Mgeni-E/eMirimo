import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { AdminDashboard } from '../admin/AdminDashboard';
import { SeekerDashboard } from '../dashboards/SeekerDashboard';
import { EmployerDashboard } from '../dashboards/EmployerDashboard';

export function Dashboard() {
  const { t } = useTranslation();
  const { user, isInitialized } = useAuth();

  // Wait for initialization
  if (!isInitialized) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-display">
          {t('pleaseLogInAccess')}
        </h2>
      </div>
    );
  }

  // Route to appropriate role-based dashboard
  if (!user.role || !['admin', 'seeker', 'employer'].includes(user.role)) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-display">
          {t('invalidUserRole')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('invalidRoleContactSupport')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {t('role')}: {user.role || 'undefined'}
        </p>
      </div>
    );
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'seeker':
      return <SeekerDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    default:
      return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-display">
          {t('unknownUserRoleTitle')}: {user.role}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('contactSupportAssistance')}
        </p>
      </div>
      );
  }
}
