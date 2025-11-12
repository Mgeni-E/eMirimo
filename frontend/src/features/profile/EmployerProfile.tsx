import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { 
  UploadIcon
} from '../../components/icons';

interface EmployerProfileData {
  name: string;
  email: string;
  role: string;
  company_name: string;
  company_description: string;
  company_size: string;
  industry: string;
  website: string;
  position: string;
  department: string;
  hiring_authority: boolean;
  phone: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  linkedin: string;
  profile_image: string;
  is_verified: boolean;
}

const companySizes = [
  '1-10 employees',
  '11-50 employees', 
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Non-profit',
  'Government',
  'Other'
];

export function EmployerProfile() {
  const [profile, setProfile] = useState<EmployerProfileData>({
    name: '',
    email: '',
    role: '',
    company_name: '',
    company_description: '',
    company_size: '',
    industry: '',
    website: '',
    position: '',
    department: '',
    hiring_authority: false,
    phone: '',
    address: '',
    city: '',
    country: 'Rwanda',
    bio: '',
    linkedin: '',
    profile_image: '',
    is_verified: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For local preview only

  useEffect(() => {
    fetchProfile();
  }, []);

  // Cleanup blob URL when component unmounts or imagePreview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/me');
      if (response.data?.user) {
        const userData = response.data.user;
        // Map backend data to frontend state, ensuring all fields are strings (not undefined)
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || '',
          company_name: userData.company_name || '',
          company_description: userData.company_description || '',
          company_size: userData.company_size || '',
          industry: userData.industry || '',
          website: userData.website || userData.company_website || '',
          position: userData.position || '',
          department: userData.department || '',
          hiring_authority: userData.hiring_authority || false,
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || 'Rwanda',
          bio: userData.bio || '',
          linkedin: userData.linkedin || '',
          profile_image: userData.profile_image || '',
          is_verified: userData.is_verified || false
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      setMessage({ 
        text: error.response?.data?.error || 'Failed to load profile. Please refresh the page.', 
        type: 'error' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Prepare profile data for saving - filter out blob URLs
      let profileToSave: any = { ...profile };
      
      // If profile_image is a blob URL, don't send it (user needs to upload to Cloudinary first)
      if (profileToSave.profile_image && profileToSave.profile_image.startsWith('blob:')) {
        // Remove blob URL - keep existing image or empty
        const { profile_image, ...rest } = profileToSave;
        profileToSave = rest;
        setMessage({ 
          text: 'Please upload your profile image using the Upload Image button before saving.', 
          type: 'error' 
        });
        setTimeout(() => setMessage(null), 5000);
        setSaving(false);
        return;
      }
      
      const response = await api.put('/users/me', profileToSave);
      if (response.data?.user) {
        // Update local state with response data
        const userData = response.data.user;
        setProfile(prev => ({
          ...prev,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          company_name: userData.company_name || prev.company_name,
          company_description: userData.company_description || prev.company_description,
          company_size: userData.company_size || prev.company_size,
          industry: userData.industry || prev.industry,
          website: userData.website || userData.company_website || prev.website,
          position: userData.position || prev.position,
          department: userData.department || prev.department,
          hiring_authority: userData.hiring_authority !== undefined ? userData.hiring_authority : prev.hiring_authority,
          phone: userData.phone || prev.phone,
          address: userData.address || prev.address,
          city: userData.city || prev.city,
          country: userData.country || prev.country,
          bio: userData.bio || prev.bio,
          linkedin: userData.linkedin || prev.linkedin,
          profile_image: userData.profile_image || prev.profile_image
        }));
        
        // Update auth store with new user name if it changed
        const { useAuth } = await import('../../lib/store');
        const currentAuthUser = useAuth.getState().user;
        if (currentAuthUser && userData.name !== currentAuthUser.name) {
          useAuth.getState().setUser({
            ...currentAuthUser,
            name: userData.name
          });
        }
        
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setMessage({ 
        text: error.response?.data?.error || error.response?.data?.message || 'Failed to update profile. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Use storage service for image uploads (Cloudinary)
  const uploadAvatarToCloudinary = async (file: File): Promise<string> => {
    const { uploadImageToCloudinary } = await import('../../lib/storage.service');
    return uploadImageToCloudinary(file, { folder: 'profile_images' });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      // Upload to Cloudinary first
      const imageUrl = await uploadAvatarToCloudinary(file);
      
      // Then update profile with the image URL
      const response = await api.post('/users/me/image', { imageUrl });
      
      if (response.data?.user) {
        const newImageUrl = response.data.user.profile_image || imageUrl;
        setProfile(prev => ({
          ...prev,
          profile_image: newImageUrl
        }));
        // Cleanup and clear preview since we now have a real URL
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setMessage({ text: 'Profile image uploaded successfully!', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Failed to upload profile image:', error);
      setMessage({ 
        text: error.response?.data?.error || 'Failed to upload profile image. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Employer Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your company information and hiring preferences.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div className="mb-6 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          Loading profile...
        </div>
      )}

      {/* Profile Image Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Image</h2>
        <div className="flex items-center space-x-6">
          {(imagePreview || profile.profile_image) ? (
            <img
              src={imagePreview || profile.profile_image || ''}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`;
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
              <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Create preview URL for immediate display (blob URL, not saved)
                  const previewUrl = URL.createObjectURL(file);
                  setImagePreview(previewUrl);
                  // Upload to Cloudinary
                  handleFileUpload(file);
                }
                // Reset input to allow selecting the same file again
                e.target.value = '';
              }}
              className="hidden"
              id="profile-image-upload"
              disabled={uploading}
            />
            <label
              htmlFor="profile-image-upload"
              className={`cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </label>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name or Company Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Your personal name or company name"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use your personal name if you're an HR/recruiting staff member, or your company name if this is a company account.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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
            placeholder="Tell us about yourself and your role..."
          />
        </div>
      </div>

            {/* Company Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={profile.company_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter company name"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This is the company name that will appear on job postings. If you used your personal name above, enter your company name here.
                  </p>
                </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Size
            </label>
            <select
              value={profile.company_size}
              onChange={(e) => setProfile(prev => ({ ...prev, company_size: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select company size</option>
              {companySizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <select
              value={profile.industry}
              onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={profile.website || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Position
            </label>
            <input
              type="text"
              value={profile.position || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., HR Manager, CEO, Recruiter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <input
              type="text"
              value={profile.department || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Human Resources, Engineering"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Description
          </label>
          <textarea
            value={profile.company_description || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, company_description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe your company, its mission, values, and what makes it unique..."
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {(profile.company_description || '').length}/1000 characters
          </p>
        </div>
        <div className="mt-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.hiring_authority}
              onChange={(e) => setProfile(prev => ({ ...prev, hiring_authority: e.target.checked }))}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              I have hiring authority in this company
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-8">
            Check this if you have the authority to make hiring decisions
          </p>
        </div>
      </div>

      {/* Company Location */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Company Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={profile.city || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={profile.linkedin || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://linkedin.com/in/yourprofile"
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
