import { KeyRound, Mail, ShieldCheck, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { roleHome } from '../lib/rbac';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset' | 'change_temp_password'>('login');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [tempRefreshToken, setTempRefreshToken] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const navigateToRole = (userRole: string) => navigate(roleHome(userRole));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'change_temp_password') {
        const response = await apiRequest<any>('/auth/change-temp-password', {
          method: 'POST',
          body: JSON.stringify({ newPassword }),
          token: tempToken || undefined,
        });

        setMessage('Password updated successfully! Logging you in...');
        login({ 
          _id: response._id, 
          name: response.name, 
          email: response.email, 
          role: response.role, 
          avatarUrl: response.avatarUrl 
        }, tempToken!, response.refreshToken ?? tempRefreshToken ?? undefined);
        
        navigateToRole(response.role);
        return;
      }

      let path = '/auth/login';
      let payload: Record<string, any> = { email, password, role, name };

      if (mode === 'register') {
        path = '/auth/register';
      } else if (mode === 'forgot') {
        path = '/auth/forgot-password';
        payload = { email };
      } else if (mode === 'reset') {
        path = '/auth/reset-password';
        payload = { email, otp, newPassword };
      }

      const response = await apiRequest<any>(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (mode === 'login' || mode === 'register') {
        if (!response.token) {
          setMessage(response.message || 'Account request received. Please wait for approval before signing in.');
          setMode('login');
          setPassword('');
          return;
        }

        if (response.requiresPasswordChange) {
          setTempToken(response.token);
          setTempRefreshToken(response.refreshToken ?? null);
          setMode('change_temp_password');
          setNewPassword('');
          setMessage('Temporary password detected. Please choose a new secure password.');
          return;
        }

        login({ _id: response._id, name: response.name, email: response.email, role: response.role, status: response.status, avatarUrl: response.avatarUrl }, response.token, response.refreshToken);
        navigateToRole(response.role);
      } else if (mode === 'forgot') {
        setMessage('OTP sent to your email. Enter it below to reset your password.');
        setMode('reset');
      } else if (mode === 'reset') {
        setMessage('Password reset successful. Please sign in with your new password.');
        setMode('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center min-h-[80vh] overflow-hidden">
      <motion.section className="relative z-10" initial="hidden" animate="show" variants={containerVariants}>
        <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px] animate-pulse" />
        <motion.div variants={itemVariants}>
          <SectionHeader
            eyebrow="Authentication"
            title="Sign in to your specific role portal"
            description="Access customized dashboards for Main Admin, Admin, HR, and Student users with live backend authentication."
          />
        </motion.div>

        <motion.div className="mt-10 grid gap-5" variants={containerVariants}>
          {[
            { icon: ShieldCheck, title: 'Role-based access', text: 'Auto-redirects to Student, HR, Admin, or Main Admin portals.' },
            { icon: Mail, title: 'Secure Verification', text: 'Email OTP registration and profile verification.' },
            { icon: KeyRound, title: 'Live backend auth', text: 'Login and registration use real Node API endpoints.' },
          ].map((item) => (
            <motion.article
              key={item.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-cyan-500/20 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]"
            >
              <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="relative"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
      >
        <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 -left-20 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/[0.7] p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                <p className="text-sm text-slate-400">Use your account to access live student, HR, and admin screens.</p>
              </div>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              {mode !== 'change_temp_password' && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'forgot' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                  >
                    Forgot Password
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Full Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </label>
              )}

              {mode !== 'change_temp_password' && (
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Email Address
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                </label>
              )}

              {(mode === 'login' || mode === 'register') && (
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Password
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </label>
              )}

              {mode === 'reset' && (
                <>
                  <label className="grid gap-2 text-sm font-medium text-slate-300">
                    OTP Code
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      type="text"
                      placeholder="Enter OTP sent by email"
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-300">
                    New Password
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      type="password"
                      placeholder="Enter a new password"
                      required
                    />
                  </label>
                </>
              )}

              {mode === 'change_temp_password' && (
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  New Secure Password
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    type="password"
                    placeholder="Enter new custom password"
                    required
                  />
                </label>
              )}

              {mode === 'register' && (
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Account Role
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="h-11 w-full appearance-none rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">HR accounts are created by Admin users. Admin signups require Main Admin approval.</p>
                </label>
              )}

              {message && (
                <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-sm text-teal-100">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-4 grid gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-sm font-bold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    <LogIn className="h-5 w-5 transition-transform group-hover:scale-110" />
                    {loading ? 'Processing...' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send OTP' : mode === 'reset' ? 'Reset Password' : mode === 'change_temp_password' ? 'Update Password' : 'Sign In'}
                  </span>
                </motion.button>

                {(mode === 'forgot' || mode === 'reset') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-left text-sm font-medium text-cyan-300 hover:text-white"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </motion.section>
    </main>
  );
};

export default Auth;
