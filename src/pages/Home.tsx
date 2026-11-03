import { ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, Compass, LineChart, ShieldCheck, Sparkles, Target, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { domains } from '../data/platform';

const steps = [
  { label: 'Discover', text: 'Build a clear picture of your strengths, interests, and current experience.', icon: Compass },
  { label: 'Improve', text: 'See the gaps that matter for your chosen direction and learning level.', icon: Target },
  { label: 'Practise', text: 'Learn through structured topics, examples, assessments, and interview practice.', icon: BookOpenCheck },
  { label: 'Demonstrate', text: 'Track evidence of progress and share published results when ready.', icon: BarChart3 },
];

const features = [
  { title: 'Skill DNA profile', text: 'Keep your goals, strengths, evidence, and next actions together in one student workspace.', icon: Sparkles },
  { title: 'Skill-gap guidance', text: 'Turn assessment and interview evidence into a focused learning direction.', icon: Target },
  { title: 'Structured practice', text: 'Move from modules and topics to notes, examples, and measurable practice.', icon: BookOpenCheck },
  { title: 'Progress you can explain', text: 'Build a record of what you have learned and how your skills are developing.', icon: LineChart },
];

const Home = () => (
  <main className="bg-slate-50 text-slate-900">
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <nav className="flex items-center justify-between" aria-label="Public navigation">
          <Link to="/" className="flex items-center gap-3 text-slate-950">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white shadow-sm"><Sparkles className="h-5 w-5" /></span>
            <span><span className="block text-base font-bold tracking-tight">SkillDNA Tech AI</span><span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">Student growth platform</span></span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#about" className="hover:text-blue-700">About</a>
            <a href="#features" className="hover:text-blue-700">Features</a>
            <a href="#how-it-works" className="hover:text-blue-700">How it works</a>
            <a href="#contact" className="hover:text-blue-700">Contact</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Log in</Link>
            <Link to="/register" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">Get started</Link>
          </div>
        </nav>
      </div>
    </section>

    <section id="about" className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><UsersRound className="h-4 w-4" /> Built for student growth</p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Discover your skills. Build your future.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Understand your strengths, identify what to improve, and take meaningful steps towards your career goals with SkillDNA Tech AI.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Start your journey <ArrowRight className="h-4 w-4" /></Link>
            <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">Explore features</a>
          </div>
          <p className="mt-5 text-sm text-slate-500">Your skills have a story. Start building yours.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-start justify-between border-b border-white/10 pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Your growth workspace</p><h2 className="mt-2 text-2xl font-semibold">A clearer next step</h2></div><LineChart className="h-7 w-7 text-blue-300" /></div>
          <div className="mt-6 space-y-3">
            {['Understand your current skills', 'Choose a direction that fits', 'Learn and practise with structure', 'Build evidence over time'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-200">{index + 1}</span><span className="text-sm font-medium text-slate-200">{item}</span><CheckCircle2 className="ml-auto h-4 w-4 text-emerald-300" /></div>)}
          </div>
          <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-slate-400">No promises of guaranteed jobs. Just a practical space to understand, practise, and show your progress.</p>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-200 bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">The student challenge</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Progress is difficult when the next step is unclear.</h2><p className="mt-4 leading-7 text-slate-600">SkillDNA Tech AI gives you a place to make that next step concrete, without pretending that every student needs the same path.</p></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{['Unsure which skills to develop?', 'Not sure where to start?', 'Need practical experience?', 'Want to understand readiness?'].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700 shadow-sm">{item}</div>)}</div></div></section>

    <section id="how-it-works" className="bg-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">How it works</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Discover → Improve → Practise → Demonstrate.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-4">{steps.map((step, index) => <article key={step.label} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5"><span className="text-xs font-bold text-blue-700">0{index + 1}</span><step.icon className="mt-7 h-6 w-6 text-blue-700" /><h3 className="mt-5 font-bold text-slate-950">{step.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></article>)}</div></div></section>

    <section id="features" className="border-y border-slate-200 bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">What exists today</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Tools that support real student decisions.</h2></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map((feature) => <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><feature.icon className="h-6 w-6 text-blue-700" /><h3 className="mt-5 font-bold text-slate-950">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p></article>)}</div></div></section>

    <section className="bg-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Across disciplines</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Your path should reflect your direction.</h2><p className="mt-4 leading-7 text-slate-600">The platform supports different academic and professional streams so your learning context starts with you, not a one-size-fits-all template.</p></div><Link to="/register" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">Create your path <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{domains.map((domain) => <article key={domain.name} className="rounded-xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50"><domain.icon className={`h-5 w-5 ${domain.color}`} /></div><h3 className="font-bold text-slate-950">{domain.name}</h3></div><p className="mt-4 text-sm leading-6 text-slate-600">{domain.subjects}</p></article>)}</div></div></section>

    <section id="contact" className="border-t border-slate-200 bg-slate-900"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-bold text-white">Your next step starts with understanding your skills.</h2><p className="mt-2 text-sm text-slate-400">Create a student account and begin with your own profile.</p></div><div className="flex flex-wrap gap-3"><Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500">Get started <ArrowRight className="h-4 w-4" /></Link><Link to="/verify" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Verify a certificate</Link></div></div></section>
  </main>
);

export default Home;
