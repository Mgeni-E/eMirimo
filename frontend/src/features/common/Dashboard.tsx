import { useAuth } from '../../lib/store';
import { AdminDashboard } from '../dashboards/AdminDashboard';
import { SeekerDashboard } from '../dashboards/SeekerDashboard';
import { MentorDashboard } from '../dashboards/MentorDashboard';
import { EmployerDashboard } from '../dashboards/EmployerDashboard';

export function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-display">
          Please Log In To Access Your Dashboard
        </h2>
      </div>
    );
  }

  // Route to appropriate role-based dashboard
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'seeker':
      return <SeekerDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    default:
      return (
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-display">
            Unknown User Role
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please contact support for assistance.
          </p>
        </div>
      );
  }
}
