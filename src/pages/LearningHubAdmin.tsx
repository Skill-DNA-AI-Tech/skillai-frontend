import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const LearningHubAdmin = () => {
  const { token } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [curriculumRequests, setCurriculumRequests] = useState<any[]>([]);
  const [noteRequests, setNoteRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [batchData, curriculumData, noteData] = await Promise.all([
        apiRequest<any>('/admin/question-batches', { token }),
        apiRequest<any[]>('/admin/subject-change-requests', { token }),
        apiRequest<any>('/admin/notes/regeneration-requests?status=PENDING', { token }),
      ]);
      setBatches(batchData.batches || []);
      setCurriculumRequests(curriculumData || []);
      setNoteRequests(noteData.requests || []);
    } catch (err: any) {
      setError(err.message || 'Could not load Learning Hub management data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const publish = async (batchId: string) => {
    try {
      await apiRequest(`/admin/question-batches/${encodeURIComponent(batchId)}/publish`, { method: 'POST', token });
      await load();
    } catch (err: any) { setError(err.message || 'Batch publication failed.'); }
  };

  const reviewCurriculum = async (request: any, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(`/admin/subject-change-requests/${request._id || request.id}/review`, { method: 'PUT', token, body: JSON.stringify({ status }) });
      await load();
    } catch (err: any) { setError(err.message || 'Curriculum request review failed.'); }
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading Learning Hub management…</div>;
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Admin Learning Hub</p><h1 className="mt-2 text-2xl font-bold text-white">Curriculum and practice governance</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Review generated monthly batches and student curriculum requests before they affect the learning experience.</p></div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400"><RefreshCw className="h-4 w-4" />Refresh</button>
      </header>
      {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-3"><Metric label="Batches" value={batches.length} /><Metric label="Pending curriculum" value={curriculumRequests.filter((r) => r.status === 'PENDING').length} /><Metric label="Pending note revisions" value={noteRequests.length} /></div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Monthly batches</h2><div className="mt-4 space-y-3">{batches.length === 0 ? <Empty text="No generated batches are waiting for review." /> : batches.map((batch) => <div key={batch.batchId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div><p className="font-semibold text-white">{batch.career} · Batch {batch.batchNumber}</p><p className="mt-1 text-xs text-slate-400">{batch.questionCount} questions · {batch.status} · Easy {batch.difficultyDistribution?.Easy || 0} / Medium {batch.difficultyDistribution?.Medium || 0} / Hard {batch.difficultyDistribution?.Hard || 0}</p></div>{batch.status !== 'PUBLISHED' && <button type="button" onClick={() => publish(batch.batchId)} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">Validate and publish</button>}</div>)}</div></section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Curriculum change requests</h2><div className="mt-4 space-y-3">{curriculumRequests.length === 0 ? <Empty text="No curriculum change requests." /> : curriculumRequests.map((request) => <div key={request._id || request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div><p className="font-semibold text-white">{request.email || request.studentName}</p><p className="mt-1 text-xs text-slate-400">{request.fromRole} → {request.toRole} · {request.status}</p><p className="mt-2 text-xs text-slate-300">{request.reason}</p></div>{request.status === 'PENDING' && <div className="flex gap-2"><button type="button" onClick={() => reviewCurriculum(request, 'APPROVED')} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950"><CheckCircle2 className="mr-1 inline h-4 w-4" />Approve</button><button type="button" onClick={() => reviewCurriculum(request, 'REJECTED')} className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-300"><XCircle className="mr-1 inline h-4 w-4" />Reject</button></div>}</div>)}</div></section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Pending note revisions</h2>{noteRequests.length === 0 ? <Empty text="No pending note revision requests." /> : <div className="mt-4 space-y-3">{noteRequests.map((request) => <div key={request._id || request.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="font-semibold text-white">{request.topic || 'Saved note revision'}</p><p className="mt-1 text-xs text-slate-400">{request.reason}</p><p className="mt-2 text-xs text-amber-300"><ShieldCheck className="mr-1 inline h-4 w-4" />Review this request in Notes Management to preserve version history.</p></div>)}</div>}</section>
    </main>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>;
const Empty = ({ text }: { text: string }) => <p className="rounded-xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">{text}</p>;
export default LearningHubAdmin;
