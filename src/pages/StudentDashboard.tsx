import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, FileBadge, Loader2, Pencil, Target, Trophy, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type Profile = { name?: string; email?: string; college?: string; degree?: string; branch?: string; career?: string; activeSubject?: string; isProfileCompleted?: boolean; skillDNA?: Record<string, any>; skills?: string[] };
type Curriculum = { career: string; domain: string; activeSubject?: string; completionPercentage: number; masteredTopics: number; totalTopics: number; topics: Array<{ name: string; status: string; attempts: number }> };

const StudentDashboard = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [careerTwin, setCareerTwin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const [profileData, curriculumData, scorecardData, twinData] = await Promise.all([
        apiRequest<Profile>('/profiles/me', { token }),
        apiRequest<Curriculum>('/learning/active-curriculum', { token }),
        apiRequest<any>('/reports/me/scorecards', { token }).catch(() => null),
        apiRequest<any>('/career-twin/me', { token }).catch(() => null),
      ]);
      setProfile(profileData); setCurriculum(curriculumData); setScorecard(scorecardData); setCareerTwin(twinData);
    } catch (err: any) { setError(err.message || 'Dashboard data could not be loaded.'); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const dna = profile?.skillDNA || {};
  const metrics = [
    { label: 'SkillDNA', value: numberOrNull(dna.overallScore ?? dna.score), tone: 'bg-cyan-400' },
    { label: 'Technical', value: numberOrNull(dna.technicalScore), tone: 'bg-blue-400' },
    { label: 'Communication', value: numberOrNull(dna.communicationScore), tone: 'bg-emerald-400' },
    { label: 'Confidence', value: numberOrNull(dna.confidenceScore), tone: 'bg-amber-300' },
  ];
  const nextTopic = useMemo(() => curriculum?.topics.find((topic) => topic.status !== 'PASSED') || curriculum?.topics[0], [curriculum]);
  const latestScore = scorecard?.latest || scorecard?.sessions?.[0];

  if (loading) return <main className="grid min-h-[70vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-300" /></main>;
  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Student dashboard</p><h1 className="mt-2 text-3xl font-bold text-white">Good to see you, {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'learner'}.</h1><p className="mt-2 text-sm text-slate-400">A clear view of your curriculum, evidence, and next useful action.</p></div><div className="flex gap-2"><Link to="/profile" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400"><Pencil className="h-4 w-4" />Profile</Link><Link to="/learning" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950"><BookOpen className="h-4 w-4" />Learning Hub</Link></div></header>{error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
    {!profile?.isProfileCompleted && <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5"><div className="flex items-start gap-3"><UserRound className="mt-1 h-5 w-5 text-amber-300" /><div><h2 className="font-bold text-white">Finish your profile to personalize this dashboard</h2><p className="mt-1 text-sm text-slate-400">Add your education, experience, and target direction. Your curriculum track will remain governed by approval.</p><Link to="/profile" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">Complete profile <ArrowRight className="h-4 w-4" /></Link></div></div></section>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Metric key={metric.label} {...metric} />)}</section>
    <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]"><div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#10243c] to-[#0b1525] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Your current path</p><h2 className="mt-2 text-2xl font-bold text-white">{curriculum?.career || profile?.career || 'Curriculum not assigned'}</h2><p className="mt-2 text-sm text-slate-400">{curriculum?.domain || profile?.degree || 'Set up your profile to unlock curriculum details.'}</p></div><span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">Focus: {curriculum?.activeSubject || profile?.activeSubject || 'Choose a subject'}</span></div><div className="mt-7 flex items-end justify-between"><div><p className="text-sm text-slate-400">Curriculum completion</p><p className="mt-1 text-4xl font-bold text-white">{curriculum?.completionPercentage || 0}<span className="text-lg text-slate-500">%</span></p></div><p className="text-sm text-slate-400">{curriculum?.masteredTopics || 0}/{curriculum?.totalTopics || 0} topics mastered</p></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${curriculum?.completionPercentage || 0}%` }} /></div><Link to="/learning" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950">Continue {nextTopic ? nextTopic.name : 'learning'} <ArrowRight className="h-4 w-4" /></Link></div><div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"><div className="flex items-center gap-3"><Target className="h-5 w-5 text-amber-300" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Next best action</p><h2 className="mt-1 text-lg font-bold text-white">{careerTwin?.nextBestAction?.title || (nextTopic ? `Study ${nextTopic.name}` : 'Build your evidence')}</h2></div></div><p className="mt-4 text-sm leading-6 text-slate-400">{careerTwin?.nextBestAction?.reason || 'Open your Learning Hub, pick a subject, and complete one approved lesson or assessment.'}</p><Link to={careerTwin?.nextBestAction?.actionUrl || '/learning'} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">Take action <ArrowRight className="h-4 w-4" /></Link></div></section>
    <section className="grid gap-5 lg:grid-cols-[1fr_1fr]"><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center gap-3"><Activity className="h-5 w-5 text-cyan-300" /><div><h2 className="font-bold text-white">Evidence snapshot</h2><p className="mt-1 text-xs text-slate-500">Scores appear only when supported by saved assessments or interviews.</p></div></div><div className="mt-5 space-y-4">{metrics.map((metric) => <div key={metric.label}><div className="flex justify-between text-sm"><span className="text-slate-300">{metric.label}</span><span className="font-semibold text-white">{metric.value === null ? 'Not assessed' : `${metric.value}/100`}</span></div><div className="mt-2 h-2 rounded-full bg-slate-800"><div className={`h-full rounded-full ${metric.tone}`} style={{ width: `${metric.value || 0}%` }} /></div></div>)}</div></div><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><FileBadge className="h-5 w-5 text-emerald-300" /><div><h2 className="font-bold text-white">Latest assessment</h2><p className="mt-1 text-xs text-slate-500">Verified interview evidence</p></div></div><Link to="/scorecards" className="text-xs font-semibold text-cyan-300">View all</Link></div>{latestScore ? <div className="mt-6 grid grid-cols-2 gap-3"><Score label="Overall" value={latestScore.overallScore || latestScore.skillDNAScore} /><Score label="Technical" value={latestScore.technicalScore} /><Score label="Communication" value={latestScore.communicationScore} /><Score label="Confidence" value={latestScore.confidenceScore} /></div> : <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">Complete an interview or assessment to see a scorecard here.</div>}</div></section>
    <section className="grid gap-4 md:grid-cols-3"><QuickLink icon={<BookOpen />} title="Learning Hub" text="Study Java, DSA, SQL, Python, Node.js, and other curriculum subjects." href="/learning" /><QuickLink icon={<BriefcaseBusiness />} title="Career gaps" text="Compare your current evidence with your target career." href="/career-gap" /><QuickLink icon={<Trophy />} title="Certificates" text="Review verified outcomes when you have completed the required evidence." href="/certificates" /></section>
  </main>;
};
const numberOrNull = (value: any) => typeof value === 'number' && value > 0 ? Math.round(value) : null;
const Metric = ({ label, value, tone }: { label: string; value: number | null; tone: string }) => <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value === null ? '—' : value}<span className="text-sm text-slate-500">{value === null ? '' : '/100'}</span></p><div className="mt-4 h-1.5 rounded-full bg-slate-800"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value || 0}%` }} /></div></div>;
const Score = ({ label, value }: { label: string; value?: number }) => <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-cyan-300">{value || '—'}{value ? <span className="text-xs text-slate-500">/100</span> : null}</p></div>;
const QuickLink = ({ icon, title, text, href }: { icon: ReactNode; title: string; text: string; href: string }) => <Link to={href} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-cyan-500/50"><span className="text-cyan-300">{icon}</span><h3 className="mt-3 font-bold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">Open <ArrowRight className="h-3 w-3" /></span></Link>;
export default StudentDashboard;
