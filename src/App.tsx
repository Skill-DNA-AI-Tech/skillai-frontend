// Trigger redeployment for Cloudflare configuration updates
import React, { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import AppShell from './components/AppShell';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageSettingsProvider } from './context/PageSettingsContext';
import PageAccessWrapper from './components/PageAccessWrapper';

const Auth = lazy(() => import('./pages/Auth'));
const CareerTwin = lazy(() => import('./pages/CareerTwin'));
const Register = lazy(() => import('./pages/Register'));
const Community = lazy(() => import('./pages/Community'));
const DynamicInterviewPage = lazy(() => import('./pages/DynamicInterviewPage'));
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const LearningHub = lazy(() => import('./pages/LearningHub'));
const NotFound = lazy(() => import('./pages/NotFound'));
const QuestionBankDashboard = lazy(() => import('./pages/QuestionBankDashboard'));
const RecruiterPortal = lazy(() => import('./pages/RecruiterPortal'));
const ReportCard = lazy(() => import('./pages/ReportCard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentScorecardPage = lazy(() => import('./pages/StudentScorecardPage'));
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const CertificateVerifyPage = lazy(() => import('./pages/CertificateVerifyPage'));
const CertificateManagementPage = lazy(() => import('./pages/CertificateManagementPage'));
const Feedback = lazy(() => import('./pages/Feedback'));

const RouteFallback = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid min-h-[60vh] place-items-center px-4 text-center"
  >
    <div>
      <div className="mx-auto h-12 w-12 animate-pulse rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
      <p className="mt-4 text-sm font-medium text-slate-300">Loading SkillDNA AI...</p>
    </div>
  </motion.div>
);

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SkillDNA UI ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <span className="text-xl font-bold tracking-wider">SkillDNA</span>
          </div>
          <h2 className="text-xl font-bold">Session Restored</h2>
          <p className="mt-2 text-sm text-slate-400">Taking you back to the home portal...</p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
          >
            Return Home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { role, isLoading } = useAuth();
  
  if (isLoading) {
    return <RouteFallback />;
  }

  if (!role) {
    // If not authenticated or on refresh without session, cleanly return home
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'MAIN_ADMIN' || role === 'ADMIN' || role === 'SUPPORT_TEAM') {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'HR') {
      return <Navigate to="/hr" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const MainAdminDashboard = lazy(() => import('./pages/MainAdminDashboard'));
const HrDashboard = lazy(() => import('./pages/HrDashboard'));

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/main-admin" element={<ProtectedRoute allowedRoles={['MAIN_ADMIN', 'ADMIN', 'SUPPORT_TEAM']}><MainAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'MAIN_ADMIN', 'SUPPORT_TEAM']}><MainAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={['ADMIN', 'MAIN_ADMIN', 'SUPPORT_TEAM']}><QuestionBankDashboard /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute allowedRoles={['HR']}><HrDashboard /></ProtectedRoute>} />
          <Route path="/recruiter" element={<Navigate to="/hr" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/scorecards" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentScorecardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute allowedRoles={['STUDENT', 'HR', 'ADMIN', 'MAIN_ADMIN', 'SUPPORT_TEAM']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/career-twin" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="career-twin"><CareerTwin /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="learning"><LearningHub /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="interview"><DynamicInterviewPage /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/interview/dynamic" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="interview"><DynamicInterviewPage /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/report/:id" element={<ReportCard />} />
          <Route path="/jobs" element={<ProtectedRoute allowedRoles={['STUDENT', 'HR', 'ADMIN', 'MAIN_ADMIN', 'SUPPORT_TEAM']}><PageAccessWrapper pageId="jobs"><Jobs /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/recruiter/report/:token" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN', 'MAIN_ADMIN', 'SUPPORT_TEAM']}><ReportCard /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><PageAccessWrapper pageId="community"><Community /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute allowedRoles={['STUDENT']}><CertificateManagementPage /></ProtectedRoute>} />
          <Route path="/certificate/:certificateId" element={<ProtectedRoute allowedRoles={['STUDENT', 'HR', 'ADMIN', 'MAIN_ADMIN', 'SUPPORT_TEAM']}><CertificatePage /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/certificate/verify/:certificateId" element={<CertificateVerifyPage />} />
          <Route path="/verify/:certificateId" element={<CertificateVerifyPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PageSettingsProvider>
          <Suspense fallback={<RouteFallback />}>
            <AnimatedRoutes />
          </Suspense>
        </PageSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
