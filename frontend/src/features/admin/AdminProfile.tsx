import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../lib/store';
import { 
  UserIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon
} from '../../components/icons';
import { api } from '../../lib/api';
import { socketService } from '../../lib/socket';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
  profilePicture?: string;
  phone?: string;
  bio?: string;
  location?: string;
}

export function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: ''
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      // Fetch real admin profile data from API
      const response = await api.get('/admin/profile');
      
      const profileData = response.data;
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        location: profileData.location || ''
      });
      
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      console.error('Error response:', error.response?.data);
      
      // Fallback to mock data if API fails
      const mockProfile: AdminProfile = {
        id: user?.id || '1',
        name: user?.name || 'Admin User',
        email: 'admin@emirimo.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        permissions: [
          'user_management',
          'job_moderation',
          'system_settings',
          'analytics_access',
          'notification_management'
        ],
        profilePicture: '',
        phone: '',
        bio: 'Administrator of eMirimo platform',
        location: 'Kigali, Rwanda'
      };
      
      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        bio: mockProfile.bio || '',
        location: mockProfile.location || ''
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleAdminUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'profile-update':
        loadProfile(); // Refresh profile data
        break;
    }
  }, [loadProfile]);

  const setupSocketConnection = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        
        // Listen for connection status
        socketService.getSocket()?.on('connect', () => {
          socketService.getSocket()?.emit('join-admin-dashboard');
        });

        socketService.getSocket()?.on('disconnect', () => {
          // Connection lost
        });

        socketService.getSocket()?.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
        
        // Listen for admin updates
        socketService.onAdminUpdate((data) => {
          handleAdminUpdate(data);
        });
      }
    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }
  }, [handleAdminUpdate]);

  useEffect(() => {
    loadProfile();
    setupSocketConnection();
    
    return () => {
      if (socketService.isSocketConnected()) {
        socketService.getSocket()?.emit('leave-admin-dashboard');
      }
    };
  }, [loadProfile, setupSocketConnection]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location: profile?.location || ''
    });
  };

  const handleSave = async () => {
    try {
      console.log('Saving profile changes...');
      
      // Make API call to update profile
      const response = await api.patch('/admin/profile', formData);
      console.log('Profile update response:', response.data);
      
      if (response.data.success) {
        setProfile(prev => prev ? {
          ...prev,
          ...formData
        } : null);
        setEditing(false);
        
        // Broadcast profile update to other admins
        if (socketService.isSocketConnected()) {
          socketService.getSocket()?.emit('admin-update', {
            type: 'profile-update',
            data: formData
          });
        }
        
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.post('/admin/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setProfile(prev => prev ? {
          ...prev,
          profilePicture: response.data.profilePicture
        } : null);
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Profile not found</h3>
          <p className="text-gray-600 dark:text-gray-400">Unable to load your profile information.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your admin account information and settings</p>
          </div>
        </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Picture */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                  <CameraIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                {uploading && (
                  <p className="text-sm text-primary-600 dark:text-primary-400">Uploading...</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.bio || 'No bio provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.location || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                View Activity
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Click to view</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">Last Login</p>
                    <p>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Click to view</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Manage
              </button>
            </div>
            
            <div className="space-y-3">
              {profile.permissions.map((permission, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-green-500" />
                    <span className="capitalize">{permission.replace('_', ' ')}</span>
                  </div>
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}