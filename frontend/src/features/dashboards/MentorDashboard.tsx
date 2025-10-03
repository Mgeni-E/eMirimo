import { DashboardLayout } from '../../components/DashboardLayout';

export function MentorDashboard() {
  return (
    <DashboardLayout>
      {/* Mentor Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Mentees</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Hours Mentored</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
        </div>
      </div>

      {/* Mentor Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Mentorship Management
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">My Mentees</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">Manage your mentee relationships</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Schedule Sessions</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Plan mentoring sessions</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Update Profile</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Manage your mentor profile</div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resources & Content
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Share Resources</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Upload helpful materials</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Create Content</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Write articles and guides</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Host Events</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Organize workshops and sessions</div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Mentoring Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Mentoring Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                New mentee request from Sarah Johnson
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Session completed with Mike Chen
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Resource shared: "Career Development Guide"
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
