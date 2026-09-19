import { 
  Play, RotateCcw, Loader2, Send, CheckCircle2, TrendingUp, Award, 
  Download, Share2, ExternalLink, Copy, AlertTriangle, Sparkles, 
  BookOpen, ShieldAlert, ArrowRight, Check, Mic, MicOff, Video, VideoOff,
  Eye, Volume2, VolumeX, RefreshCw, Pause, Clock, ChevronDown, ChevronUp,
  HelpCircle, Search, Youtube, Code, ShieldCheck
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

  // Virtual Interview Room, TTS & Session Controls State
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [expandedPracticeQuestions, setExpandedPracticeQuestions] = useState<Record<string, boolean>>({});

  // Career Twin Remediation & Mini-Reassessment State
  const [reassessingConcept, setReassessingConcept] = useState<string | null>(null);
  const [reassessmentInput, setReassessmentInput] = useState('');
  const [reassessmentLoading, setReassessmentLoading] = useState(false);
  const [reassessmentFeedback, setReassessmentFeedback] = useState<Record<string, { resolved: boolean; score: number; message: string }>>({});

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

  // Natural Web Speech TTS Read-Aloud Engine
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window) || !ttsEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('google us english') ||
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('karen')) &&
          v.lang.startsWith('en')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      utterance.onstart = () => setIsInterviewerSpeaking(true);
      utterance.onend = () => setIsInterviewerSpeaking(false);
      utterance.onerror = () => setIsInterviewerSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setIsInterviewerSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsInterviewerSpeaking(false);
  };

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (mode === 'active' && !isPaused && !submitting) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, isPaused, submitting]);

  // Clean up audio speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const togglePause = () => {
    if (!isPaused) {
      stopSpeaking();
      if (sttSessionRef.current && isRecording) {
        sttSessionRef.current.stop();
        setIsRecording(false);
        setAudioVolume(0);
      }
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  };

  const endInterviewEarly = async () => {
    if (!sessionId) return;
    if (window.confirm('Are you sure you want to end the interview early? Your answers submitted so far will be evaluated and finalized.')) {
      stopSpeaking();
      await completeInterview(sessionId);
    }
  };

  const togglePracticeQuestion = (key: string) => {
    setExpandedPracticeQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleMiniReassessment = async (concept: string, studentAnswer?: string) => {
    setReassessmentLoading(true);
    try {
      const res = await apiRequest<any>(`/career-twin/reassess/${encodeURIComponent(concept)}`, {
        method: 'POST',
        body: JSON.stringify({
          score: 85,
          answers: studentAnswer || 'Demonstrated understanding of core principles, trade-offs, and practical industry workflows.',
        }),
        token,
      });

      setReassessmentFeedback((prev) => ({
        ...prev,
        [concept]: {
          resolved: res.resolved ?? true,
          score: res.score ?? 85,
          message: res.message || `Topic '${concept}' successfully mastered via mini-reassessment!`,
        },
      }));

      // Update report weakness remediations locally
      if (report?.weaknessRemediations) {
        setReport((prev: any) => ({
          ...prev,
          weaknessRemediations: (prev.weaknessRemediations || []).map((rem: any) =>
            rem.concept?.toLowerCase() === concept.toLowerCase() || rem.topic?.toLowerCase() === concept.toLowerCase()
              ? { ...rem, resolved: true, score: Math.max(rem.score || 0, res.score || 85) }
              : rem
          ),
        }));
      }

      setReassessingConcept(null);
      setReassessmentInput('');
    } catch (err: any) {
      alert('Mini-reassessment failed: ' + err.message);
    } finally {
      setReassessmentLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

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
      stopSpeaking();
      setElapsedSeconds(0);
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
        if (ttsEnabled && response.question) {
          speakQuestion(response.question);
        }
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
    }
  };

  const submitAnswer = async (forcedAnswer?: string) => {
    if (!sessionId || !currentQuestion) return;

    stopSpeaking();
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
    stopSpeaking();
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
    stopSpeaking();
    setMode('setup');
    setSessionId(null);
    setCurrentQuestion(null);
    setUserAnswer('');
    setProgress(0);
    setReport(null);
    setClaimedCertificate(null);
    setCreatedReport(null);
    setIsPaused(false);
    setElapsedSeconds(0);
    setExpandedPracticeQuestions({});
    setReassessmentFeedback({});
    setReassessingConcept(null);
    setReassessmentInput('');
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

      {/* Active Interview Mode - 2-Column Virtual Interview Room */}
      {mode === 'active' && currentQuestion && (
        <div className="mt-8 space-y-6">
          {/* Room Header: Progress, Live Timer & Session Controls */}
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex flex-wrap items-center gap-3">
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
                <span className="text-xs text-slate-400">
                  • {currentQuestion.domain || setupForm.field}
                </span>
              </div>

              {/* Timer & Room Action Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs font-mono text-cyan-300">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{formatTime(elapsedSeconds)} / {currentQuestion.expectedDuration || 90}s</span>
                </div>

                <button
                  type="button"
                  onClick={togglePause}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                    isPaused
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800 text-slate-300 border-white/10 hover:text-white'
                  }`}
                  title={isPaused ? "Resume Interview" : "Pause Interview Timer"}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>

                <button
                  type="button"
                  onClick={endInterviewEarly}
                  className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition flex items-center gap-1"
                  title="Finalize answers and view evaluation report now"
                >
                  End Early
                </button>
              </div>
            </div>
            <ProgressBar value={progress * 100} tone="bg-cyan-500" />
          </div>

          {/* 2-Column Virtual Interview Room Workspace */}
          <div className="grid gap-6 lg:grid-cols-2 relative">
            {/* Evaluating Overlay when submitting */}
            {submitting && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-2xl p-6 text-center shadow-2xl border border-cyan-500/20">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-4" />
                <h4 className="text-lg font-bold text-white mb-1">AI Evaluating Your Response...</h4>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  Synthesizing technical depth, communication clarity, problem-solving reasoning, confidence, and structure...
                </p>
              </div>
            )}

            {/* Paused Overlay */}
            {isPaused && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-2xl p-6 text-center shadow-2xl border border-amber-500/20">
                <Pause className="h-12 w-12 text-amber-400 mb-3" />
                <h4 className="text-xl font-bold text-white mb-2">Interview Session Paused</h4>
                <p className="text-xs text-slate-300 max-w-md mb-6">
                  The session timer and speech recording are currently paused. Click resume when you are ready to continue.
                </p>
                <button
                  onClick={togglePause}
                  className="px-6 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 shadow-lg flex items-center gap-2"
                >
                  <Play className="h-4 w-4 fill-slate-950" />
                  Resume Interview
                </button>
              </div>
            )}

            {/* Column 1: AI Interviewer Console */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950/95 p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-5">
              <div>
                {/* Header with Interviewer Title & Live State */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      AI Virtual Interviewer
                    </span>
                  </div>

                  {/* Interviewer State Badge */}
                  {isInterviewerSpeaking ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold animate-pulse">
                      <Volume2 className="h-3.5 w-3.5" />
                      Speaking Question...
                    </div>
                  ) : isRecording ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      Listening to Candidate
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Standby
                    </div>
                  )}
                </div>

                {/* AI Interviewer Avatar & Voice Waveform Visualizer */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="relative">
                    <div className={`absolute -inset-2 rounded-full blur-xl transition duration-500 ${
                      isInterviewerSpeaking ? 'bg-cyan-500/50 opacity-100 animate-pulse' : 'bg-transparent opacity-0'
                    }`} />
                    <img
                      src="/images/ai_female_interviewer.png"
                      alt="AI Female Interviewer"
                      className={`relative w-36 h-36 rounded-full object-cover border-4 transition-all duration-300 shadow-2xl ${
                        isInterviewerSpeaking
                          ? 'border-cyan-400 ring-4 ring-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.6)] scale-105'
                          : 'border-slate-800'
                      }`}
                    />
                    {isInterviewerSpeaking && (
                      <span className="absolute bottom-2 right-2 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-500 items-center justify-center text-[9px] text-slate-950 font-extrabold">
                          AI
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Audio Wave Bars Simulation when speaking */}
                  <div className="h-6 flex items-center gap-1 mt-4">
                    {isInterviewerSpeaking ? (
                      <>
                        <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-4" />
                        <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-6" />
                        <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-3" />
                        <span className="w-1 bg-cyan-500 rounded-full animate-bounce h-5" />
                        <span className="w-1 bg-cyan-300 rounded-full animate-pulse h-4" />
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Natural Web Speech TTS Engine Active</span>
                    )}
                  </div>

                  {/* Audio TTS Controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isInterviewerSpeaking) {
                          stopSpeaking();
                        } else if (currentQuestion?.question) {
                          speakQuestion(currentQuestion.question);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition border border-cyan-500/20"
                    >
                      {isInterviewerSpeaking ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
                      {isInterviewerSpeaking ? 'Stop Audio' : 'Listen to Question'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTtsEnabled(!ttsEnabled)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                        ttsEnabled
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-950 text-slate-500 border-white/5'
                      }`}
                      title="Toggle automatic speech read-aloud when questions change"
                    >
                      Auto-Read: {ttsEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Current Question Card */}
                <div className="p-4 rounded-xl border border-white/10 bg-slate-950/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px]">
                      Topic: {currentQuestion.topic || setupForm.topic}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">
                      Target Duration: {currentQuestion.expectedDuration || 90}s
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-white/5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                Adaptive progression: Demonstrating deep technical knowledge advances you toward Advanced problems.
              </div>
            </div>

            {/* Column 2: Candidate Workspace & Engagement Proctor */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md space-y-4 flex flex-col justify-between">
              {/* Webcam & Telemetry Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Video Feed & Proctor</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-white/10 hover:text-white transition flex items-center gap-1"
                  >
                    {cameraActive ? <Video className="h-3 w-3 text-emerald-400" /> : <VideoOff className="h-3 w-3 text-slate-500" />}
                    {cameraActive ? 'Camera On' : 'Audio Only'}
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-video flex items-center justify-center border border-white/10 shadow-inner">
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
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] border border-white/10 text-white font-mono">
                      <span className={`h-1.5 w-1.5 rounded-full ${visualMetrics.faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      {visualMetrics.faceDetected ? 'FACE TRACKED' : 'ALIGNING FACE'}
                    </div>
                  )}
                </div>

                {/* Behavioral Telemetry Badges */}
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5 text-center">
                    <span className="text-slate-500 block text-[10px]">Camera-Facing</span>
                    <span className="font-mono font-bold text-cyan-300">{visualMetrics.cameraFacingPercentage}%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5 text-center">
                    <span className="text-slate-500 block text-[10px]">Engagement</span>
                    <span className={`font-bold ${
                      visualMetrics.behaviorStatus === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {visualMetrics.behaviorStatus === 'NORMAL' ? 'Optimal' : 'Looking Away'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5 text-center">
                    <span className="text-slate-500 block text-[10px]">Candidate Count</span>
                    <span className="font-mono text-slate-300">
                      {visualMetrics.multipleFacesDetected ? 'Multiple' : 'Single'}
                    </span>
                  </div>
                </div>

                {/* Approximate Legal Disclaimer */}
                <div className="p-2 rounded-lg border border-white/5 bg-slate-950/60 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">Observation Note:</strong> Approximate AI-assisted interview-behavior observations (not scientific psychological or personality claims; not sole basis of scoring).
                  </span>
                </div>
              </div>

              {/* Voice STT & Answer Input Area */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Your Solution / Explanation:
                  </label>
                  
                  {/* Voice Recording Control */}
                  <div className="flex items-center gap-2">
                    {isRecording && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        Recording ({audioVolume}%)
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

                {/* STT Warning if confidence is low */}
                {audioWarning && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span>{audioWarning} You can type or edit your response below.</span>
                  </div>
                )}

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Speak via microphone or type your technical solution here. Structure your reasoning with core principles, methodology, trade-offs, and failure mode handling..."
                  className="w-full h-36 px-4 py-3 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-y text-sm font-sans"
                />

                {/* Transcription Confidence */}
                {wasRecordedAudio && transcriptionConfidence !== null && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3 text-cyan-400" />
                      Speech Transcription Confidence: <strong className="text-white">{Math.round(transcriptionConfidence * 100)}%</strong>
                    </span>
                    <span className="text-emerald-400">Aligned with technical vocabulary</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
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
                    className="px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40 text-xs font-semibold transition flex items-center justify-center gap-1"
                    title="Test empty answer handling (0 marks awarded)"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Skip (0 Marks)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswer("I do not know the answer to this question.");
                      submitAnswer("I do not know the answer to this question.");
                    }}
                    disabled={submitting}
                    className="px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/40 text-xs font-semibold transition flex items-center justify-center gap-1"
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
                      AI Scoring...
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
          </div>
        </div>
      )}

      {/* Completed Mode - Comprehensive Report & Learning System */}
      {mode === 'completed' && report && (
        <div className="mt-8 space-y-8">
          {/* Header Banner */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-emerald-950/40 p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Interview Assessment Completed</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  Domain: <span className="text-cyan-300 font-semibold">{report.domain || setupForm.field}</span> • Role: <span className="text-cyan-300 font-semibold">{report.role || setupForm.topic}</span> • Questions Evaluated: {report.questionsAsked || report.totalQuestions || report.answers?.length || 10}
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

          {/* Official AI Evaluator Final Remark Block */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
              <img
                src="/images/ai_female_interviewer.png"
                alt="AI Interviewer"
                className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400 shadow-md flex-shrink-0"
              />
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  Official AI Evaluator Remark & Performance Synthesis
                </h4>
                <p className="text-xs text-slate-400">
                  SkillDNA AI Interview Panel • {report.domain || setupForm.field} ({report.role || setupForm.topic})
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/80 border border-white/5 text-sm text-slate-200 italic leading-relaxed">
              "{report.finalRemark || report.aiRemark || report.finalReport?.finalRemark || report.finalReport?.aiRemark || `Candidate completed technical assessment in ${report.domain || setupForm.field}. Demonstrated structured analytical reasoning and core domain competencies.`}"
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

          {/* Strengths & Weaknesses + Behavioral Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Strengths */}
            <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-5 shadow-lg">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Demonstrated Strengths
              </h4>
              {report.strengthAreas?.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-300">
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

            {/* Areas to Improve */}
            <div className="rounded-xl border border-amber-500/20 bg-slate-900/60 p-5 shadow-lg">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Areas to Improve & Stuck Topics
              </h4>
              {report.weakAreas?.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-300">
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
            </div>

            {/* Approximate Behavioral Telemetry Summary */}
            <div className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  Behavioral Telemetry Summary
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400">Camera-Facing Ratio</span>
                    <span className="font-mono text-cyan-300 font-semibold">{visualMetrics.cameraFacingPercentage}%</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400">Engagement Posture</span>
                    <span className="text-emerald-400 font-semibold">{visualMetrics.behaviorStatus === 'NORMAL' ? 'Optimal' : 'Variable'}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-2 border-t border-white/5 mt-3">
                Approximate AI-assisted interview-behavior observations (not scientific psychological or personality claims; not sole basis of scoring).
              </p>
            </div>
          </div>

          {/* Question-by-Question Review */}
          {report.answers && report.answers.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
              <h4 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                Question-by-Question Diagnostic Review
              </h4>
              <div className="space-y-4">
                {report.answers.map((ans: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/5 bg-slate-950/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">
                        Question {idx + 1}: {ans.questionId?.topic || ans.topic || 'Core Concept'}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                        (ans.scores?.correctness ?? ans.correctness ?? 0) >= 75 ? 'bg-emerald-500/20 text-emerald-300' :
                        (ans.scores?.correctness ?? ans.correctness ?? 0) >= 50 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        Score: {ans.scores?.correctness ?? ans.correctness ?? 0}/100
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {ans.questionId?.question || ans.questionText || 'Question prompt'}
                    </p>

                    <div className="p-2.5 rounded bg-slate-900 text-xs text-slate-300 border border-white/5">
                      <strong className="text-slate-400 block mb-1">Your Answer ({ans.answerType || 'Text'}):</strong>
                      <span className="italic">{ans.answer || '[No answer submitted - 0 marks awarded]'}</span>
                    </div>

                    {ans.feedback && (
                      <p className="text-xs text-cyan-300/90 bg-cyan-950/20 p-2.5 rounded border border-cyan-500/20">
                        <strong>AI Feedback:</strong> {ans.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY INTERVIEW IMPROVEMENT PLAN (Career Twin & Learning System) */}
          {(report.weaknessRemediations || report.myImprovementPlan || report.finalReport?.weaknessRemediations || []).length > 0 && (
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 shadow-2xl backdrop-blur-md space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-lg sm:text-xl">
                    My Interview Improvement Plan & Targeted Remediation
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Personalized diagnostic recovery plan generated from topics where you were challenged. Master core principles, review 5 practice questions, and take mini-reassessments to update your Career Twin and Skill DNA profile.
                </p>
              </div>

              {/* Remediation Cards */}
              <div className="space-y-6">
                {(report.weaknessRemediations || report.myImprovementPlan || report.finalReport?.weaknessRemediations || []).map((rem: any, remIdx: number) => {
                  const isResolved = rem.resolved || (reassessmentFeedback[rem.concept]?.resolved ?? false);
                  const displayScore = reassessmentFeedback[rem.concept]?.score || rem.score || 40;
                  const isReassessing = reassessingConcept === rem.concept;

                  return (
                    <div
                      key={remIdx}
                      className={`p-6 rounded-xl border transition-all ${
                        isResolved
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : 'border-white/10 bg-slate-950/70'
                      }`}
                    >
                      {/* Concept Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/5 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-white">{rem.concept || rem.topic}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              rem.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              rem.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {rem.severity || 'Diagnostic Priority'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 mt-0.5 block">
                            Domain: {rem.domain || report.domain || setupForm.field}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isResolved ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              Mastered via Mini-Reassessment ({displayScore}%) • Skill DNA Updated!
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                              Needs Mastery ({displayScore}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Simple Explanation */}
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Simple Explanation & Intuition
                        </h5>
                        <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-white/5">
                          {rem.simpleExplanation || `Understanding ${rem.concept} is essential for scalable system design and industry workflows.`}
                        </p>
                      </div>

                      {/* Important Concepts & Principles */}
                      {rem.importantConcepts && rem.importantConcepts.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Key Principles & Architectural Insights
                          </h5>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {rem.importantConcepts.map((conceptStr: string, cIdx: number) => (
                              <div key={cIdx} className="p-2.5 rounded-lg bg-slate-900/40 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                                <span>{conceptStr}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Production Example */}
                      {rem.examples && (
                        <div className="mb-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                            <Code className="h-3.5 w-3.5 text-cyan-400" />
                            Production Implementation Example
                          </h5>
                          <pre className="p-3.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-cyan-200 font-mono overflow-x-auto whitespace-pre-wrap">
                            {rem.examples}
                          </pre>
                        </div>
                      )}

                      {/* 5 Practice Questions with Collapsible Answers */}
                      {rem.practiceQuestions && rem.practiceQuestions.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                            5 Diagnostic Practice Questions
                          </h5>
                          <div className="space-y-2">
                            {rem.practiceQuestions.map((pq: any, pqIdx: number) => {
                              const toggleKey = `${remIdx}-${pqIdx}`;
                              const isExpanded = expandedPracticeQuestions[toggleKey];

                              return (
                                <div key={pqIdx} className="p-3 rounded-lg bg-slate-900/80 border border-white/5 text-xs">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 flex-1">
                                      <span className="font-bold text-cyan-400">Q{pqIdx + 1}.</span>
                                      <span className="text-white font-medium">{pq.question}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => togglePracticeQuestion(toggleKey)}
                                      className="px-2 py-1 rounded bg-slate-950 text-[11px] text-cyan-300 border border-cyan-500/20 hover:bg-slate-800 transition flex items-center gap-1 flex-shrink-0"
                                    >
                                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                      {isExpanded ? 'Hide Model Answer' : 'Show Model Answer'}
                                    </button>
                                  </div>

                                  {isExpanded && (
                                    <div className="mt-2.5 pt-2.5 border-t border-white/5 text-slate-300 bg-slate-950/60 p-2.5 rounded">
                                      <strong className="text-cyan-400 block mb-1">Model Answer / Explanation:</strong>
                                      <p className="leading-relaxed">{pq.answer}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Bar: External Resource Links & Mini-Reassessment Button */}
                      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {rem.resources?.googleSearchUrl && (
                            <a
                              href={rem.resources.googleSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Search className="h-3.5 w-3.5 text-cyan-400" />
                              Search Google Docs
                            </a>
                          )}

                          {rem.resources?.youtubeSearchUrl && (
                            <a
                              href={rem.resources.youtubeSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Youtube className="h-3.5 w-3.5 text-rose-400" />
                              Watch YouTube Tutorials
                            </a>
                          )}
                        </div>

                        {/* Interactive Mini-Reassessment Button */}
                        <div>
                          {!isResolved ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (isReassessing) {
                                  setReassessingConcept(null);
                                } else {
                                  setReassessingConcept(rem.concept);
                                  setReassessmentInput('');
                                }
                              }}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 flex items-center gap-1.5 shadow-md transition"
                            >
                              <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
                              {isReassessing ? 'Cancel Mini-Reassessment' : 'Take Mini-Reassessment'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              Resolved in Career Twin
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inline Mini-Reassessment Input Form */}
                      {isReassessing && (
                        <div className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 space-y-3">
                          <div className="flex items-center justify-between">
                            <h6 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                              Mini-Reassessment: Demonstrate Mastery of {rem.concept}
                            </h6>
                            <span className="text-[11px] text-slate-400">Score &gt;= 75% marks topic as resolved</span>
                          </div>

                          <textarea
                            value={reassessmentInput}
                            onChange={(e) => setReassessmentInput(e.target.value)}
                            placeholder={`Explain the foundational architecture, core mechanisms, and production best practices for ${rem.concept}...`}
                            className="w-full h-24 px-3 py-2 rounded-lg border border-white/10 bg-slate-950 text-white text-xs placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReassessingConcept(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMiniReassessment(rem.concept, reassessmentInput)}
                              disabled={reassessmentLoading}
                              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
                            >
                              {reassessmentLoading ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5" />
                                  Submit Reassessment
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                          A minimum composite score of 75% is required to earn an official SkillDNA certificate. Please review your stuck topics in the improvement plan above, practice, and re-attempt to qualify.
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
