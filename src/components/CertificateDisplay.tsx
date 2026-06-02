import React, { useState, useEffect } from 'react';
import { Download, Share2, Copy, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { api } from '../lib/api';

interface Certificate {
  _id: string;
  certificateId: string;
  studentName: string;
  email: string;
  careerPath: string;
  issueDate: string;
  expiryDate: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  overallScore: number;
  sessionsCompleted: number;
  interviewReadinessStatus: 'NOT_READY' | 'IN_PROGRESS' | 'READY' | 'ADVANCED';
  strengths: string[];
  improvements: string[];
  pdfUrl?: string;
  sharedWith: Array<{ recruiterEmail: string; sharedAt: string }>;
}

interface CertificateDisplayProps {
  certificateId: string;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ certificateId }) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showShareForm, setShowShareForm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/certificates/${certificateId}`);
        setCertificate(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleDownloadPDF = async () => {
    if (!certificate) return;
    
    try {
      setDownloading(true);
      const response = await api.get(
        `/api/certificates/${certificateId}/pdf`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkillDNA-Certificate-${certificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificate || !shareEmail) return;

    try {
      await api.post(`/api/certificates/${certificateId}/share`, {
        recruiterEmail: shareEmail,
      });
      setShareEmail('');
      setShowShareForm(false);
      alert('Certificate shared successfully!');
      // Refetch to update shared list
      const response = await api.get(`/api/certificates/${certificateId}`);
      setCertificate(response.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to share certificate');
    }
  };

  const copyVerificationLink = () => {
    const verifyUrl = `${window.location.origin}/certificate/verify/${certificate?.certificateId}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <p className="text-slate-300">Certificate not found</p>
      </div>
    );
  }

  const isExpired = new Date(certificate.expiryDate) < new Date();
  const readinessColor = {
    'NOT_READY': 'bg-red-500/20 text-red-400 border-red-500/30',
    'IN_PROGRESS': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'READY': 'bg-green-500/20 text-green-400 border-green-500/30',
    'ADVANCED': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }[certificate.interviewReadinessStatus];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Certificate Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">SkillDNA AI</h1>
            <p className="text-cyan-300 text-lg">Certificate of Verified Learning & Interview Readiness</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {isExpired && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-200">This certificate has expired</p>
              </div>
            )}

            {/* Student Info */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">{certificate.studentName}</h2>
              <p className="text-slate-400">{certificate.email}</p>
              <p className="text-cyan-300 font-semibold">Career Path: {certificate.careerPath}</p>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Technical', score: certificate.technicalScore },
                { label: 'Communication', score: certificate.communicationScore },
                { label: 'Problem Solving', score: certificate.problemSolvingScore },
                { label: 'Confidence', score: certificate.confidenceScore },
                { label: 'Overall', score: certificate.overallScore },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4 text-center"
                >
                  <p className="text-slate-400 text-sm mb-2">{item.label}</p>
                  <p className="text-3xl font-bold text-cyan-400">{item.score}</p>
                  <p className="text-slate-500 text-xs">/ 100</p>
                </div>
              ))}
            </div>

            {/* Status and Sessions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Interview Readiness</p>
                <div className={`inline-block px-3 py-1 rounded-lg border text-sm font-semibold ${readinessColor}`}>
                  {certificate.interviewReadinessStatus.replace('_', ' ')}
                </div>
              </div>
              <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">Sessions Completed</p>
                <p className="text-2xl font-bold text-cyan-400">{certificate.sessionsCompleted}</p>
              </div>
            </div>

            {/* Strengths */}
            {certificate.strengths.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> AI-Identified Strengths
                </p>
                <div className="flex flex-wrap gap-2">
                  {certificate.strengths.map((strength, idx) => (
                    <span
                      key={idx}
                      className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {certificate.improvements.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 font-semibold mb-2">Recommended Improvements</p>
                <div className="flex flex-wrap gap-2">
                  {certificate.improvements.map((improvement, idx) => (
                    <span
                      key={idx}
                      className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm border border-yellow-500/30"
                    >
                      {improvement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Details */}
            <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4 space-y-2 text-sm">
              <p className="text-slate-400">
                Certificate ID: <span className="text-cyan-300 font-mono">{certificate.certificateId}</span>
              </p>
              <p className="text-slate-400">
                Issued: <span className="text-cyan-300">{new Date(certificate.issueDate).toLocaleDateString()}</span>
              </p>
              <p className="text-slate-400">
                Expires: <span className={isExpired ? 'text-red-400' : 'text-cyan-300'}>{new Date(certificate.expiryDate).toLocaleDateString()}</span>
              </p>
            </div>

            {/* Shared With */}
            {certificate.sharedWith.length > 0 && (
              <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-slate-300 font-semibold mb-3">Shared With Recruiters</p>
                <div className="space-y-2">
                  {certificate.sharedWith.map((share, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-600/50 rounded px-3 py-2">
                      <span className="text-slate-300">{share.recruiterEmail}</span>
                      <span className="text-xs text-slate-500">{new Date(share.sharedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading || isExpired}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {downloading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" /> Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => setShowShareForm(!showShareForm)}
                disabled={isExpired}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                <Share2 className="w-5 h-5" /> Share
              </button>
              <button
                onClick={copyVerificationLink}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                <Copy className="w-5 h-5" /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Share Form */}
            {showShareForm && (
              <form onSubmit={handleShareCertificate} className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4 space-y-4">
                <p className="text-slate-300 font-semibold">Share with Recruiter</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="recruiter@company.com"
                    className="flex-1 bg-slate-600/50 border border-slate-500 text-white placeholder-slate-500 rounded px-3 py-2 focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-all"
                  >
                    Share
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDisplay;
