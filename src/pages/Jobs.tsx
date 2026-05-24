import { Bookmark, BriefcaseBusiness, CheckCircle2, MapPin, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const MOCK_JOBS = [
  { role: 'Clinical Research Associate', company: 'MedNova Labs', domain: 'Medical', jobSkills: ['GCP', 'Clinical Trials', 'Research'], certs: ['GCP Certificate'] },
  { role: 'Software Engineer', company: 'TechNova', domain: 'IT', jobSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB'], certs: ['AWS Certified'] },
  { role: 'Junior Data Analyst', company: 'Apex Insights', domain: 'MBA / Science', jobSkills: ['SQL', 'Python', 'Tableau', 'Excel'], certs: [] },
  { role: 'Graduate Engineer Trainee', company: 'VoltEdge', domain: 'Engineering', jobSkills: ['PLC', 'AutoCAD', 'Electrical Systems'], certs: [] }
];

const Jobs = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [aiJobs, setAiJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiRequest('/profiles/me', { token }).then(data => setProfile(data)).catch(console.error);
  }, [token]);

  const handleMatchJobs = async () => {
    if (!profile?.skillDNA?.skills && !profile?.deepProfile?.keySkills) {
      alert("Please complete your deep profile or add skills to generate AI job matches.");
      return;
    }
    
    setLoading(true);
    try {
      const demoToken = token || "demo-token";
      const profileSkills = profile.deepProfile?.keySkills?.split(',') || profile.skillDNA?.skills || [];
      const commScore = profile.skillDNA?.communicationScore || 70;
      const intScore = profile.skillDNA?.confidenceScore || 70;

      const processedJobs = await Promise.all(MOCK_JOBS.map(async (job) => {
        const matchData = await apiRequest<any>('/ai/jobs/match', {
          method: 'POST',
          body: JSON.stringify({
            profileSkills,
            jobSkills: job.jobSkills,
            jobCertifications: job.certs,
            profileCertifications: profile.deepProfile?.certifications?.split(',') || [],
            communicationScore: commScore,
            interviewScore: intScore
          }),
          token: demoToken
        });
        return { ...job, ...matchData };
      }));
      
      setAiJobs(processedJobs.sort((a, b) => b.matchScore - a.matchScore));
    } catch (error) {
      console.error(error);
      alert("Failed to analyze jobs. Is the python server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="AI job matching portal"
        title="Browse, match, apply, and improve"
        description="Click 'Find AI Matches' to scan our job database against your deep profile and SkillDNA score."
        action={
          <button 
            onClick={handleMatchJobs}
            disabled={loading || !profile}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Matching..." : "Find AI Matches"}
          </button>
        }
      />

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {['Full-time', 'Internship', 'Remote', 'Research'].map((type) => (
          <button key={type} className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-left text-sm font-medium text-white hover:bg-white/[0.09]">
            {type}
          </button>
        ))}
      </section>

      {aiJobs.length > 0 && (
        <section className="mt-8 grid gap-5">
          {aiJobs.map((job) => (
            <article key={`${job.role}-${job.company}`} className="rounded-lg border border-white/10 bg-slate-900/[0.84] p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_260px] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-300 text-slate-950">
                      <BriefcaseBusiness className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{job.role}</h3>
                      <p className="mt-1 text-sm text-slate-400">{job.company} - {job.domain}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-2 py-1 text-slate-300">
                      <MapPin className="h-3.5 w-3.5" />
                      Remote
                    </span>
                    <span className="rounded bg-emerald-300/[0.15] px-2 py-1 text-emerald-100">One click apply</span>
                    {job.missingSkills?.length > 0 && (
                      <span className="rounded bg-amber-300/[0.15] px-2 py-1 text-amber-100">Missing: {job.missingSkills.join(', ')}</span>
                    )}
                  </div>
                  <div className="mt-4 text-sm leading-6 text-slate-300">
                    <p className="font-semibold text-cyan-200">AI Explanation:</p>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {job.explanation?.map((exp: string, i: number) => <li key={i}>{exp}</li>)}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold text-white">Match Score</p>
                    <span className="text-lg font-semibold text-cyan-200">{job.matchScore}%</span>
                  </div>
                  <ProgressBar value={job.matchScore} tone={job.matchScore > 80 ? "bg-emerald-400" : "bg-cyan-400"} />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
                      <CheckCircle2 className="h-4 w-4" />
                      Apply
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/[0.08]">
                      <Bookmark className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                  {job.improvementRoadmap?.length > 0 && (
                    <div className="mt-4 p-3 rounded-md border border-amber-300/30 bg-amber-300/5 text-xs text-amber-100">
                      <p className="font-semibold mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> How to improve:</p>
                      <ul className="list-disc list-inside">
                        {job.improvementRoadmap.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
      
      {!loading && aiJobs.length === 0 && (
        <div className="mt-12 text-center text-slate-400 border border-white/10 rounded-xl p-12 bg-slate-900/50">
          <BriefcaseBusiness className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-white mb-2">No jobs matched yet</h3>
          <p>Click "Find AI Matches" to run your SkillDNA profile against our job board.</p>
        </div>
      )}
    </main>
  );
};

export default Jobs;
