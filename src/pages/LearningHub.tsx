import { FileText, GripVertical, Layers3, ListChecks, Plus, UploadCloud, Video, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import { contentTypes, domains } from '../data/platform';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const LearningHub = () => {
  const { token } = useAuth();
  const [topic, setTopic] = useState('Machine Learning Basics');
  const [subject, setSubject] = useState('Computer Science');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicLessons, setDynamicLessons] = useState<any[]>([]);

  const handlePublish = async () => {
    setIsGenerating(true);
    try {
      const demoToken = token || "demo-token";
      const data = await apiRequest<any>('/ai/learning/recommend', {
        method: 'POST',
        body: JSON.stringify({
          weakTopics: [topic, subject],
          recentScore: 60,
          targetExam: 'SkillDNA Certification',
          availableMinutesPerDay: 45
        }),
        token: demoToken
      });
      
      const newLessons = [
        { topic: data.nextLesson, level: data.difficulty, domain: subject, minutes: 20 },
        ...(data.roadmap || []).map((r: string) => ({ topic: r, level: data.difficulty, domain: subject, minutes: 30 }))
      ];
      setDynamicLessons([...newLessons, ...dynamicLessons]);
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI lessons.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 overflow-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <SectionHeader
          eyebrow="Universal learning hub"
          title="Domain -> subject -> topic -> lesson"
          description="Admin teams can create structured learning content for any education stream with notes, PDFs, videos, quizzes, assignments, flashcards, interviews, career guidance, and webinars."
        />
      </motion.div>

      <motion.section 
        className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {domains.map((domain) => (
          <motion.article 
            key={domain.name} 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/[0.4] p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-900/[0.7]"
          >
            <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${domain.color.replace('text-', 'bg-').replace('400', '400/10')} blur-[40px] transition-all group-hover:scale-150 duration-700`} />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-slate-950/50 ${domain.color.replace('text-', 'bg-').replace('400', '400/10')}`}>
                  <domain.icon className={`h-6 w-6 ${domain.color}`} />
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">Active</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{domain.name}</h3>
              <p className="mt-2 text-sm text-slate-400">{domain.subjects}</p>
            </div>
          </motion.article>
        ))}
      </motion.section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-6 shadow-xl backdrop-blur-sm relative overflow-hidden"
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-500/10">
              <Layers3 className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Content Generator</h3>
          </div>
          
          <form className="mt-8 grid gap-5 relative z-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Subject
                <input value={subject} onChange={e => setSubject(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white focus:border-cyan-500 focus:ring-1" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Topic to Expand
                <input value={topic} onChange={e => setTopic(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white focus:border-cyan-500 focus:ring-1" />
              </label>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 mt-2">
              <motion.button whileHover={{ scale: 1.02 }} type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200">
                <UploadCloud className="h-4 w-4" /> Upload Material
              </motion.button>
              <motion.button 
                onClick={handlePublish}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }} 
                type="button" 
                className="group relative overflow-hidden inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 text-sm font-bold text-slate-950 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? 'Generating...' : 'Auto-Generate Curriculum'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        <motion.div className="grid gap-4" variants={containerVariants} initial="hidden" animate="show">
          {dynamicLessons.length === 0 ? (
            <div className="text-center text-slate-400 border border-white/10 rounded-xl p-12 bg-slate-900/50">
              <Layers3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Auto-Generate Curriculum" to use AI to build a roadmap for the selected topic.</p>
            </div>
          ) : (
            dynamicLessons.map((lesson, index) => (
              <motion.article 
                key={`${lesson.topic}-${index}`} 
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group cursor-pointer rounded-2xl border border-white/5 bg-slate-900/[0.6] p-5 backdrop-blur-sm transition-all hover:bg-slate-800/80 hover:border-cyan-500/20"
              >
                <div className="flex gap-4">
                  <GripVertical className="mt-1 h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors cursor-grab" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-white group-hover:text-cyan-100 transition-colors">{lesson.topic}</p>
                      <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">{lesson.level}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                      <span className="text-slate-300">{lesson.domain}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      {lesson.minutes} min
                    </p>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </motion.div>
      </section>
    </main>
  );
};

export default LearningHub;
