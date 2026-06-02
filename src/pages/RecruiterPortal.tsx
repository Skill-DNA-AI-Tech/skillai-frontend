import { CalendarPlus, Filter, Mail, Search, Star, UserRoundCheck, Building2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { recruiterCandidates } from '../data/platform';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const RecruiterPortal = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <SectionHeader
          eyebrow="Recruiter portal"
          title="Search verified students and hire faster"
          description="Company teams can post jobs, filter students, review verified report cards, shortlist candidates, and schedule interviews."
          action={
            <button className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95">
              <CalendarPlus className="h-5 w-5 transition-transform group-hover:rotate-12" />
              Post Job
            </button>
          }
        />
      </motion.div>

      <motion.section 
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {[
          { label: "Open jobs", value: "18", icon: UserRoundCheck, delta: "+4" },
          { label: "Verified candidates", value: "1,284", icon: Star, delta: "+21%" },
          { label: "Shortlists", value: "96", icon: CalendarPlus, delta: "+13" },
          { label: "Report views", value: "312", icon: Mail, delta: "+44" }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }} 
            transition={{ type: "spring", stiffness: 300 }}
          >
            <MetricCard {...stat} />
          </motion.div>
        ))}
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_180px]">
          <div className="relative group">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/50 pl-12 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Search by skill, college, field" />
          </div>
          <div className="relative">
            <select className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer">
              <option>All fields</option>
              <option>Medical</option>
              <option>Engineering</option>
              <option>MBA</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
          <div className="relative">
            <select className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer">
              <option>Min score 70</option>
              <option>Min score 80</option>
              <option>Min score 90</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95">
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </motion.section>

      <motion.section 
        className="mt-8 grid gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {recruiterCandidates.map((candidate, i) => (
          <motion.article 
            key={candidate.name} 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/[0.4] p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-900/[0.7] hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)]"
          >
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[60px] transition-all group-hover:bg-cyan-500/20 group-hover:scale-150 duration-700" />
            
            <div className="relative grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
                    <span className="text-2xl font-bold text-white">
                      {candidate.name.split(' ').map((part) => part[0]).join('')}
                    </span>
                    <div className="absolute -bottom-2 -right-2 grid h-6 w-6 place-items-center rounded-full border-[3px] border-slate-900 bg-white">
                      <Star className="h-3 w-3 text-amber-500" fill="currentColor" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 group/link cursor-pointer">
                      {candidate.name}
                      <ExternalLink className="h-4 w-4 text-slate-500 opacity-0 transition-all group-hover/link:opacity-100 group-hover/link:text-cyan-400" />
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-slate-400 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      {candidate.field}
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400 border border-amber-500/20">
                        {candidate.badge} verified
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Detailed Report', 'ATS Resume', 'Live Projects', 'Interview Summary'].map((item) => (
                    <span key={item} className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/20">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-5 shadow-inner">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">SkillDNA Match</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{candidate.score}%</span>
                </div>
                <ProgressBar value={candidate.score} tone="bg-gradient-to-r from-cyan-500 to-blue-500" />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-bold text-slate-950 transition-all hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] active:scale-95">
                    Shortlist
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95">
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.section>
    </main>
  );
};

export default RecruiterPortal;
