import { FormEvent, useEffect, useState } from 'react';
import { BriefcaseBusiness, CalendarPlus, CheckCircle2, Filter, Loader2, Search, Star, UserRoundCheck, XCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { apiRequest } from '../lib/api';

type Job = {
  _id: string;
  title: string;
  company: string;
  domain: string;
  status: string;
  skills?: string[];
  createdAt?: string;
};

type Application = {
  _id: string;
  status: string;
  matchScore: number;
  student?: { name: string; email: string };
  profile?: { college?: string; branch?: string; skillDNA?: { score?: number; communicationScore?: number; confidenceScore?: number } };
  job?: Job;
};

type Candidate = {
  _id: string;
  name: string;
  college?: string;
  branch?: string;
  skills?: string[];
  skillDNA?: { score?: number; communicationScore?: number; confidenceScore?: number };
  user?: { name: string; email: string };
};

const emptyJobForm = {
  title: '',
  company: '',
  domain: '',
  description: '',
  skills: '',
  location: 'Remote',
};

const HrDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [search, setSearch] = useState({ skill: '', field: '', minScore: '70' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsResult, applicationsResult] = await Promise.all([
        apiRequest<Job[]>('/recruiters/jobs/me'),
        apiRequest<Application[]>('/recruiters/applications'),
      ]);
      setJobs(jobsResult);
      setApplications(applicationsResult);
    } catch (err: any) {
      setError(err?.message || 'Unable to load HR dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createJob = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...jobForm,
          skills: jobForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        }),
      });
      setJobForm(emptyJobForm);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to create job.');
    } finally {
      setSaving(false);
    }
  };

  const searchCandidates = async () => {
    const params = new URLSearchParams();
    if (search.skill) params.set('skill', search.skill);
    if (search.field) params.set('field', search.field);
    if (search.minScore) params.set('minScore', search.minScore);

    try {
      const result = await apiRequest<Candidate[]>(`/recruiters/students/search?${params.toString()}`);
      setCandidates(result);
    } catch (err: any) {
      setError(err?.message || 'Unable to search candidates.');
    }
  };

  const updateApplication = async (id: string, status: 'shortlisted' | 'rejected' | 'interviewing') => {
    try {
      await apiRequest(`/recruiters/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to update application.');
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="HR Dashboard"
        title="Manage jobs, candidates, and interviews"
        description="Post jobs, search verified students, review scorecards, shortlist candidates, reject applicants, and schedule interview workflows."
      />

      {error && <div className="mt-6 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>}
      {loading && <p className="mt-6 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading HR workspace...</p>}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open jobs" value={jobs.filter((job) => job.status === 'open').length} icon={BriefcaseBusiness} />
        <MetricCard label="Applications" value={applications.length} icon={UserRoundCheck} />
        <MetricCard label="Shortlisted" value={applications.filter((app) => app.status === 'shortlisted').length} icon={Star} />
        <MetricCard label="Interviews" value={applications.filter((app) => app.status === 'interviewing').length} icon={CalendarPlus} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={createJob} className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><CalendarPlus className="h-5 w-5 text-cyan-300" /> Post Job</h2>
          <div className="grid gap-3">
            <input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Job title" required />
            <input value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Company" required />
            <input value={jobForm.domain} onChange={(e) => setJobForm({ ...jobForm, domain: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Domain" required />
            <input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Location" />
            <input value={jobForm.skills} onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Skills, comma separated" />
            <textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} className="min-h-24 rounded-md border border-white/10 bg-slate-950 p-3 text-sm text-white" placeholder="Job description" required />
            <button disabled={saving} className="rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60">{saving ? 'Posting...' : 'Post Job'}</button>
          </div>
        </form>

        <div className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Job Management</h2>
              <p className="text-sm text-slate-400">Your active and draft job postings.</p>
            </div>
          </div>
          <div className="grid gap-3">
            {jobs.map((job) => (
              <article key={job._id} className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{job.company} / {job.domain}</p>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">{job.status}</span>
                </div>
                {!!job.skills?.length && <p className="mt-3 text-xs text-slate-500">{job.skills.join(', ')}</p>}
              </article>
            ))}
            {jobs.length === 0 && <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">No jobs posted yet.</p>}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-slate-900/70 p-5">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_160px_150px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search.skill} onChange={(e) => setSearch({ ...search, skill: e.target.value })} className="h-11 w-full rounded-md border border-white/10 bg-slate-950 pl-10 pr-3 text-sm text-white" placeholder="Search candidates by skill" />
          </div>
          <input value={search.field} onChange={(e) => setSearch({ ...search, field: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Field or domain" />
          <input value={search.minScore} onChange={(e) => setSearch({ ...search, minScore: e.target.value })} className="h-11 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-white" placeholder="Min score" />
          <button onClick={searchCandidates} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white/10 px-4 text-sm font-semibold text-white">
            <Filter className="h-4 w-4" />
            Search
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((candidate) => {
            const score = candidate.skillDNA?.score ?? 0;
            return (
              <article key={candidate._id} className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{candidate.name || candidate.user?.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{candidate.college || 'College not added'} / {candidate.branch || 'Domain not added'}</p>
                  </div>
                  <span className="text-lg font-bold text-cyan-200">{score}%</span>
                </div>
                <div className="mt-4"><ProgressBar value={score} tone="bg-cyan-300" /></div>
                <p className="mt-3 text-xs text-slate-500">{candidate.skills?.slice(0, 6).join(', ') || 'No skills listed'}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-slate-900/70">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-lg font-bold text-white">Candidate Pipeline</h2>
          <p className="mt-1 text-sm text-slate-400">Review applications and move candidates through the hiring workflow.</p>
        </div>
        <div className="divide-y divide-white/5">
          {applications.map((application) => (
            <div key={application._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_180px_260px] lg:items-center">
              <div>
                <h3 className="font-bold text-white">{application.student?.name || 'Candidate'}</h3>
                <p className="mt-1 text-sm text-slate-400">{application.job?.title || 'Job'} / {application.profile?.college || 'College not added'}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-slate-400">Match {application.matchScore}%</p>
                <ProgressBar value={application.matchScore} tone="bg-emerald-300" />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button onClick={() => updateApplication(application._id, 'shortlisted')} className="inline-flex items-center gap-1 rounded-md bg-emerald-300 px-3 py-2 text-xs font-bold text-slate-950"><CheckCircle2 className="h-4 w-4" /> Shortlist</button>
                <button onClick={() => updateApplication(application._id, 'interviewing')} className="inline-flex items-center gap-1 rounded-md border border-cyan-300/30 px-3 py-2 text-xs font-semibold text-cyan-100">Schedule</button>
                <button onClick={() => updateApplication(application._id, 'rejected')} className="inline-flex items-center gap-1 rounded-md border border-red-300/30 px-3 py-2 text-xs font-semibold text-red-100"><XCircle className="h-4 w-4" /> Reject</button>
              </div>
            </div>
          ))}
          {applications.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No applications yet.</p>}
        </div>
      </section>
    </main>
  );
};

export default HrDashboard;
