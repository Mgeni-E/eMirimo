import { useAuth } from '../lib/store';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { MenuIcon, CloseIcon } from './icons';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 font-display">
          Please Log In To Access Your Dashboard
        </h2>
        <Link 
          to="/login" 
          className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {t('login')}
        </Link>
      </div>
    );
  }

  const getMenuItems = (role: string) => {
    const baseItems = [
      {
        title: 'Dashboard',
        path: '/dashboard'
      },
      {
        title: 'Profile',
        path: '/profile'
      }
    ];

    const roleSpecificItems = {
      admin: [
        {
          title: 'User Management',
          path: '/admin/users'
        },
        {
          title: 'Job Moderation',
          path: '/admin/jobs'
        },
        {
          title: 'System Analytics',
          path: '/admin/analytics'
        }
      ],
      seeker: [
        {
          title: 'Jobs',
          path: '/jobs'
        },
        {
          title: 'Applications',
          path: '/applications'
        },
        {
          title: 'Mentors',
          path: '/mentors'
        },
        {
          title: 'Resources',
          path: '/resources'
        }
      ],
      mentor: [
        {
          title: 'My Mentees',
          path: '/mentor/mentees'
        },
        {
          title: 'Schedule Sessions',
          path: '/mentor/sessions'
        },
        {
          title: 'Share Resources',
          path: '/mentor/resources'
        },
        {
          title: 'Host Events',
          path: '/mentor/events'
        }
      ],
      employer: [
        {
          title: 'Post Jobs',
          path: '/employer/jobs'
        },
        {
          title: 'Applications',
          path: '/employer/applications'
        },
        {
          title: 'Interviews',
          path: '/employer/interviews'
        },
        {
          title: 'Hiring Pipeline',
          path: '/employer/pipeline'
        }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])];
  };

  const menuItems = getMenuItems(user.role);

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* User Info Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-4 border-primary-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <div className="font-medium">{item.title}</div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.name}!
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your account today.
              </p>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
