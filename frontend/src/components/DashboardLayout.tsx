import { useAuth } from '../lib/store';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fetch user profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;
      try {
        const { api } = await import('../lib/api');
        // Use admin profile endpoint for admins, regular endpoint for others
        const endpoint = user.role === 'admin' ? '/admin/profile' : '/users/me';
        const response = await api.get(endpoint);
        
        // Handle different response structures
        const profileImg = user.role === 'admin' 
          ? (response.data?.profilePicture || response.data?.profile_image)
          : (response.data?.user?.profile_image);
        
        if (profileImg && typeof profileImg === 'string' && profileImg.trim() !== '') {
          setProfileImage(profileImg);
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.error('Failed to fetch profile image:', error);
        setProfileImage(null);
      }
    };
    fetchProfileImage();
    // Also refresh when location changes (e.g., after profile update)
  }, [user, location.pathname]);

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
          title: t('applications'),
          path: '/admin/applications'
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
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 md:w-80 lg:w-72 xl:w-80 2xl:w-96 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* User Info Header */}
        <div className="px-3 sm:px-4 md:px-5 lg:px-4 xl:px-5 2xl:px-6 py-4 sm:py-5 md:py-6 lg:py-5 xl:py-6 2xl:py-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              {profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && (profileImage.startsWith('http://') || profileImage.startsWith('https://')) ? (
                <img
                  src={profileImage}
                  alt={user.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                  onError={() => {
                    // Hide image and show fallback initial on error
                    setProfileImage(null);
                  }}
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-base lg:text-sm xl:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {user.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.role === 'seeker' ? 'Job Seeker' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex-shrink-0 ml-2"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 sm:px-3 md:px-4 lg:px-3 xl:px-4 2xl:px-5 py-3 sm:py-4 md:py-4 lg:py-4 xl:py-5 2xl:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 sm:px-4 md:px-4 lg:px-3 xl:px-4 2xl:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-200 text-sm sm:text-base lg:text-sm xl:text-base ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-4 border-primary-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <div className="font-medium truncate">{item.title}</div>
              </Link>
            );
          })}
        </nav>


        {/* Logout Button */}
        <div className="px-2 sm:px-3 md:px-4 lg:px-3 xl:px-4 2xl:px-5 py-3 sm:py-4 md:py-4 lg:py-4 xl:py-5 2xl:py-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-3 sm:px-4 md:px-4 lg:px-3 xl:px-4 2xl:px-5 py-2 sm:py-2.5 md:py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base lg:text-sm xl:text-base"
          >
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8 2xl:px-12 py-3 sm:py-3.5 md:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {/* Only show welcome banner on main dashboard pages, not on admin sub-pages */}
              {(location.pathname === '/dashboard' || location.pathname === '/admin') && (
                <>
                  <h1 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {t('welcomeBack', { name: user.name })}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                    {t('recentActivity')}
                  </p>
                </>
              )}
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 flex-shrink-0">
              {/* Theme and Language Switchers - Desktop */}
              <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
                <LanguageSwitcher />
                <ThemeSwitcher />
                <NotificationBell />
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 2xl:p-12 overflow-y-auto">
          <div className="w-full max-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
