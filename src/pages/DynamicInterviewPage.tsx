import { Play, RotateCcw, Radio, Loader2, Send, CheckCircle2, TrendingUp, Award, Download, Share2, ExternalLink, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { apiRequest, api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/SectionHeader';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';

type InterviewMode = 'setup' | 'active' | 'completed' | 'report';

const DynamicInterviewPage = () => {
  const { token } = useAuth();
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
  
  const location = useLocation();
  const [setupForm, setSetupForm] = useState({
    field: 'Computer Science',
    topic: 'JavaScript',
    difficulty: 'Medium',
    questionCount: 5,
  });

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
      const response = await apiRequest<any>(`/questions/interview/next/${sid}`, { token });
      
      if (response.completed) {
        completeInterview(sid);
      } else {
        setCurrentQuestion(response);
        setProgress(response.sequence / response.totalQuestions);
        setUserAnswer('');
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId || !currentQuestion) return;

    setSubmitting(true);
    try {
      await apiRequest<any>('/questions/interview/submit-answer', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.questionId,
          answer: userAnswer,
          answerType: 'Text',
          timeTaken: 120, // Mock time
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
              domain: reportData.session?.field || 'Computer Science',
              branch: reportData.session?.topic || 'General',
              skills: [reportData.session?.topic || 'Software Development'],
              college: 'SkillDNA Academy',
              bio: 'Active learner in technology.',
            }),
            token,
          });
        } else {
          throw err;
        }
      }

      if (profile) {
        const savedReport = await apiRequest<any>('/reports', {
          method: 'POST',
          body: JSON.stringify({
            profileId: profile._id,
            interviewScore: Math.round(reportData.averageScores?.averageCorrectness || 0),
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
      const completionRes = await apiRequest<any>(`/questions/interview/complete/${sid}`, {
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
    setClaimingCertificate(true);
    try {
      const scores = report.averageScores;
      const certRes = await apiRequest<any>('/certificates/create', {
        method: 'POST',
        body: JSON.stringify({
          careerPath: report.session?.topic || 'Developer',
          technicalScore: Math.round(scores.averageTechnical || 80),
          communicationScore: Math.round(scores.averageCommunication || 80),
          problemSolvingScore: Math.round(scores.averageCorrectness || 80),
          confidenceScore: Math.round((scores.averageCommunication + scores.averageTechnical) / 2 || 80),
          sessionsCompleted: 1,
          strengths: report.strengthAreas || [],
          improvements: report.weakAreas || [],
        }),
        token,
      });
      setClaimedCertificate(certRes.certificate);
      alert('Certificate claimed successfully!');
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
          company: 'Recruiter Partner',
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
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="AI Dynamic Interview"
        title="Personalized interview with AI-generated questions"
        description="Each student gets unique questions. AI analyzes your answers in real-time."
      />

      {/* Setup Mode */}
      {mode === 'setup' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white mb-4">Interview Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Field
                </label>
                <select
                  value={setupForm.field}
                  onChange={(e) => setSetupForm({ ...setupForm, field: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="MBA">MBA</option>
                  <option value="Medical">Medical</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={setupForm.topic}
                  onChange={(e) => setSetupForm({ ...setupForm, topic: e.target.value })}
                  placeholder="e.g., JavaScript, Python, React"
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={setupForm.difficulty}
                  onChange={(e) => setSetupForm({ ...setupForm, difficulty: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={setupForm.questionCount}
                  onChange={(e) => setSetupForm({ ...setupForm, questionCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500"
                />
              </div>

              <button
                onClick={startInterview}
                className="w-full px-4 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 flex items-center justify-center gap-2 transition"
              >
                <Play className="h-5 w-5" />
                Start Interview
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              How It Works
            </h3>
            <ul className="text-sm text-slate-300 space-y-3">
              <li className="flex gap-2">
                <span className="text-cyan-400">✓</span>
                Each student gets unique questions
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">✓</span>
                Questions are generated by AI
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">✓</span>
                Adaptive difficulty based on performance
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">✓</span>
                Real-time answer analysis
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">✓</span>
                Score breakdown after completion
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">✓</span>
                Personalized learning recommendations
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Active Interview Mode */}
      {mode === 'active' && currentQuestion && (
        <div className="mt-8 grid gap-6">
          {/* Progress Bar */}
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Progress</span>
              <span className="text-sm text-cyan-400">{Math.round(progress * 100)}%</span>
            </div>
            <ProgressBar value={progress * 100} tone="bg-cyan-500" />
          </div>

          {/* Question */}
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Question {currentQuestion.sequence} of {currentQuestion.totalQuestions}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
                Estimated: {currentQuestion.expectedDuration}s
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mt-4 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Answer Input */}
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 px-4 py-3 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500 resize-none"
            />

            {/* Submit Button */}
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || submitting}
              className="mt-4 px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Completed Mode - Report */}
      {mode === 'completed' && report && (
        <div className="mt-8 grid gap-6">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-6 flex items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-white">Interview Completed!</h3>
              <p className="text-sm text-slate-300 mt-1">
                {report.questionsAsked} questions answered. Results analyzed below.
              </p>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Correctness"
              value={Math.round(report.averageScores.averageCorrectness)}
              suffix="%"
              progress={report.averageScores.averageCorrectness}
              tone="bg-cyan-400"
            />
            <MetricCard
              label="Communication"
              value={Math.round(report.averageScores.averageCommunication)}
              suffix="%"
              progress={report.averageScores.averageCommunication}
              tone="bg-emerald-400"
            />
            <MetricCard
              label="Technical"
              value={Math.round(report.averageScores.averageTechnical)}
              suffix="%"
              progress={report.averageScores.averageTechnical}
              tone="bg-violet-400"
            />
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-6">
              <h3 className="font-semibold text-white mb-4">✓ Strengths</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {report.strengthAreas.map((area: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-950/30 p-6">
              <h3 className="font-semibold text-white mb-4">⚠ Areas to Improve</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {report.weakAreas.map((area: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-400">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action and Certificate Claiming Area */}
          <div className="grid gap-6 md:grid-cols-2 mt-2">
            {/* Verified Report Card Section */}
            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-cyan-400" />
                  Verified SkillDNA Report Card
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  A public report card with granular performance analysis, AI comments, and verified scores.
                </p>

                {createdReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded bg-slate-950/50 border border-white/5">
                      <div>
                        <div className="text-xs text-slate-500">Verification ID</div>
                        <div className="text-sm font-mono text-cyan-300 font-semibold">{createdReport.verificationId}</div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdReport.publicUrl);
                          alert('Verification link copied to clipboard!');
                        }}
                        className="p-2 rounded hover:bg-white/5 text-slate-400 hover:text-white"
                        title="Copy Verification Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <a
                      href={`/report/${createdReport.verificationId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Live Report Card
                    </a>

                    {/* Share Form */}
                    <form onSubmit={handleShareReport} className="mt-4 pt-4 border-t border-white/5">
                      <label className="block text-xs font-medium text-slate-400 mb-2">Share with Recruiters</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="recruiter@company.com"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded border border-white/10 bg-slate-950 text-white text-xs placeholder-slate-500 focus:border-cyan-500"
                          required
                        />
                        <button
                          type="submit"
                          disabled={sharing}
                          className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          {sharing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
                          Share
                        </button>
                      </div>
                      {shareSuccess && (
                        <p className="text-xs text-emerald-400 mt-1">✓ Shared with recruiter successfully!</p>
                      )}
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                    Generating verified report card...
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Section */}
            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Verifiable Skill Certificate
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Earn a secure, cryptographically verifiable badge and PDF document representing your expertise.
                </p>

                {claimedCertificate ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200">
                      <div className="text-xs">Certificate Claimed!</div>
                      <div className="text-sm font-semibold mt-1 font-mono text-amber-300">{claimedCertificate.certificateId}</div>
                    </div>

                    <button
                      onClick={handleDownloadPDF}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF Certificate
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 rounded bg-slate-950/50 border border-white/5 text-slate-400 text-xs">
                      Claim your verified certificate once you complete the interview with passing grades.
                    </div>

                    <button
                      onClick={claimCertificate}
                      disabled={claimingCertificate}
                      className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {claimingCertificate ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Claiming Certificate...
                        </>
                      ) : (
                        <>
                          <Award className="h-4 w-4" />
                          Claim Verifiable Certificate
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reset Interview Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={resetInterview}
              className="px-8 py-3 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2 transition text-sm font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              Start New Interview
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default DynamicInterviewPage;
