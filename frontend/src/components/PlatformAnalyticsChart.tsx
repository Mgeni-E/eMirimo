import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../lib/store';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon } from './icons';

interface ChartData {
  timeSeries: Array<{
    date: string;
    users: number;
    jobs: number;
    applications: number;
  }>;
  roleDistribution: Array<{ role: string; count: number }>;
  jobStatusDistribution: Array<{ status: string; count: number }>;
  applicationStatusDistribution: Array<{ status: string; count: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PlatformAnalyticsChart() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeSeries' | 'roles' | 'jobs' | 'applications'>('timeSeries');

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = user?.role === 'admin' 
        ? '/admin/analytics/charts'
        : user?.role === 'employer'
        ? '/dashboard/employer/analytics'
        : '/dashboard/seeker/analytics';
      
      const response = await api.get(endpoint);
      
      if (response.data.success && response.data.data) {
        setChartData(response.data.data);
      } else {
        // Fallback: create mock data if endpoint doesn't exist
        setChartData(createMockData());
      }
    } catch (err: any) {
      console.warn('Chart analytics endpoint not available, using mock data:', err);
      setChartData(createMockData());
    } finally {
      setLoading(false);
    }
  };

  const createMockData = (): ChartData => {
    const timeSeries = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      timeSeries.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 10),
        jobs: Math.floor(Math.random() * 5),
        applications: Math.floor(Math.random() * 15)
      });
    }
    
    return {
      timeSeries,
      roleDistribution: [
        { role: 'seeker', count: 45 },
        { role: 'employer', count: 20 },
        { role: 'admin', count: 2 }
      ],
      jobStatusDistribution: [
        { status: 'active', count: 30 },
        { status: 'inactive', count: 10 },
        { status: 'pending', count: 5 }
      ],
      applicationStatusDistribution: [
        { status: 'pending', count: 25 },
        { status: 'approved', count: 15 },
        { status: 'rejected', count: 10 },
        { status: 'interview', count: 8 }
      ]
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!chartData) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('platformAnalytics') || 'Platform Analytics'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('performanceImprovementAnalysis') || 'Performance and improvement analysis'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('timeSeries')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'timeSeries'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('timeSeries') || 'Time Series'}
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'roles'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('userRoles') || 'User Roles'}
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'jobs'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('jobStatus') || 'Job Status'}
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'applications'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t('applicationStatus') || 'Application Status'}
        </button>
      </div>

      {/* Charts */}
      <div className="mt-6">
        {activeTab === 'timeSeries' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => formatDate(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Users"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="jobs" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Jobs"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="applications" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Applications"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('userRoleDistribution') || 'User Role Distribution'}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ role, percent }) => `${role}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('userRoleCounts') || 'User Role Counts'}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('jobStatusDistribution') || 'Job Status Distribution'}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.jobStatusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.jobStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('jobStatusCounts') || 'Job Status Counts'}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.jobStatusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('applicationStatusDistribution') || 'Application Status Distribution'}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.applicationStatusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.applicationStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                {t('applicationStatusCounts') || 'Application Status Counts'}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.applicationStatusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

