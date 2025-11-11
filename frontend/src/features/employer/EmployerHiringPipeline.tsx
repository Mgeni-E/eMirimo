import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { api } from '../../lib/api';
import { 
  UserIcon,
  CheckIcon,
  ClockIcon,
  XIcon,
  ArrowRightIcon,
  UsersIcon,
  TrendingUpIcon,
  CalendarIcon,
  StarIcon
} from '../../components/icons';

interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  experience: string;
  skills: string[];
  currentStage: 'applied' | 'screening' | 'interview' | 'final' | 'offer' | 'hired' | 'rejected';
  appliedAt: string;
  lastActivity: string;
  job: {
    id: string;
    title: string;
    department: string;
  };
  notes?: string;
  rating?: number;
  interviewScheduled?: string;
  offerDate?: string;
}

interface PipelineStats {
  total: number;
  applied: number;
  screening: number;
  interview: number;
  final: number;
  offer: number;
  hired: number;
  rejected: number;
  conversionRate: number;
  averageTimeToHire: number;
}

const pipelineStages = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-500', icon: UserIcon },
  { id: 'screening', name: 'Screening', color: 'bg-yellow-500', icon: ClockIcon },
  { id: 'interview', name: 'Interview', color: 'bg-purple-500', icon: CalendarIcon },
  { id: 'final', name: 'Final Review', color: 'bg-indigo-500', icon: StarIcon },
  { id: 'offer', name: 'Offer', color: 'bg-green-500', icon: CheckIcon },
  { id: 'hired', name: 'Hired', color: 'bg-emerald-500', icon: CheckIcon },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-500', icon: XIcon }
];

export function EmployerHiringPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<PipelineStats>({
    total: 0,
    applied: 0,
    screening: 0,
    interview: 0,
    final: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
    conversionRate: 0,
    averageTimeToHire: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employer/pipeline');
      const data = response.data || [];
      
      setCandidates(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        applied: data.filter((candidate: Candidate) => candidate.currentStage === 'applied').length,
        screening: data.filter((candidate: Candidate) => candidate.currentStage === 'screening').length,
        interview: data.filter((candidate: Candidate) => candidate.currentStage === 'interview').length,
        final: data.filter((candidate: Candidate) => candidate.currentStage === 'final').length,
        offer: data.filter((candidate: Candidate) => candidate.currentStage === 'offer').length,
        hired: data.filter((candidate: Candidate) => candidate.currentStage === 'hired').length,
        rejected: data.filter((candidate: Candidate) => candidate.currentStage === 'rejected').length,
        conversionRate: data.length > 0 ? (data.filter((c: Candidate) => c.currentStage === 'hired').length / data.length) * 100 : 0,
        averageTimeToHire: calculateAverageTimeToHire(data)
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageTimeToHire = (candidates: Candidate[]) => {
    const hiredCandidates = candidates.filter(c => c.currentStage === 'hired');
    if (hiredCandidates.length === 0) return 0;
    
    const totalDays = hiredCandidates.reduce((sum, candidate) => {
      const appliedDate = new Date(candidate.appliedAt);
      const hiredDate = new Date(candidate.lastActivity);
      const days = Math.ceil((hiredDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / hiredCandidates.length);
  };

  const moveCandidateToStage = async (candidateId: string, newStage: string) => {
    try {
      await api.put(`/employer/pipeline/${candidateId}/stage`, { stage: newStage });
      setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, currentStage: newStage as any, lastActivity: new Date().toISOString() }
          : candidate
      ));
      loadPipelineData(); // Refresh stats
    } catch (error) {
      console.error('Failed to move candidate to stage:', error);
    }
  };

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(candidate => 
      candidate.currentStage === stage && 
      (selectedJob === 'all' || candidate.job.id === selectedJob)
    );
  };

  const getStageColor = (stage: string) => {
    const stageConfig = pipelineStages.find(s => s.id === stage);
    return stageConfig?.color || 'bg-gray-500';
  };

  const getStageIcon = (stage: string) => {
    const stageConfig = pipelineStages.find(s => s.id === stage);
    const IconComponent = stageConfig?.icon || UserIcon;
    return <IconComponent className="w-4 h-4" />;
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Hiring Pipeline
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track candidates through your hiring process
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Candidates</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.hired}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hired</div>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.averageTimeToHire}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Days to Hire</div>
            </div>
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pipeline Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            {pipelineStages.map((stage, index) => (
              <div key={stage.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center text-white mb-2`}>
                  {getStageIcon(stage.id)}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{stage.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {candidates.filter(c => c.currentStage === stage.id).length}
                </div>
                {index < pipelineStages.length - 1 && (
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pipelineStages.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.id);
          return (
            <div key={stage.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full ${stage.color} flex items-center justify-center text-white`}>
                      {getStageIcon(stage.id)}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h4>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stageCandidates.length}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {stageCandidates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UserIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No candidates</p>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => (
                    <div key={candidate.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm relative overflow-hidden">
                          {(() => {
                            const profileImage = candidate.avatar || candidate.profile_image;
                            const hasValidImage = profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && (profileImage.startsWith('http://') || profileImage.startsWith('https://'));
                            
                            if (hasValidImage) {
                              return (
                                <>
                                  <img 
                                    src={profileImage} 
                                    alt={candidate.name}
                                    className="w-10 h-10 rounded-full object-cover"
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
                                    {candidate.name.charAt(0).toUpperCase()}
                                  </span>
                                </>
                              );
                            }
                            return (
                              <span>{candidate.name.charAt(0).toUpperCase()}</span>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {candidate.name}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {candidate.job.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {candidate.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon 
                                    key={i} 
                                    className={`w-3 h-3 ${i < candidate.rating! ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(candidate.lastActivity).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-3">
                        {stage.id === 'applied' && (
                          <button
                            onClick={() => moveCandidateToStage(candidate.id, 'screening')}
                            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Screen
                          </button>
                        )}
                        {stage.id === 'screening' && (
                          <button
                            onClick={() => moveCandidateToStage(candidate.id, 'interview')}
                            className="flex-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            Interview
                          </button>
                        )}
                        {stage.id === 'interview' && (
                          <button
                            onClick={() => moveCandidateToStage(candidate.id, 'final')}
                            className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                          >
                            Final Review
                          </button>
                        )}
                        {stage.id === 'final' && (
                          <button
                            onClick={() => moveCandidateToStage(candidate.id, 'offer')}
                            className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Make Offer
                          </button>
                        )}
                        {stage.id === 'offer' && (
                          <button
                            onClick={() => moveCandidateToStage(candidate.id, 'hired')}
                            className="flex-1 px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                          >
                            Hire
                          </button>
                        )}
                        {stage.id !== 'hired' && stage.id !== 'rejected' && (
                          <button
                            onClick={() => moveCandidateToStage(candidate.id, 'rejected')}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
