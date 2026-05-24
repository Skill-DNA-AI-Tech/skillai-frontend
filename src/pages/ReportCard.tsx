import { BadgeCheck, Download, Eye, Mail, QrCode, ShieldCheck } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';

const scores = [
  { label: 'SkillDNA', value: 88, tone: 'bg-cyan-400' },
  { label: 'Interview', value: 81, tone: 'bg-violet-400' },
  { label: 'Communication', value: 84, tone: 'bg-emerald-400' },
  { label: 'Confidence', value: 79, tone: 'bg-amber-400' },
  { label: 'Technical', value: 86, tone: 'bg-rose-400' },
  { label: 'Projects', value: 82, tone: 'bg-sky-400' },
];

const ReportCard = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Verified report"
        title="AI-verified SkillDNA report card"
        description="A recruiter-ready profile with verification ID, badge, score breakdown, strengths, weaknesses, role fit, salary estimate, QR verification, and tracked secure links."
        action={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/[0.08]">
              <Mail className="h-4 w-4" />
              Send
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
              <Download className="h-4 w-4" />
              PDF
            </button>
          </div>
        }
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-white/10 bg-slate-900/[0.86] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <img
                className="h-20 w-20 shrink-0 rounded-lg object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80"
                alt="Student profile"
              />
              <div className="min-w-0">
                <h3 className="text-2xl font-semibold text-white">Nisha Rao</h3>
                <p className="mt-1 text-sm text-slate-300">Pharmacy - Final Year</p>
                <p className="mt-1 break-words text-sm text-slate-400">Greenfield College of Health Sciences</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950">
              <BadgeCheck className="h-4 w-4" />
              Gold
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <p className="text-sm text-slate-400">Verification ID</p>
              <p className="mt-2 font-semibold text-white">SDNA-8F4A91C2</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <p className="text-sm text-slate-400">Salary estimate</p>
              <p className="mt-2 font-semibold text-white">5L - 10L INR</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <p className="font-semibold text-white">Recommended roles</p>
            <div className="flex flex-wrap gap-2">
              {['Clinical Research Associate', 'Drug Safety Associate', 'Medical Writer'].map((role) => (
                <span key={role} className="max-w-full break-words rounded bg-cyan-300/[0.15] px-3 py-2 text-sm text-cyan-100">{role}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {scores.map((score) => (
            <article key={score.label} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-white">{score.label}</p>
                <p className="text-sm font-semibold text-slate-200">{score.value}%</p>
              </div>
              <ProgressBar value={score.value} tone={score.tone} />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
          <ShieldCheck className="h-6 w-6 text-emerald-200" />
          <h3 className="mt-4 font-semibold text-white">Strengths</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300">
            <li>Pharmacology fundamentals</li>
            <li>Certification discipline</li>
            <li>Clear communication</li>
          </ul>
        </article>
        <article className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
          <Eye className="h-6 w-6 text-amber-200" />
          <h3 className="mt-4 font-semibold text-white">Weaknesses</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300">
            <li>Add one clinical case project</li>
            <li>Practice interview examples</li>
            <li>Improve resume keyword density</li>
          </ul>
        </article>
        <article className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
          <QrCode className="h-6 w-6 text-cyan-200" />
          <h3 className="mt-4 font-semibold text-white">QR verification</h3>
          <div className="mt-4 grid h-28 w-28 grid-cols-4 gap-1 rounded bg-white p-2">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index} className={index % 3 === 0 || index % 5 === 0 ? 'bg-slate-950' : 'bg-slate-200'} />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};

export default ReportCard;
