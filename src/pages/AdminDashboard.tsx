import { BarChart3, FilePlus2, MailCheck, Shield, UploadCloud, Settings, Database, Users, Edit3, UserPlus, Trash2, Key, ShieldAlert, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import SectionHeader from '../components/SectionHeader';
import { adminAnalytics, contentTypes } from '../data/platform';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const adminChart = [
  { label: 'Medical', users: 3200 },
  { label: 'Engg', users: 5400 },
  { label: 'MBA', users: 1900 },
  { label: 'Science', users: 2800 },
  { label: 'Law', users: 1200 },
  { label: 'Arts', users: 980 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const adminSidebarLinks = [
  { label: 'Overview', href: '#overview', icon: BarChart3 },
  { label: 'Question bank', href: '/admin/questions', icon: FilePlus2 },
  { label: 'Footer settings', href: '#footer-management', icon: Edit3 },
  { label: 'Content modules', href: '#content-types', icon: Database },
  { label: 'Moderation', href: '#moderation', icon: Shield },
  { label: 'Recruiter portal', href: '/recruiter', icon: Users },
  { label: 'Community', href: '/community', icon: MailCheck },
];

interface FooterLink {
  label: string;
  url: string;
}

interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

interface FooterData {
  text: string;
  linkGroups: FooterLinkGroup[];
  copyright: string;
  links?: FooterLink[];
}

interface ModerationData {
  pendingCompanies: number;
  pendingJobs: number;
  pendingReports: number;
  flaggedPosts: number;
}

const defaultFooterData: FooterData = {
  text: '',
  linkGroups: [{ title: '', links: [{ label: '', url: '' }] }],
  copyright: ''
};

const normalizeFooter = (footer: FooterData): FooterData => ({
  text: footer.text ?? '',
  linkGroups: footer.linkGroups ?? (footer.links ? [{ title: 'Quick Links', links: footer.links }] : []),
  copyright: footer.copyright ?? '',
});

const AdminDashboard = () => {
  const { user } = useAuth();
  const isMainAdmin = user?.email === 'skilldnaai@ai.com';

  const [activeTab, setActiveTab] = useState<'overview' | 'footer' | 'admins'>('overview');
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [overview, setOverview] = useState<any>(null);
  const [moderationData, setModerationData] = useState<ModerationData | null>(null);
  const [isEditingFooter, setIsEditingFooter] = useState(false);

  // Admin/Employee Management State
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee'
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedAdminForReset, setSelectedAdminForReset] = useState<any | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');

  const fetchAdmins = async () => {
    if (!isMainAdmin) return;
    try {
      setAdminsLoading(true);
      const data = await apiRequest<any[]>('/admin/admins');
      setAdmins(data || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const footer = await apiRequest<FooterData>('/admin/footer');
        setFooterData(normalizeFooter(footer));
      } catch (error) {
        console.error('Failed to fetch footer:', error);
      }

      try {
        const overviewResult = await apiRequest<any>('/admin/overview');
        setOverview(overviewResult);
      } catch (error) {
        console.error('Failed to fetch overview:', error);
      }

      try {
        const moderationResult = await apiRequest<ModerationData>('/admin/moderation');
        setModerationData(moderationResult);
      } catch (error) {
        console.error('Failed to fetch moderation info:', error);
      }
    };
    fetchAdminData();
    if (isMainAdmin) {
      fetchAdmins();
    }
  }, [isMainAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAdmin(true);
      await apiRequest('/admin/admins', {
        method: 'POST',
        body: JSON.stringify(newAdminForm)
      });
      alert(`Account created successfully with role ${newAdminForm.role}!`);
      setShowAddModal(false);
      setNewAdminForm({ name: '', email: '', password: '', role: 'employee' });
      fetchAdmins();
    } catch (error: any) {
      alert(error.message || 'Failed to create account');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete admin/employee ${email}?`)) return;
    try {
      await apiRequest(`/admin/admins/${adminId}`, {
        method: 'DELETE'
      });
      alert('Account deleted successfully.');
      fetchAdmins();
    } catch (error: any) {
      alert(error.message || 'Failed to delete account');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminForReset || !newResetPassword) return;
    try {
      setSubmittingAdmin(true);
      await apiRequest(`/admin/admins/${selectedAdminForReset._id}`, {
        method: 'PUT',
        body: JSON.stringify({ password: newResetPassword })
      });
      alert(`Password successfully reset for ${selectedAdminForReset.email}. They will be forced to change it on their next login.`);
      setShowResetModal(false);
      setSelectedAdminForReset(null);
      setNewResetPassword('');
      fetchAdmins();
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleToggleRole = async (adminId: string, currentRole: 'admin' | 'employee') => {
    const nextRole = currentRole === 'admin' ? 'employee' : 'admin';
    try {
      await apiRequest(`/admin/admins/${adminId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: nextRole })
      });
      alert(`Role successfully updated to ${nextRole}!`);
      fetchAdmins();
    } catch (error: any) {
      alert(error.message || 'Failed to update role');
    }
  };

  const handleSaveFooter = async () => {
    try {
      const updated = await apiRequest<FooterData>('/admin/footer', {
        method: 'PUT',
        body: JSON.stringify(footerData)
      });
      setFooterData(normalizeFooter(updated));
      setIsEditingFooter(false);
    } catch (error) {
      console.error('Failed to update footer:', error);
    }
  };

  const addLinkGroup = () => {
    setFooterData(prev => ({
      ...prev,
      linkGroups: [...(prev.linkGroups || []), { title: '', links: [{ label: '', url: '' }] }]
    }));
  };

  const removeLinkGroup = (groupIndex: number) => {
    setFooterData(prev => ({
      ...prev,
      linkGroups: prev.linkGroups.filter((_, i) => i !== groupIndex)
    }));
  };

  const updateLinkGroupTitle = (groupIndex: number, title: string) => {
    setFooterData(prev => ({
      ...prev,
      linkGroups: prev.linkGroups.map((g, i) => i === groupIndex ? { ...g, title } : g)
    }));
  };

  const addLink = (groupIndex: number) => {
    setFooterData(prev => ({
      ...prev,
      linkGroups: prev.linkGroups.map((g, i) => 
        i === groupIndex ? { ...g, links: [...g.links, { label: '', url: '' }] } : g
      )
    }));
  };

  const updateLink = (groupIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    setFooterData(prev => ({
      ...prev,
      linkGroups: prev.linkGroups.map((g, gi) => 
        gi === groupIndex ? {
          ...g,
          links: g.links.map((l, li) => li === linkIndex ? { ...l, [field]: value } : l)
        } : g
      )
    }));
  };

  const removeLink = (groupIndex: number, linkIndex: number) => {
    setFooterData(prev => ({
      ...prev,
      linkGroups: prev.linkGroups.map((g, gi) => 
        gi === groupIndex ? {
          ...g,
          links: g.links.filter((_, li) => li !== linkIndex)
        } : g
      )
    }));
  };
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <SectionHeader
          eyebrow="Admin dashboard"
          title="Operate content, users, reports, jobs, and analytics"
          description="Manage students, recruiters, companies, lessons, quizzes, webinars, reports, badges, emails, job postings, and moderation from one control surface."
          action={
            <button className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95">
              <FilePlus2 className="h-5 w-5 transition-transform group-hover:scale-110" />
              Create Content
            </button>
          }
        />
      </motion.div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block rounded-3xl border border-white/5 bg-slate-900/70 p-5 shadow-lg shadow-black/20 sticky top-24 self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300 mb-4">Admin quick links</p>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'overview' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Overview</span>
            </button>
            <a
              href="/admin/questions"
              className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-sm text-slate-200 transition-all hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white"
            >
              <FilePlus2 className="h-4 w-4 text-cyan-400" />
              <span>Question bank</span>
            </a>
            {isMainAdmin && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'admins' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
              >
                <Users className="h-4 w-4 text-cyan-400" />
                <span>User accounts</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('footer')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'footer' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <Edit3 className="h-4 w-4 text-cyan-400" />
              <span>Footer settings</span>
            </button>
          </div>
          <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-slate-200">Manage footer links and content, review moderation, and access recruiter and community routes from this control sidebar.</p>
          </div>
        </aside>

        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              <motion.section 
                id="overview"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
            {adminAnalytics.map((metric) => (
              <motion.div key={metric.label} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <MetricCard label={metric.label} value={metric.value} icon={metric.icon} delta={metric.delta} />
              </motion.div>
            ))}
          </motion.section>

      <motion.section
        id="moderation"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: 'Pending companies', value: moderationData?.pendingCompanies ?? 0, icon: Shield },
          { label: 'Pending jobs', value: moderationData?.pendingJobs ?? 0, icon: UploadCloud },
          { label: 'Pending reports', value: moderationData?.pendingReports ?? 0, icon: FilePlus2 },
          { label: 'Flagged posts', value: moderationData?.flaggedPosts ?? 0, icon: MailCheck },
        ].map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} icon={metric.icon} />
        ))}
      </motion.section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-6 shadow-xl backdrop-blur-sm transition-all hover:border-cyan-500/20"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Domain engagement</h3>
              <p className="mt-1 text-sm text-slate-400">Total verified users grouped by primary learning domains.</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-500/10 transition-colors group-hover:bg-cyan-500/20">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                />
                <Bar dataKey="users" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {[
            { icon: Shield, title: 'Badge rules', text: 'Bronze, Silver, Gold, Platinum thresholds.', color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30" },
            { icon: MailCheck, title: 'Email workflows', text: 'OTP, recruiter shares, shortlist alerts.', color: "text-purple-400", bg: "bg-purple-500/10", border: "hover:border-purple-500/30" },
            { icon: UploadCloud, title: 'Moderation', text: 'Review companies, content, jobs, and forums.', color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30" },
          ].map((item, i) => (
            <motion.article 
              key={item.title} 
              variants={itemVariants} 
              whileHover={{ scale: 1.02 }} 
              className={`group relative overflow-hidden rounded-xl border border-white/5 bg-slate-900/[0.6] p-5 backdrop-blur-sm transition-all ${item.border}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${item.bg} transition-colors`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.text}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <motion.section 
        id="footer-management"
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8 rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-500/10">
              <Edit3 className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Footer Management</h3>
          </div>
          <button
            onClick={() => setIsEditingFooter(!isEditingFooter)}
            className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            {isEditingFooter ? 'Cancel' : 'Edit Footer'}
          </button>
        </div>

        {isEditingFooter ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Footer Text</label>
              <textarea
                value={footerData.text}
                onChange={(e) => setFooterData(prev => ({ ...prev, text: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                rows={3}
                placeholder="Enter footer description text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-4">Link Groups</label>
              <div className="space-y-6">
                {(footerData.linkGroups || []).map((group, groupIndex) => (
                  <div key={groupIndex} className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                    <div className="flex gap-4 mb-4">
                      <input
                        type="text"
                        value={group.title}
                        onChange={(e) => updateLinkGroupTitle(groupIndex, e.target.value)}
                        placeholder="Group Title (e.g., Quick Links, Support)"
                        className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none font-semibold"
                      />
                      <button
                        onClick={() => removeLinkGroup(groupIndex)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Remove Group
                      </button>
                    </div>
                    <div className="space-y-2 pl-4 border-l border-white/10">
                      {group.links.map((link, linkIndex) => (
                        <div key={linkIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateLink(groupIndex, linkIndex, 'label', e.target.value)}
                            placeholder="Link label"
                            className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(groupIndex, linkIndex, 'url', e.target.value)}
                            placeholder="Link URL"
                            className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                          />
                          <button
                            onClick={() => removeLink(groupIndex, linkIndex)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addLink(groupIndex)}
                        className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors mt-2"
                      >
                        Add Link to Group
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addLinkGroup}
                  className="w-full rounded-xl border border-dashed border-white/20 p-4 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  + Add New Link Group
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Copyright Text</label>
              <input
                type="text"
                value={footerData.copyright}
                onChange={(e) => setFooterData(prev => ({ ...prev, copyright: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                placeholder="Enter copyright text..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditingFooter(false)}
                className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFooter}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-1">Footer Text</h4>
              <p className="text-slate-400 text-sm">{footerData.text || 'No text set'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-1">Footer Links</h4>
              <div className="space-y-4">
                {(footerData.linkGroups || []).map((group, gi) => (
                  <div key={gi}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{group.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.links.map((link, index) => (
                        <span key={index} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {link.label || 'No label'} → {link.url || 'No URL'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-1">Copyright</h4>
              <p className="text-slate-400 text-sm">{footerData.copyright || 'No copyright set'}</p>
            </div>
          </div>
        )}
      </motion.section>

            </>
          )}

          {activeTab === 'footer' && (
            <motion.section 
              id="footer-management"
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.5 }}
              className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-500/10">
                    <Edit3 className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Footer Management</h3>
                </div>
                <button
                  onClick={() => setIsEditingFooter(!isEditingFooter)}
                  className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  {isEditingFooter ? 'Cancel' : 'Edit Footer'}
                </button>
              </div>

              {isEditingFooter ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Footer Text</label>
                    <textarea
                      value={footerData.text}
                      onChange={(e) => setFooterData(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                      rows={3}
                      placeholder="Enter footer description text..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">Link Groups</label>
                    <div className="space-y-6">
                      {(footerData.linkGroups || []).map((group, groupIndex) => (
                        <div key={groupIndex} className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                          <div className="flex gap-4 mb-4">
                            <input
                              type="text"
                              value={group.title}
                              onChange={(e) => updateLinkGroupTitle(groupIndex, e.target.value)}
                              placeholder="Group Title (e.g., Quick Links, Support)"
                              className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none font-semibold"
                            />
                            <button
                              onClick={() => removeLinkGroup(groupIndex)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              Remove Group
                            </button>
                          </div>
                          <div className="space-y-2 pl-4 border-l border-white/10">
                            {group.links.map((link, linkIndex) => (
                              <div key={linkIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={link.label}
                                  onChange={(e) => updateLink(groupIndex, linkIndex, 'label', e.target.value)}
                                  placeholder="Link label"
                                  className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                                />
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => updateLink(groupIndex, linkIndex, 'url', e.target.value)}
                                  placeholder="Link URL"
                                  className="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                                />
                                <button
                                  onClick={() => removeLink(groupIndex, linkIndex)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addLink(groupIndex)}
                              className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors mt-2"
                            >
                              Add Link to Group
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addLinkGroup}
                        className="w-full rounded-xl border border-dashed border-white/20 p-4 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        + Add New Link Group
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Copyright Text</label>
                    <input
                      type="text"
                      value={footerData.copyright}
                      onChange={(e) => setFooterData(prev => ({ ...prev, copyright: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none"
                      placeholder="Enter copyright text..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsEditingFooter(false)}
                      className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveFooter}
                      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">Footer Text</h4>
                    <p className="text-slate-400 text-sm">{footerData.text || 'No text set'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">Footer Links</h4>
                    <div className="space-y-4">
                      {(footerData.linkGroups || []).map((group, gi) => (
                        <div key={gi}>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{group.title}</p>
                          <div className="flex flex-wrap gap-2">
                            {group.links.map((link, index) => (
                              <span key={index} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                {link.label || 'No label'} → {link.url || 'No URL'}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">Copyright</h4>
                    <p className="text-slate-400 text-sm">{footerData.copyright || 'No copyright set'}</p>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'admins' && isMainAdmin && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-cyan-400" />
                    Admin & Employee Management
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Only the main Super Admin skilldnaai@ai.com can add, modify, or revoke access for secondary admins and employees.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Account
                </button>
              </div>

              {adminsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-white/10 bg-slate-950/40">
                  <ShieldAlert className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-1">No Secondary Accounts</h4>
                  <p className="text-sm text-slate-400">Add secondary administrators or employees to collaborate on the platform.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-semibold">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Access Role</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-white">{admin.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{admin.email}</div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleRole(admin._id, admin.role)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                admin.role === 'admin' 
                                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                              title="Click to toggle role"
                            >
                              <Shield className="h-3 w-3" />
                              {admin.role === 'admin' ? 'Administrator' : 'Employee (Staff)'}
                            </button>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              admin.requiresPasswordChange 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${admin.requiresPasswordChange ? 'bg-amber-400' : 'bg-green-400'}`} />
                              {admin.requiresPasswordChange ? 'Temporary PW' : 'Active'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedAdminForReset(admin);
                                  setShowResetModal(true);
                                }}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Reset to a temporary password"
                              >
                                <Key className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                                className="p-1.5 rounded bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-400 transition-colors"
                                title="Delete account permanently"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          )}
        </div>
      </section>

      {/* Create User Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-cyan-400" />
              Create Admin or Employee
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter details below. Newly created accounts will be forced to change this temporary password immediately upon their first login.
            </p>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950/85 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="name@skilldna.com"
                  className="w-full bg-slate-950/85 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Temporary Password</label>
                <input
                  type="password"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/85 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Access Role</label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value as any })}
                  className="w-full bg-slate-950/85 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="employee">Employee (Staff / Support)</option>
                  <option value="admin">Secondary Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/10 mt-6">
                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {submittingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedAdminForReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-400" />
              Reset Password
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter a temporary password for <strong>{selectedAdminForReset.email}</strong>. They will be forced to update it on their next login.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">New Temporary Password</label>
                <input
                  type="password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/85 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 placeholder-slate-600 focus:ring-1 focus:ring-amber-500 transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/10 mt-6">
                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {submittingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedAdminForReset(null);
                    setNewResetPassword('');
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
