import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/icons';

export function PrivacyPolicy() {

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            1. Information We Collect
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              update your profile, apply for jobs, or contact us for support.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal information (name, email, phone number)</li>
              <li>Professional information (resume, work experience, skills)</li>
              <li>Account credentials and preferences</li>
              <li>Communication records and support interactions</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            2. How We Use Your Information
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Match job seekers with relevant opportunities</li>
              <li>Connect mentors with mentees</li>
              <li>Send important updates and notifications</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            3. Information Sharing
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With your explicit consent</li>
              <li>To facilitate job applications and mentorship connections</li>
              <li>With service providers who assist in platform operations</li>
              <li>When required by law or to protect our rights</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            4. Data Security
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure data centers and infrastructure</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            5. Your Rights
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and review your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability and export</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            6. Cookies and Tracking
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We use cookies and similar technologies to enhance your experience, 
              analyze usage patterns, and provide personalized content.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            7. Contact Us
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@emirimo.com</p>
              <p><strong>Address:</strong> Kigali, Rwanda</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
