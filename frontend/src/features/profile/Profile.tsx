import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { DashboardLayout } from '../../components/DashboardLayout';
import { SeekerProfile } from './SeekerProfile';
import { EmployerProfile } from './EmployerProfile';

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Render appropriate profile based on user role
  if (user?.role === 'seeker') {
    return <SeekerProfile />;
  }
  
  if (user?.role === 'employer') {
    return <EmployerProfile />;
  }

  // Fallback for admin or other roles - use basic profile
  return (
    <DashboardLayout>
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-display">
          {t('profileManagement')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('profileManagementNotImplemented')}
        </p>
      </div>
    </DashboardLayout>
  );
}