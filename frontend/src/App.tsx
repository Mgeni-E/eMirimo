import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import { AdminAuthGuard } from './components/AdminAuthGuard';
import { Home } from './features/common/Home';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { ForgotPassword } from './features/auth/ForgotPassword';
import { ResetPassword } from './features/auth/ResetPassword';
import { Dashboard } from './features/common/Dashboard';
import { Jobs } from './features/jobs/Jobs';
import { JobDetail } from './features/jobs/JobDetail';
import { Applications } from './features/applications/Applications';
import { Profile } from './features/profile/Profile';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminUsers } from './features/admin/AdminUsers';
import { AdminUserDetail } from './features/admin/AdminUserDetail';
import { AdminJobs } from './features/admin/AdminJobs';
import { AdminJobDetail } from './features/admin/AdminJobDetail';
import { AdminNotifications } from './features/admin/AdminNotifications';
import { AdminProfile } from './features/admin/AdminProfile';
import { MyJobs } from './features/employer/PostJobs';
import { EmployerApplications } from './features/employer/EmployerApplications';
import { EmployerInterviews } from './features/employer/EmployerInterviews';
import { EmployerHiringPipeline } from './features/employer/EmployerHiringPipeline';
import { Learning } from './features/learning/Learning';
import { LearningDetail } from './features/learning/LearningDetail';
import { Recommendations } from './features/recommendations/Recommendations';
import { CompanyProfile } from './features/company/CompanyProfile';
import { Messaging } from './features/messaging/Messaging';
import { SkillsAssessment } from './features/skills/SkillsAssessment';
import { PrivacyPolicy } from './features/legal/PrivacyPolicy';
import { TermsAndConditions } from './features/legal/TermsAndConditions';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <Routes>
          {/* Public routes with Layout */}
          <Route path="/" element={<Layout><Home/></Layout>} />
          <Route path="/login" element={<Layout><AuthGuard requireAuth={false}><Login/></AuthGuard></Layout>} />
          <Route path="/register" element={<Layout><AuthGuard requireAuth={false}><Register/></AuthGuard></Layout>} />
          <Route path="/forgot-password" element={<Layout><AuthGuard requireAuth={false}><ForgotPassword/></AuthGuard></Layout>} />
          <Route path="/reset-password/:token" element={<Layout><AuthGuard requireAuth={false}><ResetPassword/></AuthGuard></Layout>} />
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicy/></Layout>} />
          <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions/></Layout>} />
          
          {/* Dashboard routes without Layout (use DashboardLayout internally) */}
          <Route path="/dashboard" element={<AuthGuard><Dashboard/></AuthGuard>} />
          <Route path="/jobs" element={<AuthGuard><Jobs/></AuthGuard>} />
          <Route path="/jobs/:id" element={<AuthGuard><JobDetail/></AuthGuard>} />
          <Route path="/learning" element={<AuthGuard><Learning/></AuthGuard>} />
          <Route path="/learning/:id" element={<AuthGuard><LearningDetail/></AuthGuard>} />
          <Route path="/recommendations" element={<AuthGuard><Recommendations/></AuthGuard>} />
          <Route path="/applications" element={<AuthGuard><Applications/></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile/></AuthGuard>} />
          <Route path="/company/:slug" element={<AuthGuard><CompanyProfile/></AuthGuard>} />
          <Route path="/messaging" element={<AuthGuard><Messaging/></AuthGuard>} />
          <Route path="/skills" element={<AuthGuard><SkillsAssessment/></AuthGuard>} />
          <Route path="/employer/jobs" element={<AuthGuard><MyJobs/></AuthGuard>} />
          <Route path="/employer/applications" element={<AuthGuard><EmployerApplications/></AuthGuard>} />
          <Route path="/employer/interviews" element={<AuthGuard><EmployerInterviews/></AuthGuard>} />
          <Route path="/employer/pipeline" element={<AuthGuard><EmployerHiringPipeline/></AuthGuard>} />
          
          {/* Admin routes without Layout (use DashboardLayout internally) */}
          <Route path="/admin" element={<AdminAuthGuard><AdminDashboard/></AdminAuthGuard>} />
          <Route path="/admin/users" element={<AdminAuthGuard><AdminUsers/></AdminAuthGuard>} />
          <Route path="/admin/users/:id" element={<AdminAuthGuard><AdminUserDetail/></AdminAuthGuard>} />
          <Route path="/admin/jobs" element={<AdminAuthGuard><AdminJobs/></AdminAuthGuard>} />
          <Route path="/admin/jobs/:id" element={<AdminAuthGuard><AdminJobDetail/></AdminAuthGuard>} />
          <Route path="/admin/notifications" element={<AdminAuthGuard><AdminNotifications/></AdminAuthGuard>} />
          <Route path="/admin/profile" element={<AdminAuthGuard><AdminProfile/></AdminAuthGuard>} />
          
          <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}