import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';

export function Events() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingEvents = [
    {
      id: 1,
      title: 'Tech Career Fair 2024',
      date: '2024-02-15',
      time: '09:00 AM - 05:00 PM',
      location: 'Kigali Convention Centre',
      type: 'Career Fair',
      description: 'Connect with top tech companies and discover remote job opportunities.',
      attendees: 500,
      price: 'Free'
    },
    {
      id: 2,
      title: 'Remote Work Masterclass',
      date: '2024-02-20',
      time: '02:00 PM - 04:00 PM',
      location: 'Online',
      type: 'Workshop',
      description: 'Learn the essential skills and tools for successful remote work.',
      attendees: 150,
      price: 'Free'
    },
    {
      id: 3,
      title: 'Startup Pitch Competition',
      date: '2024-02-25',
      time: '10:00 AM - 06:00 PM',
      location: 'Kigali Innovation City',
      type: 'Competition',
      description: 'Showcase your startup idea and win funding opportunities.',
      attendees: 200,
      price: '$25'
    }
  ];

  const pastEvents = [
    {
      id: 4,
      title: 'Digital Skills Workshop',
      date: '2024-01-15',
      time: '10:00 AM - 03:00 PM',
      location: 'Kigali Public Library',
      type: 'Workshop',
      description: 'Introduction to digital marketing and social media management.',
      attendees: 75,
      price: 'Free'
    },
    {
      id: 5,
      title: 'Tech Networking Meetup',
      date: '2024-01-10',
      time: '06:00 PM - 09:00 PM',
      location: 'The Office Bar & Restaurant',
      type: 'Networking',
      description: 'Connect with fellow tech professionals and entrepreneurs.',
      attendees: 120,
      price: 'Free'
    }
  ];

  const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('events')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Join our events to network, learn new skills, and advance your career.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'upcoming'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {t('upcomingEvents')}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'past'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {t('pastEvents')}
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                {event.type}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {event.attendees} attendees
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {event.description}
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(event.date)}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {event.time}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {event.price}
              </div>
            </div>
            
            {activeTab === 'upcoming' && (
              <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                {t('registerEvent')}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Want to Host an Event?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Partner with us to organize career development events and workshops for the Rwandan tech community.
        </p>
        <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
          Partner With Us
        </button>
      </div>
    </DashboardLayout>
  );
}