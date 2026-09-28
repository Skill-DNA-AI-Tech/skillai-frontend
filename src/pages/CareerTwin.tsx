import {
  AlertCircle,
  BrainCircuit,
  BriefcaseBusiness,
  Clock,
  Lightbulb,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Target,
  TrendingUp,
  Compass,
  ExternalLink,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  Award,
  FolderKanban,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface WeaknessRemediation {
  concept: string;
  topic: string;
  domain: string;
  score: number;
  diagnostic: string;
  personalizedNotes?: string;
  youtubeResources?: Array<{ title: string; url: string; channel?: string }>;
  externalResources?: Array<{ title: string; url: string; platform?: string }>;
  examples?: string;
  practiceQuestions?: Array<{ question: string; answer: string }>;
  reassessmentAvailable?: boolean;
  resolved?: boolean;
  lastAssessedAt?: string;
}

interface InterviewHistoryItem {
  label: string;
  sessionId?: string;
  score: number;
  averageResponseTime: number;
  completedAt?: string;
}

interface JobReadinessItem {
  role: string;
  readiness: number;
  missing: string[];
  matchedStrengths: string[];
}

interface TaskItem {
  type: string;
  title: string;
  minutes: number;
}

interface DynamicInterview {
  currentDifficulty: string;
  nextDifficulty: string;
  followUpQuestion: string;
  personalizedQuestion: string;
  reason: string;
}

interface NextRecommendedSkill {
  skill: string;
  priority: string;
  whyRecommended: string;
  prerequisites: string[];
  currentLevel: string;
  targetLevel: string;
  actionUrl: string;
}

interface NextBestAction {
  title: string;
  reason: string;
  actionType: string;
  actionLabel: string;
  actionUrl: string;
  estimatedMinutes: number;
  topic?: string;
}

interface PipelineStep {
  step: number;
  key: string;
  label: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ACTIVE' | 'PENDING' | 'NEXT';
  detail: string;
  actionUrl?: string;
}

interface PracticalProject {
  title: string;
  description: string;
  deliverable: string;
}

interface SkillTier {
  title: string;
  skills: string[];
  status: string;
}

interface SkillEngineTiers {
  beginner: SkillTier;
  intermediate: SkillTier;
  advanced: SkillTier;
}

interface CareerTwinMemory {
  overallScore: number;
  technicalScore: number;
  strengths: string[];
  weaknesses: string[];
  confidence: number;
  communicationQuality: number;
  responseTime: number;
  discipline?: string;
  careerDomain?: string;
  targetRole?: string;
  interviewHistory: InterviewHistoryItem[];
  jobReadiness: JobReadinessItem[];
  dailyTasks: TaskItem[];
  improvementTimeline: {
    items: InterviewHistoryItem[];
    improvement: number;
  };
  mentorSuggestions: string[];
  skillGaps: string[];
  recommendations: TaskItem[];
  weaknessRemediations?: WeaknessRemediation[];
  dynamicInterview?: DynamicInterview;
  nextRecommendedSkill?: NextRecommendedSkill;
  nextBestAction?: NextBestAction;
  structuredPipeline?: PipelineStep[];
  practicalProject?: PracticalProject;
  skillEngineTiers?: SkillEngineTiers;
  generatedAt?: string;
}

const CareerTwin = () => {
  const { token } = useAuth();
  const [memory, setMemory] = useState<CareerTwinMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemory = async () => {
    if (!token) {
      setLoading(false);
      setError('Sign in as a student to view your AI Career Twin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<CareerTwinMemory>('/career-twin/me', { token });
      setMemory(data);
    } catch {
      try {
        const generated = await apiRequest<CareerTwinMemory>('/career-twin/me/refresh', {
          method: 'POST',
          body: JSON.stringify({}),
          token,
        });
        setMemory(generated);
      } catch (refreshError: any) {
        setError(refreshError?.message || 'Unable to generate AI Career Twin memory.');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshMemory = async () => {
    if (!token) {
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const generated = await apiRequest<CareerTwinMemory>('/career-twin/me/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
        token,
      });
      setMemory(generated);
    } catch (refreshError: any) {
      setError(refreshError?.message || 'Unable to refresh AI Career Twin memory.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMemory();
  }, [token]);

  const timeline = memory?.improvementTimeline?.items?.length
    ? memory.improvementTimeline.items
    : memory?.interviewHistory ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="AI Career Twin"
        title="Personal interview coach that learns from every answer"
        description="Your Career Twin tracks interview history, readiness, skill gaps, daily tasks, and adaptive follow-up questions from live performance data."
        action={
          <button
            type="button"
            onClick={refreshMemory}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Twin
          </button>
        }
      />

      {loading && (
        <div className="mt-10 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/70 p-5 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          Building your AI memory from profile and interview history...
        </div>
      )}

      {error && !loading && (
        <div className="mt-10 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-5 text-red-100">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
          <div>
            <p className="font-semibold">Career Twin is not ready</p>
            <p className="mt-1 text-sm text-red-100/80">{error}</p>
          </div>
        </div>
      )}

      {memory && !loading && (
        <div className="mt-8 grid gap-8">
          {/* 1. NEXT RECOMMENDED SKILL SPOTLIGHT BANNER */}
          {(memory.nextRecommendedSkill || memory.weaknesses?.length > 0) && (
            <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-xs font-bold text-cyan-300">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      YOUR NEXT RECOMMENDED SKILL
                    </span>
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                      High Priority Gap
                    </span>
                    <span className="text-xs text-slate-400">
                      Target Role: <strong className="text-white">{memory.targetRole || memory.discipline || 'Professional'}</strong>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {memory.nextRecommendedSkill?.skill || memory.weaknesses[0]}
                  </h2>

                  <div className="rounded-xl border border-white/5 bg-slate-950/50 p-4">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Why you should learn this now
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {memory.nextRecommendedSkill?.whyRecommended ||
                        `Direct prerequisite for your target role in ${memory.discipline || 'your career'}. 85% of employers benchmark this competency before selection. Mastering this bridges your evaluated skill gap.`}
                    </p>
                  </div>

                  {/* Prerequisites & Progression Level */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-cyan-400" />
                      <span>Progression: <strong className="text-slate-200">{memory.nextRecommendedSkill?.currentLevel || 'Beginner'} → {memory.nextRecommendedSkill?.targetLevel || 'Advanced'}</strong></span>
                    </div>
                    {memory.nextRecommendedSkill?.prerequisites && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Prerequisites: <strong className="text-slate-200">{memory.nextRecommendedSkill.prerequisites.join(', ')}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Navigation */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      const topic = memory.nextRecommendedSkill?.skill || memory.weaknesses[0];
                      window.location.href = `/learning?topic=${encodeURIComponent(topic)}`;
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
                  >
                    <BookOpen className="h-4 w-4" />
                    Study Topic Notes
                  </button>

                  <button
                    onClick={() => {
                      const topic = memory.nextRecommendedSkill?.skill || memory.weaknesses[0];
                      window.location.href = `/learning?tab=mcq&topic=${encodeURIComponent(topic)}`;
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-700 active:scale-95"
                  >
                    <Target className="h-4 w-4 text-cyan-400" />
                    Take Practice Quiz
                  </button>

                  <button
                    onClick={() => {
                      window.location.href = '/interview';
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-6 py-2.5 text-xs font-bold text-violet-300 transition-all hover:bg-violet-500/20 active:scale-95"
                  >
                    <BriefcaseBusiness className="h-3.5 w-3.5 text-violet-400" />
                    Simulate AI Interview
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 2. CAREER PROGRESSION PIPELINE (12 Sequential Milestones) */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Structured Career Progression Pipeline</h3>
                  <p className="text-xs text-slate-400">Sequential roadmap: from current standing to validated job placement readiness</p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                Discipline: {memory.discipline || memory.careerDomain || 'General'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pt-1">
              {(memory.structuredPipeline || [
                { step: 1, label: '1. Current Position Verified', status: 'COMPLETED', detail: `${memory.overallScore}% composite readiness.` },
                { step: 2, label: '2. Target Career Identified', status: 'COMPLETED', detail: `Target: ${memory.targetRole || 'Professional'}.` },
                { step: 3, label: '3. Required Skills Cataloged', status: 'COMPLETED', detail: 'Curriculum topics mapped.' },
                { step: 4, label: '4. Current Skills Verified', status: 'COMPLETED', detail: `${memory.strengths.length} verified competencies.` },
                { step: 5, label: '5. Real Skill Gaps Calculated', status: 'IN_PROGRESS', detail: `${memory.weaknesses.length} critical gaps identified.` },
                { step: 6, label: `6. Priority Skill: ${memory.weaknesses[0] || 'Core'}`, status: 'IN_PROGRESS', detail: 'Recommended to learn first.' },
                { step: 7, label: '7. Structured Learning Path', status: 'ACTIVE', detail: 'Detailed notes and study guide.', actionUrl: '/learning' },
                { step: 8, label: '8. Concept Practice & MCQ', status: 'PENDING', detail: '5-question diagnostic quiz.', actionUrl: '/learning' },
                { step: 9, label: '9. Skill Assessment', status: 'PENDING', detail: 'Score >= 70% to update Skill DNA.', actionUrl: '/learning' },
                { step: 10, label: '10. Practical Project Work', status: 'PENDING', detail: memory.practicalProject?.title || 'Hands-on domain deliverable.' },
                { step: 11, label: '11. AI Interview Simulation', status: 'PENDING', detail: 'Targeted panel interview prep.', actionUrl: '/interview' },
                { step: 12, label: '12. Skill DNA Update', status: 'PENDING', detail: 'Verified mastery recorded on credential.' },
              ]).map((st) => (
                <div
                  key={st.step}
                  onClick={() => {
                    if (st.actionUrl) window.location.href = st.actionUrl;
                  }}
                  className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    st.status === 'COMPLETED'
                      ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30'
                      : st.status === 'ACTIVE' || st.status === 'IN_PROGRESS'
                      ? 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                      : 'border-white/5 bg-slate-950/40 opacity-75'
                  } ${st.actionUrl ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white line-clamp-1">{st.label}</span>
                      {st.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : st.status === 'ACTIVE' || st.status === 'IN_PROGRESS' ? (
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">#{st.step}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{st.detail}</p>
                  </div>
                  {st.actionUrl && (
                    <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-cyan-400">
                      <span>Take Action</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. PRACTICAL PROJECT WORK & SKILL TIERS */}
          {memory.practicalProject && (
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Recommended Practical Project</h3>
                    <p className="text-xs text-slate-400">Hands-on milestone tailored to {memory.discipline || 'your career'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-violet-500/20 bg-slate-950/60 p-5 space-y-3">
                  <h4 className="text-sm font-bold text-violet-300">{memory.practicalProject.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{memory.practicalProject.description}</p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <strong className="text-slate-200">Required Deliverable:</strong> {memory.practicalProject.deliverable}
                  </div>
                </div>
              </div>

              {/* Skill Engine Tiers */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Skill Engine Prerequisites & Tiers</h3>
                    <p className="text-xs text-slate-400">Progressive difficulty: Foundation → Core Practitioner → Advanced</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-xl border border-emerald-500/20 bg-slate-950/40 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-300">Tier 1: Foundational Principles</p>
                      <p className="text-[11px] text-slate-400">Terminology, definitions, statutory frameworks</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {memory.overallScore >= 70 ? 'Mastered' : 'In Progress'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-slate-950/40 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-cyan-300">Tier 2: Core Practitioner Workflow</p>
                      <p className="text-[11px] text-slate-400">Differential diagnostics, trade-off optimization, execution</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      In Progress
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-300">Tier 3: Advanced Architecture & Leadership</p>
                      <p className="text-[11px] text-slate-400">Systemic reliability, failure modes, executive communication</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      {memory.overallScore >= 85 ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Overall readiness" value={memory.overallScore} suffix="%" progress={memory.overallScore} tone="bg-cyan-400" icon={BrainCircuit} />
            <MetricCard label="Technical depth" value={memory.technicalScore} suffix="%" progress={memory.technicalScore} tone="bg-violet-400" icon={Target} />
            <MetricCard label="Communication" value={memory.communicationQuality} suffix="%" progress={memory.communicationQuality} tone="bg-emerald-400" icon={MessageSquareText} />
            <MetricCard label="Avg response time" value={memory.responseTime || 0} suffix="s" progress={Math.max(0, 100 - (memory.responseTime || 0) / 2)} tone="bg-amber-400" icon={Clock} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Improvement timeline</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {memory.improvementTimeline?.improvement >= 0 ? '+' : ''}
                    {memory.improvementTimeline?.improvement ?? 0} points across recorded interviews.
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline}>
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">Adaptive interview prompt</h3>
              <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
                <p className="text-sm font-semibold text-cyan-200">Next question</p>
                <p className="mt-2 text-slate-100">{memory.dynamicInterview?.personalizedQuestion || 'Refresh your Career Twin to generate a question.'}</p>
              </div>
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 p-4">
                <p className="text-sm font-semibold text-violet-200">Follow-up</p>
                <p className="mt-2 text-slate-100">{memory.dynamicInterview?.followUpQuestion || 'No follow-up generated yet.'}</p>
              </div>
              <p className="mt-4 text-sm text-slate-400">{memory.dynamicInterview?.reason}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    window.location.href = '/interview';
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                >
                  Start Practice Interview
                </button>
              </div>
            </div>
          </section>

          {/* TARGETED WEAKNESS REMEDIATION SECTION (SCORE < 75%) */}
          {memory.weaknessRemediations && memory.weaknessRemediations.length > 0 && (
            <section className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-amber-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Targeted Weakness Remediation (Score &lt; 75%)</h3>
                    <p className="text-xs text-slate-400">Continuous learning loop: Diagnosed weak points requiring practice and reassessment</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                  {memory.weaknessRemediations.filter(r => !r.resolved).length} Pending Reassessments
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {memory.weaknessRemediations.map((rem, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm">{rem.concept}</span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${rem.resolved ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                          {rem.resolved ? 'Mastered (>= 75%)' : `Score: ${rem.score}%`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{rem.diagnostic}</p>

                      {rem.personalizedNotes && (
                        <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono whitespace-pre-line">
                          {rem.personalizedNotes}
                        </div>
                      )}

                      {rem.youtubeResources && rem.youtubeResources.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video Tutorials:</p>
                          {rem.youtubeResources.map((yt, yIdx) => (
                            <a key={yIdx} href={yt.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs text-cyan-400 hover:text-cyan-300 bg-slate-900/40 p-2 rounded border border-slate-800/80">
                              <span className="truncate">{yt.title}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => {
                          window.location.href = `/learning`;
                        }}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1.5 shadow-md"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Take Topic Reassessment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="font-semibold text-white">Strength memory</h3>
              <div className="mt-4 grid gap-2">
                {memory.strengths.map((item) => (
                  <span key={item} className="rounded bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">{item}</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="font-semibold text-white">Skill gaps</h3>
              <div className="mt-4 grid gap-3">
                {(memory.skillGaps.length ? memory.skillGaps : memory.weaknesses).map((item) => (
                  <div key={item}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-200">{item}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={Math.max(20, 100 - memory.overallScore)} tone="bg-amber-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="font-semibold text-white">Mentor suggestions</h3>
              <div className="mt-4 grid gap-3">
                {memory.mentorSuggestions.map((item) => (
                  <div key={item} className="flex gap-3 rounded bg-white/[0.04] p-3 text-sm text-slate-200">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="font-semibold text-white">Today&apos;s personalized tasks</h3>
              <div className="mt-4 grid gap-3">
                {memory.dailyTasks.map((task) => (
                  <div key={`${task.type}-${task.title}`} className="flex items-center justify-between gap-4 rounded bg-white/[0.04] p-4">
                    <div>
                      <p className="font-medium text-slate-100">{task.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-cyan-300">{task.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-slate-950 px-3 py-1 text-sm text-slate-300">{task.minutes} min</span>
                      {task.type === 'technical' ? (
                        <button
                          onClick={() => {
                            const titleLower = task.title.toLowerCase();
                            let topic = 'General';
                            if (titleLower.includes('on ')) {
                              topic = task.title.split(/on /i)[1] || 'General';
                            } else if (titleLower.includes('about ')) {
                              topic = task.title.split(/about /i)[1] || 'General';
                            }
                            window.location.href = `/interview/dynamic?topic=${encodeURIComponent(topic)}`;
                          }}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded transition active:scale-95"
                        >
                          Start
                        </button>
                      ) : task.type === 'interview' ? (
                        <button
                          onClick={() => {
                            window.location.href = '/interview';
                          }}
                          className="bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold px-3 py-1.5 rounded transition active:scale-95"
                        >
                          Start
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-900/60 p-6">
              <h3 className="font-semibold text-white">Job readiness</h3>
              <div className="mt-4 grid gap-4">
                {memory.jobReadiness.map((job) => (
                  <div key={job.role} className="rounded bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <BriefcaseBusiness className="h-4 w-4 text-cyan-300" />
                        <p className="font-medium text-slate-100">{job.role}</p>
                      </div>
                      <span className="font-semibold text-cyan-200">{job.readiness}%</span>
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={job.readiness} tone="bg-cyan-400" />
                    </div>
                    {job.missing.length > 0 && (
                      <p className="mt-3 text-sm text-slate-400">Missing: {job.missing.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default CareerTwin;
