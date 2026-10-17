import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Edit3, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type Batch = { batchId: string; career?: string; batchNumber: number; status: string; questions: any[]; questionCount: number; difficultyDistribution?: Record<string, number>; reviewHistory?: any[]; rejectionReason?: string };

const LearningHubAdmin = () => {
  const { token } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [curriculumRequests, setCurriculumRequests] = useState<any[]>([]);
  const [noteRequests, setNoteRequests] = useState<any[]>([]);
  const [careerId, setCareerId] = useState('software-engineer');
  const [editing, setEditing] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const [batchData, curriculumData, noteData] = await Promise.all([
        apiRequest<any>('/admin/question-batches', { token }),
        apiRequest<any[]>('/admin/subject-change-requests', { token }),
        apiRequest<any>('/admin/notes/regeneration-requests?status=PENDING', { token }),
      ]);
      setBatches(batchData.batches || []); setCurriculumRequests(curriculumData || []); setNoteRequests(noteData.requests || []);
    } catch (err: any) { setError(err.message || 'Could not load Learning Hub management data.'); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setBusy(true); setError(null);
    try { await apiRequest('/admin/question-batches/generate', { method: 'POST', token, body: JSON.stringify({ careerId }) }); await load(); }
    catch (err: any) { setError(err.message || 'Batch generation failed. No batch was published.'); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!editing) return; setBusy(true); setError(null);
    try { await apiRequest(`/admin/question-batches/${encodeURIComponent(editing.batchId)}`, { method: 'PUT', token, body: JSON.stringify({ questions: editing.questions }) }); setEditing(null); await load(); }
    catch (err: any) { setError(err.message || 'Batch validation failed. Changes were not saved.'); }
    finally { setBusy(false); }
  };
  const publish = async (batchId: string) => { setBusy(true); try { await apiRequest(`/admin/question-batches/${encodeURIComponent(batchId)}/publish`, { method: 'POST', token }); await load(); } catch (err: any) { setError(err.message || 'Publication failed.'); } finally { setBusy(false); } };
  const reject = async (batchId: string) => { const reason = window.prompt('Why is this batch being rejected?')?.trim(); if (!reason) return; setBusy(true); try { await apiRequest(`/admin/question-batches/${encodeURIComponent(batchId)}/reject`, { method: 'POST', token, body: JSON.stringify({ reason }) }); await load(); } catch (err: any) { setError(err.message || 'Rejection failed.'); } finally { setBusy(false); } };
  const reviewCurriculum = async (request: any, status: 'APPROVED' | 'REJECTED') => { try { await apiRequest(`/admin/subject-change-requests/${request._id || request.id}/review`, { method: 'PUT', token, body: JSON.stringify({ status }) }); await load(); } catch (err: any) { setError(err.message || 'Curriculum request review failed.'); } };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading Learning Hub management…</div>;
  return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Admin Learning Hub</p><h1 className="mt-2 text-2xl font-bold text-white">Question governance and curriculum control</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Generate proposals, edit every question, validate the 4/7/4 distribution, and publish only approved content.</p></div><button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400"><RefreshCw className="h-4 w-4" />Refresh</button></header>
    {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
    <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5"><div className="flex flex-wrap items-end gap-3"><label className="grid gap-2 text-xs font-semibold text-slate-300">Curriculum ID<input value={careerId} onChange={(e) => setCareerId(e.target.value)} className="h-10 w-64 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white" /></label><button type="button" disabled={busy || !careerId.trim()} onClick={generate} className="h-10 rounded-lg bg-cyan-400 px-4 text-xs font-bold text-slate-950 disabled:opacity-50">{busy ? 'Working…' : 'Generate proposal'}</button><span className="text-xs text-slate-500">Generation creates a pending proposal; it never auto-publishes.</span></div></section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Monthly question batches</h2><p className="mt-1 text-xs text-slate-400">{batches.length} batch records · all publication actions are validated server-side</p></div></div><div className="mt-4 space-y-3">{batches.length === 0 ? <Empty text="No generated batch proposals." /> : batches.map((batch) => <div key={batch.batchId} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-white">{batch.career || careerId} · Batch {batch.batchNumber}</p><p className="mt-1 text-xs text-slate-400">{batch.questionCount} questions · <Status value={batch.status} /> · Easy {batch.difficultyDistribution?.Easy || 0} / Medium {batch.difficultyDistribution?.Medium || 0} / Hard {batch.difficultyDistribution?.Hard || 0}</p>{batch.rejectionReason && <p className="mt-2 text-xs text-rose-300">Rejected: {batch.rejectionReason}</p>}</div><div className="flex flex-wrap gap-2">{batch.status !== 'PUBLISHED' && <button type="button" disabled={busy} onClick={() => setEditing(batch)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400"><Edit3 className="mr-1 inline h-4 w-4" />Edit questions</button>}{batch.status === 'PENDING_APPROVAL' && <button type="button" disabled={busy} onClick={() => publish(batch.batchId)} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950">Validate and publish</button>}{batch.status === 'PENDING_APPROVAL' && <button type="button" disabled={busy} onClick={() => reject(batch.batchId)} className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-300"><XCircle className="mr-1 inline h-4 w-4" />Reject</button>}</div></div>{batch.reviewHistory?.length ? <p className="mt-3 text-[11px] text-slate-500">Review history: {batch.reviewHistory.length} event(s)</p> : null}</div>)}</div></section>
    {editing && <BatchEditor batch={editing} onChange={setEditing} onCancel={() => setEditing(null)} onSave={save} busy={busy} />}
    <section className="grid gap-6 lg:grid-cols-2"><Queue title="Curriculum change requests" empty="No curriculum change requests.">{curriculumRequests.map((request) => <div key={request._id || request.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="font-semibold text-white">{request.email || request.studentName}</p><p className="mt-1 text-xs text-slate-400">{request.fromRole} → {request.toRole} · {request.status}</p><p className="mt-2 text-xs text-slate-300">{request.reason}</p>{request.status === 'PENDING' && <div className="mt-3 flex gap-2"><button type="button" onClick={() => reviewCurriculum(request, 'APPROVED')} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950"><CheckCircle2 className="mr-1 inline h-4 w-4" />Approve</button><button type="button" onClick={() => reviewCurriculum(request, 'REJECTED')} className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs text-rose-300">Reject</button></div>}</div>)}</Queue><Queue title="Pending note revisions" empty="No pending note revision requests.">{noteRequests.map((request) => <div key={request._id || request.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="font-semibold text-white">{request.topic || 'Saved note revision'}</p><p className="mt-1 text-xs text-slate-400">{request.reason}</p><p className="mt-2 text-xs text-amber-300"><ShieldCheck className="mr-1 inline h-4 w-4" />Review in Notes Management for provider-backed regeneration.</p></div>)}</Queue></section>
  </main>;
};

const BatchEditor = ({ batch, onChange, onCancel, onSave, busy }: { batch: Batch; onChange: (batch: Batch) => void; onCancel: () => void; onSave: () => void; busy: boolean }) => <section className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Edit and preview all 15 questions</h2><p className="mt-1 text-xs text-slate-400">Changes are validated before saving and return the batch to Pending Approval.</p></div><div className="flex gap-2"><button type="button" onClick={onCancel} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">Cancel</button><button type="button" disabled={busy} onClick={onSave} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950">Save validated draft</button></div></div><div className="mt-4 grid gap-3">{batch.questions.map((question, index) => <div key={question.questionId || index} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold text-cyan-300">Question {index + 1}</span><select value={question.difficulty} onChange={(e) => { const questions = batch.questions.map((item, i) => i === index ? { ...item, difficulty: e.target.value } : item); onChange({ ...batch, questions }); }} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"><option>Easy</option><option>Medium</option><option>Hard</option></select></div><textarea value={question.question} onChange={(e) => { const questions = batch.questions.map((item, i) => i === index ? { ...item, question: e.target.value } : item); onChange({ ...batch, questions }); }} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white" /><input value={question.topic || ''} onChange={(e) => { const questions = batch.questions.map((item, i) => i === index ? { ...item, topic: e.target.value } : item); onChange({ ...batch, questions }); }} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-white" placeholder="Topic" /><textarea value={question.expectedAnswer || ''} onChange={(e) => { const questions = batch.questions.map((item, i) => i === index ? { ...item, expectedAnswer: e.target.value } : item); onChange({ ...batch, questions }); }} rows={2} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-white" placeholder="Expected answer" /><textarea value={question.explanation || ''} onChange={(e) => { const questions = batch.questions.map((item, i) => i === index ? { ...item, explanation: e.target.value } : item); onChange({ ...batch, questions }); }} rows={2} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-white" placeholder="Explanation" /></div>)}</div></section>;
const Queue = ({ title, empty, children }: { title: string; empty: string; children: ReactNode }) => <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">{title}</h2><div className="mt-4 space-y-3">{children || <Empty text={empty} />}</div></section>;
const Status = ({ value }: { value: string }) => <span className={value === 'PUBLISHED' ? 'text-emerald-300' : value === 'REJECTED' ? 'text-rose-300' : 'text-amber-300'}>{value}</span>;
const Empty = ({ text }: { text: string }) => <p className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">{text}</p>;
export default LearningHubAdmin;
