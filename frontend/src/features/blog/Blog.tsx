import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ArrowRightIcon, 
  StarIcon,
  UsersIcon,
  SettingsIcon
} from '../../components/icons';
import { DashboardLayout } from '../../components/DashboardLayout';

export function Blog() {
  const { t } = useTranslation();

  const blogPosts = [
    {
      id: 1,
      title: 'How to Land Your First Remote Job in 2024',
      excerpt: 'A comprehensive guide for Rwandan graduates looking to start their remote work journey.',
      author: 'Dr. Jean Paul Nkurunziza',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'Career',
      icon: StarIcon,
      featured: true
    },
    {
      id: 2,
      title: 'Building a Strong Professional Network in Tech',
      excerpt: 'Learn how to connect with industry professionals and build meaningful relationships.',
      author: 'Sarah Uwimana',
      date: '2024-01-12',
      readTime: '6 min read',
      category: 'Networking',
      icon: UsersIcon,
      featured: false
    },
    {
      id: 3,
      title: 'Essential Skills for Remote Software Developers',
      excerpt: 'The technical and soft skills you need to succeed as a remote developer.',
      author: 'Alex Kamanzi',
      date: '2024-01-10',
      readTime: '10 min read',
      category: 'Skills',
      icon: SettingsIcon,
      featured: false
    },
    {
      id: 4,
      title: 'Creating an Impressive Tech Portfolio',
      excerpt: 'Step-by-step guide to showcase your projects and stand out to employers.',
      author: 'Grace Mukamana',
      date: '2024-01-08',
      readTime: '7 min read',
      category: 'Career',
      icon: StarIcon,
      featured: false
    },
    {
      id: 5,
      title: 'The Future of Work in Rwanda',
      excerpt: 'Exploring how remote work is transforming the Rwandan job market.',
      author: 'Dr. Emmanuel Nkurunziza',
      date: '2024-01-05',
      readTime: '9 min read',
      category: 'Industry',
      icon: UsersIcon,
      featured: false
    },
    {
      id: 6,
      title: 'Mentoring the Next Generation',
      excerpt: 'How experienced professionals can guide and support young talent.',
      author: 'Marie Claire Uwimana',
      date: '2024-01-03',
      readTime: '5 min read',
      category: 'Mentorship',
      icon: SettingsIcon,
      featured: false
    }
  ];

  const categories = ['All', 'Career', 'Networking', 'Skills', 'Industry', 'Mentorship'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('blog')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Insights, tips, and success stories to help you advance your career in the digital age.
        </p>
      </div>

      {/* Featured Post */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-semibold">
            Featured
          </span>
          <span className="px-3 py-1 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold border border-primary-200 dark:border-primary-800">
            {blogPosts[0].category}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {blogPosts[0].title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {blogPosts[0].excerpt}
        </p>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>By {blogPosts[0].author}</span>
            <span>•</span>
            <span>{formatDate(blogPosts[0].date)}</span>
            <span>•</span>
            <span>{blogPosts[0].readTime}</span>
          </div>
          <Link
            to={`/blog/${blogPosts[0].id}`}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Read More
          </Link>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                category === 'All'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 border dark:border-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {blogPosts.slice(1).map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <post.icon className="w-5 h-5 text-white" />
              </div>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                {post.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {post.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>By {post.author}</span>
              <span>{post.readTime}</span>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {formatDate(post.date)}
            </div>
            
            <Link
              to={`/blog/${post.id}`}
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
            >
              Read More
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </article>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Stay Updated
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Get the latest career tips, job opportunities, and industry insights delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
            Subscribe
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}