import { BarChart3, FilePlus2, MailCheck, Shield, UploadCloud, Settings, Database, Users, Edit3, UserPlus, Trash2, Key, ShieldAlert, Loader2, Sparkles, CheckCircle2, Award, PenTool, FileClock, MessageSquareText, Star } from 'lucide-react';
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

const SignaturePad = ({ onSave, initialSignature }: { onSave: (data: string) => void, initialSignature?: string }) => {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef && initialSignature) {
      const ctx = canvasRef.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialSignature;
      }
    }
  }, [canvasRef, initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#22d3ee'; // cyan-400
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const rect = canvasRef.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    }
  };

  const saveSignature = () => {
    if (!canvasRef) return;
    const dataUrl = canvasRef.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-300">Draw your official signature below using mouse or touch screen:</p>
      <div className="border border-cyan-500/20 bg-slate-950 rounded-xl overflow-hidden shadow-inner">
        <canvas
          ref={setCanvasRef}
          width={500}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full max-w-[500px] h-[200px] cursor-crosshair touch-none"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
        >
          Clear Pad
        </button>
        <button
          type="button"
          onClick={saveSignature}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
};

const MainAdminDashboard = () => {
  const { user } = useAuth();
  const isMainAdmin = user?.email === 'skilldnaai@ai.com';

  const [activeTab, setActiveTab] = useState<'overview' | 'footer' | 'admins' | 'certificates' | 'page-settings' | 'feedback'>('overview');
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);

  // Certificates Approval & Signature State
  const [pendingCertificates, setPendingCertificates] = useState<any[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [adminSignature, setAdminSignature] = useState<string>('');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [auditingCertificate, setAuditingCertificate] = useState<any>({
    careerPath: '',
    technicalScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    confidenceScore: 0,
    strengths: '',
    improvements: '',
  });

  // Page Settings State
  const [pageSettings, setPageSettings] = useState<any[]>([]);
  const [pageSettingsLoading, setPageSettingsLoading] = useState(false);
  const [pageSettingsUpdating, setPageSettingsUpdating] = useState<string | null>(null);

  // User Feedbacks State
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(null);

  const fetchPendingCertificates = async () => {
    try {
      setCertificatesLoading(true);
      const res = await apiRequest<any[]>('/certificates/admin/pending');
      setPendingCertificates(res || []);
    } catch (error) {
      console.error('Failed to fetch pending certificates:', error);
    } finally {
      setCertificatesLoading(false);
    }
  };

  const fetchAdminSignature = async () => {
    try {
      const res = await apiRequest<{ signatureBase64: string }>('/certificates/admin/signature');
      setAdminSignature(res?.signatureBase64 || '');
    } catch (error) {
      console.error('Failed to fetch admin signature:', error);
    }
  };

  const fetchPageSettings = async () => {
    try {
      setPageSettingsLoading(true);
      const res = await apiRequest<any[]>('/admin/page-settings');
      setPageSettings(res || []);
    } catch (error) {
      console.error('Failed to fetch page settings:', error);
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
      });
      setPageSettings((prev) =>
        prev.map((item) => (item.pageId === pageId ? { ...item, isHidden: res.isHidden } : item))
      );
    } catch (error) {
      console.error('Failed to update page setting:', error);
      alert('Failed to update page settings');
    } finally {
      setPageSettingsUpdating(null);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const res = await apiRequest<any[]>('/admin/feedback');
      setFeedbacks(res || []);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
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
      });
      setFeedbacks((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: res.status } : item))
      );
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      alert('Failed to update feedback status');
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  const handleBackupFeedbacks = async () => {
    try {
      const res = await apiRequest<any>('/admin/feedback/backup');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "feedbacks_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error('Failed to backup feedbacks:', error);
      alert('Failed to download backup data');
    }
  };

  useEffect(() => {
    if (activeTab === 'certificates') {
      fetchPendingCertificates();
      fetchAdminSignature();
    } else if (activeTab === 'page-settings') {
      fetchPageSettings();
    } else if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);
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
            <button 
              onClick={() => window.location.href = '/admin/questions'}
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95"
            >
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
            <button
              onClick={() => setActiveTab('certificates')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'certificates' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <Award className="h-4 w-4 text-cyan-400" />
              <span>Certificates & Signature</span>
            </button>
            <button
              onClick={() => setActiveTab('page-settings')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'page-settings' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <Settings className="h-4 w-4 text-cyan-400" />
              <span>Page Visibility</span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'feedback' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <MessageSquareText className="h-4 w-4 text-cyan-400" />
              <span>User Feedback</span>
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

          {activeTab === 'certificates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="h-6 w-6 text-cyan-400" />
                  Certificate Approvals & Digital Signature Settings
                </h2>
                <p className="mt-2 text-slate-400 text-sm">
                  Configure your digital handwritten signature and audit requested certificates. Signing a certificate will transition it to APPROVED and stamp it with your official digital signature.
                </p>
              </div>

              {/* Digital Signature Panel */}
              <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-cyan-400" />
                  Configure Your Digital Signature
                </h3>
                {adminSignature ? (
                  <div className="space-y-4">
                    <div className="p-4 border border-cyan-500/20 bg-slate-950/60 rounded-xl inline-block">
                      <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Active Signature Image:</p>
                      <img src={adminSignature} alt="Digital Signature" className="max-h-[100px] bg-white rounded p-2" />
                    </div>
                    <p className="text-sm text-slate-400">
                      Signature is configured! Want to update it? Draw below and save to overwrite.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-300/80 text-sm mb-4">
                    No active digital signature found. You must configure and save your signature before approving any certificates.
                  </div>
                )}
                
                <div className="mt-6 border-t border-slate-800 pt-6">
                  <SignaturePad
                    initialSignature={adminSignature}
                    onSave={async (signatureData) => {
                      try {
                        await apiRequest('/certificates/admin/signature', {
                          method: 'POST',
                          body: JSON.stringify({ signatureBase64: signatureData }),
                        });
                        setAdminSignature(signatureData);
                        alert('Digital signature saved successfully!');
                      } catch (err: any) {
                        alert(err.message || 'Failed to save digital signature');
                      }
                    }}
                  />
                </div>
              </div>

              {/* Certificates Queue */}
              <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileClock className="h-5 w-5 text-cyan-400" />
                  Pending Approvals ({pendingCertificates.length})
                </h3>

                {certificatesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                  </div>
                ) : pendingCertificates.length === 0 ? (
                  <div className="text-center py-12 border border-white/5 rounded-2xl bg-slate-950/20">
                    <Award className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No pending certificate approval requests found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/40 text-slate-400 uppercase text-xs font-mono">
                        <tr>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Career Path</th>
                          <th className="px-6 py-4">Overall Score</th>
                          <th className="px-6 py-4">Requested Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {pendingCertificates.map((cert) => (
                          <tr key={cert._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-semibold text-white">
                              <div>{cert.studentName}</div>
                              <div className="text-xs text-slate-500 font-normal">{cert.email}</div>
                            </td>
                            <td className="px-6 py-4">{cert.careerPath}</td>
                            <td className="px-6 py-4 text-cyan-400 font-bold">{cert.overallScore} / 100</td>
                            <td className="px-6 py-4 text-slate-400">
                              {new Date(cert.createdAt || cert.issueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedCertificate(cert);
                                  setAuditingCertificate({
                                    careerPath: cert.careerPath,
                                    technicalScore: cert.technicalScore,
                                    communicationScore: cert.communicationScore,
                                    problemSolvingScore: cert.problemSolvingScore,
                                    confidenceScore: cert.confidenceScore,
                                    strengths: cert.strengths?.join(', ') || '',
                                    improvements: cert.improvements?.join(', ') || '',
                                  });
                                  setShowApproveModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-all animate-pulse"
                              >
                                Audit & Sign
                              </button>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Are you sure you want to reject ${cert.studentName}'s certificate request?`)) return;
                                  try {
                                    await apiRequest(`/certificates/admin/reject/${cert.certificateId}`, { method: 'POST' });
                                    alert('Certificate rejected.');
                                    fetchPendingCertificates();
                                  } catch (err: any) {
                                    alert(err.message || 'Failed to reject certificate');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs transition-all"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
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

          {activeTab === 'page-settings' && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="h-6 w-6 text-cyan-400" />
                  Student Page Visibility Controls
                </h3>
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
            </motion.section>
          )}

          {activeTab === 'feedback' && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquareText className="h-6 w-6 text-cyan-400" />
                    User Feedback Submissions
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Review and manage feedback submitted by platform users. Mark them as RESOLVED or IN PROGRESS.
                  </p>
                </div>
                <button
                  onClick={handleBackupFeedbacks}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
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
                  <table className="w-full text-left border-collapse text-sm">
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
            </motion.section>
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

      {/* Audit & Approve Modal */}
      {showApproveModal && selectedCertificate && (() => {
        const calculatedOverall = Math.round(
          (parseInt(auditingCertificate.technicalScore || 0) +
           parseInt(auditingCertificate.communicationScore || 0) +
           parseInt(auditingCertificate.problemSolvingScore || 0) +
           parseInt(auditingCertificate.confidenceScore || 0)) / 4
        );
        const readinessColor = 
          calculatedOverall >= 85 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          calculatedOverall >= 70 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          calculatedOverall >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border-red-500/30';
        const readinessText = 
          calculatedOverall >= 85 ? 'ADVANCED' :
          calculatedOverall >= 70 ? 'READY' :
          calculatedOverall >= 50 ? 'IN PROGRESS' :
          'NOT READY';

        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-cyan-500/20 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-6 flex items-center justify-between border-b border-cyan-500/20">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="h-6 w-6 text-cyan-300" />
                  Audit & Sign: {selectedCertificate.studentName}
                </h2>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 grid gap-8 lg:grid-cols-12 max-h-[80vh] overflow-y-auto">
                {/* Left Column: Form Controls */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!adminSignature) {
                      alert('You must configure your digital signature before approving certificates.');
                      return;
                    }

                    try {
                      const payload = {
                        ...auditingCertificate,
                        technicalScore: parseInt(auditingCertificate.technicalScore),
                        communicationScore: parseInt(auditingCertificate.communicationScore),
                        problemSolvingScore: parseInt(auditingCertificate.problemSolvingScore),
                        confidenceScore: parseInt(auditingCertificate.confidenceScore),
                        strengths: auditingCertificate.strengths ? auditingCertificate.strengths.split(',').map((s: string) => s.trim()) : [],
                        improvements: auditingCertificate.improvements ? auditingCertificate.improvements.split(',').map((i: string) => i.trim()) : [],
                      };

                      await apiRequest(`/certificates/admin/approve/${selectedCertificate.certificateId}`, {
                        method: 'POST',
                        body: JSON.stringify(payload),
                      });

                      alert('Certificate digitally approved and signed!');
                      setShowApproveModal(false);
                      fetchPendingCertificates();
                    } catch (err: any) {
                      alert(err.message || 'Failed to approve certificate');
                    }
                  }}
                  className="lg:col-span-5 space-y-4"
                >
                  <div>
                    <label className="text-slate-300 font-semibold mb-1 block text-sm">Career Path</label>
                    <input
                      type="text"
                      value={auditingCertificate.careerPath}
                      onChange={(e) => setAuditingCertificate({ ...auditingCertificate, careerPath: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'technicalScore', label: 'Technical Score' },
                      { key: 'communicationScore', label: 'Communication' },
                      { key: 'problemSolvingScore', label: 'Problem Solving' },
                      { key: 'confidenceScore', label: 'Confidence Score' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-slate-300 font-semibold mb-1 block text-xs">{label}</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={auditingCertificate[key]}
                          onChange={(e) => setAuditingCertificate({ ...auditingCertificate, [key]: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400 text-sm"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold mb-1 block text-sm">Strengths (comma-separated)</label>
                    <textarea
                      value={auditingCertificate.strengths}
                      onChange={(e) => setAuditingCertificate({ ...auditingCertificate, strengths: e.target.value })}
                      placeholder="e.g., System Design, Coding speed"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 text-xs"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold mb-1 block text-sm">Improvements (comma-separated)</label>
                    <textarea
                      value={auditingCertificate.improvements}
                      onChange={(e) => setAuditingCertificate({ ...auditingCertificate, improvements: e.target.value })}
                      placeholder="e.g., Stress management, Communication depth"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 text-xs"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={!adminSignature}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 disabled:text-slate-500 font-bold py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] text-sm"
                    >
                      Sign & Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApproveModal(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Right Column: Live Certificate Preview */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <p className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wide">Live Certificate Preview:</p>
                  
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden h-full flex flex-col justify-between min-h-[440px]">
                    {/* Background Light */}
                    <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-500/10 blur-[40px] pointer-events-none" />
                    
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-slate-800">
                      <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">SkillDNA AI</h4>
                      <p className="text-[10px] text-cyan-300 tracking-wider uppercase font-semibold">Certificate of Verified Learning</p>
                    </div>

                    {/* Awardee details */}
                    <div className="text-center space-y-2 py-2">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Awarded To</p>
                      <h5 className="text-xl font-bold text-white leading-tight">{selectedCertificate.studentName}</h5>
                      <p className="text-[11px] text-slate-400">{selectedCertificate.email}</p>
                      <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                        Career Path: {auditingCertificate.careerPath || 'Software Developer'}
                      </div>
                    </div>

                    {/* Scores Dashboard */}
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {[
                        { label: 'Tech', val: auditingCertificate.technicalScore },
                        { label: 'Comm', val: auditingCertificate.communicationScore },
                        { label: 'Problem', val: auditingCertificate.problemSolvingScore },
                        { label: 'Conf', val: auditingCertificate.confidenceScore },
                        { label: 'Overall', val: calculatedOverall, isOverall: true },
                      ].map((item) => (
                        <div key={item.label} className={`p-2 rounded-lg border ${item.isOverall ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400' : 'bg-slate-950/40 border-slate-800 text-slate-300'}`}>
                          <p className="text-[8px] uppercase tracking-wider text-slate-400 leading-none">{item.label}</p>
                          <p className="text-sm font-bold mt-1 leading-none">{item.val || 0}</p>
                        </div>
                      ))}
                    </div>

                    {/* Key Strengths & Status */}
                    <div className="space-y-2 py-2 border-t border-slate-800/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Readiness Status:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${readinessColor}`}>
                          {readinessText}
                        </span>
                      </div>
                      
                      {auditingCertificate.strengths && (
                        <div className="text-left">
                          <p className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold leading-none mb-1">Key Strengths:</p>
                          <p className="text-[10px] text-slate-300 truncate leading-tight">{auditingCertificate.strengths}</p>
                        </div>
                      )}
                    </div>

                    {/* Stamped bottom footer */}
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded p-0.5 flex items-center justify-center border border-slate-700 shadow">
                          <div className="w-full h-full bg-slate-900 flex flex-wrap gap-[1px] p-[1px]">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className={`w-[8px] h-[8px] ${i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[7px] text-slate-500 leading-tight">Scan to<br />Verify</p>
                      </div>

                      <div className="text-right">
                        {adminSignature ? (
                          <div className="inline-block bg-white border border-cyan-500/20 rounded p-1 shadow max-w-[110px] transition-all">
                            <img src={adminSignature} alt="Admin Signature Stamp" className="max-h-[30px] object-contain" />
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-yellow-500 uppercase animate-pulse">Signature Required</span>
                        )}
                        <p className="text-[7px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Digitally Stamped</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </main>
  );
};

export default MainAdminDashboard;
