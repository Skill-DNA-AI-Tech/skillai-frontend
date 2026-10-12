import { ArrowRight, BadgeCheck, BookOpenCheck, BriefcaseBusiness, CheckCircle2, Compass, GraduationCap, LineChart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { domains, roadmap } from '../data/platform';

const Home = () => {
  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              <GraduationCap className="h-4 w-4 text-cyan-300" />
              Student growth workspace
            </p>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn your current skills into a clear next step.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              SkillDNA AI connects your profile, learning path, assessments, interview practice, and verified results in one place—so you always know what to learn next and why it matters.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                Start with your profile <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/learning"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                See the learning path <Compass className="h-4 w-4 text-cyan-300" />
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-500">Built for students across engineering, health sciences, commerce, law, arts, and science.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-slate-950/40 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Your growth path</p>
                <h2 className="mt-2 text-xl font-semibold text-white">One connected journey</h2>
              </div>
              <LineChart className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="mt-5 space-y-3">
              {roadmap.map((item, index) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-semibold text-cyan-200">{index + 1}</div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Progress is based on your saved profile and assessment evidence.
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-18">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">What you can do here</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Useful guidance, not another content feed.</h2>
            <p className="mt-4 leading-7 text-slate-400">Each workspace is designed to help you make a decision, complete an activity, or show evidence of progress.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              { title: 'Learn with context', text: 'Follow modules, topics, and subtopics with notes, examples, practice, and assessments.', icon: BookOpenCheck },
              { title: 'Find the next gap', text: 'Use assessment and interview evidence to focus your time on the skills that need attention.', icon: ShieldCheck },
              { title: 'Show verified progress', text: 'Use published certificates and report links when you are ready to share your work.', icon: BadgeCheck },
            ].map((feature) => (
              <article key={feature.title} className="rounded-xl border border-white/10 bg-slate-950/60 p-6">
                <feature.icon className="h-6 w-6 text-cyan-300" />
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Built around your field</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">A learning path that starts where you are.</h2>
            <p className="mt-4 leading-7 text-slate-400">Choose your domain, define your goal, and build evidence through learning and practice. The platform keeps the structure clear as your direction develops.</p>
          </div>
          <Link to="/auth" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            Create your path <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {domains.map((domain) => (
            <article key={domain.name} className="rounded-xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-cyan-400/30 hover:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06]"><domain.icon className={`h-5 w-5 ${domain.color}`} /></div>
                <h3 className="font-semibold text-white">{domain.name}</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">{domain.subjects}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Ready to make your next step visible?</h2>
            <p className="mt-2 text-sm text-slate-400">Start with a profile, then let your saved evidence shape the path.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-200"><ArrowRight className="h-4 w-4" /> Get started</Link>
            <Link to="/verify" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.06]"><BriefcaseBusiness className="h-4 w-4" /> Verify a certificate</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
