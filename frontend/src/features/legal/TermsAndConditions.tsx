import { useTranslation } from 'react-i18next';

export function TermsAndConditions() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('termsAndConditions')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('lastUpdated')}: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            1. {t('acceptanceOfTerms')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              By accessing and using eMirimo, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            2. {t('descriptionOfService')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              eMirimo is a platform that connects Rwandan youth and graduates with remote work 
              opportunities, mentorship programs, and learning resources. Our services include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Job matching and application management</li>
              <li>Mentorship program facilitation</li>
              <li>Learning resources and skill development</li>
              <li>Professional networking opportunities</li>
              <li>Career guidance and support</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            3. {t('userAccounts')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
              <li>Update your information when it changes</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            4. {t('userConduct')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to the platform</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            5. {t('contentAndIntellectualProperty')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              You retain ownership of content you post, but grant us a license to use, 
              display, and distribute it in connection with our services. You must not 
              post content that infringes on others' intellectual property rights.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            6. {t('jobApplicationsAndMentorship')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We facilitate connections between users but are not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The accuracy of job postings or mentor profiles</li>
              <li>The outcome of job applications or mentorship relationships</li>
              <li>Employment decisions made by employers</li>
              <li>Mentorship quality or outcomes</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            7. {t('privacyAndDataProtection')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Your privacy is important to us. Please review our Privacy Policy to 
              understand how we collect, use, and protect your information.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            8. {t('serviceAvailability')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We strive to maintain service availability but cannot guarantee uninterrupted 
              access. We may temporarily suspend service for maintenance, updates, or 
              technical issues.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            9. {t('limitationOfLiability')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              To the maximum extent permitted by law, eMirimo shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages resulting 
              from your use of the service.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            10. {t('termination')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We may terminate or suspend your account at any time for violation of these 
              terms. You may also terminate your account at any time by contacting us.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            11. {t('changesToTerms')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              We reserve the right to modify these terms at any time. We will notify users 
              of significant changes via email or platform notification.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            12. {t('contactInformation')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p><strong>Email:</strong> legal@emirimo.com</p>
              <p><strong>Address:</strong> Kigali, Rwanda</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
