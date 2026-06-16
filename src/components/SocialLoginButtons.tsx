import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Shield, Mail, ArrowRight } from 'lucide-react';

interface SocialUser {
  provider: 'google' | 'microsoft';
  email: string;
  name: string;
  id: string;
  avatarUrl?: string;
}

interface SocialLoginButtonsProps {
  onSuccess: (user: SocialUser) => void;
  onError: (error: string) => void;
  role?: 'student' | 'admin';
}

export const SocialLoginButtons = ({ onSuccess, onError, role = 'student' }: SocialLoginButtonsProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'google' | 'microsoft' | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const mockAccounts = {
    google: [
      { name: 'Alex Student', email: 'alex.student@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
      { name: 'Jane Admin', email: 'jane.admin@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    ],
    microsoft: [
      { name: 'Alex Student', email: 'alex.student@outlook.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexOut' },
      { name: 'Jane Admin', email: 'jane.admin@outlook.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JaneOut' },
    ],
  };

  const handleProviderClick = (provider: 'google' | 'microsoft') => {
    setActiveProvider(provider);
    setModalOpen(true);
    setCustomEmail('');
    setCustomName('');
    setLoading(false);
  };

  const handleSelectAccount = (account: { name: string; email: string; avatar: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalOpen(false);
      onSuccess({
        provider: activeProvider!,
        email: account.email,
        name: account.name,
        id: `${activeProvider}_id_${Math.random().toString(36).substring(2, 10)}`,
        avatarUrl: account.avatar,
      });
    }, 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalOpen(false);
      onSuccess({
        provider: activeProvider!,
        email: customEmail,
        name: customName,
        id: `${activeProvider}_id_${Math.random().toString(36).substring(2, 10)}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customName)}`,
      });
    }, 1200);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Google Login Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleProviderClick('google')}
          className="flex h-11 items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47c0,-0.61 -0.05,-1.2 -0.16,-1.77Z" fill="#4285F4" />
              <path d="M12,20.73c2.43,0 4.47,-0.8 5.96,-2.19l-3.3,-2.57c-0.9,-0.61 -2.07,-0.98 -3.3,-0.98c-2.33,0 -4.3,-1.58 -5,-3.7H3v2.66c1.49,2.96 4.54,4.78 8,4.78Z" fill="#34A853" />
              <path d="M7,11.29c-0.18,-0.54 -0.28,-1.11 -0.28,-1.71s0.1,-1.17 0.28,-1.71V5.21H3c-0.63,1.27 -1,2.7 -1,4.22s0.37,2.95 1,4.22l4,-3.14Z" fill="#FBBC05" />
              <path d="M12,6.15c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.46 14.42,2.73 12,2.73c-3.46,0 -6.51,1.82 -8,4.78l4,3.14c0.7,-2.12 2.67,-3.7 5,-3.7Z" fill="#EA4335" />
            </g>
          </svg>
          Google
        </motion.button>

        {/* Microsoft Login Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleProviderClick('microsoft')}
          className="flex h-11 items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f35325" d="M0 0h11v11H0z" />
            <path fill="#81bc06" d="M12 0h11v11H12z" />
            <path fill="#05a6f0" d="M0 12h11v11H0z" />
            <path fill="#ffba08" d="M12 12h11v11H12z" />
          </svg>
          Microsoft
        </motion.button>
      </div>

      {/* Interactive simulated OAuth selector modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* simulated header */}
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <div className="grid h-8 w-8 place-items-center rounded bg-white/5 text-cyan-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">OAuth Simulation Portal</h3>
                  <p className="text-[11px] text-slate-400">Secure simulated environment for role evaluation</p>
                </div>
              </div>

              {loading ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <p className="mt-4 text-sm font-medium text-slate-300">
                    Signing in with {activeProvider === 'google' ? 'Google' : 'Microsoft'}...
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Exchanging authorization credentials</p>
                </div>
              ) : (
                /* Account Selector state */
                <div>
                  <div className="text-center mb-6">
                    {activeProvider === 'google' ? (
                      <div className="inline-flex flex-col items-center">
                        <svg className="h-12 w-12" viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                          <g transform="matrix(1, 0, 0, 1, 0, 0)">
                            <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47c0,-0.61 -0.05,-1.2 -0.16,-1.77Z" fill="#4285F4" />
                            <path d="M12,20.73c2.43,0 4.47,-0.8 5.96,-2.19l-3.3,-2.57c-0.9,-0.61 -2.07,-0.98 -3.3,-0.98c-2.33,0 -4.3,-1.58 -5,-3.7H3v2.66c1.49,2.96 4.54,4.78 8,4.78Z" fill="#34A853" />
                            <path d="M7,11.29c-0.18,-0.54 -0.28,-1.11 -0.28,-1.71s0.1,-1.17 0.28,-1.71V5.21H3c-0.63,1.27 -1,2.7 -1,4.22s0.37,2.95 1,4.22l4,-3.14Z" fill="#FBBC05" />
                            <path d="M12,6.15c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.46 14.42,2.73 12,2.73c-3.46,0 -6.51,1.82 -8,4.78l4,3.14c0.7,-2.12 2.67,-3.7 5,-3.7Z" fill="#EA4335" />
                          </g>
                        </svg>
                        <h4 className="mt-3 text-lg font-bold text-white">Sign in with Google</h4>
                        <p className="text-xs text-slate-400 mt-1">to continue to SkillDNA Portal</p>
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-center">
                        <svg className="h-12 w-12" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#f35325" d="M0 0h11v11H0z" />
                          <path fill="#81bc06" d="M12 0h11v11H12z" />
                          <path fill="#05a6f0" d="M0 12h11v11H0z" />
                          <path fill="#ffba08" d="M12 12h11v11H12z" />
                        </svg>
                        <h4 className="mt-3 text-lg font-bold text-white">Sign in with Microsoft</h4>
                        <p className="text-xs text-slate-400 mt-1">to continue to SkillDNA Portal</p>
                      </div>
                    )}
                  </div>

                  {/* Mock accounts selection */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Select a mock account ({role} role):</p>
                    {mockAccounts[activeProvider!].map((acc) => {
                      const finalEmail = acc.email;
                      // Replace admin/student role email matches if the parent request specifies a different role
                      const isStudentMock = acc.email.includes('student');
                      const displayEmail = role === 'student' 
                        ? (isStudentMock ? finalEmail : finalEmail.replace('admin', 'student'))
                        : (!isStudentMock ? finalEmail : finalEmail.replace('student', 'admin'));
                      
                      const displayName = role === 'student'
                        ? (isStudentMock ? acc.name : 'Alex Student')
                        : (!isStudentMock ? acc.name : 'Jane Admin');

                      return (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => handleSelectAccount({ name: displayName, email: displayEmail, avatar: acc.avatar })}
                          className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-slate-950/20 p-3 text-left transition hover:border-cyan-500/20 hover:bg-cyan-500/5"
                        >
                          <img src={acc.avatar} alt="Avatar" className="h-9 w-9 rounded-full bg-slate-950/50" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                            <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-slate-400">
                            {role}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative my-6 text-center">
                    <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-white/5" />
                    <span className="bg-slate-900 px-3 text-xs text-slate-500">Or use a custom account</span>
                  </div>

                  {/* Custom account input */}
                  <form onSubmit={handleCustomSubmit} className="space-y-4">
                    <label className="grid gap-1.5 text-xs font-medium text-slate-400">
                      Full Name
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Alex Custom"
                        className="h-10 w-full rounded-lg border-white/10 bg-slate-950/50 px-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </label>

                    <label className="grid gap-1.5 text-xs font-medium text-slate-400">
                      Email Address
                      <input
                        type="email"
                        required
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder={activeProvider === 'google' ? 'custom@gmail.com' : 'custom@outlook.com'}
                        className="h-10 w-full rounded-lg border-white/10 bg-slate-950/50 px-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </label>

                    <button
                      type="submit"
                      className="flex w-full h-10 items-center justify-center gap-1.5 rounded-lg bg-cyan-500 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition"
                    >
                      Continue to authentication
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
