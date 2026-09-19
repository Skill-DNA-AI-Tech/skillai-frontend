import { 
  Play, RotateCcw, Loader2, Send, CheckCircle2, TrendingUp, Award, 
  Download, Share2, ExternalLink, Copy, AlertTriangle, Sparkles, 
  BookOpen, ShieldAlert, ArrowRight, Check, Mic, MicOff, Video, VideoOff,
  Eye, Volume2, VolumeX, RefreshCw
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { apiRequest, api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/SectionHeader';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import { SpeechToTextSession, EngagementVisualTracker, VisualMetrics, AudioMetrics } from '../lib/speechAndVision';

type InterviewMode = 'setup' | 'active' | 'completed';

const DOMAIN_OPTIONS: { domain: string; roles: string[] }[] = [
  { 
    domain: 'Mechanical Engineering', 
    roles: ['Mechanical Design Engineer', 'HVAC Engineer', 'Thermal Systems Specialist', 'Manufacturing Quality Engineer'] 
  },
  { 
    domain: 'Civil Engineering', 
    roles: ['Structural Design Engineer', 'Site Execution Engineer', 'Geotechnical Specialist', 'BIM Modeler'] 
  },
  { 
    domain: 'Electronics Engineering', 
    roles: ['Embedded Systems Engineer', 'IoT Firmware Developer', 'PCB Design Engineer', 'Digital Signal Processing Engineer'] 
  },
  { 
    domain: 'Commerce', 
    roles: ['Accounts Officer', 'GST & Taxation Analyst', 'Audit Assistant', 'Bookkeeper'] 
  },
  { 
    domain: 'Finance', 
    roles: ['Financial Analyst', 'Investment Banking Associate', 'Equity Research Analyst', 'Corporate Finance Associate'] 
  },
  { 
    domain: 'Management & Strategy', 
    roles: ['Operations Manager', 'Project Management Officer', 'Business Analyst', 'Product Associate'] 
  },
  { 
    domain: 'Marketing', 
    roles: ['Digital Marketing Strategist', 'SEO & Performance Lead', 'Brand Marketing Specialist', 'Content Strategist'] 
  },
  { 
    domain: 'Human Resources', 
    roles: ['HR Generalist', 'Technical Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner'] 
  },
  { 
    domain: 'UI/UX & Graphic Design', 
    roles: ['UI/UX Product Designer', 'Visual Designer', 'Design Systems Specialist', 'User Researcher'] 
  },
  { 
    domain: 'Healthcare & Pharmacy', 
    roles: ['Clinical Research Associate', 'Pharmacovigilance Officer', 'Quality Control Analyst', 'Healthcare Operations'] 
  },
  { 
    domain: 'Computer Science & IT', 
    roles: ['Full Stack Developer', 'Cloud & DevOps Engineer', 'Backend Specialist', 'Frontend Engineer'] 
  },
];

const DynamicInterviewPage = () => {
  const { token, user } = useAuth();
  const [mode, setMode] = useState<InterviewMode>('setup');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<any>(null);
  
  const [createdReport, setCreatedReport] = useState<any>(null);
  const [claimingCertificate, setClaimingCertificate] = useState(false);
  const [claimedCertificate, setClaimedCertificate] = useState<any>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio & STT State
  const [isRecording, setIsRecording] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [transcriptionConfidence, setTranscriptionConfidence] = useState<number | null>(null);
  const [audioWarning, setAudioWarning] = useState<string | null>(null);
  const [wasRecordedAudio, setWasRecordedAudio] = useState(false);
  const [lastRecordedMetrics, setLastRecordedMetrics] = useState<AudioMetrics | null>(null);

  // Video & Engagement State
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [visualMetrics, setVisualMetrics] = useState<VisualMetrics>({
    faceDetected: false,
    cameraFacingPercentage: 100,
    lookingAwayPercentage: 0,
    multipleFacesDetected: false,
    behaviorStatus: 'NORMAL',
    sampleCount: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sttSessionRef = useRef<SpeechToTextSession | null>(null);
  const visualTrackerRef = useRef<EngagementVisualTracker | null>(null);
  const questionStartTime = useRef<number>(Date.now());
  
  const location = useLocation();
  const [setupForm, setSetupForm] = useState({
    field: DOMAIN_OPTIONS[0].domain,
    topic: DOMAIN_OPTIONS[0].roles[0],
    difficulty: 'Basic',
    questionCount: 10,
  });

  // Automatically pre-populate domain & target role from candidate profile
  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        const profile = await apiRequest<any>('/student/profile', { token });
        if (profile?.user) {
          const dom = profile.user.careerDomain || profile.branch;
          const rol = profile.user.targetRole || profile.preferredRoles?.[0];
          if (dom) {
            const matched = DOMAIN_OPTIONS.find(d => d.domain.toLowerCase().includes(dom.toLowerCase()) || dom.toLowerCase().includes(d.domain.toLowerCase()));
            const fieldVal = matched ? matched.domain : dom;
            const topicVal = rol || (matched ? matched.roles[0] : 'Specialist');
            setSetupForm(prev => ({
              ...prev,
              field: fieldVal,
              topic: topicVal,
            }));
          }
        }
      } catch (err) {
        // Fallback: leave defaults
      }
    };

    if (token) {
      fetchCandidateProfile();
    }
  }, [token]);

  // Query params override
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topicParam = params.get('topic');
    const fieldParam = params.get('field');
    const difficultyParam = params.get('difficulty');

    if (topicParam || fieldParam || difficultyParam) {
      setSetupForm((prev) => ({
        ...prev,
        topic: topicParam || prev.topic,
        field: fieldParam || prev.field,
        difficulty: difficultyParam || prev.difficulty,
      }));
    }
  }, [location]);

  // Initialize camera when entering active mode
  useEffect(() => {
    if (mode === 'active' && cameraEnabled && videoRef.current) {
      const tracker = new EngagementVisualTracker((metrics) => {
        setVisualMetrics(metrics);
      });
      visualTrackerRef.current = tracker;
      tracker.start(videoRef.current).then((active) => {
        setCameraActive(active);
      });
    }

    return () => {
      if (visualTrackerRef.current) {
        visualTrackerRef.current.stop();
        visualTrackerRef.current = null;
      }
      if (sttSessionRef.current) {
        sttSessionRef.current.stop();
        sttSessionRef.current = null;
      }
    };
  }, [mode, cameraEnabled]);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (visualTrackerRef.current) {
        visualTrackerRef.current.stop();
        visualTrackerRef.current = null;
      }
      setCameraActive(false);
      setCameraEnabled(false);
    } else {
      setCameraEnabled(true);
      if (videoRef.current) {
        const tracker = new EngagementVisualTracker((metrics) => {
          setVisualMetrics(metrics);
        });
        visualTrackerRef.current = tracker;
        const active = await tracker.start(videoRef.current);
        setCameraActive(active);
      }
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      if (sttSessionRef.current) {
        const metrics = sttSessionRef.current.stop();
        setLastRecordedMetrics(metrics);
        setIsRecording(false);
        setAudioVolume(0);
      }
    } else {
      setAudioWarning(null);
      const session = new SpeechToTextSession(
        (transcript, _isFinal, conf) => {
          setUserAnswer(transcript);
          setTranscriptionConfidence(conf);
          setWasRecordedAudio(true);
        },
        (volume) => setAudioVolume(volume),
        (warning) => setAudioWarning(warning)
      );
      sttSessionRef.current = session;
      const started = await session.start();
      if (started) {
        setIsRecording(true);
        setWasRecordedAudio(true);
      } else {
        alert('Could not access microphone or Speech Recognition is not supported by your browser. You can type your answer in the box.');
      }
    }
  };

  const handleDomainSelect = (selectedDomain: string) => {
    const matched = DOMAIN_OPTIONS.find(d => d.domain === selectedDomain);
    setSetupForm({
      ...setupForm,
      field: selectedDomain,
      topic: matched ? matched.roles[0] : 'Specialist',
    });
  };

  const startInterview = async () => {
    try {
      const response = await apiRequest<any>('/questions/interview/start', {
        method: 'POST',
        body: JSON.stringify(setupForm),
        token,
      });

      setSessionId(response.sessionId);
      setMode('active');
      fetchNextQuestion(response.sessionId);
    } catch (error: any) {
      alert('Failed to start interview: ' + error.message);
    }
  };

  const fetchNextQuestion = async (sid: string) => {
    try {
      if (sttSessionRef.current && isRecording) {
        sttSessionRef.current.stop();
        setIsRecording(false);
        setAudioVolume(0);
      }
      setAudioWarning(null);
      setWasRecordedAudio(false);
      setTranscriptionConfidence(null);
      questionStartTime.current = Date.now();

      const response = await apiRequest<any>(`/questions/interview/next/${sid}`, { token });
      
      if (response.completed) {
        completeInterview(sid);
      } else {
        setCurrentQuestion(response);
        const seq = response.sequence || 1;
        const total = response.totalQuestions || setupForm.questionCount || 10;
        setProgress(Math.min(seq / total, 1));
        setUserAnswer('');
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
    }
  };

  const submitAnswer = async (forcedAnswer?: string) => {
    if (!sessionId || !currentQuestion) return;

    const answerToSend = forcedAnswer !== undefined ? forcedAnswer : userAnswer;
    const isAudio = wasRecordedAudio || isRecording;

    let finalAudioMetrics = lastRecordedMetrics || { confidence: 0.9, audioQuality: 'GOOD' as const };
    if (sttSessionRef.current && isRecording) {
      const stoppedMetrics = sttSessionRef.current.stop();
      finalAudioMetrics = stoppedMetrics;
      setIsRecording(false);
      setAudioVolume(0);
    }

    const currentVisual = visualTrackerRef.current ? visualTrackerRef.current.getMetrics() : visualMetrics;
    const timeTaken = Math.max(5, Math.round((Date.now() - questionStartTime.current) / 1000));

    setSubmitting(true);
    try {
      await apiRequest<any>('/questions/interview/submit-answer', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.questionId,
          answer: answerToSend,
          answerType: isAudio ? 'Audio' : 'Text',
          timeTaken,
          transcriptionConfidence: isAudio ? finalAudioMetrics.confidence : undefined,
          audioQuality: isAudio ? finalAudioMetrics.audioQuality : undefined,
          visualMetrics: {
            faceDetected: currentVisual.faceDetected,
            cameraFacingPercentage: currentVisual.cameraFacingPercentage,
            lookingAwayPercentage: currentVisual.lookingAwayPercentage,
            multipleFacesDetected: currentVisual.multipleFacesDetected,
            behaviorStatus: currentVisual.behaviorStatus,
          },
        }),
        token,
      });

      // Fetch next question
      await fetchNextQuestion(sessionId);
    } catch (error: any) {
      alert('Failed to submit answer: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const initializeReportCard = async (reportData: any) => {
    try {
      let profile: any = null;
      try {
        profile = await apiRequest<any>('/profiles/me', { token });
      } catch (err: any) {
        if (err.message?.includes('not found') || err.message?.includes('404')) {
          profile = await apiRequest<any>('/profiles', {
            method: 'POST',
            body: JSON.stringify({
              domain: reportData.domain || setupForm.field,
              branch: reportData.role || setupForm.topic,
              skills: [reportData.role || setupForm.topic],
              college: 'SkillDNA Academy',
              bio: 'Active learner in ' + (reportData.domain || setupForm.field),
            }),
            token,
          });
        }
      }

      if (profile) {
        const savedReport = await apiRequest<any>('/reports', {
          method: 'POST',
          body: JSON.stringify({
            profileId: profile._id,
            interviewScore: Math.round(reportData.overallScore || reportData.averageScores?.averageCorrectness || 0),
          }),
          token,
        });
        setCreatedReport(savedReport);
      }
    } catch (error) {
      console.error('Failed to initialize report card:', error);
    }
  };

  const completeInterview = async (sid: string) => {
    try {
      await apiRequest<any>(`/questions/interview/complete/${sid}`, {
        method: 'POST',
        token,
      });

      const reportData = await apiRequest<any>(`/questions/interview/report/${sid}`, { token });
      setReport(reportData);
      setMode('completed');
      await initializeReportCard(reportData);
    } catch (error) {
      console.error('Failed to complete interview:', error);
    }
  };

  const claimCertificate = async () => {
    if (!report) return;

    const overallScore = report.overallScore ?? report.averageScores?.overallScore ?? 0;
    if (overallScore < 75) {
      alert(`Certificate Eligibility: A minimum overall score of 75% is required to claim a SkillDNA Certificate (Your score: ${overallScore}%). Review your stuck topics in Career Twin, practice, and retake the interview to qualify.`);
      return;
    }

    setClaimingCertificate(true);
    try {
      const scores = report.competencies || report.averageScores;
      const certRes = await apiRequest<any>('/certificates/create', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          careerPath: report.role || report.domain || setupForm.field || 'Career Development',
          technicalScore: Math.round(scores.technical ?? scores.averageTechnical ?? 75),
          communicationScore: Math.round(scores.communication ?? scores.averageCommunication ?? 75),
          problemSolvingScore: Math.round(scores.problemSolving ?? scores.averageCorrectness ?? 75),
          confidenceScore: Math.round(scores.confidence ?? scores.averageConfidence ?? 75),
          sessionsCompleted: 1,
          strengths: report.strengthAreas || [],
          improvements: report.weakAreas || [],
        }),
        token,
      });
      setClaimedCertificate(certRes.certificate);
      alert('SkillDNA Verified Certificate claimed successfully!');
    } catch (error: any) {
      alert('Failed to claim certificate: ' + error.message);
    } finally {
      setClaimingCertificate(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!claimedCertificate) return;
    try {
      const response = await api.get<Blob>(`/certificates/${claimedCertificate.certificateId}/pdf`, {
        responseType: 'blob',
        token,
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `SkillDNA-Certificate-${claimedCertificate.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      alert('Failed to download PDF: ' + error.message);
    }
  };

  const handleShareReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdReport || !shareEmail.trim()) return;
    setSharing(true);
    setShareSuccess(false);
    try {
      await apiRequest<any>(`/reports/${createdReport._id}/share`, {
        method: 'POST',
        body: JSON.stringify({
          recruiterEmail: shareEmail,
          company: 'Hiring Partner',
        }),
        token,
      });
      setShareSuccess(true);
      setShareEmail('');
    } catch (error: any) {
      alert('Failed to share report: ' + error.message);
    } finally {
      setSharing(false);
    }
  };

  const resetInterview = () => {
    setMode('setup');
    setSessionId(null);
    setCurrentQuestion(null);
    setUserAnswer('');
    setProgress(0);
    setReport(null);
    setClaimedCertificate(null);
    setCreatedReport(null);
  };

  const currentOverallScore = report ? (report.overallScore ?? report.averageScores?.overallScore ?? 0) : 0;
  const isEligibleForCertificate = currentOverallScore >= 75;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Adaptive AI Interview Engine"
        title="Multi-Domain Personalized Technical & Behavioral Assessment"
        description="Dynamic 10-15 question progressive interview tailored to your career domain. Real-time answer evaluation across 5 core employability competencies."
      />

      {/* Setup Mode */}
      {mode === 'setup' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-white text-lg">Interview Setup & Career Domain</h3>
            </div>
            
            <div className="space-y-4">
              {/* Domain Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Career Domain *
                </label>
                <select
                  value={setupForm.field}
                  onChange={(e) => handleDomainSelect(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                >
                  {DOMAIN_OPTIONS.map((opt) => (
                    <option key={opt.domain} value={opt.domain}>{opt.domain}</option>
                  ))}
                </select>
              </div>

              {/* Target Role Selector / Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Job Role *
                </label>
                <input
                  type="text"
                  value={setupForm.topic}
                  onChange={(e) => setSetupForm({ ...setupForm, topic: e.target.value })}
                  placeholder="e.g. Mechanical Design Engineer, Financial Analyst"
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500 text-sm"
                  required
                />
                {/* Role quick pills */}
                {DOMAIN_OPTIONS.find(d => d.domain === setupForm.field)?.roles && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {DOMAIN_OPTIONS.find(d => d.domain === setupForm.field)?.roles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSetupForm({ ...setupForm, topic: r })}
                        className={`text-[11px] rounded-md px-2 py-0.5 border transition ${
                          setupForm.topic === r
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

              {/* Starting Difficulty */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Starting Difficulty Level
                </label>
                <select
                  value={setupForm.difficulty}
                  onChange={(e) => setSetupForm({ ...setupForm, difficulty: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                >
                  <option value="Basic">Basic (Foundational principles & core concepts)</option>
                  <option value="Intermediate">Intermediate (Industry applications & problem solving)</option>
                  <option value="Advanced">Advanced (Complex systems, trade-offs & edge cases)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Adaptive Engine: Questions dynamically scale up as you succeed, or stay sticky at foundational levels if struggling.
                </p>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Adaptive Question Count (10 - 15 Questions)
                </label>
                <input
                  type="number"
                  min="10"
                  max="15"
                  value={setupForm.questionCount}
                  onChange={(e) => setSetupForm({ ...setupForm, questionCount: Math.min(15, Math.max(10, parseInt(e.target.value) || 10)) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500 text-sm"
                />
                <span className="text-[11px] text-slate-500">Standard production interviews scale between 10 and 15 questions.</span>
              </div>

              <button
                onClick={startInterview}
                className="w-full mt-2 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Play className="h-5 w-5 fill-slate-950" />
                Launch Adaptive Interview
              </button>
            </div>
          </div>

          {/* Right Explanatory Card */}
          <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-cyan-950/20 to-slate-900/90 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Evaluation & Adaptive Intelligence
              </h3>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">1</span>
                  <div>
                    <span className="font-semibold text-white">Multi-Career Domain Coverage:</span> Real domain questions for Mechanical, Civil, Electronics, Finance, Commerce, HR, Design, and CS.
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">2</span>
                  <div>
                    <span className="font-semibold text-white">Adaptive Difficulty Progression:</span> Starts at your experience level. Advances if you demonstrate mastery; if stuck in Basic or Intermediate, stays at that level for diagnostic practice.
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">3</span>
                  <div>
                    <span className="font-semibold text-white">5 Core Competency Metrics:</span> Backend rigorously scores Technical depth, Communication clarity, Problem solving, Confidence, and Clarity (0-100).
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 font-bold text-xs">4</span>
                  <div>
                    <span className="font-semibold text-white">Strict Empty & Skip Handling:</span> Empty submissions receive strictly 0 marks. "I don't know" answers receive low scores and log stuck topics to Career Twin.
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">5</span>
                  <div>
                    <span className="font-semibold text-white">75%+ Certificate Threshold:</span> Only candidates earning an overall composite score of 75% or higher qualify for a verified SkillDNA certificate.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-white/5 bg-slate-950/60 p-3 text-xs text-slate-400">
              Session data automatically synchronizes with your <Link to="/career-twin" className="text-cyan-400 underline font-semibold">Career Twin</Link> and Skill DNA profile.
            </div>
          </div>
        </div>
      )}

      {/* Active Interview Mode */}
      {mode === 'active' && currentQuestion && (
        <div className="mt-8 space-y-6">
          {/* Progress & Difficulty Header */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 shadow-lg backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">
                  Question {currentQuestion.sequence} of {currentQuestion.totalQuestions || setupForm.questionCount || 10}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                  currentQuestion.difficulty === 'ADVANCED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                  currentQuestion.difficulty === 'INTERMEDIATE' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  Level: {currentQuestion.difficulty || 'BASIC'}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • {currentQuestion.domain || setupForm.field}
                </span>
              </div>
              <span className="text-sm font-mono text-cyan-400">
                {Math.round(progress * 100)}% Completed
              </span>
            </div>
            <ProgressBar value={progress * 100} tone="bg-cyan-500" />
          </div>

          {/* Active Interview Content: Two-Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Question & Answer Workspace */}
            <div className="lg:col-span-2 rounded-xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Topic: {currentQuestion.topic || setupForm.topic}
                </span>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-950 text-cyan-300 font-mono border border-cyan-500/20">
                  Target Response Time: {currentQuestion.expectedDuration || 90}s
                </span>
              </div>

              <div className="text-xl font-semibold text-white leading-relaxed">
                {currentQuestion.question}
              </div>

              {/* STT Warning if confidence is low */}
              {audioWarning && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span>{audioWarning} You can also type or edit your response directly in the box below.</span>
                </div>
              )}

              {/* Answer Input Area & Voice Controls */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Your Answer / Diagnostic Explanation:
                  </label>
                  
                  {/* Voice Recording Control */}
                  <div className="flex items-center gap-2">
                    {isRecording && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        Live STT ({audioVolume}%)
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                        isRecording
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                          : 'bg-slate-800 text-cyan-300 border-cyan-500/30 hover:bg-slate-700'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      {isRecording ? 'Stop Recording' : 'Speak Answer (STT)'}
                    </button>
                  </div>
                </div>

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Speak via microphone or type your structured explanation here. Be thorough with technical principles, methodology, and problem-solving reasoning..."
                  className="w-full h-44 px-4 py-3 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-y text-sm font-sans"
                />

                {/* Transcription Confidence / Audio Quality indicator */}
                {wasRecordedAudio && transcriptionConfidence !== null && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3 text-cyan-400" />
                      Speech Recognition Confidence: <strong className="text-white">{Math.round(transcriptionConfidence * 100)}%</strong>
                    </span>
                    <span className="text-emerald-400">Domain technical vocabulary auto-aligned</span>
                  </div>
                )}
              </div>

              {/* Submission Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Submit empty answer? Empty answers strictly receive 0 marks across all 5 competencies.")) {
                        submitAnswer('');
                      }
                    }}
                    disabled={submitting}
                    className="px-3.5 py-2 rounded-lg border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    title="Test empty answer handling (0 marks awarded)"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Skip / Submit Empty (0 Marks)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswer("I do not know the answer to this question.");
                      submitAnswer("I do not know the answer to this question.");
                    }}
                    disabled={submitting}
                    className="px-3.5 py-2 rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/40 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    title="Submit 'I don't know' to record weakness in Career Twin"
                  >
                    "I Don't Know"
                  </button>
                </div>

                <button
                  onClick={() => submitAnswer()}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI Analyzing Answer...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 1 Col: Video Proctoring & Telemetry Panel */}
            <div className="space-y-4">
              {/* Webcam Card */}
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Engagement Proctor</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="text-[11px] px-2 py-1 rounded bg-slate-950 text-slate-300 border border-white/10 hover:text-white transition flex items-center gap-1"
                  >
                    {cameraActive ? <Video className="h-3 w-3 text-emerald-400" /> : <VideoOff className="h-3 w-3 text-slate-500" />}
                    {cameraActive ? 'Camera On' : 'Audio Only'}
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-slate-950 aspect-video flex items-center justify-center border border-white/10">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  {!cameraActive && (
                    <div className="text-center p-4">
                      <VideoOff className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Audio-Only Fallback Active</p>
                      <button
                        onClick={toggleCamera}
                        className="mt-2 text-[11px] px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                      >
                        Enable Webcam
                      </button>
                    </div>
                  )}

                  {/* Live Status Overlay on Video */}
                  {cameraActive && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] border border-white/10 text-white font-mono">
                      <span className={`h-1.5 w-1.5 rounded-full ${visualMetrics.faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      {visualMetrics.faceDetected ? 'FACE TRACKED' : 'ALIGNING FACE'}
                    </div>
                  )}
                </div>

                {/* Telemetry Metrics */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400">Camera-Facing Ratio</span>
                    <span className="font-mono font-semibold text-cyan-300">
                      {visualMetrics.cameraFacingPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400">Engagement Status</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      visualMetrics.behaviorStatus === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      visualMetrics.behaviorStatus === 'LOOKING_AWAY_FREQUENTLY' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-slate-800 text-slate-300 border-white/10'
                    }`}>
                      {visualMetrics.behaviorStatus === 'NORMAL' ? 'Optimal' :
                       visualMetrics.behaviorStatus === 'LOOKING_AWAY_FREQUENTLY' ? 'Looking Away' :
                       visualMetrics.behaviorStatus === 'AUDIO_ONLY_FALLBACK' ? 'Audio Only' : 'Checking'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400">Multiple Face Check</span>
                    <span className="font-mono text-slate-300">
                      {visualMetrics.multipleFacesDetected ? 'Multiple Detected' : 'Single Candidate'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1">
                    Visual telemetry provides engagement signal context. Your technical evaluation is derived from your spoken/written solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Mode - Comprehensive Report */}
      {mode === 'completed' && report && (
        <div className="mt-8 space-y-6">
          {/* Header Banner */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-emerald-950/40 p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Interview Assessment Completed</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  Domain: <span className="text-cyan-300 font-semibold">{report.domain || setupForm.field}</span> • Role: <span className="text-cyan-300 font-semibold">{report.role || setupForm.topic}</span> • Questions Answered: {report.questionsAsked || report.totalQuestions}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-slate-400">Composite Score</div>
              <div className={`text-3xl font-extrabold ${currentOverallScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentOverallScore}%
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border tracking-wide uppercase ${
                isEligibleForCertificate ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {isEligibleForCertificate ? 'PASS (>= 75/100)' : 'FAIL (< 75/100)'}
              </span>
            </div>
          </div>

          {/* 5 Core Competencies Grid */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">5 Core Competency Evaluation</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                label="Technical Mastery"
                value={Math.round(report.competencies?.technical ?? report.averageScores?.averageTechnical ?? 0)}
                suffix="%"
                progress={report.competencies?.technical ?? report.averageScores?.averageTechnical ?? 0}
                tone="bg-cyan-400"
              />
              <MetricCard
                label="Communication"
                value={Math.round(report.competencies?.communication ?? report.averageScores?.averageCommunication ?? 0)}
                suffix="%"
                progress={report.competencies?.communication ?? report.averageScores?.averageCommunication ?? 0}
                tone="bg-emerald-400"
              />
              <MetricCard
                label="Problem Solving"
                value={Math.round(report.competencies?.problemSolving ?? report.averageScores?.averageCorrectness ?? 0)}
                suffix="%"
                progress={report.competencies?.problemSolving ?? report.averageScores?.averageCorrectness ?? 0}
                tone="bg-indigo-400"
              />
              <MetricCard
                label="Confidence & Tone"
                value={Math.round(report.competencies?.confidence ?? report.averageScores?.averageConfidence ?? 0)}
                suffix="%"
                progress={report.competencies?.confidence ?? report.averageScores?.averageConfidence ?? 0}
                tone="bg-violet-400"
              />
              <MetricCard
                label="Clarity & Structure"
                value={Math.round(report.competencies?.clarity ?? report.averageScores?.averageClarity ?? 0)}
                suffix="%"
                progress={report.competencies?.clarity ?? report.averageScores?.averageClarity ?? 0}
                tone="bg-amber-400"
              />
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-6 shadow-lg">
              <h4 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Demonstrated Strengths
              </h4>
              {report.strengthAreas?.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-300">
                  {report.strengthAreas.map((s: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">Continue answering questions with structured reasoning to highlight strengths.</p>
              )}
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-slate-900/60 p-6 shadow-lg">
              <h4 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Areas to Improve & Stuck Topics
              </h4>
              {report.weakAreas?.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-300">
                  {report.weakAreas.map((w: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No major weaknesses flagged in this session.</p>
              )}

              {/* Link to Career Twin */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <Link
                  to="/career-twin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Review targeted recommendations in Career Twin
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Verification & Certificate Claiming Area */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Verified Report Card Section */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-cyan-400" />
                  SkillDNA Verified Report Card
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Public tamper-evident report card with granular performance analytics and AI feedback.
                </p>

                {createdReport ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-white/5">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Verification ID</div>
                        <div className="text-sm font-mono text-cyan-300 font-semibold">{createdReport.verificationId}</div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdReport.publicUrl || `${window.location.origin}/report/${createdReport.verificationId}`);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                        title="Copy Public Report Link"
                      >
                        {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    <a
                      href={`/report/${createdReport.verificationId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Public Verification View
                    </a>

                    {/* Recruiter Share */}
                    <form onSubmit={handleShareReport} className="pt-3 border-t border-white/5">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Share with Hiring Team</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="recruiter@company.com"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-slate-950 text-white text-xs placeholder-slate-600 focus:border-cyan-500"
                          required
                        />
                        <button
                          type="submit"
                          disabled={sharing}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition disabled:opacity-50"
                        >
                          {sharing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
                          Share
                        </button>
                      </div>
                      {shareSuccess && (
                        <p className="text-xs text-emerald-400 mt-1">✓ Report sent to recruiter successfully!</p>
                      )}
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    Generating verified public report card...
                  </div>
                )}
              </div>
            </div>

            {/* Verifiable Certificate Section */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  SkillDNA Verified Certificate
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Official verifiable credential with digital signature and public verification ledger. Requires minimum 75% score.
                </p>

                {claimedCertificate ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">
                      <div className="text-xs font-semibold text-amber-300">Certificate Successfully Issued!</div>
                      <div className="text-sm font-mono text-white mt-1 font-bold">{claimedCertificate.certificateId}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Domain: {claimedCertificate.careerPath} • Status: {claimedCertificate.status}
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadPDF}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      Download Official PDF Certificate
                    </button>

                    <Link
                      to={`/certificate/verify/${claimedCertificate.certificateId}`}
                      className="w-full py-2 rounded-lg border border-white/10 bg-slate-950 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                      Verify on Public Ledger
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!isEligibleForCertificate ? (
                      <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 space-y-1.5">
                        <div className="font-bold text-rose-300 flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-rose-400" />
                          Certificate Locked (Score: {currentOverallScore}% / 75% required)
                        </div>
                        <p className="text-[11px] text-slate-300">
                          A minimum composite score of 75% is required to earn an official SkillDNA certificate. Please review your stuck topics, practice in Career Twin, and re-attempt to qualify.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                        <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Eligible for Verified Certification!
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Congratulations! Your composite score of {currentOverallScore}% satisfies the 75%+ threshold.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={claimCertificate}
                      disabled={claimingCertificate || !isEligibleForCertificate}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                        isEligibleForCertificate
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-lg cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      {claimingCertificate ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Issuing Certificate...
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4" />
                          {isEligibleForCertificate ? 'Claim Verified Certificate' : 'Score 75%+ to Unlock Certificate'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action: Retake Interview */}
          <div className="flex justify-center pt-4">
            <button
              onClick={resetInterview}
              className="px-6 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition text-xs font-semibold shadow-md"
            >
              <RotateCcw className="h-4 w-4 text-cyan-400" />
              Retake or Start New Interview Session
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default DynamicInterviewPage;
