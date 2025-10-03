import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import { Home } from './features/common/Home';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { ForgotPassword } from './features/auth/ForgotPassword';
import { ResetPassword } from './features/auth/ResetPassword';
import { Dashboard } from './features/common/Dashboard';
import { Jobs } from './features/jobs/Jobs';
import { Applications } from './features/applications/Applications';
import { Profile } from './features/profile/Profile';
import { Resources } from './features/resources/Resources';
import { Events } from './features/events/Events';
import { Blog } from './features/blog/Blog';
import { Mentors } from './features/mentors/Mentors';
import { About } from './features/about/About';
import { Contact } from './features/contact/Contact';
import { UserManagement } from './features/admin/UserManagement';
import { JobModeration } from './features/admin/JobModeration';
import { SystemAnalytics } from './features/admin/SystemAnalytics';
import { MyMentees } from './features/mentor/MyMentees';
import { ScheduleSessions } from './features/mentor/ScheduleSessions';
import { ShareResources } from './features/mentor/ShareResources';
import { HostEvents } from './features/mentor/HostEvents';
import { PostJobs } from './features/employer/PostJobs';
import { EmployerApplications } from './features/employer/EmployerApplications';
import { Interviews } from './features/employer/Interviews';
import { HiringPipeline } from './features/employer/HiringPipeline';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<AuthGuard requireAuth={false}><Login/></AuthGuard>} />
            <Route path="/register" element={<AuthGuard requireAuth={false}><Register/></AuthGuard>} />
            <Route path="/forgot-password" element={<AuthGuard requireAuth={false}><ForgotPassword/></AuthGuard>} />
            <Route path="/reset-password/:token" element={<AuthGuard requireAuth={false}><ResetPassword/></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard/></AuthGuard>} />
            <Route path="/jobs" element={<Jobs/>} />
            <Route path="/applications" element={<AuthGuard><Applications/></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile/></AuthGuard>} />
            <Route path="/resources" element={<Resources/>} />
            <Route path="/events" element={<Events/>} />
            <Route path="/blog" element={<Blog/>} />
            <Route path="/mentors" element={<Mentors/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/contact" element={<Contact/>} />
            <Route path="/admin/users" element={<AuthGuard><UserManagement/></AuthGuard>} />
            <Route path="/admin/jobs" element={<AuthGuard><JobModeration/></AuthGuard>} />
            <Route path="/admin/analytics" element={<AuthGuard><SystemAnalytics/></AuthGuard>} />
            <Route path="/mentor/mentees" element={<AuthGuard><MyMentees/></AuthGuard>} />
            <Route path="/mentor/sessions" element={<AuthGuard><ScheduleSessions/></AuthGuard>} />
            <Route path="/mentor/resources" element={<AuthGuard><ShareResources/></AuthGuard>} />
            <Route path="/mentor/events" element={<AuthGuard><HostEvents/></AuthGuard>} />
            <Route path="/employer/jobs" element={<AuthGuard><PostJobs/></AuthGuard>} />
            <Route path="/employer/applications" element={<AuthGuard><EmployerApplications/></AuthGuard>} />
            <Route path="/employer/interviews" element={<AuthGuard><Interviews/></AuthGuard>} />
            <Route path="/employer/pipeline" element={<AuthGuard><HiringPipeline/></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </ErrorBoundary>
  );
}