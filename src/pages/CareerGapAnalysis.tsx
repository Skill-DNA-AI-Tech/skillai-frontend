import { AlertCircle, ArrowRight, CheckCircle2, ClipboardCheck, Loader2, Search, Target, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type Career = { id: string; category: string; title: string; description: string; competencies: string[] };
type Competency = { competency: string; classification: string; score: number | null; evidence: string };
type Analysis = { analysisId?: string; createdAt?: string; targetCareer: Career; competencies: Competency[]; readinessScore: number | null; readinessMethod: string; roadmap: Array<{ competency: string; why: string; activity: string; priority: string; completionCriterion: string; learningPath: string }>; nextAction: { activity: string; priority: string } };

const statusStyles: Record<string, string> = {
  STRONG: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PARTIALLY_DEVELOPED: 'border-amber-200 bg-amber-50 text-amber-700',
  MISSING: 'border-rose-200 bg-rose-50 text-rose-700',
  NOT_ASSESSED: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function CareerGapAnalysis() {
  const { token } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [targetCareer, setTargetCareer] = useState('');
  const [search, setSearch] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiRequest<{ careers: Career[] }>('/career-gap/catalog', { token }),
      apiRequest<{ analysis: Analysis | null }>('/career-gap/me', { token }),
    ]).then(([catalog, saved]) => {
      setCareers(catalog.careers || []);
      setAnalysis(saved.analysis);
      setTargetCareer(saved.analysis?.targetCareer?.id || catalog.careers?.[0]?.id || '');
    }).catch((err: any) => setError(err.message || 'Unable to load career gap analysis.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredCareers = useMemo(() => careers.filter((career) => `${career.title} ${career.category}`.toLowerCase().includes(search.toLowerCase())), [careers, search]);
  const selectedCareer = careers.find((career) => career.id === targetCareer);

  const runAnalysis = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !targetCareer) return;
    setSubmitting(true); setError(null);
    try {
      const result = await apiRequest<Analysis>('/career-gap/analyze', { method: 'POST', token, body: JSON.stringify({ targetCareer, currentSkills: currentSkills.split(',').map((skill) => skill.trim()).filter(Boolean), experienceSummary: experienceSummary.trim() || undefined, targetLevel: targetLevel || undefined }) });
      setAnalysis(result);
    } catch (err: any) { setError(err.message || 'Could not create the analysis.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>;

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
    <SectionHeader eyebrow="Career planning" title="Career Gap Analysis" description="Compare your available evidence with the competencies for a target role. Unassessed skills stay unassessed—nothing is guessed or treated as a hiring guarantee." />
    {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}
    <form onSubmit={runAnalysis} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Target className="h-4 w-4 text-cyan-600" />Choose a target career</div>
        <label className="relative block"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input aria-label="Search careers" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by career or category" className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm" /></label>
        <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {filteredCareers.map((career) => <button type="button" key={career.id} onClick={() => setTargetCareer(career.id)} className={`rounded-lg border p-3 text-left transition ${targetCareer === career.id ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500' : 'border-slate-200 hover:border-cyan-300'}`}><span className="block text-sm font-semibold text-slate-900">{career.title}</span><span className="mt-1 block text-xs text-slate-500">{career.category}</span></button>)}
        </div>
        {selectedCareer && <p className="mt-3 text-xs leading-5 text-slate-600">{selectedCareer.description}</p>}
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Current skills <span className="font-normal text-slate-400">(comma separated)</span><input value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} placeholder="e.g. SQL, research, Excel" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-slate-700">Experience or project evidence<textarea value={experienceSummary} onChange={(e) => setExperienceSummary(e.target.value)} rows={3} placeholder="Describe projects, work, volunteering, or qualifications" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <label className="block text-sm font-medium text-slate-700">Target level<select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">Not specified</option><option>Entry level</option><option>Intermediate</option><option>Advanced</option></select></label>
        <button disabled={submitting || !targetCareer} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />} {submitting ? 'Analysing evidence…' : 'Analyse my gap'}</button>
      </div>
    </form>

    {analysis && <section className="space-y-5" aria-live="polite">
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target role</p><h2 className="mt-2 text-xl font-bold text-slate-900">{analysis.targetCareer.title}</h2><p className="mt-1 text-sm text-slate-600">{analysis.targetCareer.category}</p><div className="mt-6 flex items-end justify-between"><span className="text-sm font-medium text-slate-600">Evidence readiness</span><span className="text-2xl font-bold text-slate-900">{analysis.readinessScore == null ? 'Not enough evidence' : `${analysis.readinessScore}%`}</span></div>{analysis.readinessScore != null && <ProgressBar value={analysis.readinessScore} tone="bg-cyan-500" />}<p className="mt-3 text-xs leading-5 text-slate-500">{analysis.readinessMethod}</p></div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5"><div className="flex items-center gap-2 text-sm font-semibold text-cyan-900"><TrendingUp className="h-4 w-4" /> Next most useful action</div><p className="mt-3 text-lg font-semibold text-slate-900">{analysis.nextAction.activity}</p><span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-cyan-800">{analysis.nextAction.priority} priority</span></div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Competency evidence</h2><div className="mt-4 space-y-3">{analysis.competencies.map((item) => <div key={item.competency} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold text-slate-900">{item.competency}</span><span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusStyles[item.classification] || statusStyles.NOT_ASSESSED}`}>{item.classification.replace(/_/g, ' ')}</span></div><div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{item.evidence}</span><span>{item.score == null ? 'No score' : `${item.score}% evidence`}</span></div></div>)}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Personalized roadmap</h2><div className="mt-4 space-y-3">{analysis.roadmap.length ? analysis.roadmap.map((step) => <div key={step.competency} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-900">{step.competency}</h3><span className="text-xs font-semibold text-amber-700">{step.priority}</span></div><p className="mt-1 text-xs text-slate-600">{step.why}</p><p className="mt-2 text-sm text-slate-800">{step.activity}</p><p className="mt-2 text-xs text-slate-500">Done when: {step.completionCriterion}</p><Link to={step.learningPath} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900">Open in LearningHub <ArrowRight className="h-3.5 w-3.5" /></Link></div>) : <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mr-2 inline h-4 w-4" />All available competencies have strong evidence.</div>}</div></div>
      </div>
    </section>}
  </main>;
}
