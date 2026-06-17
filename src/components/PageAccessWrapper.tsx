import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { usePageSettings } from '../context/PageSettingsContext';
import { useAuth } from '../context/AuthContext';

interface PageAccessWrapperProps {
  pageId: string;
  children: React.ReactNode;
}

const PageAccessWrapper: React.FC<PageAccessWrapperProps> = ({ pageId, children }) => {
  const { isPageHidden, loading } = usePageSettings();
  const { role } = useAuth();

  const isAdmin = role === 'ADMIN' || role === 'MAIN_ADMIN';
  const isHidden = isPageHidden(pageId);

  // If page settings are still loading, show a pulsing placeholder
  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center px-4">
        <div>
          <div className="mx-auto h-12 w-12 animate-pulse rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
          <p className="mt-4 text-sm font-medium text-slate-300">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // If hidden and user is not an admin, render the "Page Hidden" message page
  if (isHidden && !isAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-slate-900/40 p-8 sm:p-12 backdrop-blur-md relative overflow-hidden"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">Feature Deactivated</h1>
          <p className="mt-4 text-slate-400 leading-relaxed text-sm">
            This module has been temporarily disabled by the platform administrator for updates or maintenance. Only Admin users have access to it at this time.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // Otherwise, allow normal rendering
  return <>{children}</>;
};

export default PageAccessWrapper;
