import { 
  FileText, Layers3, ListChecks, UploadCloud, Sparkles, Loader2, 
  CheckCircle2, XCircle, AlertTriangle, Award, BookOpen, 
  MessageSquare, Send, ChevronRight, ChevronDown, RotateCcw, 
  Check, ExternalLink, HelpCircle, ArrowRight
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import { contentTypes, domains } from '../data/platform';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type TabType = 'mcq' | 'notes' | 'curriculum';

const DOMAIN_OPTIONS = [
  { domain: 'Computer Science & IT', defaultTopic: 'Full Stack Development', roles: ['Frontend', 'Backend', 'Cloud & DevOps', 'Data Structures'] },
  { domain: 'Mechanical Engineering', defaultTopic: 'Mechanical Design & CAD', roles: ['CAD & GD&T', 'Thermal Systems', 'Manufacturing Quality', 'FEA Analysis'] },
  { domain: 'Civil Engineering', defaultTopic: 'Structural Analysis & Design', roles: ['Structural Design', 'Site Execution', 'BIM Modeling', 'Geotechnical'] },
  { domain: 'Electronics Engineering', defaultTopic: 'Embedded Systems & IoT', roles: ['Embedded C', 'PCB Design', 'Digital Electronics', 'VLSI Design'] },
  { domain: 'Commerce & Finance', defaultTopic: 'Financial Accounting & Taxation', roles: ['GST & Taxation', 'Corporate Finance', 'Audit & Compliance', 'Financial Modeling'] },
  { domain: 'Management & Marketing', defaultTopic: 'Operations & Project Management', roles: ['Project Management', 'Business Analysis', 'Digital Marketing', 'HR Operations'] },
];

const LearningHub = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('mcq');

  // --- 1. MCQ ASSESSMENT STATE ---
  const [mcqDomain, setMcqDomain] = useState(DOMAIN_OPTIONS[0].domain);
  const [mcqTopic, setMcqTopic] = useState(DOMAIN_OPTIONS[0].defaultTopic);
  const [mcqCount, setMcqCount] = useState(10);
  const [mcqMode, setMcqMode] = useState<'setup' | 'active' | 'result'>('setup');
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqSessionId, setMcqSessionId] = useState<string | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [mcqActiveIndex, setMcqActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [mcqResult, setMcqResult] = useState<any>(null);
  const [submittingMcq, setSubmittingMcq] = useState(false);
  const [claimedCert, setClaimedCert] = useState<any>(null);
  const [claimingCert, setClaimingCert] = useState(false);

  // --- 2. PERSONALIZED NOTES STATE ---
  const [notesDomain, setNotesDomain] = useState(DOMAIN_OPTIONS[0].domain);
  const [notesTopic, setNotesTopic] = useState(DOMAIN_OPTIONS[0].defaultTopic);
  const [notesLevel, setNotesLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [notesLoading, setNotesLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<any>(null);

  // --- 3. CURRICULUM STATE ---
  const [subject, setSubject] = useState('Computer Science');
  const [currTopic, setCurrTopic] = useState('System Design & Microservices');
  const [isGeneratingCurr, setIsGeneratingCurr] = useState(false);
  const [dynamicLessons, setDynamicLessons] = useState<any[]>([]);

  // --- 4. QUICK CHATBOT STATE ---
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Hello! I am your SkillDNA AI Tutor. Ask me any conceptual question or paste a problem you want explained.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatbotOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatbotOpen]);

  // --- MCQ HANDLERS ---
  const handleStartMcq = async () => {
    setMcqLoading(true);
    try {
      const data = await apiRequest<any>('/mcq/start', {
        method: 'POST',
        body: JSON.stringify({
          careerDomain: mcqDomain,
          topic: mcqTopic,
          questionCount: mcqCount,
        }),
        token,
      });

      setMcqSessionId(data.sessionId);
      setMcqQuestions(data.questions || []);
      setMcqActiveIndex(0);
      setSelectedAnswers({});
      setMcqResult(null);
      setClaimedCert(null);
      setMcqMode('active');
    } catch (err: any) {
      alert('Failed to start MCQ assessment: ' + err.message);
    } finally {
      setMcqLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitMcq = async () => {
    if (!mcqSessionId) return;

    const unanswered = mcqQuestions.filter((q) => selectedAnswers[q.questionId] === undefined);
    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Unanswered questions will receive 0 marks. Submit now?`
      );
      if (!confirmSubmit) return;
    }

    setSubmittingMcq(true);
    try {
      const answersPayload = mcqQuestions.map((q) => ({
        questionId: q.questionId,
        selectedOption: selectedAnswers[q.questionId] ?? -1,
        timeTakenSeconds: 45,
      }));

      const resultData = await apiRequest<any>('/mcq/submit', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: mcqSessionId,
          answers: answersPayload,
        }),
        token,
      });

      setMcqResult(resultData);
      setMcqMode('result');
    } catch (err: any) {
      alert('Failed to submit MCQ assessment: ' + err.message);
    } finally {
      setSubmittingMcq(false);
    }
  };

  const handleClaimMcqCertificate = async () => {
    if (!mcqResult || !mcqResult.assessmentId) return;
    if (mcqResult.overallScore < 75) {
      alert(`Certificate Eligibility: A minimum score of 75% is required (Your score: ${mcqResult.overallScore}%). Review your study notes and retake to qualify.`);
      return;
    }

    setClaimingCert(true);
    try {
      const certRes = await apiRequest<any>('/certificates/create', {
        method: 'POST',
        body: JSON.stringify({
          assessmentId: mcqResult.assessmentId,
          careerPath: mcqDomain,
        }),
        token,
      });
      setClaimedCert(certRes.certificate);
      alert('Verified SkillDNA Certificate claimed successfully!');
    } catch (err: any) {
      alert('Failed to claim certificate: ' + err.message);
    } finally {
      setClaimingCert(false);
    }
  };

  // --- STUDY NOTES HANDLERS ---
  const handleGenerateNotes = async () => {
    setNotesLoading(true);
    try {
      const data = await apiRequest<any>('/learning/notes/generate', {
        method: 'POST',
        body: JSON.stringify({
          domain: notesDomain,
          topic: notesTopic,
          studentLevel: notesLevel,
        }),
        token,
      });

      setGeneratedNotes(data.notes);
    } catch (err: any) {
      alert('Failed to generate study notes: ' + err.message);
    } finally {
      setNotesLoading(false);
    }
  };

  // --- QUICK CHATBOT HANDLERS ---
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: userTime }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const historyPayload = chatMessages.slice(-6).map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await apiRequest<any>('/learning/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          domain: mcqDomain || 'General Engineering',
          topic: mcqTopic || 'Core Principles',
          history: historyPayload,
        }),
        token,
      });

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [...prev, { sender: 'bot', text: res.reply || 'Here is what you should know.', time: botTime }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I encountered an issue processing your question. Please try again.', time: 'now' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- CURRICULUM AI GENERATOR ---
  const handleGenerateCurriculum = async () => {
    setIsGeneratingCurr(true);
    try {
      const data = await apiRequest<any>('/ai/learning/recommend', {
        method: 'POST',
        body: JSON.stringify({
          weakTopics: [currTopic, subject],
          recentScore: 60,
          targetExam: 'SkillDNA Certification',
          availableMinutesPerDay: 45,
        }),
        token,
      });

      const newLessons = [
        { topic: data.nextLesson, level: data.difficulty, domain: subject, minutes: 20 },
        ...(data.roadmap || []).map((r: string) => ({ topic: r, level: data.difficulty, domain: subject, minutes: 30 })),
      ];
      setDynamicLessons([...newLessons, ...dynamicLessons]);
    } catch (err) {
      alert('Failed to generate AI lessons.');
    } finally {
      setIsGeneratingCurr(false);
    }
  };

  const currentMcqQuestion = mcqQuestions[mcqActiveIndex];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="SkillDNA Adaptive Learning Hub"
        title="Domain Assessment, Personalized Notes & Intelligent Tutor"
        description="Master technical concepts with progressive MCQ assessments enforcing the strict 75% passing threshold, tailored study notes, and an interactive domain chatbot."
      />

      {/* Primary Navigation Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('mcq')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'mcq'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg'
              : 'bg-slate-900/60 text-slate-300 hover:text-white border border-white/5'
          }`}
        >
          <ListChecks className="h-4 w-4" />
          MCQ Assessment (75% Pass Standard)
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg'
              : 'bg-slate-900/60 text-slate-300 hover:text-white border border-white/5'
          }`}
        >
          <FileText className="h-4 w-4" />
          Personalized Study Notes
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'curriculum'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg'
              : 'bg-slate-900/60 text-slate-300 hover:text-white border border-white/5'
          }`}
        >
          <Layers3 className="h-4 w-4" />
          Curriculum & Domain Matrix
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: MCQ ASSESSMENT ENGINE                                 */}
      {/* ============================================================ */}
      {activeTab === 'mcq' && (
        <div className="mt-6 space-y-6">
          {/* SETUP SCREEN */}
          {mcqMode === 'setup' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-lg">Configure Domain MCQ Assessment</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Career Domain *
                    </label>
                    <select
                      value={mcqDomain}
                      onChange={(e) => {
                        setMcqDomain(e.target.value);
                        const matched = DOMAIN_OPTIONS.find((d) => d.domain === e.target.value);
                        if (matched) setMcqTopic(matched.defaultTopic);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                    >
                      {DOMAIN_OPTIONS.map((d) => (
                        <option key={d.domain} value={d.domain}>{d.domain}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Topic / Specialization *
                    </label>
                    <input
                      type="text"
                      value={mcqTopic}
                      onChange={(e) => setMcqTopic(e.target.value)}
                      placeholder="e.g. Mechanical Design, Structural Analysis, Full Stack"
                      className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                    />
                    {/* Quick role suggestions */}
                    {DOMAIN_OPTIONS.find((d) => d.domain === mcqDomain)?.roles && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {DOMAIN_OPTIONS.find((d) => d.domain === mcqDomain)?.roles.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setMcqTopic(r)}
                            className={`text-[11px] rounded-md px-2 py-0.5 border transition ${
                              mcqTopic === r
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                                : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Number of Questions (10 - 15)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="15"
                      value={mcqCount}
                      onChange={(e) => setMcqCount(Math.min(15, Math.max(10, parseInt(e.target.value) || 10)))}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                    />
                    <span className="text-[11px] text-slate-500">Progressive difficulty: Basic (Q1-3), Intermediate (Q4-7), Advanced (Q8-10+)</span>
                  </div>

                  <button
                    onClick={handleStartMcq}
                    disabled={mcqLoading}
                    className="w-full mt-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {mcqLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Adaptive MCQs...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Start MCQ Assessment
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Information & Standard Banner */}
              <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-cyan-950/20 to-slate-900/90 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-cyan-400" />
                    Strict 75% Passing Standard
                  </h3>
                  <div className="space-y-3.5 text-sm text-slate-300">
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">1</span>
                      <div>
                        <span className="font-semibold text-white">Backend Evaluated Only:</span> Scores are calculated strictly on the backend. No client-side answers or scores can be tampered with.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">2</span>
                      <div>
                        <span className="font-semibold text-white">75% Passing Rule:</span> Score &ge; 75 &rarr; <strong className="text-emerald-400">PASS</strong>. Score &lt; 75 &rarr; <strong className="text-rose-400">FAIL</strong>.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">3</span>
                      <div>
                        <span className="font-semibold text-white">Verified Certificate Qualification:</span> Passing candidates are immediately authorized to generate a tamper-evident SkillDNA Certificate.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">4</span>
                      <div>
                        <span className="font-semibold text-white">Instant Remediation Notes:</span> Weak topics are automatically isolated and ready for 1-click personalized study note generation.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-white/5 bg-slate-950/60 p-3 text-xs text-slate-400">
                  Assessments are mapped to industry job roles and synchronize with your <Link to="/career-twin" className="text-cyan-400 underline font-semibold">Career Twin</Link>.
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE ASSESSMENT SCREEN */}
          {mcqMode === 'active' && currentMcqQuestion && (
            <div className="space-y-6">
              {/* Question Navigation Top Bar */}
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-lg backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      Question {mcqActiveIndex + 1} of {mcqQuestions.length}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      currentMcqQuestion.difficulty === 'ADVANCED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      currentMcqQuestion.difficulty === 'INTERMEDIATE' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {currentMcqQuestion.difficulty || 'BASIC'}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      • {currentMcqQuestion.topic || mcqTopic}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-cyan-300">
                    Answered: {Object.keys(selectedAnswers).length} / {mcqQuestions.length}
                  </div>
                </div>

                {/* Question Bubbles */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {mcqQuestions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.questionId] !== undefined;
                    const isCurrent = idx === mcqActiveIndex;
                    return (
                      <button
                        key={q.questionId}
                        onClick={() => setMcqActiveIndex(idx)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                          isCurrent
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-500/40'
                            : isAnswered
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Card */}
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur-md space-y-6">
                <div className="text-lg font-medium text-white leading-relaxed">
                  {currentMcqQuestion.question}
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {currentMcqQuestion.options.map((optionText: string, optIdx: number) => {
                    const isSelected = selectedAnswers[currentMcqQuestion.questionId] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentMcqQuestion.questionId, optIdx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md'
                            : 'bg-slate-950/70 border-white/10 text-slate-300 hover:border-white/20 hover:bg-slate-950'
                        }`}
                      >
                        <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'border-white/20 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-sm pt-0.5 leading-relaxed">{optionText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button
                    onClick={() => setMcqActiveIndex(Math.max(0, mcqActiveIndex - 1))}
                    disabled={mcqActiveIndex === 0}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40 transition"
                  >
                    Previous Question
                  </button>

                  {mcqActiveIndex < mcqQuestions.length - 1 ? (
                    <button
                      onClick={() => setMcqActiveIndex(mcqActiveIndex + 1)}
                      className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center gap-1"
                    >
                      Next Question
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitMcq}
                      disabled={submittingMcq}
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-500 text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingMcq ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting for AI Evaluation...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Complete & Submit Assessment
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RESULTS SCREEN */}
          {mcqMode === 'result' && mcqResult && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className={`rounded-xl border p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                mcqResult.passStatus === 'PASS'
                  ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-emerald-950/40'
                  : 'border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-rose-950/40'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${
                    mcqResult.passStatus === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {mcqResult.passStatus === 'PASS' ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">MCQ Assessment Graded</h3>
                    <p className="text-sm text-slate-300 mt-0.5">
                      Domain: <span className="text-cyan-300 font-semibold">{mcqDomain}</span> • Topic: <span className="text-cyan-300 font-semibold">{mcqTopic}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Correct: {mcqResult.correctCount} of {mcqResult.totalQuestions} questions ({mcqResult.overallScore}%)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Official Score</div>
                  <div className={`text-3xl font-extrabold ${mcqResult.passStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mcqResult.overallScore}%
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border tracking-wide uppercase ${
                    mcqResult.passStatus === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {mcqResult.passStatus === 'PASS' ? 'STATUS: PASS (>= 75%)' : 'STATUS: FAIL (< 75%)'}
                  </span>
                </div>
              </div>

              {/* Action Banner for Pass or Fail */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                {mcqResult.passStatus === 'PASS' ? (
                  <>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-400" />
                        Eligible for SkillDNA Verified Certificate
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Your score of {mcqResult.overallScore}% satisfies the 75%+ passing standard. Claim your official verified certificate now.
                      </p>
                    </div>

                    <button
                      onClick={handleClaimMcqCertificate}
                      disabled={claimingCert || Boolean(claimedCert)}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-500 text-xs shadow-md transition flex items-center gap-2 disabled:opacity-60 flex-shrink-0"
                    >
                      {claimingCert ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Claiming...
                        </>
                      ) : claimedCert ? (
                        <>
                          <Check className="h-4 w-4" />
                          Certificate Claimed ({claimedCert.certificateId})
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4" />
                          Claim Verified Certificate
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        Minimum 75% Score Required
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        A score of {mcqResult.overallScore}% was recorded. To earn certification, practice weak topics using our personalized notes and retake.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setNotesTopic(mcqResult.weakTopics?.[0] || mcqTopic);
                          setActiveTab('notes');
                          handleGenerateNotes();
                        }}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Generate Notes for Weak Topics
                      </button>

                      <button
                        onClick={() => setMcqMode('setup')}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retake
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Detailed Review for All Questions */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
                <h4 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                  Detailed Question Review & Explanations
                </h4>

                <div className="space-y-4">
                  {mcqResult.detailedReviews?.map((rev: any, idx: number) => (
                    <div
                      key={rev.questionId || idx}
                      className={`p-4 rounded-xl border ${
                        rev.isCorrect
                          ? 'border-emerald-500/20 bg-emerald-950/10'
                          : 'border-rose-500/20 bg-rose-950/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-white">
                          {idx + 1}. {rev.question}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          rev.isCorrect ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {rev.isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-semibold">Your Answer:</span>
                          <span className={rev.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                            {rev.selectedOption >= 0 ? rev.options[rev.selectedOption] : 'Unanswered (0 marks)'}
                          </span>
                        </div>

                        {!rev.isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-semibold">Correct Answer:</span>
                            <span className="text-emerald-300 font-semibold">
                              {rev.options[rev.correctOption]}
                            </span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-white/5 text-slate-300">
                          <strong className="text-cyan-300">AI Explanation:</strong> {rev.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PERSONALIZED STUDY NOTES                              */}
      {/* ============================================================ */}
      {activeTab === 'notes' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-white text-lg">AI Personalized Study Notes Generator</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Generate structured, industry-calibrated study notes customized for your experience level. Ideal for reviewing weak topics flagged during assessments.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Domain *
                </label>
                <select
                  value={notesDomain}
                  onChange={(e) => {
                    setNotesDomain(e.target.value);
                    const matched = DOMAIN_OPTIONS.find((d) => d.domain === e.target.value);
                    if (matched) setNotesTopic(matched.defaultTopic);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d.domain} value={d.domain}>{d.domain}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Topic / Skill *
                </label>
                <input
                  type="text"
                  value={notesTopic}
                  onChange={(e) => setNotesTopic(e.target.value)}
                  placeholder="e.g. GD&T Principles, DCF Valuation, Docker Swarm"
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Candidate Level *
                </label>
                <select
                  value={notesLevel}
                  onChange={(e) => setNotesLevel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                >
                  <option value="Beginner">Beginner (Foundational Principles)</option>
                  <option value="Intermediate">Intermediate (Industry Workflows)</option>
                  <option value="Advanced">Advanced (System Design & Edge Cases)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateNotes}
              disabled={notesLoading}
              className="mt-5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
            >
              {notesLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Comprehensive Notes...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Smart Study Notes
                </>
              )}
            </button>
          </div>

          {/* RENDERED STUDY NOTES */}
          {generatedNotes && (
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
                  {generatedNotes.domain} • {generatedNotes.studentLevel} Level
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">{generatedNotes.topic}</h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{generatedNotes.summary}</p>
              </div>

              {/* Core Principles */}
              {generatedNotes.corePrinciples?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                    Core Engineering / Business Principles
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {generatedNotes.corePrinciples.map((p: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-950/60 border border-white/5">
                        <div className="font-semibold text-white text-sm">{p.title || `Principle ${idx + 1}`}</div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Terminology */}
              {generatedNotes.technicalTerminology?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    Key Technical Vocabulary & Standards
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {generatedNotes.technicalTerminology.map((term: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                        <span className="font-mono text-xs font-bold text-cyan-300">{term.term}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Best Practices */}
              {generatedNotes.industryBestPractices?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    Industry Best Practices & Pitfalls
                  </h3>
                  <ul className="space-y-2">
                    {generatedNotes.industryBestPractices.map((bp: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Interview Questions & Answers */}
              {generatedNotes.commonInterviewQuestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-400" />
                    High-Yield Technical Interview Questions & Model Answers
                  </h3>
                  <div className="space-y-3">
                    {generatedNotes.commonInterviewQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-950/60 border border-white/5 space-y-2">
                        <div className="text-xs font-bold text-white">Q{idx + 1}: {q.question}</div>
                        <div className="text-xs text-slate-300">
                          <strong className="text-emerald-400">Model Answer: </strong>{q.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CURRICULUM & DOMAIN MATRIX                            */}
      {/* ============================================================ */}
      {activeTab === 'curriculum' && (
        <div className="mt-6 space-y-8">
          {/* Domains Grid */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {domains.map((domain) => (
              <article
                key={domain.name}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/[0.4] p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-900/[0.7]"
              >
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${domain.color.replace('text-', 'bg-').replace('400', '400/10')} blur-[40px] transition-all group-hover:scale-150 duration-700`} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl bg-slate-950/50 ${domain.color.replace('text-', 'bg-').replace('400', '400/10')}`}>
                      <domain.icon className={`h-6 w-6 ${domain.color}`} />
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">Active</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{domain.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{domain.subjects}</p>
                </div>
              </article>
            ))}
          </section>

          {/* Curriculum Generator */}
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="group rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10 mb-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-500/10">
                  <Layers3 className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Curriculum Roadmap Planner</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                  Subject Area
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-10 rounded-lg border border-white/10 bg-slate-950 px-3 text-white text-sm focus:border-cyan-500"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                  Topic to Expand
                  <input
                    value={currTopic}
                    onChange={(e) => setCurrTopic(e.target.value)}
                    className="h-10 rounded-lg border border-white/10 bg-slate-950 px-3 text-white text-sm focus:border-cyan-500"
                  />
                </label>
              </div>

              <button
                onClick={handleGenerateCurriculum}
                disabled={isGeneratingCurr}
                className="mt-5 w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 text-sm font-bold text-slate-950 disabled:opacity-50 transition"
              >
                {isGeneratingCurr ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGeneratingCurr ? 'Generating...' : 'Auto-Generate Curriculum Roadmap'}
              </button>
            </div>

            <div className="grid gap-3">
              {dynamicLessons.length === 0 ? (
                <div className="text-center text-slate-400 border border-white/10 rounded-xl p-8 bg-slate-900/50 flex flex-col items-center justify-center">
                  <Layers3 className="h-10 w-10 mb-2 opacity-50 text-cyan-400" />
                  <p className="text-xs">Click "Auto-Generate Curriculum Roadmap" to construct a customized study sequence.</p>
                </div>
              ) : (
                dynamicLessons.map((lesson, idx) => (
                  <article
                    key={idx}
                    className="rounded-xl border border-white/5 bg-slate-900/60 p-4 backdrop-blur-sm flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-white text-sm">{lesson.topic}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{lesson.domain} • {lesson.minutes} mins</p>
                    </div>
                    <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
                      {lesson.level}
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* ============================================================ */}
      {/* FLOATING QUICK CHATBOT WIDGET                                 */}
      {/* ============================================================ */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatbotOpen ? (
          <button
            onClick={() => setChatbotOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-2xl hover:scale-105 transition"
          >
            <MessageSquare className="h-4 w-4" />
            <span>AI Tutor Chat</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 h-[480px] rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
            {/* Chatbot Header */}
            <div className="p-3.5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h4 className="font-bold text-white text-xs">SkillDNA AI Tutor</h4>
                  <span className="text-[10px] text-slate-400">Context: {mcqTopic || 'General'}</span>
                </div>
              </div>
              <button
                onClick={() => setChatbotOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
              >
                &times;
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl ${
                      m.sender === 'user'
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-1.5 p-2 text-slate-400 text-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                  <span>AI Tutor is thinking...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-white/10 bg-slate-900/60 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about a concept or mistake..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
};

export default LearningHub;
