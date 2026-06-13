import React, { useState, useEffect } from 'react';
import { Award, Mail, Phone, Briefcase, GraduationCap, MapPin, Download, Share2, Copy, Eye, CheckCircle, AlertCircle, Loader, Plus, Pencil, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { motion } from 'framer-motion';

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
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    mobile?: string;
    avatarUrl?: string;
  };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const [editFormData, setEditFormData] = useState({
    name: '',
    mobile: '',
    location: '',
    bio: '',
    college: '',
    degree: '',
    branch: '',
    semester: '',
    skills: '',
    interests: '',
    preferredRoles: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          // Fetch own profile
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

          // Fetch own certificates
          const certRes = await api.get('/api/certificates/my-certificates');
          setCertificates(Array.isArray(certRes.data) ? certRes.data : []);

          // Fetch own interview sessions count
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
          // Fetch target student profile
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

          // Fetch target student certificates
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

    fetchData();
  }, [id, isOwnProfile]);

  const handleShareCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertId || !shareEmail) return;

    try {
      setSharing(true);
      await api.post(`/api/certificates/${selectedCertId}/share`, {
        recruiterEmail: shareEmail,
      });

      // Refresh certificates
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
      careerPath: (profile as any)?.preferredRoles?.[0] || (profile as any)?.branch || 'Software Engineering',
      technicalScore: skillDNA.technicalScore || 70,
      communicationScore: skillDNA.communicationScore || 75,
      problemSolvingScore: skillDNA.projectsScore || skillDNA.aptitudeScore || 72,
      confidenceScore: skillDNA.confidenceScore || 68,
      sessionsCompleted: actualSessions,
      strengths: skillDNA.strengths?.join(', ') || 'Problem Solving, System Design',
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
      semester: profile?.semester || '',
      skills: profile?.skills?.join(', ') || '',
      interests: profile?.interests?.join(', ') || '',
      preferredRoles: profile?.preferredRoles?.join(', ') || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...editFormData,
        skills: editFormData.skills ? editFormData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        interests: editFormData.interests ? editFormData.interests.split(',').map((i) => i.trim()).filter(Boolean) : [],
        preferredRoles: editFormData.preferredRoles ? editFormData.preferredRoles.split(',').map((r) => r.trim()).filter(Boolean) : [],
      };

      const res = await api.put('/api/profiles/me', payload);
      setProfile(res.data);
      setShowEditModal(false);
      setError(null);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
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

  if (!profile && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-8 max-w-md w-full text-center shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-white mb-2">Profile Not Found</h3>
          <p className="text-slate-400 mb-6">The requested student profile does not exist or has not been set up yet.</p>
          <a href="/" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
          {/* Background Gradient */}
          <div className="h-32 bg-gradient-to-r from-cyan-900 to-blue-900" />

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6 flex-wrap sm:flex-nowrap">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl border-4 border-slate-800 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {(profile?.name || user?.name || '?').charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pb-2 min-w-[200px]">
                <h1 className="text-3xl font-bold text-white">{profile?.name || user?.name}</h1>
                <p className="text-slate-400">
                  {((profile?.user?.role || profile?.role || user?.role || '').toLowerCase() === 'student') ? '👨‍🎓 Student' : (profile?.user?.role || profile?.role || user?.role || '')}
                </p>
              </div>

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Pencil className="w-4 h-4" /> {profile ? 'Edit Profile' : 'Set Up Profile'}
                  </button>
                  {profile && (
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
                { icon: GraduationCap, label: 'Education', value: profile ? `${profile.degree} - ${profile.branch}` : 'Not provided' },
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

        {/* Onboarding / Profile Setup Banner */}
        {!profile && isOwnProfile && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
            <Award className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Set Up Your SkillDNA Profile</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-6">
              Complete your profile information to unlock personalized AI interview coaching, track learning roadmaps, and generate verifiable certificates.
            </p>
            <button
              onClick={handleOpenEditModal}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95"
            >
              Get Started
            </button>
          </div>
        )}

        {profile && (
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
                    <p className="text-slate-400 mb-6">Complete practice interviews to generate your first certificate</p>
                    <a
                      href="/interview"
                      className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-650 hover:to-blue-650 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      Start Interview Practice
                    </a>
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
                        {/* Header */}
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

                        {/* Content */}
                        <div className="p-4 space-y-4">
                          {/* Scores */}
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

                          {/* Status */}
                          <div className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getReadinessColor(cert.interviewReadinessStatus)}`}>
                            {cert.interviewReadinessStatus.replace('_', ' ')}
                          </div>

                          {/* Dates */}
                          <div className="text-xs text-slate-500 space-y-1">
                            <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                            <p>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                          </div>

                          {/* Shared Count */}
                          {cert.sharedWith.length > 0 && (
                            <div className="bg-slate-700/30 rounded px-3 py-2 text-xs text-slate-300">
                              Shared with {cert.sharedWith.length} recruiter{cert.sharedWith.length !== 1 ? 's' : ''}
                            </div>
                          )}

                          {/* Actions */}
                          {cert.status === 'APPROVED' ? (
                            <div className="flex gap-2 pt-2 border-t border-slate-700">
                              <button
                                onClick={() => window.open(`/certificate/${cert.certificateId}`, '_blank')}
                                className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 rounded transition-all active:scale-95"
                                title="View certificate"
                              >
                                <Eye className="w-3 h-3 text-cyan-400" /> View
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(cert.certificateId)}
                                className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 rounded transition-all active:scale-95"
                                title="Download PDF"
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
                                  title="Share certificate"
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
                <h3 className="text-lg font-bold text-white mb-4">About</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {profile.bio || 'No description provided. Add a bio to help recruiters understand your career goals and interests.'}
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
                    Preferred Roles
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
                    Interests
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

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-200 text-xs">
                  Your certificate will be shared with this recruiter. They can access it via a secure link.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sharing}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {sharing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" /> Share
                    </>
                  )}
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

              <div>
                <label className="text-slate-300 font-semibold mb-2 block">Strengths (comma-separated)</label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="e.g., Problem Solving, System Design, Technical Depth"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block">Improvements (comma-separated)</label>
                <textarea
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  placeholder="e.g., Communication, Time Management, Stress Handling"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  rows={2}
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-cyan-900 p-6 flex items-center justify-between border-b border-cyan-500/20 z-10">
              <h2 className="text-2xl font-bold text-white">{profile ? 'Edit Profile Details' : 'Create Profile'}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
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
                    placeholder="e.g. B.Tech, M.S., B.Pharm"
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
                  <label className="text-slate-300 font-semibold mb-2 block text-sm">Current Progress <span className="text-red-400">*</span></label>
                  <select
                    value={editFormData.semester}
                    onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
                    className="w-full h-10 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select semester</option>
                    <option value="1st_year">1st Year / Sem 1-2</option>
                    <option value="2nd_year">2nd Year / Sem 3-4</option>
                    <option value="3rd_year">3rd Year / Sem 5-6</option>
                    <option value="4th_year">4th Year / Sem 7-8</option>
                    <option value="graduated">Already Graduated</option>
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
                  rows={3}
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block text-sm">Key Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.skills}
                  onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                  placeholder="e.g. React.js, TypeScript, Python, REST APIs"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block text-sm">Interests (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.interests}
                  onChange={(e) => setEditFormData({ ...editFormData, interests: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Cryptography, Open Source"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block text-sm">Preferred Job Roles (comma-separated)</label>
                <input
                  type="text"
                  value={editFormData.preferredRoles}
                  onChange={(e) => setEditFormData({ ...editFormData, preferredRoles: e.target.value })}
                  placeholder="e.g. Frontend Developer, Fullstack Engineer, Data Analyst"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
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
