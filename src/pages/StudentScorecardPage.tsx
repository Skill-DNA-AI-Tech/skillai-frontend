import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Lightbulb, LineChart, ShieldCheck, Sparkles, Target } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { api, apiRequest } from '../lib/api';

type ScoreHistory = {
  label: string;
  reportId: string;
  createdAt: string;
  interviewScore: number;
  communicationScore: number;
  englishScore: number;
  confidenceScore: number;
  technicalScore: number;
  overallScore: number;
};

type Report = {
  _id: string;
  verificationId: string;
  createdAt: string;
  interviewScore: number;
  communicationScore: number;
  confidenceScore: number;
  technicalScore: number;
  skillDNAScore: number;
  strengths: string[];
  weaknesses: string[];
  aiRecommendationSummary?: string;
};

type ScorecardResponse = {
  latest: Report | null;
  history: ScoreHistory[];
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  pdfReportUrl: string;
};

const scoreItems = (latest: Report | null) => [
  { label: 'Interview Score', value: latest?.interviewScore ?? 0, icon: Target },
  { label: 'Communication Score', value: latest?.communicationScore ?? 0, icon: Sparkles },
  { label: 'English Score', value: latest?.communicationScore ?? 0, icon: LineChart },
  { label: 'Confidence Score', value: latest?.confidenceScore ?? 0, icon: ShieldCheck },
  { label: 'Technical Score', value: latest?.technicalScore ?? 0, icon: Lightbulb },
  { label: 'Overall Score', value: latest?.skillDNAScore ?? 0, icon: Target },
];

const StudentScorecardPage = () => {
  const [data, setData] = useState<ScorecardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ScorecardResponse>('/reports/me/scorecards')
      .then(setData)
      .catch((err) => setError(err?.message || 'Unable to load scorecards.'))
      .finally(() => setLoading(false));
  }, []);

  const latest = data?.latest ?? null;
  const history = useMemo(() => data?.history ?? [], [data]);

  const handleDownload = async () => {
    if (!data?.pdfReportUrl || !latest) return;

    setDownloading(true);
    setError(null);
    try {
      const { data: blob } = await api.get<Blob>(data.pdfReportUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${latest.verificationId || 'skilldna-scorecard'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'Unable to download scorecard report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Student Scorecards"
        title="Your interview score history"
        description="Review latest interview, communication, English, confidence, technical, and overall SkillDNA scores."
        action={
          <button
            onClick={handleDownload}
            disabled={!data?.pdfReportUrl || downloading}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
        }
      />

      {loading && <p className="mt-6 text-sm text-slate-400">Loading your scorecards...</p>}
      {error && <div className="mt-6 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}

      {!loading && !latest && (
        <section className="mt-10 rounded-lg border border-white/10 bg-slate-900/70 p-8 text-center">
          <LineChart className="mx-auto h-10 w-10 text-slate-500" />
          <h2 className="mt-4 text-xl font-bold text-white">No scorecards yet</h2>
          <p className="mt-2 text-sm text-slate-400">Complete a mock interview or generate a report to see your latest scores here.</p>
        </section>
      )}

      {latest && (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {scoreItems(latest).map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} suffix="%" progress={metric.value} icon={metric.icon} />
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <article className="rounded-lg border border-white/10 bg-slate-900/70 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white">Historical score trends</h2>
                <p className="mt-1 text-sm text-slate-400">Track how your core scores have changed across generated reports.</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="overallScore" name="Overall" stroke="#22d3ee" fill="#22d3ee33" strokeWidth={3} />
                    <Area type="monotone" dataKey="interviewScore" name="Interview" stroke="#a78bfa" fill="#a78bfa22" strokeWidth={2} />
                    <Area type="monotone" dataKey="technicalScore" name="Technical" stroke="#34d399" fill="#34d39922" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <aside className="grid gap-4">
              <article className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
                <h2 className="text-lg font-bold text-white">AI feedback</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{data?.feedback || 'Keep practicing interviews and strengthen your profile with role-specific projects.'}</p>
              </article>

              <article className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
                <h2 className="text-lg font-bold text-white">Strengths</h2>
                <div className="mt-4 grid gap-3">
                  {(data?.strengths?.length ? data.strengths : ['Consistent learning activity']).map((item) => (
                    <div key={item}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-300">{item}</span>
                        <span className="text-emerald-300">Strong</span>
                      </div>
                      <ProgressBar value={84} tone="bg-emerald-400" />
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
                <h2 className="text-lg font-bold text-white">Improvement suggestions</h2>
                <div className="mt-4 grid gap-2">
                  {(data?.weaknesses?.length ? data.weaknesses : ['Practice structured interview answers']).map((item) => (
                    <p key={item} className="rounded-md border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">{item}</p>
                  ))}
                </div>
              </article>
            </aside>
          </section>
        </>
      )}
    </main>
  );
};

export default StudentScorecardPage;
