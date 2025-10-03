import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';

export function Mentors(){
  const { t } = useTranslation();
  const [mentors,setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ 
    loadMentors();
  }, []);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const {data} = await api.get('/mentors');
      setMentors(data);
    } catch (err) {
      console.error('Failed to load mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('mentors')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with industry professionals who can guide your career growth and provide valuable insights.
        </p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
        </div>
      ) : mentors.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Mentors Available</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Check back later for available mentors</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map(mentor => (
            <div key={mentor._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mentor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Industry Expert</p>
                </div>
              </div>
              
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('expertise')}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {mentor.availability && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('availability')}:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.availability}</p>
                </div>
              )}
              
              <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                {t('requestMentorship')}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}