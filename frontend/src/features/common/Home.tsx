import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { JobsIcon, CheckIcon } from '../../components/icons';

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 xl:space-y-24">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white dark:bg-gray-900">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {t('welcome')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 font-medium">
                {t('heroTitle')}
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-500 mb-10 leading-relaxed">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium text-base transition-colors"
                >
                  {t('getStarted')}
                </Link>
                <Link 
                  to="/jobs" 
                  className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium text-base transition-colors"
                >
                  {t('browseJobs')}
                </Link>
              </div>
            </div>

            {/* Right Dashboard Sample Card */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard')}</h3>
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">12</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('applications')}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('interviews')}</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('recentActivity')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('appliedToSoftwareEngineer')}</div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('interviewScheduledTomorrow')}</div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('profilePercentComplete', { percent: 95 })}</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>{t('profileCompletion')}</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-500 rounded-full opacity-30 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <JobsIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-display">{t('remoteJobsTitle')}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('remoteJobsDesc')}
          </p>
        </div>

        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-display">{t('verifiedOppsTitle')}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('verifiedOppsDesc')}
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 font-display">
            {t('statsTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2 font-display">5,000+</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">{t('activeUsers')}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2 font-display">1,200+</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">{t('jobsPosted')}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2 font-display">850+</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">{t('successfulHires')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-blue-600/10"></div>
        <div className="relative w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20">
          <h2 className="text-5xl font-bold mb-6 font-display">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-4 leading-relaxed">
            {t('ctaSubtitle')}
          </p>
          <p className="text-lg text-gray-400 mb-10">
            {t('ctaTagline')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-block px-10 py-5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              {t('startJourney')}
            </Link>
            <Link 
              to="/jobs" 
              className="inline-block px-10 py-5 border-2 border-white/30 hover:border-white text-white hover:bg-white/10 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              {t('exploreOpps')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
