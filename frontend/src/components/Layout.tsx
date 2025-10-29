import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/store';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { NotificationContainer } from './Notification';
import { useNotification } from '../contexts/NotificationContext';
import { socketService } from '../lib/socket';
import { 
  HomeIcon, 
  ApplicationsIcon, 
  ProfileIcon, 
  LoginIcon, 
  RegisterIcon, 
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  ArrowUpIcon
} from './icons';
import { useState, useEffect } from 'react';

export const Layout = ({children}:{children:React.ReactNode}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { notifications, hideNotification } = useNotification();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize socket connection when user logs in
  useEffect(() => {
    if (user && user.token) {
      socketService.connect(user.token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Don't apply standard layout for dashboard routes - they have their own layout
  const dashboardRoutes = [
    '/dashboard', '/applications', '/profile',
    '/admin', '/employer/jobs'
  ];
  if (dashboardRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

  // Pages that should show footer
  const footerPages = ['/', '/login', '/register', '/privacy-policy', '/terms-and-conditions'];
  const shouldShowFooter = footerPages.includes(location.pathname);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems: { path: string; label: string }[] = [];

  const userNavigationItems = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/applications', label: 'Applications', icon: ApplicationsIcon },
    { path: '/profile', label: 'Profile', icon: ProfileIcon },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-semibold text-gray-900 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
              eMirimo
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors relative group capitalize ${
                      isActive(item.path) ? 'text-gray-900 dark:text-white' : ''
                    }`}
                  >
                    {item.label}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent-600 dark:bg-accent-400 transition-all ${
                      isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <LanguageSwitcher />
              <ThemeSwitcher />

              {user ? (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    {userNavigationItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive(item.path)
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                              : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4">
                    <NotificationBell />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {t('welcome')}, {user.name}
                    </span>
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      {t('logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                  >
                    <LoginIcon className="w-4 h-4" />
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <RegisterIcon className="w-4 h-4" />
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4 space-y-2">
                {navigationItems.map((item) => {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                
                {user && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    {userNavigationItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive(item.path)
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                              : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <div className="flex items-center justify-between px-4 py-2">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>

                {user ? (
                  <div className="px-4 py-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t('welcome')}, {user.name}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300"
                    >
                      <LogoutIcon className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                ) : (
                  <div className="px-4 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors capitalize border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <LoginIcon className="w-4 h-4" />
                      {t('login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold transition-all duration-300 capitalize"
                    >
                      <RegisterIcon className="w-4 h-4" />
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 w-full">
        {children}
      </main>

      {/* Footer - Only show on specific pages */}
      {shouldShowFooter && (
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h3 className="text-2xl font-bold text-primary-400 dark:text-primary-300 font-display mb-4">eMirimo</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering Rwandan youth and graduates with global remote opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 capitalize">{t('resources')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/jobs" className="hover:text-primary-400 transition-colors capitalize">{t('jobs')}</Link></li>
                <li><Link to="/learning" className="hover:text-primary-400 transition-colors capitalize">{t('learning')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 capitalize">{t('help')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help" className="hover:text-primary-400 transition-colors capitalize">{t('help')}</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors capitalize">{t('contact')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 capitalize">{t('connect')}</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800/30 dark:border-gray-700/30 pt-6 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} eMirimo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
        </footer>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
          aria-label="Back to top"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      )}

      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onClose={hideNotification} 
      />

      {/* PWA Components removed - will be added later */}
    </div>
  );
};
