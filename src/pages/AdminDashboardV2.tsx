import { FormEvent, useEffect, useState } from 'react';
import { Award, BarChart3, BriefcaseBusiness, FileText, Loader2, Shield, Trash2, UserPlus, Users, Ban, RotateCcw, Settings, MessageSquareText, Star, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MetricCard from '../components/MetricCard';
import SectionHeader from '../components/SectionHeader';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { TestUserManager } from '../components/TestUserManager';

type HrAccount = {
  _id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
};

const emptyHrForm = { name: '', email: '', password: '', mobile: '' };

const AdminDashboardV2 = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'hr-management' | 'page-settings' | 'feedback' | 'test-users'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [hrs, setHrs] = useState<HrAccount[]>([]);
  const [form, setForm] = useState(emptyHrForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Page Settings State
  const [pageSettings, setPageSettings] = useState<any[]>([]);
  const [pageSettingsLoading, setPageSettingsLoading] = useState(false);
  const [pageSettingsUpdating, setPageSettingsUpdating] = useState<string | null>(null);

  // User Feedbacks State
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResult, hrsResult] = await Promise.all([
        apiRequest<any>('/admin/overview', { token }),
        apiRequest<HrAccount[]>('/admin/hrs', { token }),
      ]);
      setOverview(overviewResult);
      setHrs(hrsResult);
    } catch (err: any) {
      setError(err?.message || 'Unable to load Admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPageSettings = async () => {
    try {
      setPageSettingsLoading(true);
      const res = await apiRequest<any[]>('/admin/page-settings', { token });
      setPageSettings(res || []);
    } catch (err) {
      console.error('Failed to fetch page settings:', err);
    } finally {
      setPageSettingsLoading(false);
    }
  };

  const handleTogglePageVisibility = async (pageId: string, currentHidden: boolean) => {
    try {
      setPageSettingsUpdating(pageId);
      const res = await apiRequest<any>(`/admin/page-settings/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify({ isHidden: !currentHidden }),
        token,
      });
      setPageSettings((prev) =>
        prev.map((item) => (item.pageId === pageId ? { ...item, isHidden: res.isHidden } : item))
      );
    } catch (err) {
      console.error('Failed to update page setting:', err);
      alert('Failed to update page settings');
    } finally {
      setPageSettingsUpdating(null);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const res = await apiRequest<any[]>('/admin/feedback', { token });
      setFeedbacks(res || []);
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingFeedbackId(id);
      const res = await apiRequest<any>(`/admin/feedback/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
        token,
      });
      setFeedbacks((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: res.status } : item))
      );
    } catch (err) {
      console.error('Failed to update feedback status:', err);
      alert('Failed to update feedback status');
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  const handleBackupFeedbacks = async () => {
    try {
      const res = await apiRequest<any>('/admin/feedback/backup', { token });
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "feedbacks_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to backup feedbacks:', err);
      alert('Failed to download backup data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (activeTab === 'page-settings') {
      fetchPageSettings();
    } else if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const createHr = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/admin/hrs', {
        method: 'POST',
        body: JSON.stringify(form),
        token,
      });
      setForm(emptyHrForm);
      await load();
      setActiveTab('overview');
    } catch (err: any) {
      setError(err?.message || 'Unable to create HR account.');
    } finally {
      setSaving(false);
    }
  };

  const updateHrStatus = async (id: string, status: 'ACTIVE' | 'DISABLED') => {
    try {
      await apiRequest(`/admin/hrs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        token,
      });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to update HR account.');
    }
  };

  const deleteHr = async (id: string) => {
    if (!window.confirm('Delete this HR account permanently?')) return;
    try {
      await apiRequest(`/admin/hrs/${id}`, { method: 'DELETE', token });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to delete HR account.');
    }
  };

  const modules = [
    { title: 'Test Customer Personas', text: 'Manage controlled test personas across all career domains, reset testing data, and view evaluations.', icon: Sparkles, href: '#test-users', action: () => setActiveTab('test-users') },
    { title: 'Student Management', text: 'View profiles, progress, scorecards, and learning readiness.', icon: Users, href: '#students' },
    { title: 'HR Management', text: 'Create, disable, and delete HR accounts.', icon: BriefcaseBusiness, href: '#hr-management', action: () => setActiveTab('hr-management') },
    { title: 'Job Management', text: 'Review active jobs and hiring activity.', icon: FileText, href: '/jobs' },
    { title: 'Interview Reports', text: 'Inspect interview outcomes and score trends.', icon: BarChart3, href: '#reports' },
    { title: 'Certificate Management', text: 'Approve and audit student certificates.', icon: Award, href: '/admin#certificates' },
    { title: 'Analytics', text: 'Track students, HRs, interviews, jobs, and reports.', icon: Shield, href: '#analytics' },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Admin Dashboard"
        title="Operate students, HRs, jobs, and reports"
        description="Manage platform workflows with administrative access. Admin approval and Main Admin creation remain restricted."
        action={
          <div className="flex gap-2">
            <Link to="/admin/questions" className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:opacity-90 active:scale-95 transition-all">
              <FileText className="h-4 w-4" />
              Question Bank
            </Link>
          </div>
        }
      />

      {error && <div className="mt-6 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}
      {loading && <p className="mt-6 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading Admin dashboard...</p>}

      {/* Tabs Menu */}
      <div className="mt-8 flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('test-users')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'test-users'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Pre-Production & Beta Access
        </button>
        <button
          onClick={() => setActiveTab('hr-management')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'hr-management'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          HR Management
        </button>
        <button
          onClick={() => setActiveTab('page-settings')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'page-settings'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Page Visibility
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'feedback'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          User Feedback
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <section id="analytics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Students" value={overview?.students ?? 0} icon={Users} />
              <MetricCard label="HR accounts" value={overview?.hrs ?? 0} icon={BriefcaseBusiness} />
              <MetricCard label="Jobs" value={overview?.jobs ?? 0} icon={FileText} />
              <MetricCard label="Reports" value={overview?.reports ?? 0} icon={BarChart3} />
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={(e) => {
                    if (item.action) {
                      e.preventDefault();
                      item.action();
                    }
                  }}
                  className="rounded-lg border border-white/10 bg-slate-900/70 p-5 transition hover:border-cyan-400/30"
                >
                  <item.icon className="h-6 w-6 text-cyan-300" />
                  <h2 className="mt-4 text-lg font-bold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
                </a>
              ))}
            </section>
          </motion.div>
        )}

        {activeTab === 'hr-management' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <form onSubmit={createHr} className="rounded-lg border border-white/10 bg-slate-900/70 p-5 self-start">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><UserPlus className="h-5 w-5 text-cyan-300" /> Create HR Account</h2>
              <div className="grid gap-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-cyan-400" placeholder="Full name" required />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-cyan-400" placeholder="HR email" required />
                <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-cyan-400" placeholder="Mobile" />
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white focus:outline-none focus:border-cyan-400" placeholder="Temporary password" required />
                <button disabled={saving} className="rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60 cursor-pointer">
                  {saving ? 'Creating...' : 'Create HR'}
                </button>
              </div>
            </form>

            <div className="rounded-lg border border-white/10 bg-slate-900/70">
              <div className="border-b border-white/10 p-5">
                <h2 className="text-lg font-bold text-white">HR Management</h2>
                <p className="mt-1 text-sm text-slate-400">HR users cannot self-register and can only be created here.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-white/10 text-slate-400 font-semibold bg-slate-950/20">
                    <tr>
                      <th className="px-4 py-3">HR</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {hrs.map((hr) => (
                      <tr key={hr._id} className="text-slate-300">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{hr.name}</p>
                          <p className="text-xs text-slate-500">{hr.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs border ${hr.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {hr.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{hr.created_at ? new Date(hr.created_at).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {hr.status === 'ACTIVE' ? (
                              <button onClick={() => updateHrStatus(hr._id, 'DISABLED')} title="Disable" className="rounded-md border border-amber-400/30 p-2 text-amber-200 hover:bg-amber-400/10 cursor-pointer"><Ban className="h-4 w-4" /></button>
                            ) : (
                              <button onClick={() => updateHrStatus(hr._id, 'ACTIVE')} title="Enable" className="rounded-md border border-emerald-400/30 p-2 text-emerald-200 hover:bg-emerald-500/10 cursor-pointer"><RotateCcw className="h-4 w-4" /></button>
                            )}
                            <button onClick={() => deleteHr(hr._id)} title="Delete" className="rounded-md border border-red-400/30 p-2 text-red-200 hover:bg-red-500/10 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {hrs.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No HR accounts yet.</p>}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'page-settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-cyan-300" />
                Student Page Visibility Controls
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Toggle visibility for platform pages. Hiding a page removes it from the Student navigation and blocks direct URL access.
              </p>
            </div>

            {pageSettingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              </div>
            ) : pageSettings.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">No page settings available.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pageSettings.map((page) => (
                  <div
                    key={page.pageId}
                    className={`rounded-xl border p-5 transition-all flex justify-between items-center bg-slate-950/20 ${
                      page.isHidden
                        ? 'border-red-500/20 hover:border-red-500/30'
                        : 'border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-white text-base">{page.label}</h4>
                      <p className="text-xs text-slate-400 mt-1">ID: {page.pageId}</p>
                      <div className="mt-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            page.isHidden
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {page.isHidden ? 'Hidden from Students' : 'Visible to Students'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePageVisibility(page.pageId, page.isHidden)}
                      disabled={pageSettingsUpdating === page.pageId}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 select-none ${
                        page.isHidden
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {pageSettingsUpdating === page.pageId ? 'Updating...' : page.isHidden ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'feedback' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-white/10 bg-slate-900/70 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-cyan-300" />
                  User Feedback Submissions
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Review and manage feedback submitted by platform users. Mark them as RESOLVED or IN PROGRESS.
                </p>
              </div>
              <button
                onClick={handleBackupFeedbacks}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
              >
                <Database className="h-4 w-4" />
                Backup Support Data
              </button>
            </div>

            {feedbacksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-white/10 bg-slate-950/40">
                <MessageSquareText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-1">No Feedback Found</h4>
                <p className="text-sm text-slate-400">Feedback submitted by users will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-semibold">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {feedbacks.map((item) => (
                      <tr key={item._id} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.email}</p>
                          <p className="text-[10px] text-slate-600 mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4 max-w-xs sm:max-w-md">
                          <p className="text-sm text-slate-200 break-words whitespace-pre-wrap">{item.message}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase border ${
                              item.category === 'bug'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : item.category === 'complaint'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : item.category === 'suggestion'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (item.rating || 0) ? 'fill-amber-400' : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                              item.status === 'RESOLVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : item.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}
                          >
                            {item.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {item.status !== 'IN_PROGRESS' && item.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(item._id, 'IN_PROGRESS')}
                                disabled={updatingFeedbackId === item._id}
                                className="text-xs font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 hover:bg-blue-500/20 transition-all cursor-pointer"
                              >
                                Investigate
                              </button>
                            )}
                            {item.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(item._id, 'RESOLVED')}
                                disabled={updatingFeedbackId === item._id}
                                className="text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 hover:bg-emerald-500/20 transition-all cursor-pointer"
                              >
                                Resolve
                              </button>
                            )}
                            {item.status === 'RESOLVED' && (
                              <span className="text-xs text-slate-500">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'test-users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <TestUserManager />
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default AdminDashboardV2;
