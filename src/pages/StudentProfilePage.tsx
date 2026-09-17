import React, { useState, useEffect } from 'react';
import { 
  Award, Mail, Phone, Briefcase, GraduationCap, MapPin, Download, 
  Share2, Copy, Eye, CheckCircle, AlertCircle, Loader, Plus, Pencil, 
  X, Lock, GitPullRequest, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronRight, BookOpen
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { motion } from 'framer-motion';

export const AVAILABLE_CAREERS = [
  { id: 'Java Software Engineer', domain: 'Computer Science', description: 'Enterprise Java, OOP, Spring Boot, Microservices, and Cloud Backend Architecture.' },
  { id: 'Full Stack Web Developer', domain: 'Computer Science', description: 'Modern React, Node.js, Express, MongoDB, TypeScript, and System Design.' },
  { id: 'Frontend Developer', domain: 'Computer Science', description: 'Advanced React, TypeScript, Tailwind CSS, State Management, and Web Performance.' },
  { id: 'Backend Developer', domain: 'Computer Science', description: 'REST APIs, Microservices, PostgreSQL, Redis Caching, and Scalable Backend Architecture.' },
  { id: 'Data Scientist', domain: 'Computer Science', description: 'Python, Pandas, NumPy, Statistical Modeling, Machine Learning, and Data Pipelines.' },
  { id: 'AI / ML Engineer', domain: 'Computer Science', description: 'PyTorch, Deep Learning, NLP, Transformer Models, LLMs, and Model Deployment.' },
  { id: 'DevOps Engineer', domain: 'Computer Science', description: 'Docker, Kubernetes, CI/CD Pipelines, AWS Cloud Infrastructure, and Terraform.' },
  { id: 'Mobile App Developer', domain: 'Computer Science', description: 'React Native, Flutter, Mobile UI/UX, Native APIs, and App Store Deployment.' },
  { id: 'Cloud Engineer', domain: 'Computer Science', description: 'Cloud Architecture, AWS/GCP, Serverless Computing, IAM, and Networking Security.' },
];

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  mobile?: string;
  avatarUrl?: string;
  college?: string;
  branch?: string;
  degree?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  preferredRoles?: string[];
  semester?: string;
  career?: string;
  isProfileCompleted?: boolean;
  experienceLevel?: string;
  activeCurriculum?: {
    career: string;
    domain: string;
    description: string;
    topics: Array<{ name: string; subtopics: string[] }>;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    mobile?: string;
    avatarUrl?: string;
  };
}

interface CareerChangeRequest {
  _id: string;
  currentCareer: string;
  requestedCareer: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface Certificate {
  _id: string;
  certificateId: string;
  careerPath: string;
  issueDate: string;
  expiryDate: string;
  overallScore: number;
  interviewReadinessStatus: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  sharedWith: Array<{ recruiterEmail: string; sharedAt: string }>;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isOwnProfile = !id || id === user?._id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [careerRequests, setCareerRequests] = useState<CareerChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCareerChangeModal, setShowCareerChangeModal] = useState(false);
  const [submittingCareerChange, setSubmittingCareerChange] = useState(false);
  const [careerChangeForm, setCareerChangeForm] = useState({
    requestedCareer: AVAILABLE_CAREERS[0].id,
    reason: '',
  });

  const [actualSessions, setActualSessions] = useState(0);
  const [formData, setFormData] = useState({
    careerPath: '',
    technicalScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    confidenceScore: 0,
    sessionsCompleted: 0,
    strengths: '',
    improvements: '',
  });

  // Edit / Setup Form
  const [editFormData, setEditFormData] = useState({
    name: '',
    mobile: '',
    location: '',
    bio: '',
    college: '',
    degree: '',
    branch: '',
    semester: '1st_year',
    experienceLevel: 'Fresher',
    career: AVAILABLE_CAREERS[0].id,
    skills: '',
    interests: '',
    preferredRoles: '',
  });

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        try {
          const profileRes = await api.get('/api/profiles/me');
          setProfile(profileRes.data);
        } catch (profileErr: any) {
          if (profileErr.response?.status === 404) {
            setProfile(null);
          } else {
            throw profileErr;
          }
        }

