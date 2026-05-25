import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, Navigate, useLocation, BrowserRouter } from 'react-router-dom';
import AppShell from './components/AppShell';
import { AuthProvider, useAuth } from './context/AuthContext';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
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
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const CertificateVerifyPage = lazy(() => import('./pages/CertificateVerifyPage'));
const CertificateManagementPage = lazy(() => import('./pages/CertificateManagementPage'));

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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute allowedRoles={['student', 'recruiter', 'admin']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/career-twin" element={<ProtectedRoute allowedRoles={['student']}><CareerTwin /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute allowedRoles={['student']}><LearningHub /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute allowedRoles={['student']}><InterviewCoach /></ProtectedRoute>} />
          <Route path="/interview/dynamic" element={<ProtectedRoute allowedRoles={['student']}><DynamicInterviewPage /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ReportCard />} />
          <Route path="/jobs" element={<ProtectedRoute allowedRoles={['student', 'recruiter']}><Jobs /></ProtectedRoute>} />
          <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterPortal /></ProtectedRoute>} />
          <Route path="/recruiter/report/:token" element={<ProtectedRoute allowedRoles={['recruiter']}><ReportCard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={['admin']}><QuestionBankDashboard /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute allowedRoles={['student']}><CertificateManagementPage /></ProtectedRoute>} />
          <Route path="/certificate/:certificateId" element={<ProtectedRoute allowedRoles={['student']}><CertificatePage /></ProtectedRoute>} />
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
      <Suspense fallback={<RouteFallback />}>
        <AnimatedRoutes />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
