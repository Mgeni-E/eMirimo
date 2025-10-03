import { ProfileIcon, UsersIcon, SettingsIcon, HeartIcon, StarIcon, TargetIcon, EyeIcon } from '../../components/icons';

export function About() {

  const team = [
    {
      name: 'Dr. Jean Paul Nkurunziza',
      role: 'Founder & CEO',
      bio: 'Tech entrepreneur with 10+ years experience in software development and remote work.',
      icon: ProfileIcon
    },
    {
      name: 'Ms. Grace Mukamana',
      role: 'Head of Operations',
      bio: 'Expert in talent development and career coaching for African professionals.',
      icon: UsersIcon
    },
    {
      name: 'Mr. Patrick Nkurunziza',
      role: 'Lead Developer',
      bio: 'Full-stack developer passionate about building solutions for African markets.',
      icon: SettingsIcon
    },
    {
      name: 'Dr. Marie Claire Uwimana',
      role: 'Head of Mentorship',
      bio: 'Data scientist and mentor helping young professionals navigate tech careers.',
      icon: HeartIcon
    }
  ];

  const stats = [
    { number: '5,000+', label: 'Active Users' },
    { number: '1,200+', label: 'Jobs Posted' },
    { number: '850+', label: 'Successful Hires' },
    { number: '200+', label: 'Expert Mentors' }
  ];

  const values = [
    {
      title: 'Empowerment',
      description: 'We believe in empowering Rwandan youth with the tools and opportunities they need to succeed globally.',
      icon: HeartIcon
    },
    {
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to create innovative solutions for career development.',
      icon: SettingsIcon
    },
    {
      title: 'Community',
      description: 'We foster a supportive community where professionals can learn, grow, and succeed together.',
      icon: UsersIcon
    },
    {
      title: 'Excellence',
      description: 'We are committed to delivering high-quality services and maintaining the highest standards.',
      icon: StarIcon
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 font-display">
          About eMirimo
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          We are a comprehensive career and mentorship platform specifically designed to empower Rwandan youth and graduates with global remote opportunities. Our mission is to bridge the gap between talented Rwandan professionals and international job markets.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <TargetIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-display">
            Our Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To empower Rwandan youth and graduates by connecting them with verified remote job opportunities, expert mentorship, and comprehensive career development resources that enable them to build successful global careers.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <EyeIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-display">
            Our Vision
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To become the leading platform for African professionals seeking remote work opportunities, creating a bridge between local talent and global markets while fostering economic growth and development across the continent.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 font-display">
          Our Impact
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2 font-display">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 font-display">
          Our Values
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-display">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 font-display">
          Meet Our Team
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-6 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <member.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display">
                {member.name}
              </h3>
              <p className="text-primary-600 dark:text-primary-400 font-semibold mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold text-center mb-8 font-display">
          Our Story
        </h2>
        <div className="max-w-4xl mx-auto text-lg text-gray-300 leading-relaxed space-y-6">
          <p>
            eMirimo was born from a simple observation: talented Rwandan graduates were struggling to find meaningful career opportunities, while international companies were desperately seeking skilled remote workers. This disconnect inspired us to create a bridge.
          </p>
          <p>
            Founded in 2023 by a team of Rwandan tech professionals who had successfully built global careers, we understood the challenges and opportunities firsthand. We knew that with the right platform, mentorship, and resources, Rwandan youth could compete and excel on the global stage.
          </p>
          <p>
            Today, eMirimo has grown into a comprehensive ecosystem that not only connects talent with opportunities but also provides the mentorship, training, and community support needed for long-term career success. We're proud to be part of Rwanda's digital transformation and the broader African tech revolution.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-display">
          Join Our Mission
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Whether you're a job seeker, employer, or mentor, there's a place for you in the eMirimo community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started
          </a>
          <a
            href="/contact"
            className="px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg font-bold text-lg transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
