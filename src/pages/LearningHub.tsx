import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, MessageCircle, NotebookPen, RefreshCw, Search, Sparkles, Target, Trophy, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type Tab = 'overview' | 'learn' | 'challenge' | 'notes' | 'ask';
type Topic = { name: string; subtopics: string[]; status: string; mcqScore?: number; attempts: number; isMastered: boolean };
type Curriculum = { career: string; domain: string; description: string; topics: Topic[]; totalTopics: number; masteredTopics: number; completionPercentage: number };
type Batch = { batchId: string; career?: string; batchNumber: number; status: string; questionCount: number; questions: any[]; difficultyDistribution?: Record<string, number>; answerKeyReleased?: boolean; publishedAt?: string };

const LearningHub = () => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [content, setContent] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batchAnswers, setBatchAnswers] = useState<Record<string, string>>({});
  const [batchAttempt, setBatchAttempt] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');

  const loadCurriculum = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiRequest<Curriculum>('/learning/active-curriculum', { token });
      setCurriculum(data);
      const saved = localStorage.getItem(`skilldna_learning_location_${user?._id || 'student'}`);
      const savedIndex = saved ? Number(saved) : 0;
      setSelectedIndex(Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < data.topics.length ? savedIndex : 0);
    } catch (err: any) { setMessage({ tone: 'error', text: err.message || 'Unable to load your curriculum.' }); }
    finally { setLoading(false); }
  }, [token, user?._id]);

  const loadBatches = useCallback(async () => {
    if (!token) return;
    try { const data = await apiRequest<any>('/learning/question-batches', { token }); setBatches(data.batches || []); }
    catch { setBatches([]); }
  }, [token]);

  const loadNotes = useCallback(async () => {
    if (!token) return;
    try { const data = await apiRequest<any[]>('/learning/notes/my', { token }); setNotes(data || []); }
    catch { setNotes([]); }
  }, [token]);

  useEffect(() => { loadCurriculum(); loadBatches(); loadNotes(); }, [loadCurriculum, loadBatches, loadNotes]);
  const topic = curriculum?.topics[selectedIndex];
  const filteredTopics = useMemo(() => (curriculum?.topics || []).filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [curriculum, search]);

  const selectTopic = async (index: number) => {
    if (!curriculum?.topics[index]) return;
    setSelectedIndex(index); setTab('learn'); setContentLoading(true); setMessage(null);
    localStorage.setItem(`skilldna_learning_location_${user?._id || 'student'}`, String(index));
    const selected = curriculum.topics[index];
    try { const data = await apiRequest<any>(`/learning/topic-content?domain=${encodeURIComponent(curriculum.domain)}&topic=${encodeURIComponent(selected.name)}`, { token }); setContent(data); }
    catch (err: any) { setContent(null); setMessage({ tone: 'error', text: err.message || 'Lesson content is unavailable.' }); }
    finally { setContentLoading(false); }
  };

  const openBatch = async (batch: Batch | null) => {
    if (!batch) { setSelectedBatch(null); return; }
    setSelectedBatch(batch); setBatchAttempt(null); setBatchAnswers({}); setMessage(null);
    try { const data = await apiRequest<any>(`/learning/question-batches/${encodeURIComponent(batch.batchId)}/attempts`, { token }); const attempt = data.attempts?.[0]; if (attempt) { setBatchAttempt(attempt); setBatchAnswers(attempt.answers || {}); } }
    catch { /* an absent attempt is a valid first-open state */ }
  };
  const submitBatch = async () => {
    if (!selectedBatch || batchAttempt) return;
    setSaving(true); setMessage(null);
    try { const data = await apiRequest<any>(`/learning/question-batches/${encodeURIComponent(selectedBatch.batchId)}/attempt`, { method: 'POST', token, body: JSON.stringify({ answers: batchAnswers }) }); setBatchAttempt(data.attempt); setMessage({ tone: 'success', text: 'Attempt submitted and saved.' }); }
    catch (err: any) { setMessage({ tone: 'error', text: err.message || 'Could not submit this attempt.' }); }
    finally { setSaving(false); }
  };
  const saveNote = async () => {
    if (!topic || !content?.note) return;
    setSaving(true); setMessage(null);
    try { await apiRequest('/learning/notes/save', { method: 'POST', token, body: JSON.stringify({ topic: topic.name, domain: curriculum?.domain, summary: content.note.content || content.note.overview || '', detailedNotes: content.note.content || '', keyPoints: content.note.keyTakeaways || [] }) }); await loadNotes(); setMessage({ tone: 'success', text: 'Lesson note saved to your personal workspace.' }); }
    catch (err: any) { setMessage({ tone: 'error', text: err.message || 'The note could not be saved.' }); }
    finally { setSaving(false); }
  };
  const askAi = async () => {
    const question = chatInput.trim(); if (!question) return;
    setChatInput(''); setChatMessages((items) => [...items, { role: 'user', text: question }]);
    try { const data = await apiRequest<any>('/learning/chatbot/message', { method: 'POST', token, body: JSON.stringify({ message: `${question} Context: ${topic?.name || curriculum?.career || 'my curriculum'}` }) }); setChatMessages((items) => [...items, { role: 'assistant', text: data.reply || 'No answer was returned.' }]); }
    catch (err: any) { setChatMessages((items) => [...items, { role: 'assistant', text: err.message || 'AI support is unavailable right now.' }]); }
  };

  if (loading) return <main className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-4"><div className="text-center"><RefreshCw className="mx-auto h-8 w-8 animate-spin text-cyan-300" /><p className="mt-3 text-sm text-slate-400">Loading your learning workspace…</p></div></main>;
  if (!curriculum?.career) return <main className="mx-auto max-w-2xl px-4 py-16 text-center"><div className="rounded-3xl border border-slate-800 bg-slate-900 p-8"><BookOpen className="mx-auto h-10 w-10 text-cyan-300" /><h1 className="mt-4 text-2xl font-bold text-white">Your path is not assigned yet</h1><p className="mt-3 text-sm leading-6 text-slate-400">Complete your profile to unlock a curriculum tailored to your stream and career goal.</p><Link to="/profile" className="mt-6 inline-flex rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950">Complete profile</Link></div></main>;

  return <main className="min-h-screen bg-[#07101f] text-slate-100"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">SkillDNA / Learning</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Your learning workspace</h1><p className="mt-1 text-sm text-slate-400">{curriculum.career} · {curriculum.domain}</p></div><div className="flex items-center gap-2"><Link to="/learning/english" className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400">English practice</Link><button type="button" onClick={() => { setMessage(null); loadCurriculum(); loadBatches(); }} className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:border-cyan-400" aria-label="Refresh learning data"><RefreshCw className="h-4 w-4" /></button></div></header>
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]"><div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#10243c] to-[#0c1728] p-6"><p className="text-sm text-cyan-200">Welcome back, {user?.name?.split(' ')[0] || 'learner'}</p><h2 className="mt-2 max-w-xl text-2xl font-bold text-white">Keep your next step small, visible, and yours.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{curriculum.description}</p><button type="button" onClick={() => selectTopic(selectedIndex)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950">Continue learning <ArrowRight className="h-4 w-4" /></button></div><div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"><div className="flex items-end justify-between"><span className="text-sm text-slate-400">Curriculum progress</span><strong className="text-3xl text-cyan-300">{curriculum.completionPercentage}%</strong></div><div className="mt-4"><ProgressBar value={curriculum.completionPercentage} tone="bg-gradient-to-r from-cyan-400 to-blue-500" /></div><div className="mt-5 grid grid-cols-2 gap-3"><Metric icon={<Trophy className="h-4 w-4" />} label="Mastered" value={`${curriculum.masteredTopics}/${curriculum.totalTopics}`} /><Metric icon={<Target className="h-4 w-4" />} label="Needs focus" value={String(curriculum.topics.filter((item) => item.status === 'NEEDS_REVISION').length)} /></div></div></section>
    {message && <div role="status" className={`mt-4 rounded-xl border p-3 text-sm ${message.tone === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>{message.text}</div>}
    <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-800 pb-2" aria-label="Learning sections">{([['overview', 'Overview'], ['learn', 'Learn'], ['challenge', 'Monthly challenge'], ['notes', 'My notes'], ['ask', 'Ask AI']] as Array<[Tab, string]>).map(([value, label]) => <button type="button" key={value} onClick={() => setTab(value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${tab === value ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{label}</button>)}</nav>
    <div className="mt-6">
      {tab === 'overview' && <Overview curriculum={curriculum} batches={batches} topics={filteredTopics} search={search} setSearch={setSearch} onSelect={(item) => selectTopic(curriculum.topics.indexOf(item))} onChallenge={() => setTab('challenge')} onNotes={() => setTab('notes')} />}
      {tab === 'learn' && <Learn topic={topic} curriculum={curriculum} content={content} loading={contentLoading} onSelect={(index) => selectTopic(index)} onPrevious={() => selectedIndex > 0 && selectTopic(selectedIndex - 1)} onNext={() => selectedIndex < curriculum.topics.length - 1 && selectTopic(selectedIndex + 1)} onSave={saveNote} saving={saving} />}
      {tab === 'challenge' && <Challenge batches={batches} selected={selectedBatch} answers={batchAnswers} attempt={batchAttempt} onOpen={openBatch} onAnswer={(id, value) => setBatchAnswers((items) => ({ ...items, [id]: value }))} onSubmit={submitBatch} saving={saving} />}
      {tab === 'notes' && <Notes notes={notes} onOpen={(note) => { const index = curriculum.topics.findIndex((item) => item.name.toLowerCase() === String(note.topic).toLowerCase()); if (index >= 0) selectTopic(index); }} />}
      {tab === 'ask' && <Ask messages={chatMessages} input={chatInput} setInput={setChatInput} onAsk={askAi} topic={topic?.name} />}
    </div>
  </div></main>;
};

const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs text-slate-500">{label}</span></div><p className="mt-2 font-bold text-white">{value}</p></div>;
const Overview = ({ curriculum, batches, topics, search, setSearch, onSelect, onChallenge, onNotes }: { curriculum: Curriculum; batches: Batch[]; topics: Topic[]; search: string; setSearch: (value: string) => void; onSelect: (topic: Topic) => void; onChallenge: () => void; onNotes: () => void }) => <div className="space-y-5"><div className="grid gap-4 md:grid-cols-3"><ActionCard icon={<BookOpen />} title="Continue path" text={curriculum.topics.find((item) => item.status !== 'PASSED')?.name || 'Review your mastered topics'} onClick={() => onSelect(curriculum.topics.find((item) => item.status !== 'PASSED') || curriculum.topics[0])} /><ActionCard icon={<ClipboardCheck />} title="Monthly challenge" text={batches[0] ? `${batches[0].questionCount} published questions` : 'No published batch available'} onClick={onChallenge} /><ActionCard icon={<NotebookPen />} title="Your notes" text="Revisit saved explanations and revision points" onClick={onNotes} /></div><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Learning path</p><h2 className="mt-1 text-xl font-bold text-white">Topics in your assigned curriculum</h2></div><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topics" className="rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400" /></label></div><div className="mt-5 grid gap-3 md:grid-cols-2">{topics.map((item) => <button type="button" key={item.name} onClick={() => onSelect(item)} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left hover:border-cyan-500/50"><span className={`mt-0.5 grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${item.status === 'PASSED' ? 'bg-emerald-400/15 text-emerald-300' : item.status === 'NEEDS_REVISION' ? 'bg-amber-400/15 text-amber-300' : 'bg-cyan-400/15 text-cyan-300'}`}>{item.status === 'PASSED' ? '✓' : '→'}</span><span className="min-w-0"><strong className="block truncate text-sm text-white">{item.name}</strong><span className="mt-1 block text-xs text-slate-500">{formatStatus(item.status)} · {item.subtopics?.length || 0} learning units · {item.attempts} attempts</span></span><ChevronRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-slate-600" /></button>)}</div>{topics.length === 0 && <Empty text="No topics match this search." />}</section></div>;
const ActionCard = ({ icon, title, text, onClick }: { icon: ReactNode; title: string; text: string; onClick: () => void }) => <button type="button" onClick={onClick} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left hover:border-cyan-500/50"><span className="text-cyan-300">{icon}</span><h3 className="mt-3 font-semibold text-white">{title}</h3><p className="mt-1 text-sm text-slate-400">{text}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">Open <ArrowRight className="h-3 w-3" /></span></button>;
const Learn = ({ topic, curriculum, content, loading, onSelect, onPrevious, onNext, onSave, saving }: { topic?: Topic; curriculum: Curriculum; content: any; loading: boolean; onSelect: (index: number) => void; onPrevious: () => void; onNext: () => void; onSave: () => void; saving: boolean }) => {
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Topics</p>
        <div className="mt-4 space-y-2">
          {curriculum.topics.map((item, index) => <button type="button" onClick={() => onSelect(index)} key={item.name} className={`rounded-lg px-3 py-2 text-sm ${item.name === topic?.name ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-400'}`}>{item.name}</button>)}
        </div>
      </aside>
      <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
        {loading && <Loading text="Loading the approved lesson…" />}
        {!loading && !topic && <Empty text="Select a topic to begin." />}
        {!loading && topic && <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{formatStatus(topic.status)}</p><h2 className="mt-2 text-2xl font-bold text-white">{topic.name}</h2><p className="mt-2 text-sm text-slate-400">{topic.subtopics?.length || 0} learning units · estimated 5–15 minutes</p></div>
            <button type="button" onClick={onSave} disabled={saving || !content?.note} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-50"><NotebookPen className="h-4 w-4" />{saving ? 'Saving…' : 'Save note'}</button>
          </div>
          {content?.hasNotes ? <div className="mt-8 space-y-6"><section><h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Lesson summary</h3><p className="mt-3 whitespace-pre-wrap text-base leading-8 text-slate-200">{content.note.content || content.note.overview}</p></section>{content.note.keyTakeaways?.length > 0 && <section><h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Key takeaways</h3><ul className="mt-3 space-y-2">{content.note.keyTakeaways.map((item: string) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-300"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />{item}</li>)}</ul></section>}</div> : <div className="mt-8"><Empty text={content?.message || 'No approved lesson content is available for this topic yet.'} /></div>}
          <div className="mt-8 flex justify-between border-t border-slate-800 pt-5"><button type="button" onClick={onPrevious} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Previous</button><button type="button" onClick={onNext} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Next topic<ArrowRight className="h-4 w-4" /></button></div>
        </>}
      </article>
    </div>
  );
};
const Challenge = ({ batches, selected, answers, attempt, onOpen, onAnswer, onSubmit, saving }: { batches: Batch[]; selected: Batch | null; answers: Record<string, string>; attempt: any; onOpen: (batch: Batch) => void; onAnswer: (id: string, value: string) => void; onSubmit: () => void; saving: boolean }) => <div className="space-y-5">{!selected ? <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-start gap-3"><ClipboardCheck className="mt-1 h-5 w-5 text-cyan-300" /><div><h2 className="text-xl font-bold text-white">Monthly challenge</h2><p className="mt-2 text-sm text-slate-400">Published assessments only. Protected answers and explanations unlock 30 days after publication.</p></div></div><div className="mt-5 space-y-3">{batches.length ? batches.map((batch) => <button type="button" key={batch.batchId} onClick={() => onOpen(batch)} className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left hover:border-cyan-500/50"><span><strong className="block text-sm text-white">{batch.career || 'Assigned curriculum'} · Batch {batch.batchNumber}</strong><span className="mt-1 block text-xs text-slate-500">{batch.questionCount} questions · Easy {batch.difficultyDistribution?.Easy || 0} / Medium {batch.difficultyDistribution?.Medium || 0} / Hard {batch.difficultyDistribution?.Hard || 0}</span></span><ChevronRight className="h-4 w-4 text-slate-500" /></button>) : <Empty text="No published monthly challenge is available yet." />}</div></section> : <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><button type="button" onClick={() => onOpen(null as any)} className="text-xs text-slate-400 hover:text-white">← All challenges</button><div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold text-white">{selected.career} · Batch {selected.batchNumber}</h2><p className="mt-1 text-xs text-slate-500">{selected.questionCount} questions · {attempt ? `Submitted · score ${attempt.score}%` : 'In progress — answers are saved on submit'}</p></div>{!attempt && <button type="button" onClick={onSubmit} disabled={saving} className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? 'Submitting…' : 'Submit challenge'}</button>}</div><div className="mt-6 space-y-4">{selected.questions.map((question: any, index: number) => <div key={question.questionId} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"><div className="flex justify-between gap-3"><p className="text-sm font-semibold text-white">{index + 1}. {question.question}</p><span className="shrink-0 text-[10px] font-bold uppercase text-slate-500">{question.difficulty}</span></div><textarea disabled={Boolean(attempt)} value={answers[question.questionId] || ''} onChange={(e) => onAnswer(question.questionId, e.target.value)} rows={3} placeholder="Write your answer…" className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white disabled:opacity-60" />{attempt && selected.answerKeyReleased && <p className="mt-3 text-xs leading-5 text-slate-300"><strong className="text-emerald-300">Expected:</strong> {question.expectedAnswer}<br /><strong className="text-cyan-300">Why:</strong> {question.explanation}</p>}</div>)}</div></section>}</div>;
const Notes = ({ notes, onOpen }: { notes: any[]; onOpen: (note: any) => void }) => <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center gap-3"><NotebookPen className="h-5 w-5 text-cyan-300" /><div><h2 className="text-xl font-bold text-white">My notes</h2><p className="mt-1 text-sm text-slate-400">Saved against your account and available across sessions.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2">{notes.length ? notes.map((note) => <button type="button" key={note._id || note.id} onClick={() => onOpen(note)} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left hover:border-cyan-500/50"><strong className="block text-sm text-white">{note.topic}</strong><span className="mt-1 block line-clamp-3 text-xs leading-5 text-slate-400">{note.summary || note.detailedNotes || 'Saved learning note'}</span><span className="mt-3 block text-[10px] uppercase tracking-wider text-slate-600">Version {note.version || 1}</span></button>) : <Empty text="You have no saved notes yet. Open a lesson and choose Save note." />}</div></section>;
const Ask = ({ messages, input, setInput, onAsk, topic }: { messages: Array<{ role: 'user' | 'assistant'; text: string }>; input: string; setInput: (value: string) => void; onAsk: () => void; topic?: string }) => <section className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-cyan-300" /><div><h2 className="text-xl font-bold text-white">Ask AI</h2><p className="mt-1 text-sm text-slate-400">Context: {topic || 'your assigned curriculum'}</p></div></div><div className="mt-5 min-h-64 space-y-3">{messages.length === 0 && <Empty text="Ask a focused question about the selected topic. Responses are returned by the configured learning assistant." />}{messages.map((message, index) => <div key={index} className={`max-w-[90%] rounded-xl p-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-cyan-400 text-slate-950' : 'bg-slate-950 text-slate-300'}`}>{message.text}</div>)}</div><div className="mt-5 flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAsk()} placeholder="What are you stuck on?" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" /><button type="button" onClick={onAsk} className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950">Ask</button></div></section>;
const Loading = ({ text }: { text: string }) => <div className="grid min-h-64 place-items-center text-center"><RefreshCw className="mx-auto h-7 w-7 animate-spin text-cyan-300" /><p className="mt-3 text-sm text-slate-400">{text}</p></div>;
const Empty = ({ text }: { text: string }) => <div className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">{text}</div>;
const formatStatus = (status: string) => status === 'PASSED' ? 'Done' : status === 'IN_PROGRESS' ? 'In progress' : status === 'NEEDS_REVISION' ? 'Needs focus' : 'Available';
export default LearningHub;
