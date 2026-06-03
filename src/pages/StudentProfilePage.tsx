import React, { useState, useEffect } from 'react';
import { Award, Mail, Phone, Briefcase, GraduationCap, MapPin, Download, Share2, Copy, Eye, CheckCircle, AlertCircle, Loader, Plus } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          // Fetch own profile
          const profileRes = await api.get('/api/profiles/me');
          setProfile(profileRes.data);

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
          const profileRes = await api.get(`/api/profiles/user/${id}`);
          setProfile(profileRes.data);

          // Fetch target student certificates
          const certRes = await api.get(`/api/certificates/student/${id}`);
          setCertificates(Array.isArray(certRes.data) ? certRes.data : []);
        }
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load profile');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
          {/* Background Gradient */}
          <div className="h-32 bg-gradient-to-r from-cyan-900 to-blue-900" />

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl border-4 border-slate-800 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold text-white">{profile?.name}</h1>
                <p className="text-slate-400">{profile?.role === 'student' ? '👨‍🎓 Student' : profile?.role}</p>
              </div>

              {/* Copy Profile Link */}
              {isOwnProfile && (
                <button
                  onClick={copyProfileLink}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all"
                >
                  <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Share Profile'}
                </button>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: Mail, label: 'Email', value: profile?.email },
                { icon: Phone, label: 'Phone', value: profile?.mobile || 'Not provided' },
                { icon: MapPin, label: 'Location', value: profile?.location || 'Not provided' },
                { icon: GraduationCap, label: 'Education', value: `${profile?.degree || 'N/A'} - ${profile?.branch || 'N/A'}` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1 flex items-center gap-2">
                    <item.icon className="w-4 h-4" /> {item.label}
                  </p>
                  <p className="text-slate-200 text-sm font-semibold truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

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

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {certificates.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-12 text-center">
              <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
              <p className="text-slate-400 mb-6">Complete practice interviews to generate your first certificate</p>
              <a
                href="/interview"
                className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2 rounded-lg transition-all"
              >
                Start Interview Practice
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 rounded transition-all"
                          title="View certificate"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(cert.certificateId)}
                          className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 rounded transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                        {isOwnProfile && (
                          <button
                            onClick={() => {
                              setSelectedCertId(cert.certificateId);
                              setShowShareModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold py-2 rounded transition-all"
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
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">About</h3>
          <p className="text-slate-300">
            {profile?.bio || 'No description provided. Add a bio to help recruiters understand your career goals and interests.'}
          </p>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 max-w-md w-full p-6 shadow-2xl">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-cyan-900 p-6 flex items-center justify-between border-b border-cyan-500/20">
              <h2 className="text-2xl font-bold text-white">Generate New Certificate</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
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
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Generate Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all"
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
