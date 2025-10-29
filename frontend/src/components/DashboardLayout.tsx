import { useAuth } from '../lib/store';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { MenuIcon, CloseIcon } from './icons';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';

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
        title: t('dashboard'),
        path: '/dashboard'
      }
    ];

    const roleSpecificItems = {
      admin: [
        {
          title: t('users'),
          path: '/admin/users'
        },
        {
          title: t('jobs'),
          path: '/admin/jobs'
        },
        {
          title: t('notifications'),
          path: '/admin/notifications'
        },
        {
          title: t('profile'),
          path: '/admin/profile'
        }
      ],
      seeker: [
        {
          title: t('jobs'),
          path: '/jobs'
        },
        {
          title: t('applications'),
          path: '/applications'
        },
        {
          title: t('learning'),
          path: '/learning'
        },
        {
          title: t('profile'),
          path: '/profile'
        }
      ],
      employer: [
        {
          title: t('myJobs'),
          path: '/employer/jobs'
        },
        {
          title: t('applications'),
          path: '/employer/applications'
        },
        {
          title: t('interviews'),
          path: '/employer/interviews'
        },
        {
          title: t('hiringPipeline'),
          path: '/employer/pipeline'
        },
        {
          title: t('profile'),
          path: '/profile'
        }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])];
  };

  const menuItems = getMenuItems(user.role);

  const filteredMenuItems = menuItems;

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

        {/* Notification Bell - Mobile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <NotificationBell />
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 font-medium"
          >
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {/* Only show welcome banner on main dashboard pages, not on admin sub-pages */}
              {(location.pathname === '/dashboard' || location.pathname === '/admin') && (
                <>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {t('welcomeBack')}, {user.name}!
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                    {t('recentActivity')}
                  </p>
                </>
              )}
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Theme and Language Switchers - Desktop */}
              <div className="hidden lg:flex items-center space-x-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
                <NotificationBell />
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
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
