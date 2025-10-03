import { DashboardLayout } from '../../components/DashboardLayout';

export function EmployerDashboard() {
  return (
    <DashboardLayout>
      {/* Employer Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">15</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">342</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">28</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Interviews Scheduled</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Hired Candidates</div>
        </div>
      </div>

      {/* Employer Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Job Management
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="font-medium text-primary-700 dark:text-primary-300">Post New Job</div>
              <div className="text-sm text-primary-600 dark:text-primary-400">Create a new job listing</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Manage Jobs</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Edit and update job postings</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Job Analytics</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">View job performance metrics</div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Candidate Management
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Review Applications</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Screen and evaluate candidates</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Schedule Interviews</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Coordinate interview sessions</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="font-medium text-gray-900 dark:text-white">Hiring Pipeline</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Track candidate progress</div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Hiring Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Hiring Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                New application for Software Engineer position
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">30 minutes ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Interview scheduled with Sarah Johnson
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Job posting "Product Manager" published
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
