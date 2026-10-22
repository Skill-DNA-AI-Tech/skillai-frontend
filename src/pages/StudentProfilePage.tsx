import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Clock3, GraduationCap, Loader2, Lock, MapPin, Pencil, Save, ShieldCheck, UserRound, X, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

export const AVAILABLE_CAREERS = [
  { id: 'Java Software Engineer', domain: 'Computer Science', description: 'Java, OOP, Spring Boot, databases, microservices, and cloud backend architecture.' },
  { id: 'Full Stack Web Developer', domain: 'Computer Science', description: 'React, Node.js, APIs, databases, TypeScript, and system design.' },
  { id: 'Data Scientist', domain: 'Computer Science', description: 'Python, statistics, data pipelines, and machine learning.' },
  { id: 'DevOps Engineer', domain: 'Computer Science', description: 'Linux, Docker, Kubernetes, CI/CD, cloud infrastructure, and reliability.' },
  { id: 'Product Designer', domain: 'Product & UI/UX Design', description: 'User research, information architecture, design systems, and prototyping.' },
];

type Profile = { _id?: string; name?: string; email?: string; role?: string; mobile?: string; college?: string; degree?: string; branch?: string; semester?: string; location?: string; bio?: string; skills?: string[]; interests?: string[]; preferredRoles?: string[]; career?: string; domain?: string; experienceLevel?: string; activeSubject?: string; isProfileCompleted?: boolean; skillDNA?: Record<string, number>; user?: { name?: string; email?: string; role?: string } };
type Curriculum = { career: string; domain: string; activeSubject?: string; subjects?: Array<{ id: string; name: string; description: string }>; completionPercentage: number; masteredTopics: number; totalTopics: number };
type Request = { _id?: string; id?: string; fromRole?: string; toRole?: string; currentSubject?: string; targetSubject?: string; reason?: string; status?: string; reviewNotes?: string; createdAt?: string };

const StudentProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const own = !id || id === user?._id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [careerRequests, setCareerRequests] = useState<Request[]>([]);
  const [subjectRequests, setSubjectRequests] = useState<Request[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', mobile: '', location: '', college: '', degree: '', branch: '', semester: '', experienceLevel: '', bio: '', skills: '', interests: '', preferredRoles: '' });
  const [changeForm, setChangeForm] = useState({ career: AVAILABLE_CAREERS[0].id, reason: '' });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const current = own ? await apiRequest<Profile>('/profiles/me', { token }) : await apiRequest<Profile>(`/profiles/user/${id}`, { token });
      setProfile(current);
      setForm({ name: current.name || current.user?.name || '', mobile: current.mobile || '', location: current.location || '', college: current.college || '', degree: current.degree || '', branch: current.branch || '', semester: current.semester || '', experienceLevel: current.experienceLevel || 'Fresher', bio: current.bio || '', skills: (current.skills || []).join(', '), interests: (current.interests || []).join(', '), preferredRoles: (current.preferredRoles || []).join(', ') });
      if (own) {
        const [active, careers, subjects] = await Promise.all([
          apiRequest<Curriculum>('/learning/active-curriculum', { token }),
          apiRequest<Request[]>('/career-change-requests/my', { token }).catch(() => []),
          apiRequest<Request[]>('/subject-change-requests/my', { token }).catch(() => []),
        ]);
        setCurriculum(active); setCareerRequests(careers); setSubjectRequests(subjects);
        setChangeForm((value) => ({ ...value, career: active.career || value.career }));
      }
    } catch (err: any) { setError(err.message || 'Could not load your profile.'); }
    finally { setLoading(false); }
  }, [id, own, token]);
  useEffect(() => { load(); }, [load]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault(); if (!token) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const saved = await apiRequest<Profile>('/profiles/me', { method: 'PUT', token, body: JSON.stringify({ ...form, skills: split(form.skills), interests: split(form.interests), preferredRoles: split(form.preferredRoles), isProfileCompleted: true }) });
      setProfile(saved); setEditing(false); setNotice('Profile saved successfully.');
    } catch (err: any) { setError(err.message || 'Profile could not be saved.'); }
    finally { setSaving(false); }
  };
  const switchSubject = async (subject: string) => {
    if (!token || subject === curriculum?.activeSubject) return;
    setSwitching(true); setError(''); setNotice('');
    try { await apiRequest('/learning/active-subject', { method: 'PUT', token, body: JSON.stringify({ subject }) }); setCurriculum((value) => value ? { ...value, activeSubject: subject } : value); setProfile((value) => value ? { ...value, activeSubject: subject } : value); setNotice(`Active subject changed to ${subject}.`); }
    catch (err: any) { setError(err.message || 'Subject change failed.'); }
    finally { setSwitching(false); }
  };
  const requestCurriculumChange = async (event: React.FormEvent) => {
    event.preventDefault(); if (!token || !changeForm.reason.trim() || changeForm.reason.trim().length < 12) { setError('Add at least 12 characters explaining why you need a different curriculum.'); return; }
    if (changeForm.career === curriculum?.career) { setError('Choose a curriculum different from your current one.'); return; }
    setRequesting(true); setError(''); setNotice('');
    try { const request = await apiRequest<Request>('/career-change-requests', { method: 'POST', token, body: JSON.stringify({ fromRole: curriculum?.career || profile?.career || 'Current curriculum', toRole: changeForm.career, reason: changeForm.reason.trim() }) }); setCareerRequests((items) => [request, ...items]); setChangeForm({ career: AVAILABLE_CAREERS[0].id, reason: '' }); setNotice('Curriculum change request submitted. Admin or Support Team approval is required before it becomes active.'); }
    catch (err: any) { setError(err.message || 'Could not submit the curriculum request.'); }
    finally { setRequesting(false); }
  };
  const subjects = curriculum?.subjects || [];
  const score = profile?.skillDNA?.overallScore ?? profile?.skillDNA?.score;
  const initials = (profile?.name || profile?.user?.name || user?.name || 'Student').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  if (loading) return <main className="grid min-h-[70vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-300" /></main>;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Student profile</p><h1 className="mt-2 text-3xl font-bold text-white">Your learning identity</h1><p className="mt-2 text-sm text-slate-400">Keep your academic details, target direction, and curriculum controls in one place.</p></div>{own && <button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400">{editing ? <><X className="h-4 w-4" />Cancel</> : <><Pencil className="h-4 w-4" />Edit profile</>}</button>}</header>{error && <Alert tone="error">{error}</Alert>}{notice && <Alert tone="success">{notice}</Alert>}
    <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#10243c] to-[#0b1525] p-6"><div className="flex flex-wrap items-center gap-5"><div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl font-black text-slate-950">{initials}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold text-white">{profile?.name || user?.name || 'Student'}</h2><span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">{profile?.career || 'Curriculum not assigned'}</span></div><p className="mt-2 text-sm text-slate-400">{profile?.email || user?.email} · {profile?.experienceLevel || 'Learner'}</p></div>{score !== undefined && <div className="text-right"><p className="text-xs uppercase tracking-wider text-slate-500">SkillDNA score</p><p className="mt-1 text-3xl font-bold text-cyan-300">{score}<span className="text-base text-slate-500">/100</span></p></div>}</div><div className="mt-6 grid gap-3 sm:grid-cols-3"><Info label="Education" value={[profile?.degree, profile?.branch].filter(Boolean).join(' · ') || 'Not added'} icon={<GraduationCap className="h-4 w-4" />} /><Info label="Location" value={profile?.location || 'Not added'} icon={<MapPin className="h-4 w-4" />} /><Info label="Profile status" value={profile?.isProfileCompleted ? 'Complete' : 'Needs setup'} icon={<ShieldCheck className="h-4 w-4" />} /></div></section>
    {editing && own && <form onSubmit={saveProfile} className="rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-white">Edit profile details</h2><p className="mt-1 text-sm text-slate-400">Your approved curriculum cannot be changed from this form.</p></div><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save changes'}</button></div><div className="mt-5 grid gap-4 md:grid-cols-2">{(['name', 'mobile', 'location', 'college', 'degree', 'branch', 'semester', 'experienceLevel'] as const).map((field) => <label key={field} className="text-sm text-slate-300"><span className="mb-1 block capitalize text-slate-500">{field.replace(/([A-Z])/g, ' $1')}</span><input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /></label>)}<label className="text-sm text-slate-300 md:col-span-2"><span className="mb-1 block text-slate-500">Bio</span><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /></label><label className="text-sm text-slate-300"><span className="mb-1 block text-slate-500">Skills, comma separated</span><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /></label><label className="text-sm text-slate-300"><span className="mb-1 block text-slate-500">Interests, comma separated</span><input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400" /></label></div></form>}
    {own && curriculum && <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Active curriculum</p><h2 className="mt-1 text-xl font-bold text-white">{curriculum.career}</h2><p className="mt-1 text-sm text-slate-400">{curriculum.domain} · {curriculum.masteredTopics}/{curriculum.totalTopics} topics mastered</p></div><Lock className="h-5 w-5 text-amber-300" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${curriculum.completionPercentage}%` }} /></div><div className="mt-2 flex justify-between text-xs text-slate-500"><span>Progress</span><span>{curriculum.completionPercentage}%</span></div><Link to="/learning" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">Open Learning Hub <ChevronRight className="h-4 w-4" /></Link></div><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-start gap-3"><BookOpen className="mt-0.5 h-5 w-5 text-cyan-300" /><div><h2 className="font-bold text-white">Choose a subject</h2><p className="mt-1 text-xs leading-5 text-slate-400">These are focus subjects inside your approved curriculum. Switching is immediate and does not change your career track.</p></div></div><select disabled={switching || subjects.length === 0} value={curriculum.activeSubject || subjects[0]?.name || ''} onChange={(e) => switchSubject(e.target.value)} className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400">{subjects.map((subject) => <option key={subject.id} value={subject.name}>{subject.name}</option>)}</select><p className="mt-3 text-xs text-slate-500">{switching ? 'Switching subject…' : subjects.find((subject) => subject.name === curriculum.activeSubject)?.description || 'Select a focus subject to begin.'}</p></div></section>}
    {own && curriculum && <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><div className="flex items-start gap-3"><Lock className="mt-1 h-5 w-5 text-amber-300" /><div className="flex-1"><h2 className="text-lg font-bold text-white">Need a different curriculum?</h2><p className="mt-1 text-sm text-slate-400">Changing from a Java/software track to another career curriculum requires Admin or Support Team approval.</p><form onSubmit={requestCurriculumChange} className="mt-4 grid gap-3 md:grid-cols-[0.8fr_1.2fr_auto]"><select value={changeForm.career} onChange={(e) => setChangeForm({ ...changeForm, career: e.target.value })} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white">{AVAILABLE_CAREERS.map((career) => <option key={career.id} value={career.id}>{career.id}</option>)}</select><input value={changeForm.reason} onChange={(e) => setChangeForm({ ...changeForm, reason: e.target.value })} placeholder="Why do you need this curriculum?" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-amber-300" /><button type="submit" disabled={requesting} className="rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-60">{requesting ? 'Sending…' : 'Request approval'}</button></form></div></div></section>}
    {own && <RequestHistory title="Curriculum change requests" items={careerRequests} empty="No curriculum change requests yet." />}{own && <RequestHistory title="Subject approvals" items={subjectRequests} empty="Subject switches inside your curriculum do not require approval." />}
  </main>;
};
const split = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const Info = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"><div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs text-slate-500">{label}</span></div><p className="mt-2 truncate text-sm font-semibold text-white">{value}</p></div>;
const Alert = ({ tone, children }: { tone: 'success' | 'error'; children: ReactNode }) => <div className={`rounded-xl border p-3 text-sm ${tone === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>{tone === 'success' ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : <XCircle className="mr-2 inline h-4 w-4" />}{children}</div>;
const RequestHistory = ({ title, items, empty }: { title: string; items: Request[]; empty: string }) => <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-500" /><h2 className="font-bold text-white">{title}</h2></div>{items.length === 0 ? <p className="mt-3 text-sm text-slate-500">{empty}</p> : <div className="mt-4 space-y-2">{items.slice(0, 5).map((item) => <div key={item._id || item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3"><div><p className="text-sm font-semibold text-white">{item.toRole || item.targetSubject}</p><p className="mt-1 text-xs text-slate-500">{item.reason}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${item.status === 'APPROVED' ? 'bg-emerald-400/10 text-emerald-300' : item.status === 'REJECTED' ? 'bg-rose-400/10 text-rose-300' : 'bg-amber-400/10 text-amber-300'}`}>{item.status || 'PENDING'}</span></div>)}</div>}</section>;
export default StudentProfilePage;
