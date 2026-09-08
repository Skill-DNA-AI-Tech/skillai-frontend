import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Share2, Plus, Eye, Loader, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

interface Certificate {
  _id: string;
  certificateId: string;
  studentName: string;
  careerPath: string;
  issueDate: string;
  expiryDate: string;
  overallScore: number;
  passStatus?: string;
  templateId?: string;
  interviewReadinessStatus: string;
  sharedWith: Array<{ recruiterEmail: string }>;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const CertificateManagementPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [eligibleAssessments, setEligibleAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
    fetchEligibleAssessments();
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

  const fetchEligibleAssessments = async () => {
    try {
      const res = await api.get('/api/mcq/history');
      if (res.data?.assessments && Array.isArray(res.data.assessments)) {
        const eligible = res.data.assessments.filter((a: any) => a.overallScore >= 75);
        setEligibleAssessments(eligible);
      }
    } catch (err) {
      // Ignore if no assessments yet
    }
  };

  const handleClaimCertificate = async (assessmentId?: string) => {
    setClaiming(true);
    setClaimMessage(null);
    try {
      const payload = assessmentId ? { assessmentId } : {};
      const res = await api.post('/api/certificates/create', payload);

      if (res.data?.certificate) {
        setCertificates((prev) => [res.data.certificate, ...prev]);
        setClaimMessage(`Success! Verified Certificate ${res.data.certificate.certificateId} has been issued with score ${res.data.certificate.overallScore}%.`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to claim certificate.';
      alert(msg);
    } finally {
      setClaiming(false);
    }
  };

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
      alert('Certificate shared successfully with hiring team!');
      fetchCertificates();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to share certificate');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADVANCED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'READY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Verified Certificates</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically validated certificates earned through verified assessments with scores &ge; 75%.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleClaimCertificate()}
            disabled={claiming}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50 text-sm"
          >
            {claiming ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Checking Verified Score...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Claim Certificate (Score &ge; 75%)
              </>
            )}
          </button>
        </div>

        {/* Claim Success Banner */}
        {claimMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{claimMessage}</span>
          </div>
        )}

        {/* 75% Requirement Explanatory Banner */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Automated Server Verification Protocol
            </div>
            <p className="text-xs text-slate-300">
              Certificates cannot be manually typed or fabricated. Scores are verified directly by backend grading models. A minimum composite score of <strong>75/100</strong> is strictly enforced.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/interview"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 font-semibold transition"
            >
              Take AI Interview
            </Link>
            <Link
              to="/learning"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/20 font-semibold transition"
            >
              Take MCQ Assessment
            </Link>
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <p className="text-rose-200 text-sm">{error}</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-white/10 p-8">
            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No Certificates Claimed Yet</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              Complete an AI Interview Assessment or Domain MCQ Assessment with a score of 75% or higher to automatically qualify for your official SkillDNA Certificate.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/interview"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
              >
                Start AI Interview
              </Link>
              <Link
                to="/learning"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Explore Learning MCQs
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                        {cert.certificateId}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {cert.careerPath}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      (cert.overallScore >= 75) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      PASS ({cert.overallScore}%)
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 py-3 border-y border-white/5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Candidate</span>
                      <span className="font-semibold text-white">{cert.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issue Date</span>
                      <span className="font-mono text-slate-300">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Template Style</span>
                      <span className="font-mono text-slate-400 uppercase text-[11px]">
                        {cert.templateId || 'Template 01'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPDF(cert._id, cert.certificateId)}
                      disabled={downloadingId === cert._id}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold py-2 rounded-lg transition"
                    >
                      {downloadingId === cert._id ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={() => handleShareCertificate(cert.certificateId)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  </div>

                  <a
                    href={`/api/certificates/verify/${cert.certificateId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center block text-[11px] text-slate-400 hover:text-cyan-300 transition py-1"
                  >
                    Public Verification Page &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateManagementPage;
