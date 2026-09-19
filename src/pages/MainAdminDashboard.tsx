import { BarChart3, FilePlus2, MailCheck, Shield, UploadCloud, Settings, Database, Users, Edit3, UserPlus, Trash2, Key, ShieldAlert, Loader2, Sparkles, CheckCircle2, Award, PenTool, FileClock, MessageSquareText, Star, Video, BrainCircuit, ExternalLink, Activity, Layers, ArrowRight, Building2, LineChart, Download, Search, Filter, FileSpreadsheet, Plus, RefreshCw, Check, X, ChevronLeft, ChevronRight, BookOpen, AlertCircle, FileText, GitPullRequest, GraduationCap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import SectionHeader from '../components/SectionHeader';
import { adminAnalytics, contentTypes } from '../data/platform';
import { apiRequest, getApiBaseUrl, readStoredToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { TestUserManager } from '../components/TestUserManager';
import { CareerChangeManagement } from '../components/admin/CareerChangeManagement';
import { TopicNotesManagement } from '../components/admin/TopicNotesManagement';
import { StudentAccountManagement } from '../components/admin/StudentAccountManagement';

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
    ctx.lineJoin = 'round';
    const rect = canvasRef.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
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

const CAREER_DOMAINS = [
  'ALL',
  'Computer Science',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics',
  'Commerce',
  'Finance',
  'Management',
  'Marketing',
  'HR',
  'Design',
  'Healthcare',
];

const MainAdminDashboard = () => {
  const { user } = useAuth();
  const isMainAdmin = user?.email === 'skilldnaai@ai.com';

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'questions' | 'career-changes' | 'topic-notes' | 'footer' | 'admins' | 'certificates' | 'page-settings' | 'feedback' | 'test-users'>('overview');
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);

  // Question Bank State
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(1);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionDomain, setQuestionDomain] = useState('ALL');
  const [questionDifficulty, setQuestionDifficulty] = useState('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Question Modals & Action State
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [showAiGenerateModal, setShowAiGenerateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormat, setUploadFormat] = useState<'excel' | 'csv'>('excel');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [creatingSingle, setCreatingSingle] = useState(false);

  const [singleForm, setSingleForm] = useState({
    field: 'Computer Science',
    topic: '',
    subtopic: '',
    difficulty: 'Medium',
    interviewType: 'Technical',
    question: '',
    answer: '',
    keywords: '',
  });

  const [aiForm, setAiForm] = useState({
    field: 'Computer Science',
    topic: '',
    subtopic: '',
    difficulty: 'Medium',
    count: 5,
  });

  const fetchQuestionBank = async (page = 1) => {
    try {
      setQuestionsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search: questionSearch,
        field: questionDomain,
        difficulty: questionDifficulty,
      });
      const res = await apiRequest<{
        questions: any[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/questions/admin/list?${params.toString()}`);
      setQuestions(res?.questions || []);
      setQuestionsTotal(res?.total || 0);
      setQuestionsPage(res?.page || 1);
      setQuestionsTotalPages(res?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch question bank:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleExportQuestions = async (format: 'xlsx' | 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        field: questionDomain,
        difficulty: questionDifficulty,
      });
      const url = `${getApiBaseUrl()}/questions/admin/export?${params.toString()}`;
      const token = readStoredToken();
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export request failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `skilldna_question_bank_${questionDomain.toLowerCase()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handleDownloadTemplate = async (format: 'xlsx' | 'csv') => {
    try {
      const url = `${getApiBaseUrl()}/questions/admin/template?format=${format}`;
      const token = readStoredToken();
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Template download request failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `skilldna_question_template.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || 'Template download failed');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('uploadFormat', uploadFormat);

      const res = await apiRequest<any>('/questions/admin/upload', {
        method: 'POST',
        body: formData as any,
      });

      alert(res.message || 'Questions uploaded and added to active dataset successfully!');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchQuestionBank(1);
    } catch (err: any) {
      alert(err.message || 'Failed to upload questions');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAiGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiForm.topic) {
      alert('Please enter a Topic to generate.');
      return;
    }
    try {
      setGeneratingAi(true);
      const res = await apiRequest<any>('/questions/admin/generate-and-add', {
        method: 'POST',
        body: JSON.stringify(aiForm),
      });

      alert(res.message || 'Questions generated and added to active dataset!');
      setShowAiGenerateModal(false);
      setAiForm({ field: 'Computer Science', topic: '', subtopic: '', difficulty: 'Medium', count: 5 });
      fetchQuestionBank(1);
    } catch (err: any) {
      alert(err.message || 'Failed to generate questions');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleCreateSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.question || !singleForm.answer || !singleForm.topic) {
      alert('Topic, Question, and Answer are required.');
      return;
    }
    try {
      setCreatingSingle(true);
      await apiRequest<any>('/questions/admin/create-single', {
        method: 'POST',
        body: JSON.stringify(singleForm),
      });

      alert('Question added to active dataset successfully!');
      setShowCreateQuestionModal(false);
      setSingleForm({
        field: 'Computer Science',
        topic: '',
        subtopic: '',
        difficulty: 'Medium',
        interviewType: 'Technical',
        question: '',
        answer: '',
        keywords: '',
      });
      fetchQuestionBank(1);
    } catch (err: any) {
      alert(err.message || 'Failed to create question');
    } finally {
      setCreatingSingle(false);
    }
  };

  const handleDeleteQuestion = async (id: string, qText: string) => {
    if (!confirm(`Are you sure you want to delete this question from the dataset?\n\n"${qText.slice(0, 80)}..."`)) return;
    try {
      await apiRequest<any>(`/questions/admin/${id}`, { method: 'DELETE' });
      alert('Question deleted successfully.');
      fetchQuestionBank(questionsPage);
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

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

  // Certificate Template Designer & Audit State
  const [certAdminSubTab, setCertAdminSubTab] = useState<'designer' | 'all' | 'pending'>('designer');
  const [certTemplates, setCertTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [allCertificates, setAllCertificates] = useState<any[]>([]);
  const [allCertsLoading, setAllCertsLoading] = useState(false);
  const [allCertSearch, setAllCertSearch] = useState('');

  const fetchCertTemplates = async () => {
    try {
      const res = await apiRequest<any[]>('/certificates/admin/templates');
      setCertTemplates(res || []);
      if (res && res.length > 0) {
        const active = res.find((t: any) => t.isActive) || res[0];
        setSelectedTemplate(active);
      }
    } catch (err) {
      console.error('Failed to fetch certificate templates:', err);
    }
  };

  const fetchAllCertificates = async () => {
    try {
      setAllCertsLoading(true);
      const res = await apiRequest<any>('/certificates/admin/all');
      setAllCertificates(Array.isArray(res) ? res : res?.certificates || []);
    } catch (err) {
      console.error('Failed to fetch all certificates:', err);
    } finally {
      setAllCertsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setSavingTemplate(true);
    try {
      await apiRequest('/certificates/admin/templates', {
        method: 'POST',
        body: JSON.stringify(selectedTemplate),
      });
      alert('Certificate template saved successfully!');
      fetchCertTemplates();
    } catch (err: any) {
      alert('Failed to save template: ' + err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleActivateTemplate = async (templateMongoId: string) => {
    try {
      await apiRequest(`/certificates/admin/templates/${templateMongoId}/activate`, {
        method: 'POST',
      });
      alert('Template activated as the official system default!');
      fetchCertTemplates();
    } catch (err: any) {
      alert('Failed to activate template: ' + err.message);
    }
  };

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
      fetchCertTemplates();
      fetchAllCertificates();
    } else if (activeTab === 'page-settings') {
      fetchPageSettings();
    } else if (activeTab === 'feedback') {
      fetchFeedbacks();
    } else if (activeTab === 'questions') {
      fetchQuestionBank(1);
    }
  }, [activeTab, questionDomain, questionDifficulty]);
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
              onClick={() => setActiveTab('questions')}
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FilePlus2 className="h-5 w-5 transition-transform group-hover:scale-110" />
              Question Bank & AI
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
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'students' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <span>Student Accounts</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'questions' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <FilePlus2 className="h-4 w-4 text-cyan-400" />
              <span>Question Bank & AI</span>
            </button>
            <button
              onClick={() => setActiveTab('career-changes')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'career-changes' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <GitPullRequest className="h-4 w-4 text-cyan-400" />
              <span>Career Change Requests</span>
            </button>
            <button
              onClick={() => setActiveTab('topic-notes')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'topic-notes' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <span>Topic Notes & Curriculum</span>
            </button>
            <button
              onClick={() => setActiveTab('test-users')}
              className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-slate-200 transition-all ${activeTab === 'test-users' ? 'border-cyan-500/30 bg-slate-900 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 hover:text-white'}`}
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Pre-Production & Beta Access</span>
            </button>
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
              {/* Executive Summary & Live Database Metrics */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Super Admin Active
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Shield className="h-3.5 w-3.5" /> Full Platform Access
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Award className="h-3.5 w-3.5" /> 75%+ Cert Gate Enforced
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Super Admin Executive Center</h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                      Full administrative control over multi-domain question banks (Mechanical, Civil, Electronics, Commerce, Finance, Management, Marketing, HR, Design, Healthcare, IT), adaptive AI interviews, candidate personas, and verified certificates.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('test-users')}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" /> Pre-Production Users (Beta)
                    </button>
                    <Link
                      to="/interview/dynamic"
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-white/10 transition-all flex items-center gap-2"
                    >
                      <Video className="h-4 w-4 text-cyan-400" /> Launch AI Interview
                    </Link>
                  </div>
                </div>

                {/* Live Real-Time Database Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                  <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Question Catalog</span>
                      <Database className="h-3.5 w-3.5 text-cyan-400" />
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-white">{overview?.activeQuestions || 48}</span>
                      <span className="text-xs font-semibold text-cyan-400">11 Domains</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Mechanical, Civil, Comm, IT, etc.</p>
                  </div>
                  <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Interviews Evaluated</span>
                      <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-white">{overview?.interviews || overview?.completedSessions || 0}</span>
                      <span className="text-xs font-semibold text-emerald-400">10–15 Questions</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Adaptive 5-Competency Engine</p>
                  </div>
                  <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Test Personas</span>
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-white">{overview?.testUsersCount || 0}</span>
                      <span className="text-xs font-semibold text-purple-400">Granular Reset</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">One-click simulated accounts</p>
                  </div>
                  <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Certificates</span>
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-white">{overview?.totalCertificates || 0}</span>
                      <span className="text-xs font-semibold text-amber-400">&ge;75% Gate</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Publicly verifiable ledgers</p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Platform Switcher (Access Everything as Super Admin) */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-cyan-400" /> Super Admin Full Platform Navigation
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">You have complete access to test, review, and experience all candidate and recruiter views directly.</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                    Omni-Access Enabled
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Link
                    to="/interview/dynamic"
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/5 bg-slate-800/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
                  >
                    <Video className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-semibold text-white">Adaptive Interview</span>
                    <span className="text-[10px] text-slate-400">10-15 Question Simulator</span>
                  </Link>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/5 bg-slate-800/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group cursor-pointer"
                  >
                    <FilePlus2 className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-semibold text-white">Question Bank & AI</span>
                    <span className="text-[10px] text-slate-400">Multi-Domain Catalog</span>
                  </button>
                  <Link
                    to="/career-twin"
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/5 bg-slate-800/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
                  >
                    <BrainCircuit className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-semibold text-white">Career Twin</span>
                    <span className="text-[10px] text-slate-400">Diagnostic Memory</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/5 bg-slate-800/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
                  >
                    <LineChart className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-semibold text-white">Student Portal</span>
                    <span className="text-[10px] text-slate-400">Candidate Experience</span>
                  </Link>
                  <Link
                    to="/hr"
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/5 bg-slate-800/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
                  >
                    <Building2 className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-semibold text-white">Recruiter Portal</span>
                    <span className="text-[10px] text-slate-400">HR Hiring Hub</span>
                  </Link>
                  <Link
                    to="/certificates"
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/5 bg-slate-800/60 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-center group"
                  >
                    <Award className="h-5 w-5 text-rose-400 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-semibold text-white">Certificates</span>
                    <span className="text-[10px] text-slate-400">Approvals & QR Ledgers</span>
                  </Link>
                </div>
              </div>

              {/* Multi-Domain Question Catalog Distribution */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Database className="h-5 w-5 text-cyan-400" /> Multi-Career Domain Catalog ({overview?.activeQuestions || 48} Questions)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-world technical questions categorized across diverse engineering and non-engineering careers.</p>
                  </div>
                  <button onClick={() => setActiveTab('questions')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer">
                    Manage Questions & AI <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { domain: 'Mechanical Engineering', count: 7, desc: 'Thermodynamics, HVAC, GD&T, Milling' },
                    { domain: 'Civil Engineering', count: 4, desc: 'Structural load, Concrete, Hydraulics' },
                    { domain: 'Electronics', count: 4, desc: 'Microcontrollers, I2C/SPI, PCB layout' },
                    { domain: 'Commerce', count: 3, desc: 'Double-entry, GST/VAT, Reconciliation' },
                    { domain: 'Finance', count: 4, desc: 'DCF, WACC, Working capital, CAPM' },
                    { domain: 'Management', count: 3, desc: 'Agile/Scrum, Stakeholder conflicts' },
                    { domain: 'Marketing', count: 3, desc: 'CAC/LTV, Funnel conversion, SEO' },
                    { domain: 'HR', count: 3, desc: 'Behavioral interviews, Conflict, Retention' },
                    { domain: 'Design', count: 3, desc: 'Design systems, Accessibility, UX' },
                    { domain: 'Computer Science', count: 12, desc: 'System design, REST APIs, Microservices' },
                    { domain: 'General Behavioral', count: 2, desc: 'Problem solving, Cross-functional work' }
                  ].map((d) => (
                    <div key={d.domain} className="p-3.5 rounded-xl border border-white/5 bg-slate-950/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{d.domain}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {d.count} Qs
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">{d.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

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

          {activeTab === 'students' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StudentAccountManagement />
            </motion.div>
          )}

          {activeTab === 'career-changes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CareerChangeManagement />
            </motion.div>
          )}

          {activeTab === 'topic-notes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TopicNotesManagement />
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Question Bank Control Header */}
              <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Database className="h-3.5 w-3.5" /> Question Bank Dataset
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Sparkles className="h-3.5 w-3.5" /> AI Generator Integrated
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> XLS / CSV Native
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Question Bank & AI Engine</h2>
                    <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                      Create, AI-generate, upload from Excel/CSV, and download the full questions & answers dataset across all 11 career domains.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setShowAiGenerateModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" /> AI Auto-Generate
                    </button>
                    <button
                      onClick={() => setShowCreateQuestionModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Question
                    </button>
                    <button
                      onClick={() => handleExportQuestions('xlsx')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                      title="Download full dataset as Excel .xlsx with questions and answers"
                    >
                      <FileSpreadsheet className="h-4 w-4" /> Download Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => handleExportQuestions('csv')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                      title="Download full dataset as CSV with questions and answers"
                    >
                      <Download className="h-4 w-4" /> Download CSV
                    </button>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <UploadCloud className="h-4 w-4 text-cyan-400" /> Upload XLS/CSV
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate('xlsx')}
                      className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Download sample Excel template to fill and upload"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" /> Template
                    </button>
                  </div>
                </div>

                {/* Domain Selector Pills */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-cyan-400" /> Select Career Domain:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CAREER_DOMAINS.map((domain) => (
                      <button
                        key={domain}
                        onClick={() => {
                          setQuestionDomain(domain);
                          setQuestionsPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          questionDomain === domain
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                            : 'bg-slate-950/70 border border-white/5 text-slate-300 hover:border-cyan-500/30 hover:text-white'
                        }`}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Difficulty Filter Bar */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchQuestionBank(1);
                      }}
                      placeholder="Search questions, topics, answers, keywords..."
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={questionDifficulty}
                      onChange={(e) => {
                        setQuestionDifficulty(e.target.value);
                        setQuestionsPage(1);
                      }}
                      className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Difficulties</option>
                      <option value="Easy">Easy / Basic</option>
                      <option value="Medium">Medium / Intermediate</option>
                      <option value="Hard">Hard / Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>

                    <button
                      onClick={() => fetchQuestionBank(1)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Search className="h-4 w-4" /> Filter
                    </button>

                    <button
                      onClick={() => {
                        setQuestionSearch('');
                        setQuestionDomain('ALL');
                        setQuestionDifficulty('ALL');
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
                      title="Reset filters"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions Count & Status Summary */}
              <div className="flex items-center justify-between px-2">
                <p className="text-sm text-slate-400 font-medium">
                  Showing <span className="font-bold text-white">{questions.length}</span> of{' '}
                  <span className="font-bold text-cyan-400">{questionsTotal}</span> questions
                  {questionDomain !== 'ALL' && <span> in <strong className="text-white">{questionDomain}</strong></span>}
                </p>
                <div className="text-xs text-slate-500">
                  Page {questionsPage} of {questionsTotalPages}
                </div>
              </div>

              {/* Questions List */}
              {questionsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-3xl border border-white/5">
                  <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-3" />
                  <p className="text-slate-300 font-medium text-sm">Loading Question Bank dataset...</p>
                </div>
              ) : questions.length === 0 ? (
                /* Empty state with instant AI create button */
                <div className="p-8 text-center rounded-3xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No questions found matching your filter</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                    {questionDomain !== 'ALL'
                      ? `The dataset currently has no questions for "${questionDomain}". AI can automatically create high-quality questions and add them to the dataset right now.`
                      : 'No questions matched your search query. You can add questions manually, import via Excel/CSV, or generate with AI.'}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => {
                        setAiForm(prev => ({
                          ...prev,
                          field: questionDomain !== 'ALL' ? questionDomain : 'Computer Science',
                          topic: questionSearch || (questionDomain !== 'ALL' ? `${questionDomain} Core Principles` : 'Fundamentals'),
                        }));
                        setShowAiGenerateModal(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" /> Generate Questions with AI Now
                    </button>
                    <button
                      onClick={() => setShowCreateQuestionModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Question Manually
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => {
                    const isExpanded = expandedQuestionId === q._id;
                    const diffColor =
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : q.difficulty === 'Medium'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        : q.difficulty === 'Hard'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

                    return (
                      <div
                        key={q._id}
                        className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-cyan-500/30 transition-all backdrop-blur-sm shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {q.field || 'General'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-white/5">
                                {q.topic}
                              </span>
                              {q.subtopic && (
                                <span className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800/50 text-slate-400">
                                  {q.subtopic}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${diffColor}`}>
                                {q.difficulty}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg text-xs bg-slate-800/80 text-slate-400 border border-white/5">
                                {q.interviewType || 'Technical'}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-950 text-slate-400 border border-white/5">
                                {q.source || 'Manual'}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white pt-1">{q.question}</h4>

                            {/* Keywords */}
                            {Array.isArray(q.keywords) && q.keywords.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] text-slate-400">Keywords:</span>
                                {q.keywords.map((kw: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-950/80 text-slate-300 border border-white/5"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Expandable Model Answer */}
                            {isExpanded && (
                              <div className="mt-3 p-4 rounded-xl border border-cyan-500/20 bg-slate-950/90 text-sm text-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                  <span>Model Answer / Solution</span>
                                  <span className="text-[10px] text-slate-400 lowercase">expected candidate response</span>
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed text-slate-300 text-xs sm:text-sm">
                                  {q.answer || 'No answer provided.'}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                            <button
                              onClick={() => setExpandedQuestionId(isExpanded ? null : q._id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/20 transition-all cursor-pointer"
                            >
                              {isExpanded ? 'Hide Answer' : 'Show Answer'}
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q._id, q.question)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Bar */}
              {questionsTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (questionsPage > 1) fetchQuestionBank(questionsPage - 1);
                    }}
                    disabled={questionsPage <= 1}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <span className="text-sm text-slate-400 font-medium">
                    Page <strong className="text-white">{questionsPage}</strong> of{' '}
                    <strong className="text-white">{questionsTotalPages}</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (questionsPage < questionsTotalPages) fetchQuestionBank(questionsPage + 1);
                    }}
                    disabled={questionsPage >= questionsTotalPages}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header & Sub-Tab Switcher */}
              <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md relative overflow-hidden">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Award className="h-6 w-6 text-cyan-400" />
                      Certificate Design & Certification Authority
                    </h2>
                    <p className="mt-1 text-slate-400 text-sm">
                      Design official credential templates, configure digital signatures, audit verified certificates, and manage approvals.
                    </p>
                  </div>

                  {/* Sub-tab pills */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCertAdminSubTab('designer')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        certAdminSubTab === 'designer'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      Template Designer
                    </button>

                    <button
                      onClick={() => setCertAdminSubTab('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        certAdminSubTab === 'all'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Issued Certificates ({allCertificates.length})
                    </button>

                    <button
                      onClick={() => setCertAdminSubTab('pending')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        certAdminSubTab === 'pending'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <FileClock className="h-3.5 w-3.5" />
                      Pending Approvals ({pendingCertificates.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SUB-TAB 1: TEMPLATE DESIGNER & LIVE PREVIEW               */}
              {/* ========================================================= */}
              {certAdminSubTab === 'designer' && (
                <div className="space-y-6">
                  {/* Template Picker Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {certTemplates.map((tpl) => {
                      const isSelected = selectedTemplate?.templateId === tpl.templateId;
                      return (
                        <div
                          key={tpl._id || tpl.templateId}
                          onClick={() => setSelectedTemplate({ ...tpl })}
                          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/40'
                              : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">{tpl.templateId}</span>
                            {tpl.isActive && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                ACTIVE DEFAULT
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-sm">{tpl.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tpl.description}</p>
                          <div className="mt-3 flex items-center gap-1.5">
                            <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ backgroundColor: tpl.primaryColor }} />
                            <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ backgroundColor: tpl.secondaryColor }} />
                            <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ backgroundColor: tpl.accentColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedTemplate && (
                    <div className="grid gap-6 lg:grid-cols-12">
                      {/* Left 6 Cols: Customization Controls */}
                      <div className="lg:col-span-6 rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h3 className="font-bold text-white text-base flex items-center gap-2">
                            <Edit3 className="h-4 w-4 text-cyan-400" />
                            Template Configuration: {selectedTemplate.name}
                          </h3>
                          {selectedTemplate.isActive ? (
                            <span className="text-xs font-semibold text-emerald-400">Default for Students</span>
                          ) : (
                            <button
                              onClick={() => handleActivateTemplate(selectedTemplate._id)}
                              className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 font-bold border border-emerald-500/30 transition"
                            >
                              Set as Default Template
                            </button>
                          )}
                        </div>

                        <div className="space-y-3.5 text-xs">
                          <div>
                            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Template Name</label>
                            <input
                              type="text"
                              value={selectedTemplate.name || ''}
                              onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Organization / Issuing Authority</label>
                            <input
                              type="text"
                              value={selectedTemplate.orgName || ''}
                              onChange={(e) => setSelectedTemplate({ ...selectedTemplate, orgName: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs focus:border-cyan-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Signatory Name</label>
                              <input
                                type="text"
                                value={selectedTemplate.signatoryName || ''}
                                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, signatoryName: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Signatory Title</label>
                              <input
                                type="text"
                                value={selectedTemplate.signatoryTitle || ''}
                                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, signatoryTitle: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs focus:border-cyan-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Primary Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={selectedTemplate.primaryColor || '#0f172a'}
                                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, primaryColor: e.target.value })}
                                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                                />
                                <input
                                  type="text"
                                  value={selectedTemplate.primaryColor || '#0f172a'}
                                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, primaryColor: e.target.value })}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Secondary Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={selectedTemplate.secondaryColor || '#06b6d4'}
                                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, secondaryColor: e.target.value })}
                                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                                />
                                <input
                                  type="text"
                                  value={selectedTemplate.secondaryColor || '#06b6d4'}
                                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, secondaryColor: e.target.value })}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Accent Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={selectedTemplate.accentColor || '#38bdf8'}
                                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, accentColor: e.target.value })}
                                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                                />
                                <input
                                  type="text"
                                  value={selectedTemplate.accentColor || '#38bdf8'}
                                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, accentColor: e.target.value })}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-white text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Numbering Format</label>
                              <input
                                type="text"
                                value={selectedTemplate.numberingFormat || 'SDNA-CERT-YYYY-XXXXXX'}
                                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, numberingFormat: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Watermark Text</label>
                              <input
                                type="text"
                                value={selectedTemplate.watermarkText || 'SKILLDNA VERIFIED'}
                                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, watermarkText: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-3">
                            <button
                              onClick={handleSaveTemplate}
                              disabled={savingTemplate}
                              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                            >
                              {savingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              Save Template Customization
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right 6 Cols: Live Visual Certificate Preview */}
                      <div className="lg:col-span-6 rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Rendered Certificate Preview</span>
                            <span className="text-[10px] font-mono text-cyan-400">Ratio: Standard Landscape (16:10)</span>
                          </div>

                          {/* Certificate Live Mock Canvas */}
                          <div
                            className="w-full rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all border-4"
                            style={{
                              backgroundColor: selectedTemplate.primaryColor || '#0f172a',
                              borderColor: selectedTemplate.secondaryColor || '#06b6d4',
                              color: '#f8fafc',
                            }}
                          >
                            {/* Watermark overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none text-4xl font-extrabold uppercase rotate-[-20deg]">
                              {selectedTemplate.watermarkText || 'SKILLDNA VERIFIED'}
                            </div>

                            <div className="relative z-10 space-y-4">
                              {/* Certificate Header */}
                              <div className="text-center space-y-1 border-b border-white/10 pb-3">
                                <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: selectedTemplate.secondaryColor || '#06b6d4' }}>
                                  {selectedTemplate.orgName || 'SkillDNA AI Global Certification Authority'}
                                </div>
                                <h3 className="text-base font-extrabold tracking-wide text-white uppercase">
                                  {selectedTemplate.headerText || 'Certificate of Verified Mastery'}
                                </h3>
                                <p className="text-[9px] text-slate-400">Issued under autonomous AI verification standards</p>
                              </div>

                              {/* Candidate & Path Mock */}
                              <div className="text-center py-2 space-y-1">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">This credential is presented to</span>
                                <div className="text-xl font-serif font-bold text-white tracking-wide">
                                  Alex R. Candidate
                                </div>
                                <p className="text-xs text-slate-300">
                                  for demonstrating certified professional competency in
                                </p>
                                <div className="text-xs font-bold tracking-wider uppercase" style={{ color: selectedTemplate.accentColor || '#38bdf8' }}>
                                  Advanced Mechanical Design & GD&T Systems
                                </div>
                              </div>

                              {/* Scores & Badge Mock */}
                              <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between text-xs">
                                <div>
                                  <div className="text-[9px] text-slate-400 uppercase">Composite Score</div>
                                  <div className="font-mono font-extrabold text-sm text-emerald-400">88% (HONORS PASS)</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[9px] text-slate-400 uppercase">Verification ID</div>
                                  <div className="font-mono text-[10px] text-cyan-300">SDNA-CERT-2026-88A9F1</div>
                                </div>
                              </div>

                              {/* Signatures & Seal Mock */}
                              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px]">
                                <div>
                                  <div className="font-bold text-white">{selectedTemplate.signatoryName || 'Dr. Evelyn Carter'}</div>
                                  <div className="text-[9px] text-slate-400">{selectedTemplate.signatoryTitle || 'Head of AI Evaluation'}</div>
                                </div>

                                {adminSignature ? (
                                  <img src={adminSignature} alt="Signature" className="max-h-8 max-w-[90px] object-contain" />
                                ) : (
                                  <div className="font-serif italic text-cyan-400 text-sm">Official Seal</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-4">
                          All generated certificates are automatically watermarked with unique cryptographic IDs formatted according to <code className="text-cyan-300">{selectedTemplate.numberingFormat || 'SDNA-CERT-YYYY-XXXXXX'}</code>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Digital Signature Panel */}
                  <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <PenTool className="h-5 w-5 text-cyan-400" />
                      Configure Your Official Digital Signature
                    </h3>
                    {adminSignature ? (
                      <div className="space-y-3">
                        <div className="p-4 border border-cyan-500/20 bg-slate-950/60 rounded-xl inline-block">
                          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Active Signature Stamp:</p>
                          <img src={adminSignature} alt="Digital Signature" className="max-h-[80px] bg-white rounded p-2" />
                        </div>
                        <p className="text-xs text-slate-400">
                          Signature configured. Draw below if you wish to overwrite your active digital signature.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-300/80 text-xs mb-4">
                        No active digital signature found. Draw and save your signature below to attach it to newly approved certificates.
                      </div>
                    )}
                    
                    <div className="mt-4 border-t border-slate-800 pt-4">
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
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 2: ISSUED CERTIFICATES AUDIT & LEDGER             */}
              {/* ========================================================= */}
              {certAdminSubTab === 'all' && (
                <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-cyan-400" />
                        All Issued Certificates Ledger ({allCertificates.length})
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Only candidates with verified scores &ge; 75% are authorized and recorded in this ledger.
                      </p>
                    </div>

                    <input
                      type="text"
                      placeholder="Search student, email, certificate ID..."
                      value={allCertSearch}
                      onChange={(e) => setAllCertSearch(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:border-cyan-500 w-full sm:w-72"
                    />
                  </div>

                  {allCertsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                    </div>
                  ) : allCertificates.length === 0 ? (
                    <div className="text-center py-16 border border-white/5 rounded-2xl bg-slate-950/20">
                      <Award className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-xs">No issued certificates found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/40 text-slate-400 uppercase font-mono">
                          <tr>
                            <th className="px-4 py-3">Certificate ID</th>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Career Path</th>
                            <th className="px-4 py-3">Verified Score</th>
                            <th className="px-4 py-3">Template</th>
                            <th className="px-4 py-3">Issue Date</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {allCertificates
                            .filter((c) => {
                              if (!allCertSearch.trim()) return true;
                              const q = allCertSearch.toLowerCase();
                              return (
                                c.certificateId?.toLowerCase().includes(q) ||
                                c.studentName?.toLowerCase().includes(q) ||
                                c.email?.toLowerCase().includes(q) ||
                                c.careerPath?.toLowerCase().includes(q)
                              );
                            })
                            .map((cert) => (
                              <tr key={cert._id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">{cert.certificateId}</td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-white">{cert.studentName}</div>
                                  <div className="text-[10px] text-slate-500">{cert.email}</div>
                                </td>
                                <td className="px-4 py-3">{cert.careerPath}</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    {cert.overallScore}% PASS
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono uppercase text-[10px] text-slate-400">{cert.templateId || 'Template 01'}</td>
                                <td className="px-4 py-3 text-slate-400">{new Date(cert.issueDate || cert.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right space-x-2">
                                  <a
                                    href={`/verify/${cert.certificateId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-[11px] font-semibold border border-white/10 transition"
                                  >
                                    Verify
                                  </a>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await apiRequest(`/certificates/admin/regenerate/${cert.certificateId}`, { method: 'POST' });
                                        alert('Certificate regenerated with latest template configuration!');
                                        fetchAllCertificates();
                                      } catch (e: any) {
                                        alert('Failed: ' + e.message);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition"
                                  >
                                    Regenerate
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 3: PENDING APPROVALS QUEUE                        */}
              {/* ========================================================= */}
              {certAdminSubTab === 'pending' && (
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
                      <p className="text-slate-400 text-xs">No pending certificate approval requests found.</p>
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
              )}
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

          {activeTab === 'test-users' && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TestUserManager />
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

      {/* MODAL: Create Question Manually */}
      {showCreateQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add Question to Dataset</h3>
                  <p className="text-xs text-slate-400">Add a high-quality interview question with model answer and keywords</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateQuestionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Career Domain *
                  </label>
                  <select
                    value={singleForm.field}
                    onChange={(e) => setSingleForm({ ...singleForm, field: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    required
                  >
                    {CAREER_DOMAINS.filter(d => d !== 'ALL').map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={singleForm.topic}
                    onChange={(e) => setSingleForm({ ...singleForm, topic: e.target.value })}
                    placeholder="e.g., Thermodynamics, Data Structures, Auditing"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subtopic (Optional)
                  </label>
                  <input
                    type="text"
                    value={singleForm.subtopic}
                    onChange={(e) => setSingleForm({ ...singleForm, subtopic: e.target.value })}
                    placeholder="e.g., Rankine Cycle, Event Loop"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty *
                  </label>
                  <select
                    value={singleForm.difficulty}
                    onChange={(e) => setSingleForm({ ...singleForm, difficulty: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Easy">Easy (Basic)</option>
                    <option value="Medium">Medium (Intermediate)</option>
                    <option value="Hard">Hard (Advanced)</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Interview Type
                  </label>
                  <select
                    value={singleForm.interviewType}
                    onChange={(e) => setSingleForm({ ...singleForm, interviewType: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Scenario">Scenario</option>
                    <option value="HR">HR</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="RapidFire">Rapid Fire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Question *
                </label>
                <textarea
                  value={singleForm.question}
                  onChange={(e) => setSingleForm({ ...singleForm, question: e.target.value })}
                  rows={3}
                  placeholder="Enter the complete question prompt..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Model Answer / Solution *
                </label>
                <textarea
                  value={singleForm.answer}
                  onChange={(e) => setSingleForm({ ...singleForm, answer: e.target.value })}
                  rows={4}
                  placeholder="Enter the detailed expected answer or evaluation benchmark..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Keywords (comma or semicolon separated)
                </label>
                <input
                  type="text"
                  value={singleForm.keywords}
                  onChange={(e) => setSingleForm({ ...singleForm, keywords: e.target.value })}
                  placeholder="e.g., efficiency, thermodynamics, steam, pressure"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateQuestionModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSingle}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-sm font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creatingSingle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save to Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI Auto-Generate Questions */}
      {showAiGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Question Auto-Generator</h3>
                  <p className="text-xs text-slate-400">Generate high-quality questions and automatically save them into the active dataset</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiGenerateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAiGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Domain *
                </label>
                <select
                  value={aiForm.field}
                  onChange={(e) => setAiForm({ ...aiForm, field: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none"
                  required
                >
                  {CAREER_DOMAINS.filter(d => d !== 'ALL').map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Topic *
                </label>
                <input
                  type="text"
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g., Heat Transfer, Valuation, React Hooks, Supply Chain"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="Easy">Easy (Basic)</option>
                    <option value="Medium">Medium (Intermediate)</option>
                    <option value="Hard">Hard (Advanced)</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={aiForm.count}
                    onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-300/80 leading-relaxed">
                💡 Questions created by AI include complete model answers, difficulty metadata, keywords, and follow-up scenarios. They will automatically appear in this active catalog and in student AI interview simulations.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAiGenerateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingAi}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generatingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generatingAi ? 'Generating Questions...' : 'Generate & Add to Dataset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload Excel / CSV File */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Import Questions via File</h3>
                  <p className="text-xs text-slate-400">Upload Excel (.xlsx, .xls) or CSV (.csv) spreadsheet</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadFormat('excel')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      uploadFormat === 'excel'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Excel (.xlsx, .xls)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadFormat('csv')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      uploadFormat === 'csv'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-white/10 bg-slate-950 text-slate-400'
                    }`}
                  >
                    CSV (.csv)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose Spreadsheet File *
                </label>
                <input
                  type="file"
                  accept={uploadFormat === 'excel' ? '.xlsx, .xls' : '.csv'}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer bg-slate-950 p-2 rounded-xl border border-white/10"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-400">
                <span>Need formatting reference?</span>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(uploadFormat === 'excel' ? 'xlsx' : 'csv')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
                >
                  Download Sample {uploadFormat === 'excel' ? 'Excel' : 'CSV'} Template
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !uploadFile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {uploadLoading ? 'Uploading & Processing...' : 'Upload to Dataset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default MainAdminDashboard;
