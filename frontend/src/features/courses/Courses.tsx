import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon, ChartBarIcon, MobileIcon, ClipboardIcon, LockIcon } from '../../components/icons';

interface AvailableCourse {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  price: string;
  description: string;
  skills: string[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface MyCourse {
  id: number;
  title: string;
  progress: number;
  lastAccessed: string;
  nextLesson: string;
  completionDate: string;
}

export function Courses() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('available');

  const availableCourses: AvailableCourse[] = [
    {
      id: 1,
      title: 'Introduction to Web Development',
      instructor: 'Dr. Jean Paul Nkurunziza',
      duration: '8 weeks',
      level: 'Beginner',
      rating: 4.8,
      students: 1250,
      price: 'Free',
      description: 'Learn HTML, CSS, and JavaScript from scratch with hands-on projects.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
      icon: GlobeIcon
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      instructor: 'Dr. Marie Claire Uwimana',
      duration: '12 weeks',
      level: 'Intermediate',
      rating: 4.9,
      students: 890,
      price: 'RWF 50,000',
      description: 'Master Python, statistics, and machine learning for data analysis.',
      skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
      icon: ChartBarIcon
    },
    {
      id: 3,
      title: 'Digital Marketing Strategy',
      instructor: 'Mr. Patrick Nkurunziza',
      duration: '6 weeks',
      level: 'Beginner',
      rating: 4.7,
      students: 2100,
      price: 'RWF 25,000',
      description: 'Learn social media marketing, SEO, and content creation.',
      skills: ['Social Media', 'SEO', 'Content Marketing', 'Analytics'],
      icon: MobileIcon
    },
    {
      id: 4,
      title: 'Mobile App Development',
      instructor: 'Ms. Grace Mukamana',
      duration: '10 weeks',
      level: 'Intermediate',
      rating: 4.8,
      students: 750,
      price: 'RWF 75,000',
      description: 'Build mobile apps with React Native and Flutter.',
      skills: ['React Native', 'Flutter', 'Mobile UI/UX', 'API Integration'],
      icon: MobileIcon
    },
    {
      id: 5,
      title: 'Project Management Essentials',
      instructor: 'Mr. David Nsabimana',
      duration: '4 weeks',
      level: 'Beginner',
      rating: 4.6,
      students: 1800,
      price: 'RWF 30,000',
      description: 'Learn agile methodologies and project management tools.',
      skills: ['Agile', 'Scrum', 'Project Planning', 'Team Management'],
      icon: ClipboardIcon
    },
    {
      id: 6,
      title: 'Cybersecurity Basics',
      instructor: 'Dr. Emmanuel Niyonshuti',
      duration: '8 weeks',
      level: 'Intermediate',
      rating: 4.9,
      students: 650,
      price: 'RWF 60,000',
      description: 'Understand cybersecurity threats and protection strategies.',
      skills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Compliance'],
      icon: LockIcon
    }
  ];

  const myCourses: MyCourse[] = [
    {
      id: 1,
      title: 'Introduction to Web Development',
      progress: 75,
      lastAccessed: '2 days ago',
      nextLesson: 'CSS Flexbox and Grid',
      completionDate: '2024-03-15'
    },
    {
      id: 2,
      title: 'Digital Marketing Strategy',
      progress: 100,
      lastAccessed: '1 week ago',
      nextLesson: 'Course Completed',
      completionDate: '2024-02-28'
    }
  ];

  const courses = activeTab === 'available' ? availableCourses : myCourses;
  const isAvailableCourse = (_course: AvailableCourse | MyCourse): _course is AvailableCourse => activeTab === 'available';

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-display">
          {t('courses')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Enhance your skills with our comprehensive online courses designed for Rwandan professionals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
              activeTab === 'available'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('availableCourses')}
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
              activeTab === 'my'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t('myCourses')}
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {isAvailableCourse(course) ? (
              <>
                <div className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <course.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                      {course.level}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {course.rating}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by {course.instructor}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{course.duration}</span>
                    <span>{course.students} students</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {course.price}
                    </span>
                    <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                      {t('enrollCourse')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-display">
                    {course.title}
                  </h3>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>{t('courseProgress')}</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div>Last accessed: {course.lastAccessed}</div>
                    <div>Next: {course.nextLesson}</div>
                    {course.progress === 100 && (
                      <div className="text-green-600 dark:text-green-400 font-semibold">
                        Completed on {new Date(course.completionDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <button className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300">
                    {course.progress === 100 ? t('view') : 'Continue Learning'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-display">
          Ready to Start Learning?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of Rwandan professionals who are advancing their careers with our courses.
        </p>
        <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
          Browse All Courses
        </button>
      </div>
    </div>
  );
}
