import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  ClockIcon, 
  BookOpenIcon,
  VideoIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  SearchIcon
} from '../../components/icons';

interface LearningResource {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  short_description?: string;
  type: 'article' | 'video' | 'course' | 'tutorial' | 'guide';
  category: 'technical' | 'soft-skills' | 'career' | 'interview' | 'resume' | 'networking';
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  estimated_practice_time?: number;
  language: string;
  content_url?: string;
  video_url?: string;
  video_id?: string;
  thumbnail_url?: string;
  author?: string | { name: string };
  source?: string;
  tags: string[];
  views?: number;
  likes?: number;
  bookmarks?: number;
  is_featured?: boolean;
  created_at: string;
  playlistVideos?: any[];
}

export function Learning() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      // Use the main learning resources endpoint to get all 100 courses
      const response = await api.get('/learning?includeYouTube=true');
      
      // Handle both response formats: { success: true, resources: [] } or direct array
      const resources = response.data?.success
        ? (response.data.resources || [])
        : (Array.isArray(response.data) ? response.data : []);
        
      if (resources.length > 0) {
        // Show all available courses (up to 100)
        setResources(resources.slice(0, 100));
      } else {
        // No resources found - set empty array
        setResources([]);
      }
    } catch (error: any) {
      console.error('Failed to load learning resources:', error);
      setResources([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon className="w-5 h-5" />;
      case 'article': return <DocumentTextIcon className="w-5 h-5" />;
      case 'course': return <AcademicCapIcon className="w-5 h-5" />;
      case 'tutorial': return <BookOpenIcon className="w-5 h-5" />;
      default: return <BookOpenIcon className="w-5 h-5" />;
    }
  };

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (text: string): string => {
    if (!text) return '';
    return text
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'digital-literacy-productivity': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'soft-skills-professional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'entrepreneurship-business': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'job-search-career': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'technology-digital-careers': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'personal-development-workplace': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      // Legacy categories for backward compatibility
      case 'digital-ict': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'technical-vocational': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'soft-skills': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'quality-occupational': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'career': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'interview': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'resume': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'networking': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <AcademicCapIcon className="w-8 h-8 text-primary-600" />
              Learning & Upskilling Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover personalized YouTube courses and videos to enhance your skills and advance your career
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchCoursesSkillsTopics')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('allCategories')}</option>
            <option value="digital-literacy-productivity">Digital Literacy & Productivity</option>
            <option value="soft-skills-professional">Soft Skills & Professional</option>
            <option value="entrepreneurship-business">Entrepreneurship & Business</option>
            <option value="job-search-career">Job Search & Career</option>
            <option value="technology-digital-careers">Technology & Digital Careers</option>
            <option value="personal-development-workplace">Personal Development & Workplace</option>
            {/* Legacy options for backward compatibility */}
            <option value="digital-ict">Digital/ICT Skills</option>
            <option value="technical-vocational">Technical/Vocational Skills</option>
            <option value="soft-skills">{t('softSkills')}</option>
            <option value="quality-occupational">Quality/Occupational Match</option>
            <option value="technical">{t('technicalSkills')}</option>
            <option value="career">{t('careerDevelopment')}</option>
            <option value="interview">{t('interviewPrep')}</option>
            <option value="resume">{t('resumeBuilding')}</option>
            <option value="networking">{t('networking')}</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('allLevels')}</option>
            <option value="beginner">{t('beginner')}</option>
            <option value="intermediate">{t('intermediate')}</option>
            <option value="advanced">{t('advanced')}</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">{t('allTypes')}</option>
            <option value="video">{t('videos')}</option>
            <option value="article">{t('articles')}</option>
            <option value="course">{t('courses')}</option>
            <option value="tutorial">{t('tutorials')}</option>
            <option value="guide">{t('guides')}</option>
          </select>
        </div>
      </div>

      {/* Learning Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <BookOpenIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Learning Resources Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or filters
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center justify-center gap-1">
            <span className="text-primary-600">Tip:</span> Complete your profile with skills to get personalized YouTube course recommendations!
          </p>
        </div>
      ) : (
        <div>
          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recommended Courses & Videos
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource._id || resource.video_id || resource.id || Math.random()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 overflow-hidden"
            >
              {/* Thumbnail - Simplified */}
              <div className="relative h-40 bg-gradient-to-br from-primary-500 to-primary-600">
                {resource.thumbnail_url ? (
                  <img
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getTypeIcon(resource.type)}
                  </div>
                )}
                {/* Only show category badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                    {capitalizeWords(resource.category.replace('-', ' '))}
                  </span>
                </div>
                {/* Only show difficulty badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                    {capitalizeWords(resource.difficulty)}
                  </span>
                </div>
              </div>

              {/* Content - Simplified */}
              <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
                  {resource.title}
                </h3>

                {/* Footer - Minimal info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-3 h-3" />
                    <span>{resource.duration || 0}m</span>
                  </div>
                  <Link
                    to={`/learning/${resource._id || resource.video_id || resource.id}`}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
