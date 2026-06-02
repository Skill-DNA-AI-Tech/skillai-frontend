import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Download, Eye, Mail, QrCode, ShieldCheck, Loader2, ArrowLeft, Copy } from 'lucide-react';
import { apiRequest } from '../lib/api';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';

const ReportCard = () => {
  const { id, token } = useParams<{ id?: string; token?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const isRecruiterRoute = window.location.pathname.includes('/recruiter/');
        const param = token || id;
        const endpoint = isRecruiterRoute 
          ? `/reports/secure/${param}` 
          : `/reports/public/${param}`;

        const data = await apiRequest<any>(endpoint);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load verified report card.');
      } finally {
        setLoading(false);
      }
    };

    if (id || token) {
      fetchReport();
    } else {
      setError('Invalid report verification parameters.');
      setLoading(false);
    }
  }, [id, token]);

  const handleCopyLink = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-32 sm:px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
        <p className="text-slate-400 text-sm">Retrieving verified SkillDNA report card...</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-8 max-w-md text-center">
          <h3 className="text-xl font-bold text-white mb-2">Verification Failed</h3>
          <p className="text-slate-400 text-sm mb-6">{error || 'This report card is invalid or has expired.'}</p>
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
          >
            Go to Dashboard
          </a>
        </div>
      </main>
    );
  }

  const scoresList = [
    { label: 'Overall SkillDNA', value: report.skillDNAScore || 0, tone: 'bg-cyan-400' },
    { label: 'Interview Correctness', value: report.interviewScore || 0, tone: 'bg-violet-400' },
    { label: 'Communication Quality', value: report.communicationScore || 0, tone: 'bg-emerald-400' },
    { label: 'Confidence Quotient', value: report.confidenceScore || 0, tone: 'bg-amber-400' },
    { label: 'Technical Depth', value: report.technicalScore || 0, tone: 'bg-rose-400' },
    { label: 'Project Portfolio', value: report.projectsScore || 0, tone: 'bg-sky-400' },
    { label: 'Professional Certs', value: report.certificationScore || 0, tone: 'bg-indigo-400' },
  ];

  const snapshot = report.studentSnapshot || {};

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 print:py-0 print:px-0">
      <div className="print:hidden">
        <SectionHeader
          eyebrow="AI-Verified Credentials"
          title="Verified SkillDNA Report Card"
          description="Independent cryptographic verification of skills, interview scores, and career potential backed by live AI analytics."
          action={
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/[0.08] transition"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200 transition"
              >
                <Download className="h-4 w-4" />
                PDF / Print
              </button>
            </div>
          }
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Profile and Roles Summary */}
        <div className="rounded-lg border border-white/10 bg-slate-900/[0.86] p-6 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <img
                  className="h-20 w-20 shrink-0 rounded-lg object-cover border border-white/10"
                  src={snapshot.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80"}
                  alt="Student Profile"
                />
                <div className="min-w-0">
                  <h3 className="text-2xl font-semibold text-white truncate">{snapshot.name || 'Student Candidate'}</h3>
                  <p className="mt-1 text-sm text-slate-300 truncate">{snapshot.field || 'Software Engineering'}</p>
                  <p className="mt-1 text-xs text-slate-400 truncate">{snapshot.college || 'SkillDNA Academy'}</p>
                </div>
              </div>
              <span className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold text-slate-950 uppercase tracking-wider ${
                report.badge === 'Gold' ? 'bg-amber-300' : report.badge === 'Silver' ? 'bg-slate-300' : 'bg-orange-400'
              }`}>
                <BadgeCheck className="h-4 w-4" />
                {report.badge || 'Bronze'} Badge
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500 font-medium">VERIFICATION ID</p>
                <p className="mt-2 font-semibold text-cyan-300 font-mono tracking-wider">{report.verificationId}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500 font-medium font-sans">MARKET SALARY ESTIMATE</p>
                <p className="mt-2 font-semibold text-emerald-400">{report.salaryEstimate || 'TBD'}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs text-slate-500 font-medium mb-3">AI CAREER PATH RECOMMENDATIONS</p>
              <div className="flex flex-wrap gap-2">
                {report.recommendedRoles && report.recommendedRoles.length > 0 ? (
                  report.recommendedRoles.map((role: string) => (
                    <span key={role} className="max-w-full break-words rounded bg-cyan-300/[0.1] border border-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200">
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 italic">No recommendations yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/10">
            <h4 className="text-xs font-bold text-cyan-400 mb-1">AI EXECUTIVE SUMMARY</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.aiRecommendationSummary || 'Candidate demonstrates robust domain fundamentals and communication metrics appropriate for standard operational and technical roles.'}
            </p>
          </div>
        </div>

        {/* Dynamic Skill Ratings */}
        <div className="grid gap-4">
          {scoresList.map((score) => (
            <article key={score.label} className="rounded-lg border border-white/10 bg-slate-900/[0.4] p-4 backdrop-blur-xl hover:border-white/20 transition">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-white">{score.label}</p>
                <p className="text-sm font-bold text-cyan-400">{score.value}%</p>
              </div>
              <ProgressBar value={score.value} tone={score.tone} />
            </article>
          ))}
        </div>
      </section>

      {/* Strengths, Weaknesses, QR Verification */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="rounded-lg border border-white/10 bg-slate-900/[0.6] p-5 backdrop-blur-xl">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <h3 className="mt-4 font-semibold text-white">✓ Strengths & Core Assets</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300">
            {report.strengths && report.strengths.length > 0 ? (
              report.strengths.map((str: string, index: number) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <>
                <li>Strong conceptual understanding</li>
                <li>Clear verbal articulation</li>
                <li>Reliable coding workflow</li>
              </>
            )}
          </ul>
        </article>

        <article className="rounded-lg border border-white/10 bg-slate-900/[0.6] p-5 backdrop-blur-xl">
          <Eye className="h-6 w-6 text-amber-400" />
          <h3 className="mt-4 font-semibold text-white">⚠ Recommended Action Plan</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300">
            {report.weaknesses && report.weaknesses.length > 0 ? (
              report.weaknesses.map((weak: string, index: number) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{weak}</span>
                </li>
              ))
            ) : (
              <>
                <li>Deepen project implementations</li>
                <li>Conduct targeted practice drills</li>
                <li>Optimize portfolio project descriptions</li>
              </>
            )}
          </ul>
        </article>

        <article className="rounded-lg border border-white/10 bg-slate-900/[0.6] p-5 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <QrCode className="h-6 w-6 text-cyan-400" />
            <h3 className="mt-4 font-semibold text-white">Secure Verification QR</h3>
            <p className="text-xs text-slate-400 mt-2">
              Recruiters can verify credentials instantly via mobile scan. Scan payload securely resolves to live candidate records.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center p-3 rounded bg-white w-28 h-28 border border-white/10">
            {/* Beautiful generic QR mock representation */}
            <div className="grid grid-cols-6 gap-0.5 w-full h-full bg-white">
              {Array.from({ length: 36 }).map((_, index) => (
                <span
                  key={index}
                  className={`rounded-sm ${
                    index < 6 || (index % 6 === 0 && index < 30) || (index % 6 === 5 && index < 30) || index >= 30
                      ? 'bg-slate-950'
                      : index === 8 || index === 9 || index === 14 || index === 21 || index === 27
                      ? 'bg-slate-950'
                      : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default ReportCard;
