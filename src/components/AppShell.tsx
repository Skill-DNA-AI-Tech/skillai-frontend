import { Menu, Sparkles, X, LogOut, User, LineChart, Building2, UsersRound, ShieldCheck, FilePlus2, Video, BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '../data/platform';
import { useAuth } from '../context/AuthContext';
import { usePageSettings } from '../context/PageSettingsContext';
import Footer from './Footer';
import { roleLabel } from '../lib/rbac';

const AppShell = () => {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, role, logout } = useAuth();
  const { isPageHidden } = usePageSettings();
  const navigate = useNavigate();

  const getPageId = (label: string) => {
    if (label === 'Career Twin') return 'career-twin';
    if (label === 'Learning') return 'learning';
    if (label === 'Interview') return 'interview';
    if (label === 'Jobs') return 'jobs';
    if (label === 'Community') return 'community';
    return null;
  };

  const filteredNavItems = navItems.filter((item) => {
    const pageId = getPageId(item.label);
    const isAdmin = role === 'ADMIN' || role === 'MAIN_ADMIN';
    if (pageId && isPageHidden(pageId) && !isAdmin) {
      return false;
    }

    if (!role) {
      return ['Home', 'Community'].includes(item.label);
    }
    if (isAdmin) {
      // Admins have full access across the entire platform
      return ['Home', role === 'MAIN_ADMIN' ? 'Main Admin' : 'Admin', 'Interview', 'Career Twin', 'Learning', 'Jobs', 'HR', 'Student', 'Community'].includes(item.label);
    }
    if (role === 'HR') {
      return ['Home', 'HR', 'Jobs', 'Community'].includes(item.label);
    }
    return ['Home', 'Career Twin', 'Learning', 'Interview', 'Jobs', 'Community'].includes(item.label);
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const nav = (
    <nav className="grid gap-1 lg:grid-flow-col">
      {filteredNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              isActive 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-slate-300 hover:bg-white/[0.08] hover:text-white border border-transparent'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-cyan-500/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/[0.7] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105 group-active:scale-95">
              <Sparkles className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <span className="block text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">SkillDNA AI</span>
              <span className="block text-[10px] font-semibold tracking-wider text-cyan-400 uppercase">Learn • Verify • Hire</span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">{nav}</div>

          <div className="hidden items-center gap-4 sm:flex">
            {!role ? (
              <>
                <Link to="/auth" className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95">
                  Sign in
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900 hover:bg-slate-800 transition-colors px-4 py-2 text-left cursor-pointer focus:outline-none"
                  >
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950">
                      <User className="h-3 w-3 font-bold" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-200">{roleLabel(role)}</p>
                      {user?.name && <p className="text-xs text-slate-400">{user.name}</p>}
                    </div>
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-md p-2 shadow-xl z-20"
                        >
                          {role === 'STUDENT' && (
                            <>
                              <Link
                                to="/profile"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                              >
                                <User className="h-4 w-4 text-cyan-400" />
                                Profile
                              </Link>
                              <Link
                                to="/dashboard"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                              >
                                <LineChart className="h-4 w-4 text-cyan-400" />
                                Student
                              </Link>
                            </>
                          )}
                          {role === 'HR' && (
                            <Link
                              to="/hr"
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                            >
                              <Building2 className="h-4 w-4 text-cyan-400" />
                              HR Dashboard
                            </Link>
                          )}
                          {(role === 'ADMIN' || role === 'MAIN_ADMIN') && (
                            <>
                              <Link
                                to={role === 'MAIN_ADMIN' ? '/main-admin' : '/admin'}
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-cyan-300 font-semibold hover:bg-cyan-500/10 transition-colors"
                              >
                                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                                {role === 'MAIN_ADMIN' ? 'Main Admin Portal' : 'Admin Portal'}
                              </Link>
                              <Link
                                to="/admin/questions"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                              >
                                <FilePlus2 className="h-4 w-4 text-cyan-400" />
                                Question Bank
                              </Link>
                              <Link
                                to="/interview/dynamic"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                              >
                                <Video className="h-4 w-4 text-cyan-400" />
                                AI Interview
                              </Link>
                              <Link
                                to="/career-twin"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                              >
                                <BrainCircuit className="h-4 w-4 text-cyan-400" />
                                Career Twin
                              </Link>
                              <Link
                                to="/dashboard"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                              >
                                <LineChart className="h-4 w-4 text-cyan-400" />
                                Student View
                              </Link>
                              <Link
                                to="/hr"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                              >
                                <Building2 className="h-4 w-4 text-cyan-400" />
                                HR View
                              </Link>
                            </>
                          )}
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-200 lg:hidden hover:bg-white/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-slate-950/95 p-6 backdrop-blur-xl lg:hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                    <Sparkles className="h-5 w-5 text-slate-950" />
                  </div>
                  <p className="font-bold text-white text-lg">SkillDNA AI</p>
                </div>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-8 grid gap-2">{nav}</div>
            </div>

            {role ? (
              <div className="border-t border-white/10 pt-6 mt-auto">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-xl border border-white/5 mb-4">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950">
                    <User className="h-4 w-4 font-bold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{roleLabel(role)}</p>
                    {user?.name && <p className="text-xs text-slate-400">{user.name}</p>}
                  </div>
                </div>
                <div className="grid gap-2">
                  {role === 'STUDENT' && (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] text-sm text-slate-200 hover:bg-white/[0.08]"
                      >
                        <User className="h-4 w-4 text-cyan-400" />
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] text-sm text-slate-200 hover:bg-white/[0.08]"
                      >
                        <LineChart className="h-4 w-4 text-cyan-400" />
                        Student
                      </Link>
                    </>
                  )}
                  {role === 'HR' && (
                    <Link
                      to="/hr"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] text-sm text-slate-200 hover:bg-white/[0.08]"
                    >
                      <Building2 className="h-4 w-4 text-cyan-400" />
                      HR Dashboard
                    </Link>
                  )}
                  {(role === 'ADMIN' || role === 'MAIN_ADMIN') && (
                    <>
                      <Link
                        to={role === 'MAIN_ADMIN' ? '/main-admin' : '/admin'}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
                      >
                        <ShieldCheck className="h-4 w-4 text-cyan-400" />
                        {role === 'MAIN_ADMIN' ? 'Main Admin Portal' : 'Admin Portal'}
                      </Link>
                      <Link
                        to="/admin/questions"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] text-sm text-slate-200 hover:bg-white/[0.08]"
                      >
                        <FilePlus2 className="h-4 w-4 text-cyan-400" />
                        Question Bank
                      </Link>
                      <Link
                        to="/interview/dynamic"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] text-sm text-slate-200 hover:bg-white/[0.08]"
                      >
                        <Video className="h-4 w-4 text-cyan-400" />
                        AI Interview
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] text-sm text-slate-200 hover:bg-white/[0.08]"
                      >
                        <LineChart className="h-4 w-4 text-cyan-400" />
                        Student View
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 text-sm text-rose-400 hover:bg-rose-500/20 text-left w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-6 mt-auto">
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:opacity-90 active:scale-95 w-full"
                >
                  Sign in
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default AppShell;
