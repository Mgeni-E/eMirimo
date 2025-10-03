import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { DashboardLayout } from '../../components/DashboardLayout';

export function Jobs(){
  const { t } = useTranslation();
  const { user } = useAuth();
  const [q,setQ] = useState('');
  const [jobs,setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  const load = async ()=>{
    setLoading(true);
    try {
      const { data } = await api.get('/jobs', { params:{ q }});
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId: string) => {
    if (!user) {
      alert('Please log in to apply for jobs');
      return;
    }

    setApplying(jobId);
    try {
      await api.post('/applications', { jobId });
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Failed to apply:', err);
      alert('Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  useEffect(()=>{ 
    load(); 
  },[]);

  return (
    <DashboardLayout>
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('jobs')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Browse and apply for remote job opportunities</p>
        
        <div className="flex gap-3">
          <input 
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
            placeholder={t('searchJobs')}
            value={q} 
            onChange={e=>setQ(e.target.value)} 
          />
          <button 
            onClick={load} 
            disabled={loading}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
          >
            {loading ? t('loading') : t('search')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">No Jobs Found. Try Adjusting Your Search Criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job=>(
            <div key={job._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {job.description}
              </p>
              
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => applyToJob(job._id)}
                disabled={applying === job._id || !user}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {applying === job._id ? t('loading') : t('apply')}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}