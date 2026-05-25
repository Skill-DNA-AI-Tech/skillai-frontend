import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Share2, Plus, Eye, Loader, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface Certificate {
  _id: string;
  certificateId: string;
  studentName: string;
  careerPath: string;
  issueDate: string;
  expiryDate: string;
  overallScore: number;
  interviewReadinessStatus: string;
  sharedWith: Array<{ recruiterEmail: string }>;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const CertificateManagementPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPDF = async (certId: string, certIdStr: string) => {
    try {
      setDownloadingId(certId);
      const response = await api.get(
        `/api/certificates/${certIdStr}/pdf`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkillDNA-Certificate-${certIdStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF', err);
      alert('Failed to download PDF certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShareCertificate = async (certIdStr: string) => {
    const recruiterEmail = window.prompt("Enter recruiter's email to share this certificate:");
    if (!recruiterEmail) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recruiterEmail.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      await api.post(`/api/certificates/${certIdStr}/share`, {
        recruiterEmail: recruiterEmail.trim(),
      });
      alert('Certificate shared successfully!');
      fetchCertificates();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to share certificate');
    }
  };

  const [profile, setProfile] = useState<any>(null);
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

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get('/api/profiles/me');
      if (response.data) {
        setProfile(response.data);
        const skillDNA = response.data.skillDNA || {};
        
        // Count actual completed mock sessions
        let actualSessions = 0;
        try {
          const sessionsRes = await api.get('/api/interviews/sessions/me');
          if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
            actualSessions = sessionsRes.data.filter((s: any) => s.status === 'completed').length;
          }
        } catch (e) {
          console.warn('Failed to fetch interview session count, using defaults:', e);
        }

        setFormData({
          careerPath: response.data.preferredRoles?.[0] || response.data.branch || 'Software Engineering',
          technicalScore: skillDNA.technicalScore || 70,
          communicationScore: skillDNA.communicationScore || 75,
          problemSolvingScore: skillDNA.projectsScore || skillDNA.aptitudeScore || 72,
          confidenceScore: skillDNA.confidenceScore || 68,
          sessionsCompleted: actualSessions || 0,
          strengths: skillDNA.strengths?.join(', ') || 'Problem Solving, System Design',
          improvements: skillDNA.weaknesses?.join(', ') || 'Communication Depth',
        });
      }
    } catch (err) {
      console.error('Failed to load profile in certificates page:', err);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchStudentProfile();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/certificates/my-certificates');
      setCertificates(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        technicalScore: parseInt(formData.technicalScore as any),
        communicationScore: parseInt(formData.communicationScore as any),
        problemSolvingScore: parseInt(formData.problemSolvingScore as any),
        confidenceScore: parseInt(formData.confidenceScore as any),
        sessionsCompleted: parseInt(formData.sessionsCompleted as any),
        strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()) : [],
        improvements: formData.improvements ? formData.improvements.split(',').map(i => i.trim()) : [],
      };

      const response = await api.post('/api/certificates/create', payload);

      if (response.data.certificate) {
        setCertificates([response.data.certificate, ...certificates]);
        setShowCreateModal(false);
        setFormData({
          careerPath: '',
          technicalScore: 0,
          communicationScore: 0,
          problemSolvingScore: 0,
          confidenceScore: 0,
          sessionsCompleted: 0,
          strengths: '',
          improvements: '',
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create certificate');
    }
  };

  const getStatusColor = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">My Certificates</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <Plus className="w-5 h-5" /> Generate Certificate
          </button>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 p-12 text-center">
            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Certificates Yet</h2>
            <p className="text-slate-400 mb-6">Complete interviews and practice sessions to generate certificates</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2 rounded-lg transition-all"
            >
              Create First Certificate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-500/20 transition-all overflow-hidden group"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-4 flex items-center justify-between gap-4">
                  <div className="truncate">
                    <p className="text-sm text-cyan-300 font-mono truncate">{cert.certificateId}</p>
                    <p className="text-white font-semibold truncate">{cert.careerPath}</p>
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
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Overall Score</p>
                    <p className="text-3xl font-bold text-cyan-400">{cert.overallScore}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Status</p>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(cert.interviewReadinessStatus)}`}>
                        {cert.interviewReadinessStatus.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs mb-1">Shared</p>
                      <p className="text-lg font-bold text-cyan-400">{cert.sharedWith.length}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                    <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                    <p>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  {cert.status === 'APPROVED' ? (
                    <div className="flex gap-2 pt-2">
                      <Link
                        to={`/certificate/${cert.certificateId}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2 rounded transition-all"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(cert._id, cert.certificateId)}
                        disabled={downloadingId === cert._id}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-sm font-semibold py-2 rounded transition-all"
                        title="Download PDF"
                      >
                        {downloadingId === cert._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handleShareCertificate(cert.certificateId)}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2 rounded transition-all"
                        title="Share with recruiter"
                      >
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  ) : cert.status === 'REJECTED' ? (
                    <div className="p-2 text-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      This certificate request was rejected.
                    </div>
                  ) : (
                    <div className="p-2 text-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold animate-pulse">
                      Pending digital signature and approval...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
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
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-2 block">Improvements (comma-separated)</label>
                <textarea
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  placeholder="e.g., Communication, Time Management, Stress Handling"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
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

export default CertificateManagementPage;
