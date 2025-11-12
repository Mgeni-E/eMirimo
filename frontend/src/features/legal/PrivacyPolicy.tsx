import { useTranslation } from 'react-i18next';

export function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('privacyPolicy')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('lastUpdated')}: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            1. {t('informationWeCollect')}
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
            2. {t('howWeUseYourInformation')}
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
            3. {t('informationSharing')}
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
            4. {t('dataSecurity')}
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
            5. {t('yourRights')}
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
            6. {t('cookiesAndTracking')}
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
            7. {t('contactUs')}
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
