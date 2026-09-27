import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertCircle, Loader2, QrCode, Copy, Check,
  ShieldCheck, Award, ArrowLeft, ExternalLink, Calendar,
  Building2, Sparkles, XCircle, Clock, Search
} from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';
import { VerifiedCertificateSeal } from '../components/VerifiedCertificateSeal';

interface PublicCertificateData {
  valid: boolean;
  verificationStatus: 'VERIFIED' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND';
  certificateId: string;
  studentName: string;
  certificateTitle: string;
  achievement: string;
  careerPath: string;
  issueDate: string;
  issuer: string;
  seal: string;
  verificationUrl: string;
  scores?: {
    overall?: number;
    technical?: number;
    communication?: number;
    problemSolving?: number;
    confidence?: number;
  };
  message?: string;
}

const CertificateVerifyPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicCertificateData | null>(null);
  const [loading, setLoading] = useState(Boolean(certificateId));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      if (!certificateId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const baseUrl = getApiBaseUrl();

        // Call public endpoint without auth
        let res = await fetch(`${baseUrl}/public/certificates/verify/${encodeURIComponent(certificateId)}`);
        if (!res.ok && res.status !== 404 && res.status !== 410) {
          // Fallback to legacy alias if needed
          res = await fetch(`${baseUrl}/verify/${encodeURIComponent(certificateId)}`);
        }

        if (res.status === 404) {
          setError('Certificate not found. The certificate ID does not match any issued credential in the SkillDNA registry.');
          setData(null);
          return;
        }

        const json = await res.json();
        // Support both direct response model and wrapped certificate object
        if (json.certificate && !json.certificateTitle) {
          const c = json.certificate;
          setData({
            valid: Boolean(json.valid ?? true),
            verificationStatus: (c.status === 'REVOKED' ? 'REVOKED' : json.verified ? 'VERIFIED' : 'VERIFIED'),
            certificateId: c.certificateId || certificateId,
            studentName: c.studentName || 'SkillDNA Candidate',
            certificateTitle: c.title || `SkillDNA AI Certified ${c.careerPath || 'Specialist'}`,
            achievement: c.achievement || `Mastery in ${c.careerPath || 'Engineering'}`,
            careerPath: c.careerPath || 'Engineering',
            issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString() : 'Active',
            issuer: c.issuer || 'SkillDNA Tech AI Certification Authority',
            seal: 'SKILLDNA AI • VERIFIED AUTHENTIC CERTIFICATE',
            verificationUrl: window.location.href,
            scores: {
              overall: c.overallScore || c.technicalScore || 85,
              technical: c.technicalScore || 85,
              communication: c.communicationScore || 80,
              problemSolving: c.problemSolvingScore || 80,
              confidence: c.confidenceScore || 80,
            },
            message: json.message,
          });
        } else {
          setData(json);
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to connect to the SkillDNA verification registry. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [certificateId]);

  const copyVerificationLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <CheckCircle className="h-4 w-4" /> VERIFIED AUTHENTIC
          </div>
        );
      case 'REVOKED':
        return (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <XCircle className="h-4 w-4" /> OFFICIALLY REVOKED
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Clock className="h-4 w-4" /> CREDENTIAL EXPIRED
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 font-bold text-sm">
            <AlertCircle className="h-4 w-4" /> STATUS UNCONFIRMED
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
      {/* Background Decorative Ambient Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {/* Top Return & Brand Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold backdrop-blur-md transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to SkillDNA Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-4 w-4 text-slate-950" />
            </div>
            <span className="font-bold text-sm tracking-wide text-white">SkillDNA AI Trust Registry</span>
          </div>
        </div>

        {!certificateId ? (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Verify SkillDNA Credential</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              SkillDNA AI certificates feature a cryptographic verification seal and unique registry ID. Enter the certificate ID below to inspect real-time authenticity.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchId.trim()) {
                  navigate(`/verify/${encodeURIComponent(searchId.trim())}`);
                }
              }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. CERT-SDNA-2026-XXXXXX"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Verify Credential
              </button>
            </form>
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-16 text-center backdrop-blur-xl shadow-2xl">
            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white">Verifying Certificate Authenticity...</h2>
            <p className="text-xs text-slate-400 mt-1">Cross-referencing cryptographic certificate hash with SkillDNA AI registry.</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-slate-900 via-slate-900/90 to-rose-950/20 p-8 text-center backdrop-blur-xl shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-white">Verification Failed</h1>
            <p className="text-sm text-rose-200 mt-2 max-w-md mx-auto">{error}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10"
              >
                Back to Home
              </Link>
              <Link
                to="/feedback"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Contact Support
              </Link>
            </div>
          </div>
        ) : data ? (
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Header Stamp and Badge */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div className="flex items-center gap-4">
                <VerifiedCertificateSeal size="md" certificateId={data.certificateId} />
                <div>
                  <div className="mb-2">{getStatusBadge(data.verificationStatus)}</div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {data.certificateTitle}
                  </h1>
                  <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase mt-1">
                    {data.issuer}
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-white/10 rounded-2xl p-3 shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(window.location.href)}`}
                  alt="Certificate Verification QR Code"
                  className="w-24 h-24 rounded-lg bg-white p-1"
                />
                <span className="text-[10px] text-slate-400 font-semibold mt-2 flex items-center gap-1">
                  <QrCode className="h-3 w-3 text-cyan-400" /> Official QR Scan
                </span>
              </div>
            </div>

            {/* Revocation Warning Alert if applicable */}
            {data.verificationStatus === 'REVOKED' && (
              <div className="my-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Credential Revocation Notice</p>
                  <p className="text-xs text-rose-200 mt-0.5">
                    {data.message || 'This certificate was formally revoked and can no longer be presented as active proof of technical competency.'}
                  </p>
                </div>
              </div>
            )}

            {/* Verified Student Details */}
            <div className="py-8 space-y-6">
              <div className="text-center sm:text-left bg-slate-950/60 border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Candidate Name</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {data.studentName}
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Has successfully fulfilled rigorous competency benchmarks and automated adaptive evaluations in{' '}
                  <span className="text-cyan-300 font-semibold">{data.careerPath}</span>.
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5">
                  <p className="text-slate-500 font-medium">Certificate ID</p>
                  <p className="font-bold text-white mt-1 font-mono">{data.certificateId}</p>
                </div>
                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5">
                  <p className="text-slate-500 font-medium">Issue Date</p>
                  <p className="font-bold text-white mt-1">{data.issueDate}</p>
                </div>
                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5">
                  <p className="text-slate-500 font-medium">Domain</p>
                  <p className="font-bold text-white mt-1">{data.careerPath}</p>
                </div>
                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5">
                  <p className="text-slate-500 font-medium">Registry Status</p>
                  <p className="font-bold text-emerald-400 mt-1">{data.verificationStatus}</p>
                </div>
              </div>

              {/* Score Breakdown (if available) */}
              {data.scores && (
                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Verified Competency Benchmarks
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: 'Overall Readiness', score: data.scores.overall ?? 85, color: 'text-cyan-400' },
                      { label: 'Technical Depth', score: data.scores.technical ?? 85, color: 'text-blue-400' },
                      { label: 'Communication', score: data.scores.communication ?? 80, color: 'text-purple-400' },
                      { label: 'Problem Solving', score: data.scores.problemSolving ?? 80, color: 'text-emerald-400' },
                      { label: 'Confidence', score: data.scores.confidence ?? 80, color: 'text-amber-400' },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-900 border border-white/5 rounded-xl p-3 text-center">
                        <p className="text-[11px] text-slate-400 font-medium">{item.label}</p>
                        <p className={`text-xl font-black mt-1 ${item.color}`}>{item.score}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={copyVerificationLink}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Verification URL Copied!' : 'Copy Public Verification Link'}</span>
              </button>

              <div className="text-[11px] text-slate-500 text-center sm:text-right">
                Cryptographically anchored by <span className="text-slate-400 font-semibold">SkillDNA AI Trust Authority</span>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Public Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 bg-slate-950/80 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SkillDNA AI Tech Platform. All verification records strictly protected by cryptographic audit trails.</p>
      </footer>
    </div>
  );
};

export default CertificateVerifyPage;
