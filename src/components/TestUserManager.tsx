import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Key, RotateCcw, Check, Copy, Eye, Trash2, 
  ShieldAlert, ShieldCheck, AlertCircle, RefreshCw, X, ChevronRight,
  Sparkles, Award, FileText, Activity, CheckCircle2, AlertTriangle,
  ExternalLink, LogIn
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface TestUser {
  _id: string;
  name: string;
  email: string;
  testUserId?: string;
  careerDomain?: string;
  targetRole?: string;
  department?: string;
  education?: string;
  experienceLevel?: string;
  isPreProductionUser?: boolean;
  betaAccess?: boolean;
  temporaryPassword?: string;
  testCredentials?: {
    userId?: string;
    temporaryPassword?: string;
    generatedAt?: string;
    expiresAt?: string;
    lastResetAt?: string;
  };
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
}

interface TestUserDetails {
  user: TestUser;
  interviews: any[];
  careerTwin: any[];
  profile: any;
  certificates: any[];
  summary: {
    interviewsCount: number;
    certificatesCount: number;
    careerTwinMemories: number;
    latestScore: number | null;
  };
}

const DOMAINS = [
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics Engineering',
  'Commerce',
  'Finance',
  'Management & Strategy',
  'Marketing',
  'Human Resources',
  'UI/UX & Graphic Design',
  'Healthcare & Pharmacy',
  'Computer Science & IT',
];

const EXPERIENCE_LEVELS = [
  'Fresher (0-1 year)',
  'Junior (1-3 years)',
  'Mid-Level (3-5 years)',
  'Senior (5+ years)',
];

const ROLE_PRESETS: Record<string, string[]> = {
  'Mechanical Engineering': ['Mechanical Design Engineer', 'HVAC Engineer', 'Thermal Systems Specialist', 'Manufacturing Quality Engineer'],
  'Civil Engineering': ['Structural Design Engineer', 'Site Execution Engineer', 'Geotechnical Specialist', 'BIM Modeler'],
  'Electronics Engineering': ['Embedded Systems Engineer', 'IoT Firmware Developer', 'PCB Design Engineer', 'Digital Signal Processing Engineer'],
  'Commerce': ['Accounts Officer', 'GST & Taxation Analyst', 'Audit Assistant', 'Bookkeeper'],
  'Finance': ['Financial Analyst', 'Investment Banking Associate', 'Equity Research Analyst', 'Corporate Finance Associate'],
  'Management & Strategy': ['Operations Manager', 'Project Management Officer', 'Business Analyst', 'Product Associate'],
  'Marketing': ['Digital Marketing Strategist', 'SEO & Performance Lead', 'Brand Marketing Specialist', 'Content Strategist'],
  'Human Resources': ['HR Generalist', 'Technical Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner'],
  'UI/UX & Graphic Design': ['UI/UX Product Designer', 'Visual Designer', 'Design Systems Specialist', 'User Researcher'],
  'Healthcare & Pharmacy': ['Clinical Research Associate', 'Pharmacovigilance Officer', 'Quality Control Analyst', 'Healthcare Operations'],
  'Computer Science & IT': ['Full Stack Developer', 'Cloud & DevOps Engineer', 'Backend Specialist', 'Frontend Engineer'],
};

