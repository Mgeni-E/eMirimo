import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  UsersIcon, 
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  MessageIcon,
  CalendarIcon
} from '../../components/icons';

interface Candidate {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  stage: 'applied' | 'screening' | 'interview' | 'final' | 'offer' | 'hired' | 'rejected';
  appliedDate: string;
  lastActivity: string;
  experience: string;
  skills: string[];
  rating: number;
  notes: string;
}

export function HiringPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from employer API
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          jobTitle: 'Senior Software Engineer',
          stage: 'interview',
          appliedDate: '2024-01-22',
          lastActivity: '2024-01-23',
          experience: '5 years in software development',
          skills: ['React.js', 'Node.js', 'AWS', 'MongoDB'],
          rating: 4.5,
          notes: 'Strong technical background, good communication skills'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          jobTitle: 'Frontend Developer Intern',
          stage: 'screening',
          appliedDate: '2024-01-21',
          lastActivity: '2024-01-22',
          experience: '1 year in web development',
          skills: ['HTML', 'CSS', 'JavaScript', 'React.js'],
          rating: 4.0,
          notes: 'Enthusiastic learner, basic skills but good potential'
        },
        {
          id: '3',
          name: 'Carol Williams',
          email: 'carol@example.com',
          jobTitle: 'Senior Software Engineer',
          stage: 'final',
          appliedDate: '2024-01-20',
          lastActivity: '2024-01-24',
          experience: '6 years in full-stack development',
          skills: ['Python', 'Django', 'React.js', 'PostgreSQL'],
          rating: 4.8,
          notes: 'Excellent technical skills, great cultural fit'
        },
        {
          id: '4',
          name: 'David Brown',
          email: 'david@example.com',
          jobTitle: 'Frontend Developer Intern',
          stage: 'rejected',
          appliedDate: '2024-01-19',
          lastActivity: '2024-01-20',
          experience: '6 months in web development',
          skills: ['HTML', 'CSS', 'JavaScript'],
          rating: 3.2,
          notes: 'Limited experience, needs more development'
        },
        {
          id: '5',
          name: 'Eve Davis',
          email: 'eve@example.com',
          jobTitle: 'DevOps Engineer',
          stage: 'hired',
          appliedDate: '2024-01-18',
          lastActivity: '2024-01-25',
          experience: '4 years in DevOps and cloud infrastructure',
          skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
          rating: 4.9,
          notes: 'Outstanding candidate, ready to start immediately'
        },
        {
          id: '6',
          name: 'Frank Miller',
          email: 'frank@example.com',
          jobTitle: 'Senior Software Engineer',
          stage: 'applied',
          appliedDate: '2024-01-23',
          lastActivity: '2024-01-23',
          experience: '7 years in software development',
          skills: ['Java', 'Spring Boot', 'React.js', 'AWS'],
          rating: 4.3,
          notes: 'Recent application, needs initial review'
        }
      ];
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'applied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'screening': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'interview': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'final': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'offer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const moveCandidate = (candidateId: string, newStage: Candidate['stage']) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === candidateId ? { ...candidate, stage: newStage } : candidate
    ));
  };

  const getStageOrder = (stage: string) => {
    const order = ['applied', 'screening', 'interview', 'final', 'offer', 'hired', 'rejected'];
    return order.indexOf(stage);
  };

  const getNextStage = (currentStage: string) => {
    switch (currentStage) {
      case 'applied': return 'screening';
      case 'screening': return 'interview';
      case 'interview': return 'final';
      case 'final': return 'offer';
      case 'offer': return 'hired';
      default: return currentStage;
    }
  };

  const stages = [
    { key: 'applied', name: 'Applied', count: candidates.filter(c => c.stage === 'applied').length },
    { key: 'screening', name: 'Screening', count: candidates.filter(c => c.stage === 'screening').length },
    { key: 'interview', name: 'Interview', count: candidates.filter(c => c.stage === 'interview').length },
    { key: 'final', name: 'Final Review', count: candidates.filter(c => c.stage === 'final').length },
    { key: 'offer', name: 'Offer', count: candidates.filter(c => c.stage === 'offer').length },
    { key: 'hired', name: 'Hired', count: candidates.filter(c => c.stage === 'hired').length }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hiring Pipeline</h1>
        <p className="text-gray-600 dark:text-gray-400">Track candidates through your hiring process</p>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stages.map((stage, index) => (
            <div key={stage.key} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStageColor(stage.key)}`}>
                <span className="text-sm font-bold">{stage.count}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stage.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter(c => c.stage === stage.key);
          
          return (
            <div key={stage.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(stage.key)}`}>
                    {stage.count}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {stageCandidates.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No candidates in this stage
                  </p>
                ) : (
                  stageCandidates.map((candidate) => (
                    <div key={candidate.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <UsersIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {candidate.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {candidate.jobTitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {candidate.rating}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                              +{candidate.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {candidate.notes}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {new Date(candidate.appliedDate).toLocaleDateString()}
                        </div>
                        <span>Last: {new Date(candidate.lastActivity).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          View
                        </button>
                        <button className="flex items-center px-2 py-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                          <MessageIcon className="w-3 h-3 mr-1" />
                          Contact
                        </button>
                        {candidate.stage !== 'hired' && candidate.stage !== 'rejected' && (
                          <button 
                            onClick={() => moveCandidate(candidate.id, getNextStage(candidate.stage) as Candidate['stage'])}
                            className="flex items-center px-2 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                          >
                            <ArrowRightIcon className="w-3 h-3 mr-1" />
                            Move
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
