import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { api } from '../lib/api';

interface VerificationData {
  message: string;
  certificate: {
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
    interviewReadinessStatus: string;
    strengths: string[];
    improvements: string[];
  };
  verified: boolean;
}

const CertificateVerifyPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/certificates/verify/${certificateId}`);
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to verify certificate');
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {error ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-red-500/30 shadow-2xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <h1 className="text-3xl font-bold text-white">Verification Failed</h1>
            </div>
            <p className="text-red-200 text-lg mb-6">{error}</p>
            <p className="text-slate-400">Please check the certificate ID and try again, or contact the certificate issuer.</p>
          </div>
        ) : data ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 shadow-2xl overflow-hidden">
            {/* Verification Status Header */}
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h1 className="text-3xl font-bold text-white">Certificate Verified</h1>
              </div>
              <p className="text-green-300">This certificate is authentic and currently valid</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Student Info */}
              <div className="bg-slate-700/30 border border-cyan-500/20 rounded-lg p-6 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{data.certificate.studentName}</h2>
                <p className="text-slate-300">{data.certificate.email}</p>
                <p className="text-cyan-400 font-semibold mt-2">{data.certificate.careerPath}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Overall Score', value: data.certificate.overallScore, unit: '/100' },
                  { label: 'Technical', value: data.certificate.technicalScore, unit: '/100' },
                  { label: 'Communication', value: data.certificate.communicationScore, unit: '/100' },
                  { label: 'Problem Solving', value: data.certificate.problemSolvingScore, unit: '/100' },
                  { label: 'Confidence', value: data.certificate.confidenceScore, unit: '/100' },
                  { label: 'Sessions', value: data.certificate.sessionsCompleted, unit: '' },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-700/50 rounded-lg p-4 text-center border border-cyan-500/20">
                    <p className="text-slate-400 text-sm mb-2">{item.label}</p>
                    <p className="text-2xl font-bold text-cyan-400">{item.value}{item.unit}</p>
                  </div>
                ))}
              </div>

              {/* Readiness Status */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-2">Interview Readiness</p>
                <p className="text-xl font-bold text-blue-400">
                  {data.certificate.interviewReadinessStatus.replace('_', ' ')}
                </p>
              </div>

              {/* Strengths */}
              {data.certificate.strengths.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-300 font-semibold mb-3">AI-Identified Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {data.certificate.strengths.map((strength, idx) => (
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
              {data.certificate.improvements.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 font-semibold mb-3">Recommended Areas for Growth</p>
                  <div className="flex flex-wrap gap-2">
                    {data.certificate.improvements.map((improvement, idx) => (
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

              {/* Certificate Metadata */}
              <div className="bg-slate-700/30 border border-cyan-500/20 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Certificate ID:</span>
                  <span className="text-cyan-300 font-mono text-xs">{data.certificate.certificateId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issued:</span>
                  <span className="text-slate-300">{new Date(data.certificate.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expires:</span>
                  <span className="text-slate-300">{new Date(data.certificate.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Verification Notice */}
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-center text-slate-400">
                <p className="text-sm">
                  This certificate was issued by SkillDNA AI and can be verified on our platform. The information presented above is authentic and has been verified by our system.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CertificateVerifyPage;
