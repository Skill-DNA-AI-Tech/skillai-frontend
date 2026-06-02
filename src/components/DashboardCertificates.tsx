import React, { useEffect, useState } from 'react';
import { Award, Download, Share2, Eye, Loader, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Certificate {
  _id: string;
  certificateId: string;
  careerPath: string;
  issueDate: string;
  expiryDate: string;
  overallScore: number;
  interviewReadinessStatus: string;
  sharedWith: Array<{ recruiterEmail: string }>;
}

const DashboardCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/certificates/my-certificates');
        setCertificates(Array.isArray(response.data) ? response.data.slice(0, 3) : []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADVANCED':
        return 'from-blue-600 to-blue-400 text-blue-400';
      case 'READY':
        return 'from-green-600 to-green-400 text-green-400';
      case 'IN_PROGRESS':
        return 'from-yellow-600 to-yellow-400 text-yellow-400';
      default:
        return 'from-red-600 to-red-400 text-red-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-cyan-400" />
          Your Certificates
        </h2>
        <Link
          to="/certificates"
          className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
        >
          View All →
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {certificates.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/10 rounded-xl p-8 text-center">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No certificates generated yet</p>
          <Link
            to="/interview"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2 rounded-lg transition-all"
          >
            Start Interview Practice
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certificates.map((cert, idx) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 hover:border-cyan-400/50 rounded-lg p-4 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group"
            >
              {/* Certificate Badges */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs text-cyan-300 font-mono truncate">{cert.certificateId}</p>
                  <p className="text-white font-semibold text-sm mt-1">{cert.careerPath}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${getStatusColor(cert.interviewReadinessStatus)} border border-white/20`}>
                  {cert.interviewReadinessStatus === 'IN_PROGRESS' ? 'In Progress' : cert.interviewReadinessStatus}
                </div>
              </div>

              {/* Score */}
              <div className="mb-4">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-slate-400 text-xs">Overall Score</span>
                  <span className="text-2xl font-bold text-cyan-400">{cert.overallScore}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${cert.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-slate-500 mb-3 space-y-0.5">
                <p>Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                <p>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>
              </div>

              {/* Shared Count */}
              {cert.sharedWith.length > 0 && (
                <div className="mb-3 text-xs text-cyan-300 bg-cyan-500/10 rounded px-2 py-1 border border-cyan-500/20">
                  Shared with {cert.sharedWith.length} recruiter{cert.sharedWith.length !== 1 ? 's' : ''}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to={`/certificate/${cert.certificateId}`}
                  className="flex items-center justify-center gap-1 bg-slate-700/50 hover:bg-slate-600 text-white text-xs font-semibold py-1.5 rounded transition-all"
                  title="View"
                >
                  <Eye className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => downloadPDF(cert.certificateId)}
                  className="flex items-center justify-center gap-1 bg-slate-700/50 hover:bg-slate-600 text-white text-xs font-semibold py-1.5 rounded transition-all"
                  title="Download PDF"
                >
                  <Download className="w-3 h-3" />
                </button>
                <Link
                  to="/profile"
                  className="flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-600/50 to-blue-600/50 hover:from-cyan-600 hover:to-blue-600 text-white text-xs font-semibold py-1.5 rounded transition-all"
                  title="Share"
                >
                  <Share2 className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

async function downloadPDF(certificateId: string) {
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
}

export default DashboardCertificates;