export const TestUserManager: React.FC = () => {
  const { token } = useAuth();
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    testUserId: '',
    password: '',
    careerDomain: DOMAINS[0],
    targetRole: ROLE_PRESETS[DOMAINS[0]][0],
    department: 'Engineering',
    education: 'B.Tech Mechanical Engineering',
    experienceLevel: EXPERIENCE_LEVELS[0],
  });

  // Inspect User Modal
  const [inspectingUser, setInspectingUser] = useState<TestUserDetails | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Reset Modal
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTestUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<TestUser[]>('/admin/test-users', { token });
      setTestUsers(res || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load test users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestUsers();
  }, []);

  const handleDomainChange = (domain: string) => {
    const roles = ROLE_PRESETS[domain] || ['General Specialist'];
    let defaultEdu = 'Bachelor Degree';
    let defaultDept = 'Operations';

    if (domain.includes('Mechanical')) {
      defaultEdu = 'B.Tech Mechanical Engineering';
      defaultDept = 'Mechanical Design';
    } else if (domain.includes('Civil')) {
      defaultEdu = 'B.Tech Civil Engineering';
      defaultDept = 'Infrastructure';
    } else if (domain.includes('Electronics')) {
      defaultEdu = 'B.Tech Electronics & Communication';
      defaultDept = 'Hardware & Embedded';
    } else if (domain.includes('Commerce') || domain.includes('Finance')) {
      defaultEdu = 'B.Com / MBA Finance';
      defaultDept = 'Finance & Accounts';
    } else if (domain.includes('Marketing') || domain.includes('Management')) {
      defaultEdu = 'MBA / BBA';
      defaultDept = 'Growth & Strategy';
    } else if (domain.includes('HR')) {
      defaultEdu = 'MBA Human Resources';
      defaultDept = 'People Operations';
    } else if (domain.includes('Design')) {
      defaultEdu = 'B.Des / Visual Arts';
      defaultDept = 'Design';
    } else if (domain.includes('Healthcare')) {
      defaultEdu = 'B.Pharm / M.Pharm / Life Sciences';
      defaultDept = 'Clinical Operations';
    } else if (domain.includes('Computer')) {
      defaultEdu = 'B.Tech Computer Science / MCA';
      defaultDept = 'Engineering';
    }

    setForm({
      ...form,
      careerDomain: domain,
      targetRole: roles[0],
      education: defaultEdu,
      department: defaultDept,
    });
  };

  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const handleCreateTestUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await apiRequest<any>('/admin/test-users', {
        method: 'POST',
        body: JSON.stringify(form),
        token,
      });
      const credPass = res?.credentials?.temporaryPassword || res?.temporaryPassword || form.password || 'BetaStudentPass@123';
      const userIdent = res?.credentials?.userId || res?.user?.testUserId || res?.testUserId || res?.email || form.email;
      setSuccessMsg(`Pre-production beta student (${userIdent}) created successfully! Password: ${credPass}`);
      setIsCreateOpen(false);
      // Reset form
      setForm({
        name: '',
        email: '',
        testUserId: '',
        password: '',
        careerDomain: DOMAINS[0],
        targetRole: ROLE_PRESETS[DOMAINS[0]][0],
        department: 'Engineering',
        education: 'B.Tech Mechanical Engineering',
        experienceLevel: EXPERIENCE_LEVELS[0],
      });
      fetchTestUsers();
    } catch (err: any) {
      setError(err?.message || 'Failed to create pre-production beta student.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (user: TestUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await apiRequest(`/admin/test-users/${user._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
        token,
      });
      setTestUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: nextStatus } : u));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleResetData = async (userId: string, targets?: { interviews?: boolean; careerTwin?: boolean; skillDNA?: boolean; certificates?: boolean }) => {
    setResetting(true);
    try {
      const payload = targets || {
        interviews: true,
        careerTwin: true,
        skillDNA: true,
        certificates: true,
      };
      await apiRequest(`/admin/test-users/${userId}/reset`, {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
      });
      setSuccessMsg('Pre-production user evaluation and test data successfully reset!');
      setResettingUserId(null);
      if (inspectingUser && inspectingUser.user._id === userId) {
        handleInspectUser(userId);
      }
    } catch (err: any) {
      alert('Reset failed: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleInspectUser = async (userId: string) => {
    setInspectLoading(true);
    try {
      const res = await apiRequest<TestUserDetails>(`/admin/test-users/${userId}`, { token });
      setInspectingUser(res);
    } catch (err: any) {
      alert('Failed to inspect pre-production user: ' + err.message);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleLaunchBetaSession = async (user: TestUser) => {
    setLaunchingId(user._id);
    try {
      const res = await apiRequest<{ token: string; user: any }>(`/admin/test-users/${user._id}/login-token`, {
        method: 'POST',
        token,
      });
      if (res?.token) {
        const curToken = localStorage.getItem('token');
        const curUser = localStorage.getItem('user');
        if (curToken && !localStorage.getItem('admin_backup_token')) {
          localStorage.setItem('admin_backup_token', curToken);
          if (curUser) localStorage.setItem('admin_backup_user', curUser);
        }
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.open('/student/dashboard', '_blank');
        setSuccessMsg(`Launched Beta testing session for ${user.name} (${user.email}) in a new tab!`);
      }
    } catch (err: any) {
      alert('Failed to launch beta session: ' + err.message);
    } finally {
      setLaunchingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this pre-production beta student and all related data?')) return;
    try {
      await apiRequest(`/admin/test-users/${userId}`, {
        method: 'DELETE',
        token,
      });
      setTestUsers(prev => prev.filter(u => u._id !== userId));
      if (inspectingUser?.user._id === userId) setInspectingUser(null);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const copyCredentials = (user: TestUser) => {
    const pass = user.testCredentials?.temporaryPassword || user.temporaryPassword || 'BetaStudentPass@123';
    const credText = `Email: ${user.email}\nUser/Test ID: ${user.testUserId || user.email}\nPassword: ${pass}\nDomain: ${user.careerDomain || 'General'}\nRole: ${user.targetRole || 'Specialist'}\nBeta Access: Active`;
    navigator.clipboard.writeText(credText);
    setCopiedId(user._id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide">Pre-Production Users & Beta Access</h2>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Provision and manage student candidate accounts with active Beta Access across Mechanical, Civil, Electronics, Finance, IT, Healthcare, etc. Test adaptive AI interviews, Career Twin memory, and verified certificate generation in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTestUsers}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md hover:from-cyan-400 hover:to-blue-500 transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add Pre-Production Student
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-4 text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Test Users Table / Grid */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 shadow-lg overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-white">Pre-Production Beta Candidates ({testUsers.length})</span>
          </div>
          <span className="text-xs text-slate-400">
            Accounts equipped with active student permissions & Beta Access
          </span>
        </div>

        {loading && testUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-cyan-400 mb-2" />
            Loading pre-production beta candidates...
          </div>
        ) : testUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="font-medium text-slate-300">No pre-production beta candidates provisioned yet.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Add Pre-Production Student" above to create an active student candidate account for any career domain.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3">Candidate & Credentials</th>
                  <th className="px-6 py-3">Domain & Target Role</th>
                  <th className="px-6 py-3">Education & Level</th>
                  <th className="px-6 py-3">Beta Access Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {testUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white flex items-center gap-2">
                        {u.name}
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
                          BETA ACCESS
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                      {u.testUserId && (
                        <div className="flex items-center gap-2 mt-2">
                          <code className="rounded bg-slate-950 px-2 py-0.5 text-xs text-cyan-300 font-mono border border-cyan-500/30">
                            {u.testUserId}
                          </code>
                          <button
                            onClick={() => copyCredentials(u)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                            title="Copy Login & Password"
                          >
                            {copiedId === u._id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Pass</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{u.careerDomain || 'General'}</div>
                      <div className="text-xs text-cyan-400/90 mt-0.5">{u.targetRole || 'Not assigned'}</div>
                      {u.department && <div className="text-[11px] text-slate-500">{u.department}</div>}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-300">{u.education || 'Graduate'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{u.experienceLevel || 'Fresher'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition cursor-pointer ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Disabled
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleLaunchBetaSession(u)}
                        disabled={launchingId === u._id}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition cursor-pointer"
                        title="Open candidate portal in new tab with this beta student account"
                      >
                        {launchingId === u._id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                        Launch Beta
                      </button>

                      <button
                        onClick={() => handleInspectUser(u._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 transition cursor-pointer"
                        title="Inspect test activity & AI logs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect
                      </button>

                      <button
                        onClick={() => handleResetData(u._id)}
                        disabled={resetting}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-950/30 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/40 transition cursor-pointer"
                        title="Reset interview & twin data for re-testing"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-950/30 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-900/40 transition cursor-pointer"
                        title="Delete candidate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Test Persona */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Add Pre-Production Student (Beta Access)</h3>
                  <p className="text-xs text-slate-400">Provision active candidate credentials to test adaptive interviews and Career Twin</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTestUser} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Student Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.beta@skilldna.internal"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Career Domain *
                  </label>
                  <select
                    value={form.careerDomain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Target Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    placeholder="e.g. HVAC Design Engineer"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                  {ROLE_PRESETS[form.careerDomain] && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ROLE_PRESETS[form.careerDomain].slice(0, 3).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, targetRole: r })}
                          className="text-[10px] text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60 rounded px-1.5 py-0.5 border border-cyan-500/20 cursor-pointer"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Degree / Education
                  </label>
                  <input
                    type="text"
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder="e.g. B.Tech Mechanical"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Mechanical Design"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Pre-Production Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.testUserId}
                    onChange={(e) => setForm({ ...form, testUserId: e.target.value.toUpperCase() })}
                    placeholder="Auto: BETA-XXXX"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm font-mono text-cyan-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">e.g. BETA-MECH-01 or BETA-FINANCE-02</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Student Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Defaults to BetaStudentPass@123"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Admin can copy credentials or sign-in with 1 click</span>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>Account will receive immediate <strong>Beta Access</strong>, active status, email verified, and initialized Career Twin memory.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {creating && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Provision Beta Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect Test User Activity & AI Logs */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Candidate Diagnostics: {inspectingUser.user.name} ({inspectingUser.user.testUserId || inspectingUser.user.email})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Domain: <span className="text-cyan-300">{inspectingUser.user.careerDomain}</span> • Role: <span className="text-cyan-300">{inspectingUser.user.targetRole}</span> • Beta Access: <span className="text-emerald-400">Active</span> • Status: <span className="text-emerald-400">{inspectingUser.user.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchBetaSession(inspectingUser.user)}
                  disabled={launchingId === inspectingUser.user._id}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Launch Beta Session
                </button>
                <button
                  onClick={() => handleResetData(inspectingUser.user._id)}
                  disabled={resetting}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Activity
                </button>
                <button
                  onClick={() => setInspectingUser(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-6 overflow-y-auto pr-2 flex-grow">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-center">
                  <div className="text-xs text-slate-400">Interviews Completed</div>
                  <div className="text-xl font-bold text-white mt-1">{inspectingUser.summary.interviewsCount}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-center">
                  <div className="text-xs text-slate-400">Latest Overall Score</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">
                    {inspectingUser.summary.latestScore !== null ? `${inspectingUser.summary.latestScore}%` : 'N/A'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-center">
                  <div className="text-xs text-slate-400">Certificates Earned</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{inspectingUser.summary.certificatesCount}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-center">
                  <div className="text-xs text-slate-400">Career Twin Insights</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">{inspectingUser.summary.careerTwinMemories}</div>
                </div>
              </div>

              {/* Interview Sessions Log */}
              <div>
                <h4 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Interview Sessions ({inspectingUser.interviews.length})
                </h4>
                {inspectingUser.interviews.length === 0 ? (
                  <div className="rounded-lg border border-white/5 bg-slate-950/40 p-4 text-center text-xs text-slate-400">
                    No interview sessions recorded yet. Log in with this test account to take an adaptive interview.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inspectingUser.interviews.map((sess: any, idx: number) => (
                      <div key={sess._id || idx} className="rounded-xl border border-white/10 bg-slate-950/80 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold text-white">Session #{idx + 1} ({sess.status})</span>
                            <div className="text-xs text-slate-400">
                              Domain: <span className="text-cyan-300">{sess.domain || 'N/A'}</span> • Target Role: <span className="text-cyan-300">{sess.role || 'N/A'}</span> • Questions: {sess.studentAnswers?.length || 0} / {sess.questionPool?.length || 0}
                            </div>
                          </div>
                          {sess.finalReport?.overallScore !== undefined && (
                            <span className={`text-base font-bold px-3 py-1 rounded-lg ${sess.finalReport.overallScore >= 75 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                              Score: {sess.finalReport.overallScore}%
                            </span>
                          )}
                        </div>

                        {/* Competency breakdown */}
                        {sess.finalReport?.competencies && (
                          <div className="grid grid-cols-5 gap-2 rounded-lg bg-slate-900 p-2 text-center text-xs">
                            <div>
                              <div className="text-slate-400">Technical</div>
                              <div className="font-semibold text-cyan-300">{sess.finalReport.competencies.technical}%</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Communication</div>
                              <div className="font-semibold text-cyan-300">{sess.finalReport.competencies.communication}%</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Problem Solving</div>
                              <div className="font-semibold text-cyan-300">{sess.finalReport.competencies.problemSolving}%</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Confidence</div>
                              <div className="font-semibold text-cyan-300">{sess.finalReport.competencies.confidence}%</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Clarity</div>
                              <div className="font-semibold text-cyan-300">{sess.finalReport.competencies.clarity}%</div>
                            </div>
                          </div>
                        )}

                        {/* Answers breakdown */}
                        {sess.studentAnswers && sess.studentAnswers.length > 0 && (
                          <div className="space-y-2 border-t border-white/5 pt-2">
                            <div className="text-xs font-semibold text-slate-300">Question & Answer Evaluation Log:</div>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {sess.studentAnswers.map((ans: any, qIdx: number) => (
                                <div key={qIdx} className="rounded border border-white/5 bg-slate-900/50 p-2 text-xs">
                                  <div className="flex items-center justify-between text-slate-400 mb-1">
                                    <span>Q{qIdx + 1}: {ans.questionId}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                      ans.answerStatus === 'EMPTY' ? 'bg-rose-500/20 text-rose-300' :
                                      ans.answerStatus === 'NO_ANSWER' ? 'bg-amber-500/20 text-amber-300' :
                                      ans.answerStatus === 'COPY_SUSPECTED' ? 'bg-purple-500/20 text-purple-300' :
                                      'bg-emerald-500/20 text-emerald-300'
                                    }`}>
                                      Status: {ans.answerStatus || 'VALID'} • Score: {ans.metrics?.overallScore ?? ans.marksObtained ?? 0}/100
                                    </span>
                                  </div>
                                  <div className="text-slate-200 line-clamp-2 italic">"{ans.answer || '(No answer provided)'}"</div>
                                  {ans.feedback && <div className="text-[11px] text-cyan-400/80 mt-1">Feedback: {ans.feedback}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Career Twin Insights */}
              <div>
                <h4 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Career Twin Adaptive Diagnostics ({inspectingUser.careerTwin.length})
                </h4>
                {inspectingUser.careerTwin.length === 0 ? (
                  <div className="rounded-lg border border-white/5 bg-slate-950/40 p-4 text-center text-xs text-slate-400">
                    No diagnostic memories recorded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {inspectingUser.careerTwin.map((mem: any, mIdx: number) => (
                      <div key={mIdx} className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between text-indigo-300 font-medium">
                          <span>{mem.domain || 'Domain'} Diagnostic</span>
                          <span className="text-[10px] text-slate-400">{new Date(mem.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-slate-300">{mem.memoryText}</div>
                        {mem.strengths?.length > 0 && (
                          <div className="text-[11px] text-emerald-300">Strengths: {mem.strengths.join(', ')}</div>
                        )}
                        {mem.stuckTopics?.length > 0 && (
                          <div className="text-[11px] text-rose-300">Stuck Topics: {mem.stuckTopics.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
