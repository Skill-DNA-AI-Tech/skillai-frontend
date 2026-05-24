import { BarChart3, FilePlus2, MailCheck, Shield, UploadCloud, Settings, Database, Users, Edit3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import SectionHeader from '../components/SectionHeader';
import { adminAnalytics, contentTypes } from '../data/platform';
import { apiRequest } from '../lib/api';

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
  { label: 'Footer settings', href: '#footer-management', icon: Edit3 },
  { label: 'Content modules', href: '#content-types', icon: Database },
  { label: 'Moderation', href: '#moderation', icon: Shield },
  { label: 'Recruiter portal', href: '/recruiter', icon: Users },
  { label: 'Community', href: '/community', icon: MailCheck },
];

const AdminDashboard = () => {
  const [footerData, setFooterData] = useState({
    text: '',
    linkGroups: [{ title: '', links: [{ label: '', url: '' }] }],
    copyright: ''
  });
  const [overview, setOverview] = useState<any>(null);
  const [moderationData, setModerationData] = useState<any>(null);
  const [isEditingFooter, setIsEditingFooter] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const footer = await apiRequest('/admin/footer');
        // Ensure legacy data is handled if it has links but no linkGroups
        if (!footer.linkGroups && footer.links) {
          setFooterData({
            ...footer,
            linkGroups: [{ title: 'Quick Links', links: footer.links }]
          });
        } else {
          setFooterData(footer);
        }
      } catch (error) {
        console.error('Failed to fetch footer:', error);
      }

      try {
        const overviewResult = await apiRequest('/admin/overview');
        setOverview(overviewResult);
      } catch (error) {
        console.error('Failed to fetch overview:', error);
      }

      try {
        const moderationResult = await apiRequest('/admin/moderation');
        setModerationData(moderationResult);
      } catch (error) {
        console.error('Failed to fetch moderation info:', error);
      }
    };
    fetchAdminData();
  }, []);

  const handleSaveFooter = async () => {
    try {
      const updated = await apiRequest('/admin/footer', {
        method: 'PUT',
        body: JSON.stringify(footerData)
      });
      if (!updated.linkGroups && updated.links) {
         updated.linkGroups = [{ title: 'Quick Links', links: updated.links }];
      }
      setFooterData(updated);
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
            {adminSidebarLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-sm text-slate-200 transition-all hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white"
              >
                <item.icon className="h-4 w-4 text-cyan-400" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
            <p className="text-sm font-medium text-slate-200">Manage footer links and content, review moderation, and access recruiter and community routes from this control sidebar.</p>
          </div>
        </aside>

        <div className="space-y-8">
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
        </div>
      </section>

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

      <motion.section 
        id="content-types"
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/10">
            <Database className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">CMS Content Types</h3>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 relative z-10">
          {contentTypes.map((type, i) => (
            <motion.button 
              key={type} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-slate-300 transition-all hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
            >
              {type}
            </motion.button>
          ))}
        </div>
      </motion.section>
    </main>
  );
};

export default AdminDashboard;
