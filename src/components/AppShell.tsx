import { Menu, Sparkles, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '../data/platform';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const AppShell = () => {
  const [open, setOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavItems = navItems.filter((item) => {
    if (!role) {
      return ['Home', 'Community'].includes(item.label);
    }
    if (role === 'recruiter') {
      return ['Home', 'Recruiter', 'Jobs', 'Community'].includes(item.label);
    }
    if (role === 'admin' || role === 'employee') {
      return ['Home', 'Admin', 'Community'].includes(item.label);
    }
    return ['Home', 'Student', 'Certificates', 'Career Twin', 'Learning', 'Interview', 'Jobs', 'Community'].includes(item.label);
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
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900 px-4 py-2">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950">
                    <User className="h-3 w-3 font-bold" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-200 capitalize">{role}</p>
                    {user?.name && <p className="text-xs text-slate-400">{user.name}</p>}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="group flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Logout
                </button>
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
            className="fixed inset-0 z-50 bg-slate-950/95 p-6 backdrop-blur-xl lg:hidden"
          >
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
