import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ApplicationModal } from '../../components/ApplicationModal';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon,
  StarIcon,
  ArrowRightIcon
} from '../../components/icons';

export function Jobs(){
  const { t } = useTranslation();
  const { user } = useAuth();
  const [q,setQ] = useState('');
  const [jobs,setJobs] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    experience: ''
  });
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const load = async ()=>{
    setLoading(true);
    try {
      const params = { 
        q, 
        ...filters,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      };
      const { data } = await api.get('/jobs', { params });
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await api.get('/jobs/recommendations');
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(()=>{ 
    load(); 
    loadRecommendations();
  },[]);

  useEffect(() => {
    load();
  }, [filters]);

  const handleApplyClick = (job: any) => {
    if (!user) {
      // Redirect to login
      return;
    }
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      const response = await api.post('/applications', applicationData);
      
      if (response.data.success) {
        // Success is handled by the modal
        return Promise.resolve();
      } else {
        throw new Error(response.data.error || t('applicationFailed'));
      }
    } catch (err: any) {
      console.error('Failed to apply:', err);
      const errorMessage = err.response?.data?.error || t('failedSubmitApplication');
      throw new Error(errorMessage);
    }
  };

  return (
    <DashboardLayout>
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('jobs')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Browse and apply for remote job opportunities</p>
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Jobs
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'recommended'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Recommended ({recommendations.length})
            </button>
          )}
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4">
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
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="technology">Technology</option>
              <option value="marketing">Marketing</option>
              <option value="design">Design</option>
              <option value="sales">Sales</option>
              <option value="finance">Finance</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
            
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Experience Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead Level</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
        </div>
      ) : (activeTab === 'all' ? jobs : recommendations).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {activeTab === 'recommended' 
              ? 'No recommendations available. Complete your profile to get personalized job recommendations.'
              : 'No Jobs Found. Try Adjusting Your Search Criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'all' ? jobs : recommendations).map(job=>(
            <div
              key={job._id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {job.employer_id?.name || t('company')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    {activeTab === 'recommended' && job.score && (
                      <div className="flex items-center gap-2 mt-2">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {job.score}% Match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Job Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span className="capitalize">{job.type}</span>
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>
                        {job.salary.min && job.salary.max 
                          ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                          : t('salaryNotSpecified')
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                  {job.description}
                </p>
                
                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 3).map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-md">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between gap-3">
                  <Link 
                    to={`/jobs/${job._id}`}
                    className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {user && user.role === 'seeker' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleApplyClick(job);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {selectedJob && user && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          job={{
            _id: selectedJob._id,
            title: selectedJob.title,
            company: selectedJob.employer_id?.name || t('company'),
            location: selectedJob.location,
            salary: selectedJob.salary
          }}
          user={{
            name: user.name,
            email: user.email,
            cv_url: (user as any).cv_url,
            skills: (user as any).skills || [],
            work_experience: (user as any).work_experience || []
          }}
          onApply={handleApplicationSubmit}
        />
      )}
    </DashboardLayout>
  );
}