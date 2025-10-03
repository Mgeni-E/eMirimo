import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  DocumentIcon, 
  PlusIcon, 
  SearchIcon,
  FilterIcon,
  EyeIcon,
  DownloadIcon,
  ShareIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  UsersIcon
} from '../../components/icons';

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'template';
  category: 'career' | 'technical' | 'interview' | 'resume' | 'networking';
  description: string;
  uploadDate: string;
  downloads: number;
  sharedWith: string[];
  tags: string[];
  fileSize?: string;
  url?: string;
}

export function ShareResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would fetch from mentor API
      const mockResources: Resource[] = [
        {
          id: '1',
          title: 'Software Engineer Resume Template',
          type: 'template',
          category: 'resume',
          description: 'A comprehensive resume template tailored for software engineering positions',
          uploadDate: '2024-01-20',
          downloads: 45,
          sharedWith: ['Alice Johnson', 'Bob Smith'],
          tags: ['resume', 'software engineer', 'template'],
          fileSize: '2.3 MB'
        },
        {
          id: '2',
          title: 'Technical Interview Preparation Guide',
          type: 'document',
          category: 'interview',
          description: 'Complete guide covering common technical interview questions and best practices',
          uploadDate: '2024-01-18',
          downloads: 67,
          sharedWith: ['Carol Williams', 'David Brown'],
          tags: ['interview', 'technical', 'preparation'],
          fileSize: '5.1 MB'
        },
        {
          id: '3',
          title: 'React.js Fundamentals Video Series',
          type: 'video',
          category: 'technical',
          description: '5-part video series covering React.js basics and advanced concepts',
          uploadDate: '2024-01-15',
          downloads: 89,
          sharedWith: ['Alice Johnson', 'Bob Smith', 'Carol Williams'],
          tags: ['react', 'javascript', 'frontend', 'video'],
          url: 'https://example.com/react-series'
        },
        {
          id: '4',
          title: 'Networking Strategy Guide',
          type: 'document',
          category: 'networking',
          description: 'Tips and strategies for effective professional networking',
          uploadDate: '2024-01-12',
          downloads: 34,
          sharedWith: ['David Brown'],
          tags: ['networking', 'career', 'professional'],
          fileSize: '1.8 MB'
        },
        {
          id: '5',
          title: 'Career Transition Checklist',
          type: 'link',
          category: 'career',
          description: 'Step-by-step checklist for successful career transitions',
          uploadDate: '2024-01-10',
          downloads: 56,
          sharedWith: ['Alice Johnson', 'Carol Williams'],
          tags: ['career', 'transition', 'checklist'],
          url: 'https://example.com/career-checklist'
        }
      ];
      setResources(mockResources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'link': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'template': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'career': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'interview': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'resume': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'networking': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <DocumentIcon className="w-5 h-5" />;
      case 'video': return <DocumentIcon className="w-5 h-5" />; // Could be a video icon
      case 'link': return <ShareIcon className="w-5 h-5" />;
      case 'template': return <DocumentIcon className="w-5 h-5" />;
      default: return <DocumentIcon className="w-5 h-5" />;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Share Resources</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and share learning resources with your mentees</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Resources</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {resources.reduce((sum, r) => sum + r.downloads, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DownloadIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {resources.filter(r => r.type === 'document').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {resources.filter(r => r.type === 'video').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="career">Career</option>
              <option value="technical">Technical</option>
              <option value="interview">Interview</option>
              <option value="resume">Resume</option>
              <option value="networking">Networking</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="link">Links</option>
              <option value="template">Templates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {resource.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(resource.type)}`}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(resource.category)}`}>
                      {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
              {resource.description}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {resource.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  {tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  +{resource.tags.length - 3} more
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <DownloadIcon className="w-4 h-4 mr-1" />
                {resource.downloads} downloads
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                {resource.sharedWith.length} shared
              </div>
            </div>
            
            {resource.fileSize && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Size: {resource.fileSize}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex-1">
                <DownloadIcon className="w-4 h-4 mr-1" />
                Download
              </button>
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                <ShareIcon className="w-4 h-4" />
              </button>
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                <EditIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Resource Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Resource</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Resource upload form would go here...</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
