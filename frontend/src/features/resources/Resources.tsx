import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DocumentIcon, BriefcaseIcon, RocketIcon, HandshakeIcon, TargetIcon, UsersIcon } from '../../components/icons';

export function Resources() {
  const { t } = useTranslation();

  const resourceCategories = [
    {
      title: t('resumeTips'),
      description: 'Learn how to create a compelling resume that stands out to employers',
      icon: DocumentIcon,
      articles: [
        'How to Write a Professional Resume',
        'Resume Templates for Tech Jobs',
        'Common Resume Mistakes to Avoid',
        'Tailoring Your Resume for Remote Jobs'
      ]
    },
    {
      title: t('interviewPrep'),
      description: 'Master the art of interviewing with our comprehensive guides',
      icon: BriefcaseIcon,
      articles: [
        'Technical Interview Preparation',
        'Behavioral Interview Questions',
        'Remote Interview Best Practices',
        'Salary Negotiation Strategies'
      ]
    },
    {
      title: t('skillDevelopment'),
      description: 'Enhance your technical and soft skills for career growth',
      icon: RocketIcon,
      articles: [
        'Programming Languages to Learn in 2024',
        'Soft Skills for Remote Work',
        'Project Management Fundamentals',
        'Building Your Personal Brand'
      ]
    },
    {
      title: t('networking'),
      description: 'Build meaningful professional connections and relationships',
      icon: HandshakeIcon,
      articles: [
        'LinkedIn Optimization Tips',
        'Networking Events and Meetups',
        'Building Professional Relationships',
        'Mentoring and Being Mentored'
      ]
    },
    {
      title: t('careerPlanning'),
      description: 'Plan your career path and set achievable goals',
      icon: TargetIcon,
      articles: [
        'Setting Career Goals',
        'Career Transition Strategies',
        'Building a Portfolio',
        'Freelancing vs Full-time Employment'
      ]
    },
    {
      title: t('mentorship'),
      description: 'Connect with mentors and guide others in their journey',
      icon: UsersIcon,
      articles: [
        'Finding the Right Mentor',
        'Being an Effective Mentor',
        'Mentorship Programs',
        'Mentoring the Next Generation'
      ]
    }
  ];

  const categories = ['All', 'Resume', 'Interview', 'Skills', 'Networking', 'Career', 'Mentorship'];

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('careerResources')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Everything you need to advance your career, from resume tips to interview preparation and skill development.
        </p>
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

      {/* Resource Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {resourceCategories.map((category, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <category.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {category.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {category.description}
            </p>
            <div className="space-y-2">
              {category.articles.map((article, articleIndex) => (
                <div
                  key={articleIndex}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  {article}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Start Your Career Journey?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Join thousands of Rwandan professionals who have used these resources to advance their careers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/jobs"
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {t('browseJobs')}
          </Link>
          <Link
            to="/mentors"
            className="px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg font-bold text-lg transition-all duration-300"
          >
            {t('findMentor')}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}