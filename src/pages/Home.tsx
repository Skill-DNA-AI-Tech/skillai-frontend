import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, BookOpenCheck, BriefcaseBusiness, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { domains, heroStats, roadmap } from '../data/platform';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Home = () => {
  return (
    <main className="overflow-hidden bg-slate-950">
      <section className="relative min-h-[85vh] flex items-center justify-center">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[120px] mix-blend-screen animate-pulse duration-1000" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen animate-pulse duration-[2000ms] delay-500" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen animate-pulse duration-1000 delay-1000" />
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-[0.15] mix-blend-overlay" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24 items-center">
          <motion.div initial="hidden" animate="show" variants={containerVariants}>
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              AI-powered growth for every education domain
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="mt-8 max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Welcome to </span>
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 animate-gradient-x">SkillDNA AI</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-xl font-medium text-cyan-100/90">
              Learn <span className="text-slate-500 px-2">•</span> Improve <span className="text-slate-500 px-2">•</span> Get Verified <span className="text-slate-500 px-2">•</span> Get Hired
            </motion.p>
            
            <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              A full-stack student growth and career platform for medical, pharmacy, nursing, science, engineering,
              commerce, MBA, law, arts, diploma, and competitive exam learners.
            </motion.p>
            
            <motion.div variants={itemVariants} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-sm font-bold text-slate-950 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <span className="relative flex items-center gap-2">
                  Open Student Dashboard
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                to="/recruiter"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30 active:scale-95"
              >
                Recruiter Portal
                <BriefcaseBusiness className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative grid gap-6"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent blur-2xl -z-10" />
            
            <div className="grid gap-4 sm:grid-cols-2">
              {heroStats.map((stat, i) => (
                <motion.div 
                  key={stat.label} 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl transition-all hover:border-cyan-500/30 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full" />
                  <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-6 backdrop-blur-xl shadow-lg shadow-emerald-500/5 transition-all hover:bg-emerald-900/40 hover:border-emerald-500/40">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
                  <BadgeCheck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Verified report cards</p>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-100/70">QR verification, recruiter links, PDF export, and rich analytics.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative border-y border-white/5 bg-slate-900/40 py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-4">
          {roadmap.map((item, i) => (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={item.title} 
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05] hover:border-cyan-500/20"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-800/50 group-hover:bg-cyan-500/10 transition-colors">
                <item.icon className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white group-hover:text-cyan-100 transition-colors">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SectionHeader
            eyebrow="Universal platform"
            title="Built for every student path"
            description="SkillDNA organizes learning, interviews, reports, and hiring workflows around the student's domain instead of forcing every learner into a computer-science-only track."
            action={
              <Link to="/learning" className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all active:scale-95">
                Explore Learning Hub
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </motion.div>
        
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {domains.map((domain, i) => (
            <motion.article 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              key={domain.name} 
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:bg-slate-800/60 hover:border-white/10 hover:shadow-2xl hover:shadow-cyan-500/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-slate-950/50 ${domain.color.replace('text-', 'bg-').replace('400', '400/10')} group-hover:scale-110 transition-transform duration-300`}>
                  <domain.icon className={`h-6 w-6 ${domain.color}`} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{domain.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">{domain.subjects}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="relative py-24 bg-slate-900/50 border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 relative z-10">
          {[
            { title: 'Adaptive learning', text: 'Domain -> subject -> topic -> lesson with notes, PDFs, videos, quizzes, assignments, and flashcards.', icon: BookOpenCheck, color: "text-blue-400", bg: "bg-blue-400/10", border: "group-hover:border-blue-500/30" },
            { title: 'Interview coach', text: 'Mock HR, technical, behavioral, aptitude, and group discussion sessions with AI scoring hooks.', icon: PlayCircle, color: "text-purple-400", bg: "bg-purple-400/10", border: "group-hover:border-purple-500/30" },
            { title: 'Hiring engine', text: 'AI job match scores, recruiter-safe report links, applications, shortlists, and interview scheduling.', icon: BriefcaseBusiness, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "group-hover:border-emerald-500/30" },
          ].map((feature, i) => (
            <motion.article 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={feature.title} 
              className={`group rounded-3xl border border-white/5 bg-slate-900/80 p-8 backdrop-blur-xl transition-all hover:bg-slate-800/90 hover:-translate-y-2 ${feature.border} hover:shadow-2xl`}
            >
              <div className={`grid h-16 w-16 place-items-center rounded-2xl ${feature.bg} transition-colors`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">{feature.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-slate-400">{feature.text}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
