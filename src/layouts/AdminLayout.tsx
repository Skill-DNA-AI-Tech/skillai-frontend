import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  BarChart3, GraduationCap, Users, FilePlus2, GitPullRequest,
  BookOpen, Award, ShieldAlert, MessageSquareText, Settings,
  Edit3, Shield, Menu, X, ArrowLeft, ExternalLink, LogOut,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../lib/rbac';

interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  mainAdminOnly?: boolean;
}

const adminNavItems: AdminNavItem[] = [
  { to: '/admin/overview', label: 'Overview', icon: BarChart3 },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/questions', label: 'Question Bank & AI', icon: FilePlus2 },
  { to: '/admin/career-changes', label: 'Career Change Requests', icon: GitPullRequest },
  { to: '/admin/topic-notes', label: 'Topic Notes & Curriculum', icon: BookOpen },
  { to: '/admin/helpdesk', label: 'Helpdesk & Support', icon: ShieldAlert },
  { to: '/admin/footer', label: 'Footer Settings', icon: Edit3 },
  { to: '/admin/certificates', label: 'Certificates & Signature', icon: Award },
  { to: '/admin/page-settings', label: 'Page Visibility', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMainAdmin = user?.email === 'skilldnaai@ai.com' || role === 'MAIN_ADMIN';

  // Compute breadcrumb label from current path
  const currentItem = adminNavItems.find(
    (item) => location.pathname === item.to || (item.to === '/admin/overview' && location.pathname === '/admin')
  );
  const pageTitle = currentItem ? currentItem.label : 'Admin Portal';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = (
    <div className="space-y-1.5 py-2">
      {adminNavItems
        .filter((item) => !item.mainAdminOnly || isMainAdmin)
        .map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            (item.to === '/admin/overview' && location.pathname === '/admin');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/20">
                <Sparkles className="h-4 w-4 text-slate-950 font-bold" />
              </div>
              <div>
                <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
                  SkillDNA Admin
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Governance
                </span>
              </div>
            </Link>

            {/* Breadcrumb separator */}
            <span className="hidden md:inline-block text-slate-600 font-mono">/</span>
            <span className="hidden md:inline-block text-xs font-semibold text-slate-300 bg-slate-900 border border-white/5 px-2.5 py-1 rounded-lg">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Link to Student/Public View */}
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
              Student View
            </Link>

            {/* Admin User Info */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 max-w-[140px] truncate">
                {user?.name || user?.email || 'Admin'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar + Content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Desktop Permanent Sidebar */}
        <aside className="hidden lg:block sticky top-22 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 shadow-xl shadow-black/20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="pb-3 mb-2 border-b border-white/5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Control Modules</p>
          </div>
          {navLinks}
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex">
            <div className="w-72 bg-slate-950 border-r border-white/10 p-5 flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-3">
                <span className="text-sm font-bold text-cyan-300">Admin Modules</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {navLinks}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Active Module Content Pane */}
        <main className="w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
