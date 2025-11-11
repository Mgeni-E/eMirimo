import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  DocumentIcon,
  CheckIcon,
  XIcon,
  ExternalLinkIcon,
  CalendarIcon,
  StarIcon
} from '../../components/icons';
import { useNotification } from '../../contexts/NotificationContext';

interface ApplicationDetail {
  _id: string;
  status: string;
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  seeker_id: {
    _id: string;
    name: string;
    email: string;
    profile_image?: string;
    phone?: string;
    bio?: string;
    address?: {
      city?: string;
      country?: string;
    };
    skills?: Array<{ name: string; level: string } | string>;
    job_seeker_profile?: {
      professional_summary?: string;
      work_experience?: Array<{
        company: string;
        position: string;
        start_date: string;
        end_date?: string;
        description?: string;
      }>;
      education?: Array<{
        institution: string;
        degree: string;
        field_of_study?: string;
        start_date?: string;
        end_date?: string;
      }>;
      total_years_experience?: number;
    };
    cv_url?: string;
    social_links?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
  };
  job_id: {
    _id: string;
    title: string;
    company?: string;
    company_name?: string;
    location?: string | {
      city?: string;
      country?: string;
      address?: string;
      is_remote?: boolean;
      remote_allowed?: boolean;
    };
  };
}

