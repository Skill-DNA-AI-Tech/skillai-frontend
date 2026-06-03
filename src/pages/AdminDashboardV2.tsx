import { FormEvent, useEffect, useState } from 'react';
import { Award, BarChart3, BriefcaseBusiness, FileText, Loader2, Shield, Trash2, UserPlus, Users, Ban, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import SectionHeader from '../components/SectionHeader';
import { apiRequest } from '../lib/api';

type HrAccount = {
  _id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
};

const emptyHrForm = { name: '', email: '', password: '', mobile: '' };

const AdminDashboardV2 = () => {
  const [overview, setOverview] = useState<any>(null);
  const [hrs, setHrs] = useState<HrAccount[]>([]);
  const [form, setForm] = useState(emptyHrForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResult, hrsResult] = await Promise.all([
        apiRequest<any>('/admin/overview'),
        apiRequest<HrAccount[]>('/admin/hrs'),
      ]);
      setOverview(overviewResult);
      setHrs(hrsResult);
    } catch (err: any) {
      setError(err?.message || 'Unable to load Admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createHr = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/admin/hrs', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyHrForm);
      await load();
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
      });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to update HR account.');
    }
  };

  const deleteHr = async (id: string) => {
    if (!window.confirm('Delete this HR account permanently?')) return;
    try {
      await apiRequest(`/admin/hrs/${id}`, { method: 'DELETE' });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to delete HR account.');
    }
  };

  const modules = [
    { title: 'Student Management', text: 'View profiles, progress, scorecards, and learning readiness.', icon: Users, href: '#students' },
    { title: 'HR Management', text: 'Create, disable, and delete HR accounts.', icon: BriefcaseBusiness, href: '#hr-management' },
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
        description="Manage platform workflows with limited administrative access. Admin approval and Main Admin creation remain restricted."
        action={
          <Link to="/admin/questions" className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">
            <FileText className="h-4 w-4" />
            Question Bank
          </Link>
        }
      />

      {error && <div className="mt-6 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}
      {loading && <p className="mt-6 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading Admin dashboard...</p>}

      <section id="analytics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Students" value={overview?.students ?? 0} icon={Users} />
        <MetricCard label="HR accounts" value={overview?.hrs ?? 0} icon={BriefcaseBusiness} />
        <MetricCard label="Jobs" value={overview?.jobs ?? 0} icon={FileText} />
        <MetricCard label="Reports" value={overview?.reports ?? 0} icon={BarChart3} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((item) => (
          <a key={item.title} href={item.href} className="rounded-lg border border-white/10 bg-slate-900/70 p-5 transition hover:border-cyan-400/30">
            <item.icon className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-4 text-lg font-bold text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
          </a>
        ))}
      </section>

      <section id="hr-management" className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={createHr} className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><UserPlus className="h-5 w-5 text-cyan-300" /> Create HR Account</h2>
          <div className="grid gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Full name" required />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="HR email" required />
            <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Mobile" />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Temporary password" required />
            <button disabled={saving} className="rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60">
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
              <thead className="border-b border-white/10 text-slate-400">
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
                    <td className="px-4 py-3">{hr.status}</td>
                    <td className="px-4 py-3 text-slate-500">{hr.created_at ? new Date(hr.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {hr.status === 'ACTIVE' ? (
                          <button onClick={() => updateHrStatus(hr._id, 'DISABLED')} title="Disable" className="rounded-md border border-amber-400/30 p-2 text-amber-200"><Ban className="h-4 w-4" /></button>
                        ) : (
                          <button onClick={() => updateHrStatus(hr._id, 'ACTIVE')} title="Enable" className="rounded-md border border-emerald-400/30 p-2 text-emerald-200"><RotateCcw className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => deleteHr(hr._id)} title="Delete" className="rounded-md border border-red-400/30 p-2 text-red-200"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hrs.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No HR accounts yet.</p>}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardV2;
