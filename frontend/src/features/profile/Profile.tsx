import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/store';
import { api } from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

interface ProfileData {
  name: string;
  email: string;
  role: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  skills: string[];
  experience: string;
  education: string;
  languages: string[];
}

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    email: '',
    role: user?.role || '',
    skills: [],
    experience: '',
    education: '',
    languages: []
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        role: user.role
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const removeSkill = (index: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    setProfile(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const updateLanguage = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => i === index ? value : lang)
    }));
  };

  const removeLanguage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('profile')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal information and professional details.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('success')
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {message}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={profile.bio || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Professional Information</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience
            </label>
            <textarea
              value={profile.experience}
              onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your work experience..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Education
            </label>
            <textarea
              value={profile.education}
              onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Your educational background..."
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Skills</h2>
        <div className="space-y-4">
          {profile.skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter a skill"
              />
              <button
                onClick={() => removeSkill(index)}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addSkill}
            className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Add Skill
          </button>
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Languages</h2>
        <div className="space-y-4">
          {profile.languages.map((language, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={language}
                onChange={(e) => updateLanguage(index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter a language"
              />
              <button
                onClick={() => removeLanguage(index)}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addLanguage}
            className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Add Language
          </button>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={profile.website || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={profile.linkedin || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GitHub
            </label>
            <input
              type="url"
              value={profile.github || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twitter
            </label>
            <input
              type="url"
              value={profile.twitter || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </DashboardLayout>
  );
}