export function JobSeekerDetail() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplicationDetails();
    }
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/${applicationId}`);
      if (response.data.success) {
        setApplication(response.data.application);
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load application details'
        });
        navigate('/employer/applications');
      }
    } catch (error: any) {
      console.error('Failed to load application details:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to load application details'
      });
      navigate('/employer/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;
    
    setUpdating(true);
    try {
      await api.put(`/employer/applications/${application._id}/status`, { status: newStatus });
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Application ${newStatus === 'shortlisted' ? 'shortlisted' : 'rejected'} successfully`
      });
      
      // Update local state
      setApplication({ ...application, status: newStatus });
      
      // Refresh the list after a delay
      setTimeout(() => {
        navigate('/employer/applications');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update application status:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update application status'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getResumeUrl = () => {
    if (!application) return null;
    
    // Get all possible resume URLs
    const urls = [
      application.resume_url,
      application.seeker_id?.cv_url,
      application.seeker_id?.job_seeker_profile?.documents?.resume_url
    ].filter(Boolean) as string[];
    
    // Prefer Firebase URLs (storage.googleapis.com) over Cloudinary URLs
    const firebaseUrl = urls.find(url => url.includes('storage.googleapis.com'));
    if (firebaseUrl) return firebaseUrl;
    
    // Fallback to any available URL
    return urls[0] || null;
  };

  const handleViewResume = () => {
    const resumeUrl = getResumeUrl();
    if (!resumeUrl) {
      showNotification({
        type: 'warning',
        title: 'Resume Not Available',
        message: 'The candidate has not uploaded a resume/CV'
      });
      return;
    }

    try {
      // Open PDF/document in new tab/window - browser will use built-in PDF viewer
      // This bypasses CORS issues and allows user to view and download from the viewer
      const newWindow = window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        // Popup blocked - fallback to direct download
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      showNotification({
        type: 'success',
        title: 'Opening Resume',
        message: 'The resume/CV is opening in a new tab...',
        duration: 3000
      });
    } catch (error: any) {
      console.error('Error opening resume:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to open resume/CV. ${error.message || 'Please try again.'}`
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'interview_scheduled':
      case 'interview_completed':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'offer_made':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'hired':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Application not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const seeker = application.seeker_id;
  const job = application.job_id;
  const resumeUrl = getResumeUrl();

  // Helper function to format location (handles both string and object)
  const formatLocation = (location: any): string => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.country) parts.push(location.country);
      if (location.address) parts.push(location.address);
      return parts.length > 0 ? parts.join(', ') : '';
    }
    return '';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {seeker.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Application for <span className="font-semibold">{job.title}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
            {resumeUrl && (
              <button
                onClick={handleViewResume}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <DocumentIcon className="w-5 h-5 mr-2" />
                View Resume
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden">
                {(() => {
                  const profileImage = seeker.profile_image;
                  const hasValidImage = profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && (profileImage.startsWith('http://') || profileImage.startsWith('https://'));
                  
                  if (hasValidImage) {
                    return (
                      <>
                        <img 
                          src={profileImage} 
                          alt={seeker.name}
                          className="w-20 h-20 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.avatar-fallback');
                              if (fallback) {
                                (fallback as HTMLElement).style.display = 'flex';
                              }
                            }
                          }}
                        />
                        <span className="avatar-fallback hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600">
                          {seeker.name.charAt(0).toUpperCase()}
                        </span>
                      </>
                    );
                  }
                  return (
                    <span>{seeker.name.charAt(0).toUpperCase()}</span>
                  );
                })()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {seeker.name}
                </h2>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {seeker.email && (
                    <div className="flex items-center">
                      <MailIcon className="w-4 h-4 mr-2" />
                      {seeker.email}
                    </div>
                  )}
                  {seeker.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-2" />
                      {seeker.phone}
                    </div>
                  )}
                  {seeker.address && (seeker.address.city || seeker.address.country) && (
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {[seeker.address.city, seeker.address.country].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {seeker.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{seeker.bio}</p>
              </div>
            )}

            {seeker.job_seeker_profile?.professional_summary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional Summary</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {seeker.job_seeker_profile.professional_summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {seeker.skills && seeker.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {seeker.skills.map((skill: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium"
                    >
                      {typeof skill === 'string' ? skill : skill.name || skill}
                      {typeof skill === 'object' && skill.level && (
                        <span className="ml-2 text-xs opacity-75">({skill.level})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {seeker.job_seeker_profile?.work_experience && seeker.job_seeker_profile.work_experience.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BriefcaseIcon className="w-5 h-5 mr-2" />
                  Work Experience
                </h3>
                <div className="space-y-4">
                  {seeker.job_seeker_profile.work_experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary-500 pl-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{exp.position}</h4>
                      <p className="text-primary-600 dark:text-primary-400 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                        {exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {seeker.job_seeker_profile?.education && seeker.job_seeker_profile.education.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-2" />
                  Education
                </h3>
                <div className="space-y-4">
                  {seeker.job_seeker_profile.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary-500 pl-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                      {edu.field_of_study && (
                        <p className="text-primary-600 dark:text-primary-400">{edu.field_of_study}</p>
                      )}
                      <p className="text-primary-600 dark:text-primary-400 font-medium">{edu.institution}</p>
                      {edu.start_date && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(edu.start_date).toLocaleDateString('en-US', { year: 'numeric' })} - {' '}
                          {edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { year: 'numeric' }) : 'Present'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {seeker.social_links && (seeker.social_links.linkedin || seeker.social_links.github || seeker.social_links.portfolio) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Social Links</h3>
                <div className="flex flex-wrap gap-3">
                  {seeker.social_links.linkedin && (
                    <a
                      href={seeker.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      LinkedIn
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </a>
                  )}
                  {seeker.social_links.github && (
                    <a
                      href={seeker.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      GitHub
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </a>
                  )}
                  {seeker.social_links.portfolio && (
                    <a
                      href={seeker.social_links.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      Portfolio
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cover Letter</h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {application.cover_letter}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Applied Date</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(application.applied_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Job Position</p>
                <p className="text-gray-900 dark:text-white font-medium">{job.title}</p>
              </div>
              {job.company || job.company_name && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {job.company || job.company_name}
                  </p>
                </div>
              )}
              {formatLocation(job.location) && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">{formatLocation(job.location)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
            <div className="space-y-3">
              {resumeUrl && (
                <button
                  onClick={handleViewResume}
                  className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <DocumentIcon className="w-5 h-5 mr-2" />
                  View Resume/CV
                </button>
              )}
              
              {application.status === 'applied' || application.status === 'under_review' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatusUpdate('shortlisted')}
                    disabled={updating}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    {updating ? 'Processing...' : 'Shortlist'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={updating}
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XIcon className="w-5 h-5 mr-2" />
                    {updating ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              ) : application.status === 'shortlisted' ? (
                <button
                  onClick={() => navigate('/employer/interviews')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Schedule Interview
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

