import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ClockIcon, 
  ContactIcon
} from '../../components/icons';

export function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Thank you for your message! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setMessage('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: ContactIcon,
      title: 'Address',
      details: ['Kigali Innovation City', 'KG 7 Ave, Kigali', 'Rwanda']
    },
    {
      icon: ContactIcon,
      title: 'Phone',
      details: ['+250 788 123 456', '+250 788 789 012']
    },
    {
      icon: ContactIcon,
      title: 'Email',
      details: ['info@emirimo.com', 'support@emirimo.com']
    },
    {
      icon: ClockIcon,
      title: 'Hours',
      details: ['Monday - Friday: 8:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 2:00 PM']
    }
  ];

  const faqs = [
    {
      question: 'How do I get started on eMirimo?',
      answer: 'Simply create an account, complete your profile, and start browsing available job opportunities or connect with mentors.'
    },
    {
      question: 'Is eMirimo free to use?',
      answer: 'Yes, eMirimo is free for job seekers. We also offer premium features for employers and mentors.'
    },
    {
      question: 'How do I become a mentor?',
      answer: 'Register as a mentor, complete your profile with your expertise areas, and start helping other professionals grow their careers.'
    },
    {
      question: 'Are the job opportunities verified?',
      answer: 'Yes, all job postings go through our verification process to ensure they are legitimate and from reputable companies.'
    },
    {
      question: 'Do you offer career counseling?',
      answer: 'Yes, we have certified career counselors and mentors who can provide personalized guidance and advice.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-display">
          {t('contact')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Get in touch with us. We'd love to hear from you and answer any questions you might have.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-display">
            Send us a Message
          </h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Thank you')
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('name')}
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('email')}
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="text"
                value={form.subject}
                onChange={(e) => setForm(prev => ({...prev, subject: e.target.value}))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32 resize-none"
                value={form.message}
                onChange={(e) => setForm(prev => ({...prev, message: e.target.value}))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? t('loading') : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-display">
              Get in Touch
            </h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {info.title}
                      </h3>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-600 dark:text-gray-400 text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-display">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 bg-blue-800 text-white rounded-lg flex items-center justify-center hover:bg-blue-900 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 bg-pink-600 text-white rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700 p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 font-display">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
