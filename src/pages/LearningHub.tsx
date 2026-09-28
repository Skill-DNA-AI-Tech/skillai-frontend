import { 
  FileText, ListChecks, Sparkles, Loader2, CheckCircle2, XCircle, 
  AlertTriangle, Award, BookOpen, MessageSquare, Send, ChevronRight, 
  ChevronDown, RotateCcw, ExternalLink, HelpCircle, Lock, Video, 
  Code, Compass, ArrowRight, CheckCircle, RefreshCw, X, AlertCircle,
  Bookmark, Copy, Search, Trash2, Download
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';
import { apiRequest, getApiBaseUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type TabType = 'notes' | 'ai-notes' | 'my-notes' | 'resources' | 'mcq' | 'interview' | 'remediation';

interface TopicProgress {
  name: string;
  subtopics: string[];
  status: 'PASSED' | 'NEEDS_REVISION' | 'IN_PROGRESS' | 'NOT_STARTED';
  mcqScore?: number;
  interviewScore?: number;
  isMastered: boolean;
  attempts: number;
}

interface ActiveCurriculumData {
  career: string;
  domain: string;
  description: string;
  topics: TopicProgress[];
  totalTopics: number;
  masteredTopics: number;
  completionPercentage: number;
}

const LearningHub = () => {
  const { token, user } = useAuth();

  // Active Curriculum State
  const [curriculum, setCurriculum] = useState<ActiveCurriculumData | null>(null);
  const [curriculumLoading, setCurriculumLoading] = useState(true);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('notes');

  // Topic Content State (Admin notes & resources)
  const [topicContent, setTopicContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentRequested, setContentRequested] = useState(false);
  const [requestingContent, setRequestingContent] = useState(false);

  // MCQ Assessment State
  const [mcqMode, setMcqMode] = useState<'setup' | 'active' | 'result'>('setup');
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqSessionId, setMcqSessionId] = useState<string | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [mcqActiveIndex, setMcqActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [mcqResult, setMcqResult] = useState<any>(null);
  const [submittingMcq, setSubmittingMcq] = useState(false);

  // Quick Chatbot State
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; links?: Array<{ label: string; path: string }> }>>([
    {
      sender: 'bot',
      text: 'Hello! I am your SkillDNA Learning & Platform Assistant. Ask me any conceptual question about your active curriculum, or how to navigate the platform.',
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

  // AI Study Notes State
  const [aiNoteTopic, setAiNoteTopic] = useState('');
  const [aiNoteDomain, setAiNoteDomain] = useState('');
  const [aiNoteSourceText, setAiNoteSourceText] = useState('');
  const [aiNoteLevel, setAiNoteLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);
  const [noteActiveSubtab, setNoteActiveSubtab] = useState<'summary' | 'detailed' | 'keypoints' | 'revision' | 'questions' | 'flashcards' | 'quiz'>('summary');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaveSuccess, setNoteSaveSuccess] = useState<string | null>(null);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [noteQuizAnswers, setNoteQuizAnswers] = useState<Record<string, number>>({});
  const [noteQuizSubmitted, setNoteQuizSubmitted] = useState(false);
  const [noteQuizResult, setNoteQuizResult] = useState<any>(null);

  // My Saved Notes State
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [loadingMyNotes, setLoadingMyNotes] = useState(false);
  const [savedNotesSearch, setSavedNotesSearch] = useState('');
  const [selectedSavedNote, setSelectedSavedNote] = useState<any>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const fetchMyNotes = async () => {
    if (!token) return;
    try {
      setLoadingMyNotes(true);
      const data = await apiRequest<any[]>('/learning/notes/my', { token });
      setMyNotes(data || []);
    } catch (err: any) {
      console.warn('Failed to load saved notes:', err);
    } finally {
      setLoadingMyNotes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-notes') {
      fetchMyNotes();
    }
  }, [activeTab]);

  const handleGenerateAiNotes = async () => {
    const topicToUse = aiNoteTopic.trim() || curriculum?.topics?.[selectedTopicIndex]?.name || 'Core Fundamentals';
    setGeneratingNotes(true);
    setNoteSaveSuccess(null);
    setNoteQuizAnswers({});
    setNoteQuizSubmitted(false);
    setNoteQuizResult(null);
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
    try {
      const res = await apiRequest<any>('/learning/notes/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: topicToUse,
          domain: aiNoteDomain || curriculum?.domain || 'General',
          sourceText: aiNoteSourceText.trim(),
          level: aiNoteLevel,
        }),
        token,
      });
      setGeneratedNote(res);
      setNoteActiveSubtab('summary');
    } catch (err: any) {
      alert('Failed to generate notes: ' + (err?.message || 'Unknown error'));
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleSaveAiNote = async () => {
    if (!generatedNote) return;
    setSavingNote(true);
    try {
      await apiRequest('/learning/notes/save', {
        method: 'POST',
        body: JSON.stringify({
          topic: generatedNote.topic,
          domain: generatedNote.domain,
          summary: generatedNote.summary,
          detailedNotes: generatedNote.detailedNotes,
          keyPoints: generatedNote.keyPoints,
          quickRevision: generatedNote.quickRevision,
          questions: generatedNote.questions,
          flashcards: generatedNote.flashcards,
          quiz: generatedNote.quiz,
        }),
        token,
      });
      setNoteSaveSuccess('Study note saved to your personal library!');
      fetchMyNotes();
      setTimeout(() => setNoteSaveSuccess(null), 3500);
    } catch (err: any) {
      alert('Failed to save note: ' + (err?.message || 'Unknown error'));
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteSavedNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      setDeletingNoteId(id);
      await apiRequest(`/learning/notes/${id}`, {
        method: 'DELETE',
        token,
      });
      setMyNotes((prev) => prev.filter((n) => (n.id || n._id) !== id));
      if (selectedSavedNote && (selectedSavedNote.id === id || selectedSavedNote._id === id)) {
        setSelectedSavedNote(null);
      }
    } catch (err: any) {
      alert('Failed to delete note: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleGradeNoteQuiz = () => {
    if (!generatedNote?.quiz) return;
    let correct = 0;
    const total = generatedNote.quiz.length;
    generatedNote.quiz.forEach((q: any) => {
      if (noteQuizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / total) * 100);
    setNoteQuizResult({ score, correct, total, passed: score >= 70 });
    setNoteQuizSubmitted(true);
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadDraftPdf = async () => {
    if (!generatedNote || !token) return;
    setDownloadingPdf(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/learning/notes/pdf-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: generatedNote.topic,
          domain: generatedNote.domain,
          level: generatedNote.level || aiNoteLevel,
          summary: generatedNote.summary,
          detailedNotes: generatedNote.detailedNotes,
          keyPoints: generatedNote.keyPoints,
          quickRevision: generatedNote.quickRevision,
          questions: generatedNote.questions,
          flashcards: generatedNote.flashcards,
          quiz: generatedNote.quiz,
          artifacts: generatedNote.artifacts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF study guide');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (generatedNote.topic || 'Study_Guide').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `SkillDNA_${safeName}_StudyGuide.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error downloading PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadSavedPdf = async (note: any) => {
    if (!note || !token) return;
    const noteId = note._id || note.id;
    setDownloadingPdf(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/learning/notes/${noteId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF study guide');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (note.topic || 'Study_Guide').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `SkillDNA_${safeName}_StudyGuide.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error downloading PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Load Active Curriculum
  const fetchCurriculum = async () => {
    if (!token) return;
    setCurriculumLoading(true);
    try {
      const data = await apiRequest<ActiveCurriculumData>('/learning/active-curriculum', { token });
      setCurriculum(data);
      if (data.topics && data.topics.length > 0) {
        // Expand first topic by default
        setExpandedTopics({ [data.topics[0].name]: true });
        if (data.topics[0].subtopics?.length > 0) {
          setSelectedSubtopic(data.topics[0].subtopics[0]);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch active curriculum:', err);
    } finally {
      setCurriculumLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [token]);

  const currentTopic = curriculum?.topics?.[selectedTopicIndex];

  // Fetch Topic Content (Notes, Resources, Remediation)
  const fetchTopicContent = async (topicName: string, subtopicName?: string) => {
    if (!token || !curriculum) return;
    setContentLoading(true);
    setContentRequested(false);
    try {
      const queryParams = new URLSearchParams({
        career: curriculum.career,
        domain: curriculum.domain,
        topic: topicName,
        ...(subtopicName ? { subtopic: subtopicName } : {}),
      });
      const data = await apiRequest<any>(`/learning/topic-content?${queryParams.toString()}`, { token });
      setTopicContent(data);
    } catch (err) {
      console.warn('Could not load topic content:', err);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (currentTopic) {
      fetchTopicContent(currentTopic.name, selectedSubtopic);
    }
  }, [selectedTopicIndex, selectedSubtopic, curriculum?.career]);

  // Request Admin to Add Notes
  const handleRequestContent = async () => {
    if (!curriculum || !currentTopic) return;
    setRequestingContent(true);
    try {
      await apiRequest('/learning/request-content', {
        method: 'POST',
        body: JSON.stringify({
          career: curriculum.career,
          domain: curriculum.domain,
          topic: currentTopic.name,
          subtopic: selectedSubtopic || 'General',
          studentNotes: 'Student requested verified notes for this curriculum topic.',
        }),
        token,
      });
      setContentRequested(true);
      alert('Content request submitted to Admin! Verified notes will be curated and published shortly.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit content request.');
    } finally {
      setRequestingContent(false);
    }
  };

  // MCQ Handlers
  const handleStartMcq = async () => {
    if (!curriculum || !currentTopic) return;
    setMcqLoading(true);
    try {
      const data = await apiRequest<any>('/mcq/start', {
        method: 'POST',
        body: JSON.stringify({
          career: curriculum.career,
          domain: curriculum.domain,
          topic: currentTopic.name,
          subtopic: selectedSubtopic || '',
          questionCount: 10,
        }),
        token,
      });

      setMcqSessionId(data.sessionId);
      setMcqQuestions(data.questions || []);
      setMcqActiveIndex(0);
      setSelectedAnswers({});
      setMcqResult(null);
      setMcqMode('active');
    } catch (err: any) {
      alert('Failed to start MCQ assessment: ' + err.message);
    } finally {
      setMcqLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionText: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleSubmitMcq = async () => {
    if (!mcqSessionId) return;

    const unanswered = mcqQuestions.filter((q) => !selectedAnswers[q.questionId]);
    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Unanswered questions receive 0 marks. Submit now?`
      );
      if (!confirmSubmit) return;
    }

    setSubmittingMcq(true);
    try {
      const answersPayload = mcqQuestions.map((q) => ({
        questionId: q.questionId,
        selectedOption: selectedAnswers[q.questionId] || '',
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
      // Refresh curriculum progress
      await fetchCurriculum();
    } catch (err: any) {
      alert('Failed to submit MCQ assessment: ' + err.message);
    } finally {
      setSubmittingMcq(false);
    }
  };

  // AI Chatbot Message Handler
  const handleSendChatMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = customPrompt || chatInput.trim();
    if (!query || chatLoading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: query, time: userTime }]);
    if (!customPrompt) setChatInput('');
    setChatLoading(true);

    try {
      const historyPayload = chatMessages.slice(-6).map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await apiRequest<any>('/learning/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: query,
          career: curriculum?.career,
          domain: curriculum?.domain,
          topic: currentTopic?.name,
          subtopic: selectedSubtopic,
          history: historyPayload,
        }),
        token,
      });

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply || 'Here is what you should know.',
          time: botTime,
          links: res.navigationOptions || [],
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I encountered an issue processing your question. Please try again.', time: 'now' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const toggleTopicExpand = (tName: string) => {
    setExpandedTopics((prev) => ({ ...prev, [tName]: !prev[tName] }));
  };

  if (curriculumLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // If student does not have an active curriculum set up yet
  if (!curriculum || !curriculum.career) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30 rounded-2xl p-10 text-center shadow-2xl">
          <BookOpen className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">No Active Curriculum Assigned</h2>
          <p className="text-slate-300 max-w-lg mx-auto mb-6 text-sm">
            To view your tailored curriculum, notes, question bank MCQs, and adaptive interview roadmaps, you must first complete your profile setup and choose your targeted Career.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Complete Profile Setup Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  const currentMcqQuestion = mcqQuestions[mcqActiveIndex];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Banner: Active Career & Locked Curriculum */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-3 py-1 rounded-full font-bold">
                {curriculum.domain}
              </span>
              <h1 className="text-2xl font-bold text-white">{curriculum.career}</h1>
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> Locked Curriculum
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {curriculum.description || 'Structured learning roadmap with verified admin notes, domain question banks, and adaptive assessments enforcing the strict 75% passing standard.'}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div>
              <p className="text-[11px] text-slate-400">Mastery Progress</p>
              <p className="text-lg font-bold text-cyan-400">
                {curriculum.masteredTopics} / {curriculum.totalTopics} Topics
              </p>
            </div>
            <div className="w-24">
              <ProgressBar value={curriculum.completionPercentage} tone="bg-gradient-to-r from-cyan-400 to-blue-500" />
              <p className="text-[10px] text-right text-slate-400 mt-1">{curriculum.completionPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Curriculum Tree, Right Topic Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Left: Active Curriculum Hierarchy */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Curriculum Topics
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              75% Pass Standard
            </span>
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {curriculum.topics.map((t, idx) => {
              const isSelected = idx === selectedTopicIndex;
              const isExpanded = expandedTopics[t.name] || false;

              return (
                <div key={t.name} className="rounded-xl overflow-hidden border border-slate-800/80">
                  <div
                    onClick={() => {
                      setSelectedTopicIndex(idx);
                      if (t.subtopics && t.subtopics.length > 0) {
                        setSelectedSubtopic(t.subtopics[0]);
                      } else {
                        setSelectedSubtopic('');
                      }
                      if (mcqMode !== 'setup') setMcqMode('setup');
                    }}
                    className={`p-3 flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-l-4 border-cyan-400 text-white'
                        : 'bg-slate-900/50 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-slate-500">{idx + 1}.</span>
                      <p className="text-xs font-semibold truncate">{t.name}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {t.status === 'PASSED' && (
                        <span className="bg-green-500/20 text-green-400 p-1 rounded-full" title="Mastered (>= 75%)">
                          <CheckCircle className="w-3 h-3" />
                        </span>
                      )}
                      {t.status === 'NEEDS_REVISION' && (
                        <span className="bg-amber-500/20 text-amber-300 p-1 rounded-full" title="Needs Revision (< 75%)">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                      {t.subtopics?.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTopicExpand(t.name);
                          }}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subtopics dropdown */}
                  {isExpanded && t.subtopics?.length > 0 && (
                    <div className="bg-slate-950/70 py-1 px-3 space-y-1 border-t border-slate-800">
                      {t.subtopics.map((st) => {
                        const isSubSelected = isSelected && selectedSubtopic === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setSelectedTopicIndex(idx);
                              setSelectedSubtopic(st);
                              if (mcqMode !== 'setup') setMcqMode('setup');
                            }}
                            className={`w-full text-left text-[11px] py-1 px-2 rounded flex items-center gap-1.5 transition ${
                              isSubSelected
                                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="w-1 h-1 rounded-full bg-cyan-400/60" />
                            <span className="truncate">{st}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Topic Workspace */}
        <div className="space-y-4">
          {/* Topic Header Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <p className="text-[11px] text-cyan-400 font-mono">
                  {curriculum.domain} &gt; {currentTopic?.name} {selectedSubtopic && `&gt; ${selectedSubtopic}`}
                </p>
                <h2 className="text-xl font-bold text-white mt-0.5">{currentTopic?.name}</h2>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {currentTopic?.isMastered ? (
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Topic Mastered (Score: {currentTopic.mcqScore || 80}%)
                  </span>
                ) : currentTopic?.status === 'NEEDS_REVISION' ? (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Needs Revision (Score: {currentTopic.mcqScore}%)
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
                    {currentTopic?.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 pt-3 overflow-x-auto">
              {[
                { id: 'notes', label: 'Curriculum Notes', icon: FileText },
                { id: 'ai-notes', label: 'AI Study Notes', icon: Sparkles },
                { id: 'my-notes', label: 'My Notes', icon: BookOpen },
                { id: 'resources', label: 'Learning Resources', icon: Video },
                { id: 'mcq', label: 'MCQ Practice (75% Rule)', icon: ListChecks },
                { id: 'interview', label: 'Mock Interview', icon: Award },
                { id: 'remediation', label: 'Weakness Remediation', icon: Compass },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: TOPIC NOTES (ADMIN-CURATED GOVERNED) */}
          {activeTab === 'notes' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              {contentLoading ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Loading topic notes...
                </div>
              ) : topicContent?.hasNotes && topicContent.note ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full font-semibold">
                      Verified Admin Study Notes
                    </span>
                    <span className="text-xs text-slate-500">
                      Topic: {topicContent.note.topic} {topicContent.note.subtopic && `• ${topicContent.note.subtopic}`}
                    </span>
                  </div>

                  {/* Notes Markdown / Content */}
                  <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
                    {topicContent.note.content}
                  </div>

                  {/* Key Takeaways */}
                  {topicContent.note.keyTakeaways?.length > 0 && (
                    <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Key Takeaways
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {topicContent.note.keyTakeaways.map((takeaway: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Code Examples */}
                  {topicContent.note.codeExamples?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-cyan-400" /> Practical Code Demonstrations
                      </h4>
                      {topicContent.note.codeExamples.map((codeEx: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                          {codeEx.title && (
                            <div className="bg-slate-900 px-4 py-1.5 text-xs font-mono text-cyan-300 border-b border-slate-800">
                              {codeEx.title}
                            </div>
                          )}
                          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto">
                            <code>{codeEx.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* EMPTY STATE: Admin Notes not yet available -> Request Admin Button */
                <div className="py-12 text-center max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Study Notes Under Curation</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Official verified notes for <span className="text-cyan-300 font-semibold">{currentTopic?.name}</span> have not been published by the administration yet.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      (To prevent hallucinated study materials, student auto-generation of unverified notes is restricted.)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestContent}
                    disabled={requestingContent || contentRequested}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mx-auto"
                  >
                    {contentRequested ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                        Requested! Admin has been notified
                      </>
                    ) : requestingContent ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Request Admin to Add Notes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1B: AI STUDY NOTES WORKSPACE */}
          {activeTab === 'ai-notes' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    AI Study Notes & Active Recall Generator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Generate comprehensive study guides, executive summaries, revision sheets, interactive flashcards, and quizzes from any topic, syllabus, or raw notes.
                  </p>
                </div>
                {generatedNote && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAiNote}
                      disabled={savingNote}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />}
                      Save to My Notes
                    </button>
                  </div>
                )}
              </div>

              {noteSaveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {noteSaveSuccess}
                </div>
              )}

              {/* Generator Input Section */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic / Concept Name</label>
                    <input
                      type="text"
                      value={aiNoteTopic}
                      onChange={(e) => setAiNoteTopic(e.target.value)}
                      placeholder={curriculum?.topics?.[selectedTopicIndex]?.name || 'e.g. Distributed Caching'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Discipline / Career Domain</label>
                    <input
                      type="text"
                      value={aiNoteDomain}
                      onChange={(e) => setAiNoteDomain(e.target.value)}
                      placeholder={curriculum?.domain || 'e.g. Medical, HR, Computer Science'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Proficiency Target</label>
                    <select
                      value={aiNoteLevel}
                      onChange={(e) => setAiNoteLevel(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Beginner">Beginner / Fundamentals</option>
                      <option value="Intermediate">Intermediate / Industry Standard</option>
                      <option value="Advanced">Advanced / Senior Diagnostic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Optional: Paste Course Material, Syllabus, or Lecture Notes
                  </label>
                  <textarea
                    rows={2}
                    value={aiNoteSourceText}
                    onChange={(e) => setAiNoteSourceText(e.target.value)}
                    placeholder="Paste textbook excerpts, professor notes, or syllabus bullet points to tailor note generation..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateAiNotes}
                    disabled={generatingNotes}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {generatingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{generatingNotes ? 'Synthesizing 7 Note Artifacts...' : 'Generate AI Study Notes'}</span>
                  </button>
                </div>
              </div>

              {/* Generated Note View with Artifact Sub-Tabs */}
              {generatedNote && (
                <div className="space-y-4 pt-2">
                  {/* Top Action Toolbar */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {generatedNote.topic}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        {generatedNote.domain || 'General'}
                      </span>
                      <span className="text-[10px] font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-semibold">
                        {generatedNote.level || aiNoteLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadDraftPdf}
                        disabled={downloadingPdf}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        title="Download Professional PDF Study Guide"
                      >
                        {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span>{downloadingPdf ? 'Compiling PDF...' : 'Download PDF Study Guide'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAiNote}
                        disabled={savingNote}
                        className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{savingNote ? 'Saving...' : 'Save to Library'}</span>
                      </button>
                    </div>
                  </div>

                  {noteSaveSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{noteSaveSuccess}</span>
                    </div>
                  )}

                  {/* Artifact Subtabs */}
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                    {[
                      { id: 'summary', label: 'Executive Summary' },
                      { id: 'detailed', label: 'Detailed Notes' },
                      { id: 'keypoints', label: 'Key Points' },
                      { id: 'revision', label: 'Quick Revision Sheet' },
                      { id: 'questions', label: 'Important Q&A' },
                      { id: 'flashcards', label: `Flashcards (${generatedNote.flashcards?.length || 0})` },
                      { id: 'quiz', label: 'Practice Quiz' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setNoteActiveSubtab(st.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          noteActiveSubtab === st.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* SUBTAB 1: SUMMARY */}
                  {noteActiveSubtab === 'summary' && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Executive Brief</span>
                        <span className="text-xs text-slate-400 font-mono">{generatedNote.topic} • {generatedNote.domain}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{generatedNote.summary}</p>

                      {/* Learning Objectives Callout */}
                      {generatedNote.objectives && generatedNote.objectives.length > 0 && (
                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-2">
                          <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Module Learning Objectives
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-200">
                            {generatedNote.objectives.map((obj: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Prerequisites */}
                      {generatedNote.prerequisites && generatedNote.prerequisites.length > 0 && (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-violet-400" />
                            Prerequisites & Foundational Assumptions
                          </p>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {generatedNote.prerequisites.map((pr: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-violet-400 font-bold">•</span>
                                <span>{pr}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 2: DETAILED NOTES */}
                  {noteActiveSubtab === 'detailed' && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                      <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {generatedNote.detailedNotes}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: KEY POINTS */}
                  {noteActiveSubtab === 'keypoints' && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Core High-Yield Bullet Points</h4>
                      <div className="space-y-2.5">
                        {generatedNote.keyPoints?.map((kp: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-200 leading-relaxed">{kp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 4: QUICK REVISION */}
                  {noteActiveSubtab === 'revision' && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Rapid Exam & Interview Cheat Sheet</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {generatedNote.quickRevision?.map((rev: string, idx: number) => (
                          <div key={idx} className="bg-slate-900 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-200">{rev}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 5: IMPORTANT Q&A */}
                  {noteActiveSubtab === 'questions' && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">High-Probability Questions & Model Answers</h4>
                      <div className="space-y-3">
                        {generatedNote.questions?.map((qa: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[10px]">Q{idx + 1}</span>
                              {qa.question}
                            </div>
                            <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                              <strong className="text-emerald-400 font-semibold block mb-1">Model Answer:</strong>
                              {qa.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 6: FLASHCARDS */}
                  {noteActiveSubtab === 'flashcards' && generatedNote.flashcards?.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 flex flex-col items-center space-y-4">
                      <div className="flex items-center justify-between w-full max-w-lg">
                        <span className="text-xs font-mono text-cyan-400">
                          Card {flashcardIdx + 1} of {generatedNote.flashcards.length}
                        </span>
                        <span className="text-[11px] text-slate-400">Click card to flip</span>
                      </div>

                      {/* Flip Card Container */}
                      <div
                        onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                        className="w-full max-w-lg h-56 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-6 flex flex-col justify-between cursor-pointer shadow-xl shadow-cyan-500/10 hover:border-cyan-400/60 transition-all select-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            flashcardFlipped ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {flashcardFlipped ? 'Answer / Insight' : 'Prompt / Question'}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">SkillDNA Active Recall</span>
                        </div>

                        <div className="text-center py-4">
                          <p className="text-base font-bold text-white leading-relaxed">
                            {flashcardFlipped
                              ? generatedNote.flashcards[flashcardIdx]?.back
                              : generatedNote.flashcards[flashcardIdx]?.front}
                          </p>
                        </div>

                        <div className="text-center text-[11px] text-slate-500">
                          {flashcardFlipped ? 'Click to view question' : 'Click to reveal answer'}
                        </div>
                      </div>

                      {/* Card Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFlashcardFlipped(false);
                            setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : generatedNote.flashcards.length - 1));
                          }}
                          className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFlashcardFlipped(false);
                            setFlashcardIdx((prev) => (prev < generatedNote.flashcards.length - 1 ? prev + 1 : 0));
                          }}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
                        >
                          Next Card
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 7: PRACTICE QUIZ */}
                  {noteActiveSubtab === 'quiz' && generatedNote.quiz?.length > 0 && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Topic Knowledge Check</h4>
                        {noteQuizResult && (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            noteQuizResult.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            Score: {noteQuizResult.score}% ({noteQuizResult.correct}/{noteQuizResult.total})
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        {generatedNote.quiz.map((q: any, qIdx: number) => {
                          const qKey = q.id || `Q${qIdx + 1}`;
                          return (
                            <div key={qKey} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                              <p className="text-xs font-bold text-white">
                                {qIdx + 1}. {q.question}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options?.map((opt: string, optIdx: number) => {
                                  const isSelected = noteQuizAnswers[qKey] === optIdx;
                                  const isCorrect = q.correctAnswer === optIdx;
                                  let btnClass = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                                  if (noteQuizSubmitted) {
                                    if (isCorrect) btnClass = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300';
                                    else if (isSelected) btnClass = 'bg-rose-950/50 border-rose-500/60 text-rose-300';
                                  } else if (isSelected) {
                                    btnClass = 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      disabled={noteQuizSubmitted}
                                      onClick={() => setNoteQuizAnswers((prev) => ({ ...prev, [qKey]: optIdx }))}
                                      className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer ${btnClass}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {noteQuizSubmitted && q.explanation && (
                                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                                  <strong>Explanation:</strong> {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!noteQuizSubmitted ? (
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleGradeNoteQuiz}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-90 cursor-pointer"
                          >
                            Submit & Grade Quiz
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-emerald-400 font-semibold">
                            ✓ Quiz completed! Skill DNA learning evidence updated.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNoteQuizAnswers({});
                              setNoteQuizSubmitted(false);
                              setNoteQuizResult(null);
                            }}
                            className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-white"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1C: MY SAVED NOTES */}
          {activeTab === 'my-notes' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    My Saved Study Notes
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your personal repository of curated AI study notes, revision sheets, and practice flashcards.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ai-notes')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate New Notes
                </button>
              </div>

              {/* Notes Search Filter */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={savedNotesSearch}
                  onChange={(e) => setSavedNotesSearch(e.target.value)}
                  placeholder="Search saved study notes by topic or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {loadingMyNotes ? (
                <div className="py-16 text-center">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading your saved study notes...</p>
                </div>
              ) : myNotes.length === 0 ? (
                <div className="py-16 text-center max-w-sm mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Saved Notes Yet</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate and save comprehensive study notes from any topic or syllabus to build your personal learning library.
                  </p>
                  <button
                    onClick={() => setActiveTab('ai-notes')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                  >
                    Generate First Note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myNotes
                    .filter((n) =>
                      n.topic?.toLowerCase().includes(savedNotesSearch.toLowerCase()) ||
                      n.domain?.toLowerCase().includes(savedNotesSearch.toLowerCase())
                    )
                    .map((note) => {
                      const noteId = note._id || note.id;
                      const dateStr = note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'Recent';
                      return (
                        <div
                          key={noteId}
                          className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                                {note.domain || 'General'}
                              </span>
                              <span className="text-[10px] text-slate-500">{dateStr}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-2">{note.topic}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                              {note.summary}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setGeneratedNote(note);
                                  setActiveTab('ai-notes');
                                }}
                                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                              >
                                Open & Study <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDownloadSavedPdf(note)}
                                disabled={downloadingPdf}
                                className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-800/80 hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-700 transition"
                                title="Download PDF Study Guide"
                              >
                                <Download className="w-3 h-3 text-cyan-400" /> PDF
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeleteSavedNote(noteId)}
                              disabled={deletingNoteId === noteId}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LEARNING RESOURCES */}
          {activeTab === 'resources' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-400" />
                  Curated Video Tutorials & Crash Courses
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Selected high-yield educational videos to help you master {currentTopic?.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dynamically populated resources from notes or fallbacks */}
                {(topicContent?.note?.youtubeResources?.length > 0
                  ? topicContent.note.youtubeResources
                  : [
                      {
                        title: `${currentTopic?.name} In-Depth Technical Tutorial`,
                        url: `https://www.youtube.com/results?search_query=${encodeURIComponent((curriculum?.career || '') + ' ' + (currentTopic?.name || '') + ' tutorial in depth')}`,
                        channel: 'FreeCodeCamp / Engineering Digest',
                      },
                      {
                        title: `${currentTopic?.name} Interview Questions & Real-World Patterns`,
                        url: `https://www.youtube.com/results?search_query=${encodeURIComponent((currentTopic?.name || '') + ' interview questions architecture')}`,
                        channel: 'Tech Primers / Tech Lead',
                      },
                    ]
                ).map((vid: any, vIdx: number) => (
                  <div
                    key={vIdx}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-cyan-500/40 transition group"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                        <Video className="w-3 h-3" /> {vid.channel || 'YouTube Tutorial'}
                      </span>
                      <p className="text-sm font-semibold text-white mt-1 group-hover:text-cyan-300 transition">
                        {vid.title}
                      </p>
                    </div>
                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 pt-2 border-t border-slate-800/80"
                    >
                      Watch Tutorial <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Documentation & External Links */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Official Guides & Documentation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent((currentTopic?.name || '') + ' official documentation reference')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-white"
                  >
                    <span>{currentTopic?.name} Architecture & Specification Guide</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                  <a
                    href={`https://leetcode.com/problemset/all/?search=${encodeURIComponent(currentTopic?.name || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-white"
                  >
                    <span>Targeted Coding Challenges on LeetCode</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MCQ ASSESSMENT (STRICT 75% RULE) */}
          {activeTab === 'mcq' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              {mcqMode === 'setup' && (
                <div className="text-center py-6 space-y-4 max-w-lg mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                    <ListChecks className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Topic MCQ Assessment</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Target: <span className="text-cyan-300 font-semibold">{currentTopic?.name}</span>
                      {selectedSubtopic && ` (${selectedSubtopic})`}
                    </p>
                    <div className="mt-3 inline-block bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-xs text-amber-200">
                      ⚡ <strong>Mastery Threshold: 75%</strong>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Score $\ge 75\%$ marks the topic as Mastered. Scores &lt; 75% log weak concepts into your Career Twin for remediation.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartMcq}
                    disabled={mcqLoading}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-bold px-8 py-3 rounded-xl transition shadow-lg active:scale-95 text-sm flex items-center justify-center gap-2 mx-auto"
                  >
                    {mcqLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Preparing Assessment...
                      </>
                    ) : (
                      <>
                        Start Assessment (10 Questions) <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Active Test Screen */}
              {mcqMode === 'active' && currentMcqQuestion && (
                <div className="space-y-6">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="text-slate-400 font-mono">
                      Question {mcqActiveIndex + 1} of {mcqQuestions.length}
                    </span>
                    <span className="bg-slate-800 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                      {currentMcqQuestion.difficulty || 'TECHNICAL'}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-sm md:text-base font-semibold text-white leading-relaxed">
                      {currentMcqQuestion.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentMcqQuestion.options.map((optionText: string, oIdx: number) => {
                      const isSelected = selectedAnswers[currentMcqQuestion.questionId] === optionText;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(currentMcqQuestion.questionId, optionText)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 text-white font-medium'
                              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="text-sm leading-snug">{optionText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      disabled={mcqActiveIndex === 0}
                      onClick={() => setMcqActiveIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold rounded-lg transition"
                    >
                      Previous
                    </button>

                    {mcqActiveIndex < mcqQuestions.length - 1 ? (
                      <button
                        onClick={() => setMcqActiveIndex((prev) => prev + 1)}
                        className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-md"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitMcq}
                        disabled={submittingMcq}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-md active:scale-95"
                      >
                        {submittingMcq ? 'Submitting & Grading...' : 'Submit Assessment'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Assessment Result Screen */}
              {mcqMode === 'result' && mcqResult && (
                <div className="space-y-6">
                  {/* Score & Status Summary */}
                  <div
                    className={`p-6 rounded-2xl border text-center space-y-3 ${
                      mcqResult.passStatus === 'PASS'
                        ? 'bg-emerald-950/40 border-emerald-500/40'
                        : 'bg-amber-950/40 border-amber-500/40'
                    }`}
                  >
                    {mcqResult.passStatus === 'PASS' ? (
                      <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-14 h-14 text-amber-400 mx-auto" />
                    )}

                    <div>
                      <span className="text-4xl font-extrabold text-white">
                        {mcqResult.overallScore}%
                      </span>
                      <p className="text-xs uppercase font-bold tracking-wider mt-1 text-slate-300">
                        Passing Standard: 75% • Your Status: {mcqResult.passStatus}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      {mcqResult.passStatus === 'PASS'
                        ? `Congratulations! You achieved ${mcqResult.overallScore}% and mastered ${currentTopic?.name}. Your Skill DNA profile has been updated.`
                        : `Score is below the 75% standard. Weak concepts have been diagnosed and logged into your Career Twin. Complete the remedial review before retaking.`}
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setMcqMode('setup');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition border border-slate-700 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake Assessment
                      </button>

                      {mcqResult.passStatus === 'FAIL' && (
                        <button
                          onClick={() => setActiveTab('remediation')}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
                        >
                          View Remedial Notes &amp; Practice
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detailed Question Review */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-cyan-400" />
                      Detailed Answer Review
                    </h4>
                    {mcqResult.detailedReview?.map((rev: any, rIdx: number) => (
                      <div
                        key={rIdx}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          rev.isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/20'
                            : 'bg-red-950/20 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-300">Q{rIdx + 1}. {rev.question}</span>
                          <span className={rev.isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {rev.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                          <p className="text-slate-400">
                            Your Answer: <span className="text-slate-200 font-medium">{rev.studentAnswer}</span>
                          </p>
                          <p className="text-slate-400">
                            Correct Answer: <span className="text-emerald-300 font-semibold">{rev.correctAnswer}</span>
                          </p>
                        </div>
                        {rev.explanation && (
                          <p className="text-slate-400 text-[11px] italic bg-slate-950/60 p-2 rounded">
                            💡 Explanation: {rev.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MOCK INTERVIEW */}
          {activeTab === 'interview' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Adaptive Technical Mock Interview</h3>
                <p className="text-xs text-slate-300 mt-1">
                  10-15 Question Speech &amp; Text Interview for <span className="text-cyan-300 font-semibold">{currentTopic?.name}</span>
                </p>
                <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 text-left">
                  <p>• Progressive difficulty (Basic → Intermediate → Advanced)</p>
                  <p>• Real-time speech transcription &amp; semantic evaluation</p>
                  <p>• 75/100 passing threshold with Career Twin sync</p>
                </div>
              </div>

              <Link
                to={`/interview?topic=${encodeURIComponent(currentTopic?.name || '')}&domain=${encodeURIComponent(curriculum.domain)}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg active:scale-95 text-sm"
              >
                Launch Topic Mock Interview <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* TAB 5: WEAKNESS REMEDIATION */}
          {activeTab === 'remediation' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Targeted Weakness Remediation &amp; Career Twin Diagnosis
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Personalized review modules for concepts where your score was below the 75% standard threshold.
                </p>
              </div>

              {topicContent?.remediations && topicContent.remediations.length > 0 ? (
                <div className="space-y-4">
                  {topicContent.remediations.map((rem: any, rIdx: number) => (
                    <div
                      key={rIdx}
                      className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300 uppercase">Concept:</span>
                          <span className="text-sm font-bold text-white">{rem.concept}</span>
                        </div>
                        <span className="text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                          Score: {rem.score}% (&lt; 75%)
                        </span>
                      </div>

                      {/* Diagnostic */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rem.diagnostic}
                      </p>

                      {/* Personalized Notes */}
                      {rem.personalizedNotes && (
                        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-200 whitespace-pre-line font-mono">
                          {rem.personalizedNotes}
                        </div>
                      )}

                      {/* YouTube resources */}
                      {rem.youtubeResources?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Recommended Video Reinforcement:</p>
                          <div className="space-y-1.5">
                            {rem.youtubeResources.map((yt: any, yIdx: number) => (
                              <a
                                key={yIdx}
                                href={yt.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-xs text-cyan-400 hover:text-cyan-300 bg-slate-900/50 p-2 rounded border border-slate-800"
                              >
                                <span>{yt.title}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Code Examples & Practice Questions */}
                      {rem.examples && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Practical Code Sample:</p>
                          <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-200 overflow-x-auto">
                            <code>{rem.examples}</code>
                          </pre>
                        </div>
                      )}

                      {/* One-Click Reassessment Button */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveTab('mcq');
                            handleStartMcq();
                          }}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Take One-Click Reassessment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">No Active Weakness Remediation Needed</p>
                  <p className="text-xs max-w-sm mx-auto">
                    You have not scored below 75% on this topic. Practice MCQs or mock interviews to continuously refine your knowledge.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FLOATING QUICK AI TUTOR / PLATFORM ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatbotOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-[360px] sm:w-[420px] h-[520px] shadow-2xl flex flex-col overflow-hidden mb-3"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-3.5 flex items-center justify-between border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">SkillDNA AI Platform Assistant</h3>
                    <p className="text-[10px] text-cyan-200">Career: {curriculum?.career}</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatbotOpen(false)}
                  className="text-slate-300 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-950/60 text-xs">
                {chatMessages.map((msg, mIdx) => (
                  <div
                    key={mIdx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium'
                          : 'bg-slate-800 text-slate-100 border border-slate-700 whitespace-pre-line'
                      }`}
                    >
                      {msg.text}

                      {/* Navigation links if provided */}
                      {msg.links && msg.links.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-1">
                          <p className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Quick Navigation:</p>
                          {msg.links.map((link, lIdx) => (
                            <Link
                              key={lIdx}
                              to={link.path}
                              onClick={() => setChatbotOpen(false)}
                              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                            >
                              <ChevronRight className="w-3 h-3" /> {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> AI is formulating guidance...
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Chip Prompts */}
              <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, `Explain ${currentTopic?.name || 'this topic'} simply in 3 points`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap border border-slate-700"
                >
                  Explain topic simply
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, 'How does the 75% passing threshold work?')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap border border-slate-700"
                >
                  75% rule explained
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage(undefined, 'Where can I take my technical mock interview?')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap border border-slate-700"
                >
                  Go to interview
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a technical or platform question..."
                  className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 text-slate-950 p-2 rounded-xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-bold p-3.5 rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition"
        >
          <Sparkles className="w-5 h-5" />
          {!chatbotOpen && <span className="text-xs font-bold pr-1 hidden sm:inline">AI Learning Assistant</span>}
        </button>
      </div>
    </main>
  );
};

export default LearningHub;