        // Fetch certificates
        const certRes = await api.get('/api/certificates/my-certificates');
        setCertificates(Array.isArray(certRes.data) ? certRes.data : []);

        // Fetch career change requests history
        try {
          const changeRes = await api.get('/api/career-change-requests/my');
          setCareerRequests(Array.isArray(changeRes.data) ? changeRes.data : []);
        } catch (cErr) {
          console.warn('Could not fetch career change history:', cErr);
        }

        // Fetch interview sessions count
        let sessionsCount = 0;
        try {
          const sessionsRes = await api.get('/api/interviews/sessions/me');
          if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
            sessionsCount = sessionsRes.data.filter((s: any) => s.status === 'Completed' || s.status === 'completed').length;
          }
        } catch (e) {
          console.warn('Failed to fetch interview session count:', e);
        }
        setActualSessions(sessionsCount);
      } else {
        try {
          const profileRes = await api.get(`/api/profiles/user/${id}`);
          setProfile(profileRes.data);
        } catch (profileErr: any) {
          if (profileErr.response?.status === 404) {
            setProfile(null);
          } else {
            throw profileErr;
          }
        }

        const certRes = await api.get(`/api/certificates/student/${id}`);
        setCertificates(Array.isArray(certRes.data) ? certRes.data : []);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, isOwnProfile]);

  const handleShareCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertId || !shareEmail) return;

    try {
      setSharing(true);
      await api.post(`/api/certificates/${selectedCertId}/share`, {
        recruiterEmail: shareEmail,
      });

      const certRes = await api.get('/api/certificates/my-certificates');
      setCertificates(Array.isArray(certRes.data) ? certRes.data : []);

      setShareEmail('');
      setSelectedCertId(null);
      setShowShareModal(false);
      alert('Certificate shared successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to share certificate');
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadPDF = async (certificateId: string) => {
    try {
      const response = await api.get(`/api/certificates/${certificateId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkillDNA-Certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF', err);
      alert('Failed to download certificate');
    }
  };

  const handleOpenCreateModal = () => {
    if (actualSessions === 0) {
      alert("You must complete at least one mock interview practice session before generating a certificate.");
      return;
    }

    const skillDNA = (profile as any)?.skillDNA || {};
    setFormData({
      careerPath: profile?.career || (profile as any)?.preferredRoles?.[0] || (profile as any)?.branch || 'Software Engineering',
      technicalScore: skillDNA.technicalScore || 75,
      communicationScore: skillDNA.communicationScore || 75,
      problemSolvingScore: skillDNA.projectsScore || skillDNA.aptitudeScore || 75,
      confidenceScore: skillDNA.confidenceScore || 75,
      sessionsCompleted: actualSessions,
      strengths: skillDNA.strengths?.join(', ') || 'Problem Solving, Architecture',
      improvements: skillDNA.weaknesses?.join(', ') || 'Communication Depth',
    });
    setShowCreateModal(true);
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actualSessions === 0) {
      alert("You must complete at least one mock interview practice session before generating a certificate.");
      return;
    }

    try {
      const payload = {
        ...formData,
        technicalScore: parseInt(formData.technicalScore as any),
        communicationScore: parseInt(formData.communicationScore as any),
        problemSolvingScore: parseInt(formData.problemSolvingScore as any),
        confidenceScore: parseInt(formData.confidenceScore as any),
        sessionsCompleted: parseInt(formData.sessionsCompleted as any),
        strengths: formData.strengths ? formData.strengths.split(',').map((s: string) => s.trim()) : [],
        improvements: formData.improvements ? formData.improvements.split(',').map((i: string) => i.trim()) : [],
      };

      const response = await api.post('/api/certificates/create', payload);

      if (response.data.certificate) {
        setCertificates([response.data.certificate, ...certificates]);
        setShowCreateModal(false);
        alert('Certificate request generated successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate certificate');
    }
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      name: profile?.name || user?.name || '',
      mobile: profile?.mobile || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      college: profile?.college || '',
      degree: profile?.degree || '',
      branch: profile?.branch || '',
      semester: profile?.semester || '1st_year',
      experienceLevel: profile?.experienceLevel || 'Fresher',
      career: profile?.career || AVAILABLE_CAREERS[0].id,
      skills: profile?.skills?.join(', ') || '',
      interests: profile?.interests?.join(', ') || '',
      preferredRoles: profile?.preferredRoles?.join(', ') || '',
    });
    setShowEditModal(true);
  };

  // Submit Profile (First-time setup via POST or updates via PUT)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const isFirstSetup = !profile || !profile.isProfileCompleted;

      const payload = {
        name: editFormData.name,
        mobile: editFormData.mobile,
        location: editFormData.location,
        bio: editFormData.bio,
        college: editFormData.college,
        degree: editFormData.degree,
        branch: editFormData.branch,
        semester: editFormData.semester,
        experienceLevel: editFormData.experienceLevel,
        skills: editFormData.skills ? editFormData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        interests: editFormData.interests ? editFormData.interests.split(',').map((i) => i.trim()).filter(Boolean) : [],
        preferredRoles: editFormData.preferredRoles ? editFormData.preferredRoles.split(',').map((r) => r.trim()).filter(Boolean) : [],
        ...(isFirstSetup ? { career: editFormData.career, isProfileCompleted: true } : {}),
      };

      if (isFirstSetup) {
        const res = await api.post('/api/profiles', payload);
        setProfile(res.data);
      } else {
        const res = await api.put('/api/profiles/me', payload);
        setProfile(res.data);
      }

      setShowEditModal(false);
      setError(null);
      await fetchProfileData();
      alert(isFirstSetup ? 'Profile setup complete! Active curriculum assigned.' : 'Profile updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Submit Career Change Request
  const handleSubmitCareerChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerChangeForm.reason.trim() || careerChangeForm.reason.trim().length < 10) {
      alert('Please provide a meaningful reason (at least 10 characters) explaining why you wish to change your career.');
      return;
    }

    if (careerChangeForm.requestedCareer === profile?.career) {
      alert('You have selected your currently active career. Please choose a different target career.');
      return;
    }

    setSubmittingCareerChange(true);
    try {
      await api.post('/api/career-change-requests', {
        requestedCareer: careerChangeForm.requestedCareer,
        reason: careerChangeForm.reason.trim(),
      });

      setShowCareerChangeModal(false);
      setCareerChangeForm({ requestedCareer: AVAILABLE_CAREERS[0].id, reason: '' });
      alert('Career Change Request submitted successfully! It has been routed to Admin for review.');
      await fetchProfileData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to submit career change request.');
    } finally {
      setSubmittingCareerChange(false);
    }
  };

  const copyProfileLink = () => {
    const profileLink = `${window.location.origin}/profile/${user?._id}`;
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getReadinessColor = (status: string) => {
    switch (status) {
      case 'ADVANCED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'READY':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const isProfileComplete = profile && profile.isProfileCompleted && profile.career;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
          <div className="h-32 bg-gradient-to-r from-cyan-900 to-blue-900" />

          <div className="relative px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6 flex-wrap sm:flex-nowrap">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl border-4 border-slate-800 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {(profile?.name || user?.name || '?').charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 pb-2 min-w-[200px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-white">{profile?.name || user?.name}</h1>
                  {profile?.career && (
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> {profile.career}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 mt-1">
                  {((profile?.user?.role || profile?.role || user?.role || '').toLowerCase() === 'student') ? '👨‍🎓 Student' : (profile?.user?.role || profile?.role || user?.role || '')}
                  {profile?.experienceLevel && ` • ${profile.experienceLevel}`}
                </p>
              </div>

              {isOwnProfile && (
                <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Pencil className="w-4 h-4" /> {isProfileComplete ? 'Edit Profile' : 'Set Up Profile'}
                  </button>
                  {isProfileComplete && (
                    <button
                      onClick={copyProfileLink}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl transition-all border border-slate-600 active:scale-95"
                    >
                      <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Share Profile'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Mail, label: 'Email', value: profile?.email || user?.email },
                { icon: Phone, label: 'Phone', value: profile?.mobile || 'Not provided' },
                { icon: MapPin, label: 'Location', value: profile?.location || 'Not provided' },
                { icon: GraduationCap, label: 'Education', value: profile?.degree ? `${profile.degree} - ${profile.branch}` : 'Not provided' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-700/30 border border-slate-600 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-1 flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-cyan-400" /> {item.label}
                  </p>
                  <p className="text-slate-200 text-sm font-semibold truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* 1. FIRST-TIME PROFILE SETUP WIZARD BANNER */}
        {!isProfileComplete && isOwnProfile && (
          <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-blue-950/60 rounded-2xl border-2 border-cyan-500/40 p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-cyan-500/15 blur-[80px]" />
            <Award className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-white mb-2">Complete First-Time Profile Setup</h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm">
              Select your targeted Career to automatically generate your active curriculum (<code className="text-cyan-300">Domain → Topics → Subtopics</code>), unlock personalized topic notes, question bank MCQs, and AI mock interviews.
            </p>
            <button
              onClick={handleOpenEditModal}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-95 text-base"
            >
              Start First-Time Setup
            </button>
          </div>
        )}

        {/* 2. ACTIVE CURRICULUM & CAREER GOVERNANCE CARD */}
        {isProfileComplete && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Active Learning Curriculum</h3>
                  <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <Lock className="w-3 h-3" /> Career & Curriculum Locked
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Assigned Career: <span className="text-cyan-300 font-semibold">{profile.career}</span> • Domain: <span className="text-slate-200 font-semibold">{profile.activeCurriculum?.domain || 'Computer Science'}</span>
                </p>
              </div>

              {isOwnProfile && (
                <div className="flex items-center gap-3">
                  <Link
                    to="/learning"
                    className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all border border-slate-600"
                  >
                    Open Learning Hub <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </Link>
                  <button
                    onClick={() => {
                      setCareerChangeForm({ requestedCareer: AVAILABLE_CAREERS[0].id, reason: '' });
                      setShowCareerChangeModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <GitPullRequest className="w-4 h-4" /> Request Career Change
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60">
                <p className="text-xs text-slate-400">Curriculum Structure</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">Domain → Topics → Subtopics</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60">
                <p className="text-xs text-slate-400">Core Topics Total</p>
                <p className="text-sm font-semibold text-cyan-400 mt-0.5">
                  {profile.activeCurriculum?.topics?.length || 7} Topics Curated
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60">
                <p className="text-xs text-slate-400">Curriculum Policy</p>
                <p className="text-xs text-slate-300 mt-0.5">Changes require administrative review & audit preservation.</p>
              </div>
            </div>

            {/* Career Change Request History */}
            {isOwnProfile && careerRequests.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-700/70">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" /> Career Change Requests History
                </h4>
                <div className="space-y-2">
                  {careerRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-slate-900/50 border border-slate-700/60 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400">Requested:</span>
                          <span className="text-white font-semibold">{req.requestedCareer}</span>
                          <span className="text-slate-500">from {req.currentCareer}</span>
                          <span className="text-slate-500">• {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-400 mt-1 italic">"{req.reason}"</p>
                        {req.reviewNotes && (
                          <p className="text-cyan-300 mt-1">Admin note: {req.reviewNotes}</p>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border shrink-0 ${
                          req.status === 'APPROVED'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {req.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {req.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                        {req.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isProfileComplete && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-8 items-start">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Certificates Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Award className="w-8 h-8 text-cyan-400" />
                    SkillDNA Certificates
                    <span className="text-sm bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30">
                      {certificates.length}
                    </span>
                  </h2>
                  {isOwnProfile && (
                    <button
                      onClick={handleOpenCreateModal}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Generate Certificate
                    </button>
                  )}
                </div>

                {certificates.length === 0 ? (
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-12 text-center shadow-lg">
                    <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
                    <p className="text-slate-400 mb-6">Complete topic MCQs and practice interviews to generate verifiable certificates</p>
                    <Link
                      to="/interview"
                      className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      Start Interview Practice
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert, idx) => (
                      <motion.div
                        key={cert._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-500/20 transition-all overflow-hidden group"
                      >
                        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 flex items-center justify-between gap-4">
                          <div className="truncate">
                            <p className="text-xs text-cyan-300 font-mono truncate">{cert.certificateId}</p>
                            <p className="text-white font-semibold mt-1 truncate">{cert.careerPath}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            cert.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            cert.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse'
                          }`}>
                            {cert.status || 'PENDING'}
                          </span>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-sm">Overall Score</span>
                              <span className="text-2xl font-bold text-cyan-400">{cert.overallScore}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                style={{ width: `${cert.overallScore}%` }}
                              />
                            </div>
                          </div>

                          <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getReadinessColor(cert.interviewReadinessStatus)}`}>
                            {cert.interviewReadinessStatus.replace('_', ' ')}
                          </div>

                          <div className="text-xs text-slate-500 space-y-1">
                            <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                            <p>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                          </div>

                          {cert.status === 'APPROVED' ? (
                            <div className="flex gap-2 pt-2 border-t border-slate-700">
                              <button
                                onClick={() => window.open(`/certificate/${cert.certificateId}`, '_blank')}
                                className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 rounded transition-all active:scale-95"
                              >
                                <Eye className="w-3 h-3 text-cyan-400" /> View
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(cert.certificateId)}
                                className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 rounded transition-all active:scale-95"
                              >
                                <Download className="w-3 h-3 text-cyan-400" /> PDF
                              </button>
                              {isOwnProfile && (
                                <button
                                  onClick={() => {
                                    setSelectedCertId(cert.certificateId);
                                    setShowShareModal(true);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold py-2 rounded transition-all active:scale-95"
                                >
                                  <Share2 className="w-3 h-3" /> Share
                                </button>
                              )}
                            </div>
                          ) : cert.status === 'REJECTED' ? (
                            <div className="pt-2 border-t border-slate-700">
                              <div className="p-2 text-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                                This certificate request was rejected.
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-slate-700">
                              <div className="p-2 text-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold animate-pulse">
                                Pending digital signature and approval...
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* About Section */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">About & Career Objective</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {profile.bio || 'No description provided. Add a bio to showcase your skills, objectives, and project background.'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-6 shadow-lg">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-slate-700 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                  Education Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-slate-400">College</span>
                    <span className="text-slate-200 font-medium text-right">{profile.college}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Degree</span>
                    <span className="text-slate-200 font-medium">{profile.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Branch</span>
                    <span className="text-slate-200 font-medium">{profile.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Semester</span>
                    <span className="text-slate-200 font-medium">
                      {profile.semester?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {profile.preferredRoles && profile.preferredRoles.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-slate-700 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    Target Job Roles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredRoles.map((role) => (
                      <span key={role} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-slate-700 flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    Key Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-slate-700 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    Interests & Domains
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span key={interest} className="bg-slate-700 text-slate-300 border border-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Career Change Request Modal */}
      {showCareerChangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-amber-500/30 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Request Career Change</h3>
              </div>
              <button
                onClick={() => setShowCareerChangeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCareerChange} className="mt-4 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200">
                <p className="font-semibold mb-1">Important Governance Notice:</p>
                To maintain consistent skill evaluation, changing your career and active curriculum requires Administrative approval. Your past learning records and certificates will remain preserved.
              </div>

              <div>
                <label className="text-slate-400 text-xs font-semibold mb-1 block">Current Career</label>
                <div className="w-full bg-slate-950/60 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> {profile?.career || 'None Selected'}
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1.5 block">
                  Select New Target Career <span className="text-red-400">*</span>
                </label>
                <select
                  value={careerChangeForm.requestedCareer}
                  onChange={(e) => setCareerChangeForm({ ...careerChangeForm, requestedCareer: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  required
                >
                  {AVAILABLE_CAREERS.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === profile?.career}>
                      {c.id} ({c.domain}) {c.id === profile?.career ? '• Current' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1.5 block">
                  Reason / Justification for Career Change <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={careerChangeForm.reason}
                  onChange={(e) => setCareerChangeForm({ ...careerChangeForm, reason: e.target.value })}
                  placeholder="Explain why you want to transition to this career (e.g. Completed specialized coursework, changed domain focus, internship alignment)..."
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-400 placeholder-slate-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingCareerChange}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 text-sm"
                >
                  {submittingCareerChange ? 'Submitting...' : 'Submit Request for Approval'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCareerChangeModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-2xl font-bold text-white mb-4">Share Certificate with Recruiter</h2>
            <form onSubmit={handleShareCertificate} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-semibold mb-2 block">Recruiter Email</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sharing}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {sharing ? <Loader className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Share
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-cyan-900 p-6 flex items-center justify-between border-b border-cyan-500/20 z-10">
              <h2 className="text-2xl font-bold text-white">Generate New Certificate</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-2xl transition-colors"
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCertificate} className="p-6 space-y-4">
              <div>
                <label className="text-slate-300 font-semibold mb-2 block">Career Path</label>
                <input
                  type="text"
                  value={formData.careerPath}
                  onChange={(e) => setFormData({ ...formData, careerPath: e.target.value })}
                  placeholder="e.g., Software Development"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'technicalScore', label: 'Technical Score' },
                  { key: 'communicationScore', label: 'Communication Score' },
                  { key: 'problemSolvingScore', label: 'Problem Solving Score' },
                  { key: 'confidenceScore', label: 'Confidence Score' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-slate-300 font-semibold mb-2 block text-sm">{label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block">Sessions Completed</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sessionsCompleted}
                  onChange={(e) => setFormData({ ...formData, sessionsCompleted: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold py-2.5 rounded-lg transition-all"
                >
                  Generate Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile / First-Time Setup Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-cyan-900 p-6 flex items-center justify-between border-b border-cyan-500/20 z-10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {!isProfileComplete ? 'Complete Initial Profile Setup' : 'Edit Profile Information'}
                </h2>
                <p className="text-xs text-cyan-200 mt-0.5">
                  {!isProfileComplete
                    ? 'Select your core Career to automatically configure your active curriculum.'
                    : 'Personal and educational information can be updated here.'}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {/* CAREER FIELD: Selectable on first setup, LOCKED on subsequent edits */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-200 font-semibold text-sm flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    Target Career <span className="text-red-400">*</span>
                  </label>
                  {isProfileComplete && (
                    <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked by policy
                    </span>
                  )}
                </div>

                {!isProfileComplete ? (
                  <div className="space-y-2">
                    <select
                      value={editFormData.career}
                      onChange={(e) => setEditFormData({ ...editFormData, career: e.target.value })}
                      className="w-full bg-slate-700 border-2 border-cyan-500/60 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400 cursor-pointer font-medium"
                      required
                    >
                      {AVAILABLE_CAREERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} — {c.domain}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-cyan-300">
                      💡 Setting this creates your active curriculum with custom topics, MCQ banks, notes, and adaptive mock interviews.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="w-full bg-slate-950/70 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center justify-between">
                      <span>{profile.career}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" /> Direct edit disabled
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      To change your career or curriculum, submit a request using the "Request Career Change" button on your profile.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Phone / Mobile</label>
                  <input
                    type="text"
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Location (City, Country)</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">College / University <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={editFormData.college}
                    onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Degree / Education <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={editFormData.degree}
                    onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })}
                    placeholder="e.g. B.Tech, M.S."
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Branch / Specialization <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={editFormData.branch}
                    onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Experience Level <span className="text-red-400">*</span></label>
                  <select
                    value={editFormData.experienceLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceLevel: e.target.value })}
                    className="w-full h-10 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    required
                  >
                    <option value="Fresher">Fresher / Student</option>
                    <option value="Intermediate (1-2 years)">Intermediate (1-2 years)</option>
                    <option value="Experienced (3+ years)">Experienced (3+ years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block text-sm">Bio / About Me</label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  placeholder="Tell recruiters about yourself, your career path, and achievements..."
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block text-sm">Key Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.skills}
                  onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                  placeholder="e.g. Java, Spring Boot, React, SQL, DSA"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Interests (comma-separated)</label>
                  <input
                    type="text"
                    value={editFormData.interests}
                    onChange={(e) => setEditFormData({ ...editFormData, interests: e.target.value })}
                    placeholder="e.g. Distributed Systems, AI, Cloud"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Preferred Job Roles (comma-separated)</label>
                  <input
                    type="text"
                    value={editFormData.preferredRoles}
                    onChange={(e) => setEditFormData({ ...editFormData, preferredRoles: e.target.value })}
                    placeholder="e.g. Java Developer, Backend Engineer"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold py-2.5 rounded-lg transition-all"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
