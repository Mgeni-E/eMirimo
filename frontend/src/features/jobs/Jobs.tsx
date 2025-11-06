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
    experience: '',
    company_size: ''
  });
  const load = async ()=>{
    setLoading(true);
    try {
      const params = { 
        q, 
        ...filters,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      };
      const response = await api.get('/jobs', { params });
      // Handle both array response and object with jobs array
      const jobsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.jobs || response.data?.data || []);
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.get('/jobs/recommendations');
      // Handle both array response and object with recommendations array
      const recommendationsData = Array.isArray(response.data)
        ? response.data
        : (response.data?.recommendations || response.data?.data || []);
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setRecommendations([]); // Set empty array on error
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
          <div className="space-y-4">
            {/* Single row: 4 filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="technology">Technology</option>
                <option value="software">Software Engineering</option>
                <option value="data">Data & Analytics</option>
                <option value="product">Product Management</option>
                <option value="design">Design & UX</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales & BD</option>
                <option value="finance">Finance & Accounting</option>
                <option value="operations">Operations</option>
                <option value="hr">Human Resources</option>
                <option value="customer_success">Customer Success</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="legal">Legal</option>
                <option value="security">Cybersecurity</option>
                <option value="devops">DevOps & Cloud</option>
              </select>
              
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="onsite">Onsite</option>
                <option value="remote">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
              
              <select
                value={filters.experience}
                onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                className="pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Experience Levels</option>
                <option value="lt1">Less than 1 year</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
                <option value="5plus">5+ years</option>
              </select>

              <select
                value={filters.company_size}
                onChange={(e) => setFilters(prev => ({ ...prev, company_size: e.target.value }))}
                className="pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Company Sizes</option>
                <option value="1-10">1-10</option>
                <option value="11-20">11-20</option>
                <option value="30-50">30-50</option>
                <option value="60-100">60-100</option>
              </select>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setFilters({
                  category: '',
                  type: '',
                  experience: '',
                  company_size: ''
                })}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Clear All Filters
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {jobs.length} jobs found
              </div>
            </div>
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
          {(activeTab === 'all' ? jobs : recommendations).map(job=>{
            // Format location
            const formatLocation = (loc: any): string => {
              if (!loc) return 'Location not specified';
              if (typeof loc === 'string') return loc;
              if (typeof loc === 'object') {
                const parts: string[] = [];
                if (loc.city) parts.push(loc.city);
                if (loc.country) parts.push(loc.country);
                if (parts.length > 0) return parts.join(', ');
                if (loc.address) return loc.address;
                return 'Location not specified';
              }
              return 'Location not specified';
            };

            // Get company name
            const companyName = job.company_name || job.employer_id?.name || (job.employer_id as any)?.employer_profile?.company_name || 'Company';

            // Check deadline
            const deadline = job.application_deadline || job.expiry_date;
            const deadlineDate = deadline ? new Date(deadline) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isDeadlinePassed = deadlineDate ? (() => {
              const d = new Date(deadlineDate);
              d.setHours(0, 0, 0, 0);
              return d < today;
            })() : false;

            return (
              <div
                key={job._id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Simple Card Content - Only Essential Details */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Job Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-3 line-clamp-2">
                    {job.title}
                  </h3>
                  
                  {/* Employer Name */}
                  <div className="flex items-center gap-2 mb-4">
                    <BuildingOfficeIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {companyName}
                    </span>
                  </div>
                  
                  {/* Application Deadline */}
                  {deadline && (
                    <div className={`flex items-center gap-2 mb-4 ${isDeadlinePassed 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                    }`}>
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span>Deadline: {new Date(deadline).toLocaleDateString()}</span>
                        {isDeadlinePassed && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-semibold">
                            Closed
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Match Score for Recommendations */}
                  {activeTab === 'recommended' && job.score && (
                    <div className="flex items-center gap-2 mb-4">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {job.score}% Match
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Card Footer - Apply Now Button */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                  {user && user.role === 'seeker' ? (
                    <Link
                      to={`/jobs/${job._id}`}
                      className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-sm"
                    >
                      Apply Now
                    </Link>
                  ) : (
                    <Link
                      to={`/jobs/${job._id}`}
                      className="block w-full text-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </DashboardLayout>
  );
}