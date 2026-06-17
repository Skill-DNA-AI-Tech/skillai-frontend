// Trigger redeployment for Cloudflare configuration updates
import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import AppShell from './components/AppShell';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageSettingsProvider } from './context/PageSettingsContext';
import PageAccessWrapper from './components/PageAccessWrapper';

const AdminDashboard = lazy(() => import('./pages/AdminDashboardV2'));
const Auth = lazy(() => import('./pages/Auth'));
const CareerTwin = lazy(() => import('./pages/CareerTwin'));
const Register = lazy(() => import('./pages/Register'));
const Community = lazy(() => import('./pages/Community'));
const DynamicInterviewPage = lazy(() => import('./pages/DynamicInterviewPage'));
const Home = lazy(() => import('./pages/Home'));
const InterviewCoach = lazy(() => import('./pages/InterviewCoach'));
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

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { role } = useAuth();
  
  if (!role) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
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
          <Route path="/main-admin" element={<ProtectedRoute allowedRoles={['MAIN_ADMIN']}><MainAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={['ADMIN', 'MAIN_ADMIN']}><QuestionBankDashboard /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute allowedRoles={['HR']}><HrDashboard /></ProtectedRoute>} />
          <Route path="/recruiter" element={<Navigate to="/hr" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/scorecards" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentScorecardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute allowedRoles={['STUDENT', 'HR', 'ADMIN', 'MAIN_ADMIN']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/career-twin" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="career-twin"><CareerTwin /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="learning"><LearningHub /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="interview"><InterviewCoach /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/interview/dynamic" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageAccessWrapper pageId="interview"><DynamicInterviewPage /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/report/:id" element={<ReportCard />} />
          <Route path="/jobs" element={<ProtectedRoute allowedRoles={['STUDENT', 'HR', 'ADMIN', 'MAIN_ADMIN']}><PageAccessWrapper pageId="jobs"><Jobs /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/recruiter/report/:token" element={<ProtectedRoute allowedRoles={['HR', 'ADMIN', 'MAIN_ADMIN']}><ReportCard /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><PageAccessWrapper pageId="community"><Community /></PageAccessWrapper></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute allowedRoles={['STUDENT']}><CertificateManagementPage /></ProtectedRoute>} />
          <Route path="/certificate/:certificateId" element={<ProtectedRoute allowedRoles={['STUDENT', 'HR', 'ADMIN', 'MAIN_ADMIN']}><CertificatePage /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/certificate/verify/:certificateId" element={<CertificateVerifyPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <PageSettingsProvider>
        <Suspense fallback={<RouteFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </PageSettingsProvider>
    </AuthProvider>
  );
}

export default App;
