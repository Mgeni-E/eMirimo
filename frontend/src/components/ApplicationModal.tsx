import { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  user: {
    name: string;
    email: string;
    cv_url?: string;
    skills: string[];
    work_experience: any[];
  };
  onApply: (applicationData: ApplicationData) => Promise<void>;
}

interface ApplicationData {
  job_id: string;
  cover_letter: string;
  resume_url: string;
  availability: string;
  salary_expectation: {
    min: number;
    max: number;
    currency: string;
  };
  additional_notes: string;
}

export function ApplicationModal({ isOpen, onClose, job, user, onApply }: ApplicationModalProps) {
  const [formData, setFormData] = useState<ApplicationData>({
    job_id: job._id,
    cover_letter: '',
    resume_url: user.cv_url || '',
    availability: 'immediate',
    salary_expectation: {
      min: 0,
      max: 0,
      currency: 'RWF'
    },
    additional_notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        resume_url: user.cv_url || '',
        salary_expectation: {
          min: job.salary?.min || 0,
          max: job.salary?.max || 0,
          currency: job.salary?.currency || 'RWF'
        }
      }));
    }
  }, [isOpen, user, job]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cover_letter.trim()) {
      newErrors.cover_letter = 'Cover letter is required';
    } else if (formData.cover_letter.length < 50) {
      newErrors.cover_letter = 'Cover letter must be at least 50 characters';
    }

    if (!formData.resume_url.trim()) {
      newErrors.resume_url = 'Resume URL is required';
    }

    if (formData.salary_expectation.min < 0) {
      newErrors.salary_min = 'Salary expectation must be positive';
    }

    if (formData.salary_expectation.max < formData.salary_expectation.min) {
      newErrors.salary_max = 'Maximum salary must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onApply(formData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Application submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSalaryChange = (field: 'min' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      salary_expectation: {
        ...prev.salary_expectation,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Apply for {job.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {job.company} • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="p-6 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Application Submitted Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your application has been sent to {job.company}. You'll receive notifications about the status.
            </p>
          </div>
        )}

        {/* Application Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter *
              </label>
              <textarea
                value={formData.cover_letter}
                onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                placeholder="Tell us why you're the perfect fit for this role. Highlight your relevant experience and skills..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cover_letter ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={6}
                required
              />
              {errors.cover_letter && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.cover_letter}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.cover_letter.length}/500 characters
              </p>
            </div>

            {/* Resume URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume/CV URL *
              </label>
              <input
                type="url"
                value={formData.resume_url}
                onChange={(e) => handleInputChange('resume_url', e.target.value)}
                placeholder="https://your-resume.com or Google Drive link"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.resume_url ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.resume_url && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.resume_url}
                </p>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="immediate">Immediate</option>
                <option value="2-weeks">2 weeks notice</option>
                <option value="1-month">1 month notice</option>
                <option value="2-months">2 months notice</option>
                <option value="3-months">3 months notice</option>
              </select>
            </div>

            {/* Salary Expectation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary Expectation (RWF)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                  <input
                    type="number"
                    value={formData.salary_expectation.min}
                    onChange={(e) => handleSalaryChange('min', parseInt(e.target.value) || 0)}
                    placeholder="500000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.salary_min ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.salary_min && (
                    <p className="mt-1 text-xs text-red-600">{errors.salary_min}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                  <input
                    type="number"
                    value={formData.salary_expectation.max}
                    onChange={(e) => handleSalaryChange('max', parseInt(e.target.value) || 0)}
                    placeholder="800000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.salary_max ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.salary_max && (
                    <p className="mt-1 text-xs text-red-600">{errors.salary_max}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                placeholder="Any additional information you'd like to share..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
