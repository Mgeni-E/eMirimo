import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  UsersIcon,
  CalendarIcon,
  StarIcon,
  ExternalLinkIcon,
  CheckBadgeIcon,
  HeartIcon,
  ShareIcon
} from '../../components/icons';

interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo_url: string;
  cover_image_url: string;
  industry: string;
  company_size: string;
  founded_year: number;
  headquarters: {
    city: string;
    country: string;
    address: string;
  };
  social_links: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  benefits: string[];
  culture: string[];
  values: string[];
  mission: string;
  vision: string;
  technologies: string[];
  awards: Array<{
    name: string;
    year: number;
    issuer: string;
  }>;
  team_size: number;
  remote_policy: string;
  hiring_process: string;
  is_verified: boolean;
  is_featured: boolean;
  total_jobs: number;
  total_employees: number;
  rating: number;
  review_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Job {
  _id: string;
  title: string;
  type: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experience_level: string;
  posted_at: string;
  application_deadline: string;
  skills: string[];
  is_active: boolean;
}

export function CompanyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reviews'>('overview');

  useEffect(() => {
    if (slug) {
      loadCompanyData();
    }
  }, [slug]);

  const loadCompanyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [companyResponse, jobsResponse] = await Promise.all([
        api.get(`/companies/${slug}`),
        api.get(`/companies/${slug}/jobs`)
      ]);

      if (companyResponse.data.success) {
        setCompany(companyResponse.data.company);
      } else {
        setError('Company not found');
      }

      if (jobsResponse.data.success) {
        setJobs(jobsResponse.data.jobs || []);
      }
    } catch (err: any) {
      console.error('Failed to load company data:', err);
      setError(err.response?.data?.error || 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const getCompanySizeText = (size: string) => {
    switch (size) {
      case 'startup': return '1-50 employees';
      case 'small': return '51-200 employees';
      case 'medium': return '201-1000 employees';
      case 'large': return '1000+ employees';
      default: return 'Unknown size';
    }
  };

  const getCompanySizeColor = (size: string) => {
    switch (size) {
      case 'startup': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'small': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'medium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'large': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !company) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Company Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'The company you are looking for does not exist.'}
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse All Jobs
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Company Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-600">
          {company.cover_image_url ? (
            <img
              src={company.cover_image_url}
              alt={`${company.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BuildingOfficeIcon className="w-16 h-16 text-white/50" />
            </div>
          )}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors">
              <HeartIcon className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors">
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Company Info */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start space-x-4">
              {/* Logo */}
              <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center -mt-12 border-4 border-white dark:border-gray-800">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>

              {/* Company Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {company.name}
                  </h1>
                  {company.is_verified && (
                    <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
                  )}
                  {company.is_featured && (
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{company.headquarters.city}, {company.headquarters.country}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{getCompanySizeText(company.company_size)}</span>
                  </div>
                  {company.founded_year && (
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Founded {company.founded_year}</span>
                    </div>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                    >
                      <GlobeAltIcon className="w-4 h-4" />
                      <span>Website</span>
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompanySizeColor(company.company_size)}`}>
                    {company.industry}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {company.total_jobs} open positions
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {company.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Follow Company
              </button>
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                View All Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'jobs', label: `Jobs (${jobs.length})` },
              { id: 'reviews', label: `Reviews (${company.review_count})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Mission & Vision */}
                {(company.mission || company.vision) && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Mission & Vision
                    </h3>
                    {company.mission && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Mission</h4>
                        <p className="text-gray-600 dark:text-gray-400">{company.mission}</p>
                      </div>
                    )}
                    {company.vision && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Vision</h4>
                        <p className="text-gray-600 dark:text-gray-400">{company.vision}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Culture & Values */}
                {(company.culture.length > 0 || company.values.length > 0) && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Culture & Values
                    </h3>
                    {company.culture.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Culture</h4>
                        <div className="flex flex-wrap gap-2">
                          {company.culture.map((item, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {company.values.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Values</h4>
                        <div className="flex flex-wrap gap-2">
                          {company.values.map((item, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Technologies */}
                {company.technologies.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Company Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Company Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Team Size</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {company.team_size || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Open Jobs</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {company.total_jobs}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rating</span>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {company.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ({company.review_count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                {company.benefits.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Benefits
                    </h3>
                    <ul className="space-y-2">
                      {company.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckBadgeIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Social Links */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Follow Us
                  </h3>
                  <div className="space-y-2">
                    {company.social_links.linkedin && (
                      <a
                        href={company.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <span>LinkedIn</span>
                        <ExternalLinkIcon className="w-3 h-3" />
                      </a>
                    )}
                    {company.social_links.twitter && (
                      <a
                        href={company.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-500"
                      >
                        <span>Twitter</span>
                        <ExternalLinkIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Open Positions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This company doesn't have any open positions at the moment.
                  </p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="capitalize">{job.type}</span>
                          <span>{job.location}</span>
                          <span className="capitalize">{job.experience_level}</span>
                          {job.salary && (
                            <span>
                              {job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Posted {new Date(job.posted_at).toLocaleDateString()}
                        </span>
                        <Link
                          to={`/jobs/${job._id}`}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                          View Job
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to review this company.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
