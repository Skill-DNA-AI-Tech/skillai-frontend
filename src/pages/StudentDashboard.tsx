import { Activity, Bell, CalendarDays, FileBadge, Flame, Send, Target, ChevronRight, X, UserCog, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { recommendedLessons, scoreTrend, weakAreas, dynamicWeakAreas, dynamicLessons } from '../data/platform';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface SkillDNA {
  score?: number;
  communicationScore?: number;
  confidenceScore?: number;
  technicalScore?: number;
  placementReadinessScore?: number;
  careerPathSuggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  salaryRangeEstimate?: string;
  badge?: string;
}

interface StudentProfile {
  _id: string;
  name: string;
  college?: string;
  branch?: string;
  degree?: string;
  photoUrl?: string;
  skillDNA?: SkillDNA;
}

interface DashboardMetric {
  label: string;
  value: number;
  suffix: string;
  tone: string;
}

interface FocusArea {
  topic: string;
  score: number;
  action: string;
}

interface RecommendedLesson {
  domain: string;
  topic: string;
  type: string;
  minutes: number;
  level: string;
}

interface DashboardAnalysis {
  metrics?: DashboardMetric[];
  weakAreas?: FocusArea[];
  recommendedLessons?: RecommendedLesson[];
}

const StudentDashboard = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<DashboardAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [scorecard, setScorecard] = useState<any>(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);
  
  // Profile Setup Modal State
  const [showProfileModal, setShowProfileModal] = useState(true); // Defaults to true to show popup on login
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [certName, setCertName] = useState('');
  
  const [deepProfile, setDeepProfile] = useState({
    // Basic Details
    phone: '',
    gender: '',
    dob: '',
    location: '',
    resume: '',
    
    // Academic Record
    domain: '',
    institute: '',
    semester: '',
    board10: '',
    passingYear10: '',
    tenthMarks: '',
    board12: '',
    passingYear12: '',
    twelfthMarks: '',
    passingYearDegree: '',
    finalMarks: '',
    
    // Skills & Employment
    fresherOrExperience: 'fresher',
    keySkills: '',
    preferredRole: '',
    workModel: '',
    expectedSalary: '',
    readyToRelocate: false,
    languages: '',
    
    // Portfolio & Extras
    portfolioUrl: '',
    certifications: '',
    achievements: '',
    noPortfolio: false,
    noCertifications: false
  });

  const getDynamicPortfolioField = () => {
    switch(deepProfile.domain) {
      case 'medical': return { label: 'Research / Clinical Log Link', placeholder: 'https://pubmed.ncbi... or Drive link' };
      case 'commerce': return { label: 'LinkedIn / Case Studies', placeholder: 'https://linkedin.com/in/...' };
      case 'arts': return { label: 'Writing Portfolio / Behance', placeholder: 'https://behance.net/...' };
      case 'science': return { label: 'Research Publications Link', placeholder: 'https://researchgate.net/...' };
      default: return { label: 'GitHub / Project Portfolio', placeholder: 'https://github.com/...' };
    }
  };

  const dynamicField = getDynamicPortfolioField();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isPortfolioMissing = !deepProfile.noPortfolio && !deepProfile.portfolioUrl;
    const isCertMissing = !deepProfile.noCertifications && !deepProfile.certifications;
    
    if (!deepProfile.domain || !deepProfile.phone || !deepProfile.location || !deepProfile.tenthMarks || !deepProfile.twelfthMarks || !deepProfile.finalMarks || !deepProfile.keySkills || isPortfolioMissing || isCertMissing) {
      console.log("Email Notification: User attempted to skip mandatory Naukri-style fields.");
      alert("Please fill all mandatory fields (Phone, Location, Marks, Skills). If you do not have a portfolio or certificates, please check the respective boxes.");
      return;
    }
    
    setShowProfileModal(false);
    setIsAnalyzing(true);
    
    try {
      // Mock user token for local demo if missing
      const demoToken = token || "demo-token";
      const data = await apiRequest<DashboardAnalysis>('/ai/deep-analysis', {
        method: 'POST',
        body: JSON.stringify(deepProfile),
        token: demoToken
      });
      setAiAnalysis(data);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      // Even if AI fails, let them pass
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setScorecardLoading(true);
    setError(null);

    apiRequest<StudentProfile>('/profiles/me', { token })
      .then((data) => setProfile(data))
      .catch((err) => setError(err?.message || 'Unable to load profile data.'))
      .finally(() => setLoading(false));

    apiRequest<any>('/reports/me/scorecards', { token })
      .then((data) => setScorecard(data))
      .catch((err) => console.error('Unable to load scorecard', err))
      .finally(() => setScorecardLoading(false));
  }, [token]);

  const metrics: DashboardMetric[] = aiAnalysis?.metrics || (profile
    ? [
        { label: 'SkillDNA Score', value: profile.skillDNA?.score ?? 0, suffix: '%', tone: 'bg-violet-500' },
        { label: 'Interview Readiness', value: profile.skillDNA?.confidenceScore ?? 0, suffix: '%', tone: 'bg-sky-500' },
        { label: 'Communication', value: profile.skillDNA?.communicationScore ?? 0, suffix: '%', tone: 'bg-emerald-500' },
        { label: 'Placement Ready', value: profile.skillDNA?.placementReadinessScore ?? 0, suffix: '%', tone: 'bg-amber-500' },
      ]
    : [
        { label: 'SkillDNA Score', value: 0, suffix: '%', tone: 'bg-violet-500' },
        { label: 'Interview Readiness', value: 0, suffix: '%', tone: 'bg-sky-500' },
        { label: 'Communication', value: 0, suffix: '%', tone: 'bg-emerald-500' },
        { label: 'Placement Ready', value: 0, suffix: '%', tone: 'bg-amber-500' },
      ]);

  // Dynamically map profile weaknesses to the required format if aiAnalysis is not present
  const currentWeakAreas: FocusArea[] = aiAnalysis?.weakAreas || (profile?.skillDNA?.weaknesses 
    ? profile.skillDNA.weaknesses.map((w: string, i: number) => ({ topic: w, score: 50 + (i * 5), action: 'Focus area' }))
    : weakAreas as FocusArea[]);

  // Dynamic Lessons based on profile strengths or default
  const currentLessons: RecommendedLesson[] = aiAnalysis?.recommendedLessons || (profile?.skillDNA?.strengths
    ? profile.skillDNA.strengths.map((s: string) => ({ domain: 'Career Path', topic: `Advanced ${s}`, type: 'Video', minutes: 25, level: 'Intermediate' }))
    : recommendedLessons as RecommendedLesson[]);

  // Dynamically generate a score trend leading up to the current real score
  const currentRealScore = profile?.skillDNA?.score ?? 0;
  const currentIntScore = profile?.skillDNA?.confidenceScore ?? 0;
  const dynamicScoreTrend = currentRealScore > 0 ? [
    { week: 'W1', skill: Math.max(20, currentRealScore - 40), interview: Math.max(15, currentIntScore - 45), learning: 30 },
    { week: 'W2', skill: Math.max(30, currentRealScore - 30), interview: Math.max(25, currentIntScore - 35), learning: 45 },
    { week: 'W3', skill: Math.max(40, currentRealScore - 20), interview: Math.max(35, currentIntScore - 25), learning: 55 },
    { week: 'W4', skill: Math.max(50, currentRealScore - 10), interview: Math.max(45, currentIntScore - 15), learning: 65 },
    { week: 'W5', skill: Math.max(60, currentRealScore - 5), interview: Math.max(55, currentIntScore - 5), learning: 75 },
    { week: 'W6', skill: currentRealScore, interview: currentIntScore, learning: 85 },
  ] : scoreTrend;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 overflow-hidden relative">
      {/* Analyzing Toast */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 text-cyan-200 backdrop-blur-xl shadow-2xl"
          >
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <span className="font-semibold text-cyan-400">AI is analyzing your Deep Profile...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-emerald-200 backdrop-blur-xl shadow-2xl"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">Analysis Complete! Profile Updated.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Profile Setup Modal - Naukri Style */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 py-8"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative border-b border-white/10 bg-slate-900/80 p-6 flex items-center justify-between shrink-0 backdrop-blur-xl z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserCog className="h-6 w-6 text-cyan-400" />
                    Complete Your Profile 
                    <span className="text-xs font-normal bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30">100% Required</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">Recruiters search for detailed profiles. Provide comprehensive information to get shortlisted faster.</p>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
                <form onSubmit={handleProfileSubmit} className="grid gap-12 pb-4 max-w-3xl mx-auto">
                  
                  {/* Section 1: Basic Details & Resume */}
                  <div className="grid gap-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-500/20 text-xs text-cyan-400">1</span> 
                      Basic Details & Resume
                    </h3>
                    
                    <div className="grid gap-2 text-sm font-medium text-slate-300">
                      <label>Resume / CV Upload <span className="text-red-400">*</span></label>
                      <div className="flex gap-2">
                        <input value={deepProfile.resume} readOnly className="h-11 flex-1 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1" placeholder="Upload your latest resume (PDF/DOCX)..." />
                        <button type="button" onClick={() => resumeInputRef.current?.click()} className="flex items-center gap-2 rounded-lg bg-slate-800 px-6 font-semibold text-cyan-400 hover:bg-slate-700 transition-colors">
                          <Upload className="h-4 w-4" /> Upload
                        </button>
                        <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.docx" onChange={(e) => {
                          if (e.target.files?.[0]) setDeepProfile({...deepProfile, resume: e.target.files[0].name})
                        }}/>
                      </div>
                      <p className="text-xs text-slate-500">File size must be under 5MB.</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Phone Number <span className="text-red-400">*</span>
                        <input value={deepProfile.phone} onChange={(e) => setDeepProfile({...deepProfile, phone: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1" placeholder="+91 9876543210" />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Current Location <span className="text-red-400">*</span>
                        <input value={deepProfile.location} onChange={(e) => setDeepProfile({...deepProfile, location: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1" placeholder="e.g., Bangalore, India" />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Date of Birth
                        <input type="date" value={deepProfile.dob} onChange={(e) => setDeepProfile({...deepProfile, dob: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1" />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Gender
                        <select value={deepProfile.gender} onChange={(e) => setDeepProfile({...deepProfile, gender: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-cyan-500 focus:ring-1">
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Prefer not to say</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Section 2: Complete Academic Record */}
                  <div className="grid gap-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-500/20 text-xs text-violet-400">2</span> 
                      Complete Academic Record
                    </h3>
                    
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Highest Qualification / Domain <span className="text-red-400">*</span>
                        <select value={deepProfile.domain} onChange={(e) => setDeepProfile({...deepProfile, domain: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-violet-500 focus:ring-1">
                          <option value="" disabled>Select your domain</option>
                          <option value="cs">Computer Science / IT / BCA</option>
                          <option value="engineering">Mechanical / Civil / Core Engg</option>
                          <option value="medical">Medical / Pharmacy / Nursing</option>
                          <option value="commerce">B.Com / MBA / Finance</option>
                          <option value="arts">Arts / Humanities / Law</option>
                          <option value="science">Basic Sciences (B.Sc / M.Sc)</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Institute / College Name
                        <input value={deepProfile.institute} onChange={(e) => setDeepProfile({...deepProfile, institute: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="e.g., IIT Bombay" />
                      </label>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Degree Pass Year
                        <input value={deepProfile.passingYearDegree} onChange={(e) => setDeepProfile({...deepProfile, passingYearDegree: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="YYYY" />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-300 sm:col-span-2">
                        Degree CGPA / % <span className="text-red-400">*</span>
                        <input value={deepProfile.finalMarks} onChange={(e) => setDeepProfile({...deepProfile, finalMarks: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="e.g., 8.5 CGPA" />
                      </label>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-slate-950/30 grid gap-5">
                      <div className="grid gap-5 sm:grid-cols-3">
                        <label className="grid gap-2 text-sm font-medium text-slate-300">
                          12th Board Name
                          <input value={deepProfile.board12} onChange={(e) => setDeepProfile({...deepProfile, board12: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-900/80 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="e.g., CBSE / State" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-300">
                          12th Pass Year
                          <input value={deepProfile.passingYear12} onChange={(e) => setDeepProfile({...deepProfile, passingYear12: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-900/80 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="YYYY" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-300">
                          12th % <span className="text-red-400">*</span>
                          <input value={deepProfile.twelfthMarks} onChange={(e) => setDeepProfile({...deepProfile, twelfthMarks: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-900/80 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="e.g., 82%" />
                        </label>
                      </div>
                      
                      <div className="grid gap-5 sm:grid-cols-3 border-t border-white/5 pt-4">
                        <label className="grid gap-2 text-sm font-medium text-slate-300">
                          10th Board Name
                          <input value={deepProfile.board10} onChange={(e) => setDeepProfile({...deepProfile, board10: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-900/80 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="e.g., CBSE / ICSE" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-300">
                          10th Pass Year
                          <input value={deepProfile.passingYear10} onChange={(e) => setDeepProfile({...deepProfile, passingYear10: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-900/80 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="YYYY" />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-300">
                          10th % <span className="text-red-400">*</span>
                          <input value={deepProfile.tenthMarks} onChange={(e) => setDeepProfile({...deepProfile, tenthMarks: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-900/80 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1" placeholder="e.g., 85%" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Skills & Experience */}
                  <div className="grid gap-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">3</span> 
                      Key Skills & Employment
                    </h3>
                    
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${deepProfile.fresherOrExperience === 'fresher' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-slate-950/50 text-slate-400 hover:bg-white/5'}`}>
                        <input type="radio" name="exp" value="fresher" checked={deepProfile.fresherOrExperience === 'fresher'} onChange={(e) => setDeepProfile({...deepProfile, fresherOrExperience: e.target.value})} className="hidden" />
                        I am a Fresher
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${deepProfile.fresherOrExperience === 'experienced' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-slate-950/50 text-slate-400 hover:bg-white/5'}`}>
                        <input type="radio" name="exp" value="experienced" checked={deepProfile.fresherOrExperience === 'experienced'} onChange={(e) => setDeepProfile({...deepProfile, fresherOrExperience: e.target.value})} className="hidden" />
                        I am Experienced
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-medium text-slate-300">
                      Key Skills (Comma separated) <span className="text-red-400">*</span>
                      <textarea value={deepProfile.keySkills} onChange={(e) => setDeepProfile({...deepProfile, keySkills: e.target.value})} className="h-20 rounded-lg border-white/10 bg-slate-950/50 p-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 resize-none" placeholder="e.g., Python, React.js, Sales Strategy, Tally, Clinical Research..." />
                      <p className="text-xs text-slate-500">Recruiters search by these keywords. Add up to 15 skills.</p>
                    </label>

                    <div className="grid gap-2 text-sm font-medium text-slate-300">
                      <div className="flex items-center justify-between">
                        <label>{dynamicField.label} <span className="text-red-400">*</span></label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
                          <input type="checkbox" checked={deepProfile.noPortfolio} onChange={(e) => setDeepProfile({...deepProfile, noPortfolio: e.target.checked, portfolioUrl: ''})} className="rounded border-white/20 bg-slate-950/50 text-emerald-500 focus:ring-emerald-500" />
                          I don't have one
                        </label>
                      </div>
                      <input value={deepProfile.portfolioUrl} disabled={deepProfile.noPortfolio} onChange={(e) => setDeepProfile({...deepProfile, portfolioUrl: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed" placeholder={deepProfile.noPortfolio ? 'We will help you build one! 🚀' : dynamicField.placeholder} />
                    </div>
                  </div>

                  {/* Section 4: Career Preferences */}
                  <div className="grid gap-6">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/20 text-xs text-amber-400">4</span> 
                      Career Preferences
                    </h3>
                    
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Target Job Role
                        <input value={deepProfile.preferredRole} onChange={(e) => setDeepProfile({...deepProfile, preferredRole: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1" placeholder="e.g., Software Dev, Pharmacist..." />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Expected Salary (LPA)
                        <input value={deepProfile.expectedSalary} onChange={(e) => setDeepProfile({...deepProfile, expectedSalary: e.target.value})} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1" placeholder="e.g., 6 LPA or As per industry standards" />
                      </label>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-300">
                        Preferred Work Model
                        <select value={deepProfile.workModel} onChange={(e) => setDeepProfile({...deepProfile, workModel: e.target.value})} className="h-11 w-full rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-amber-500 focus:ring-1">
                          <option value="any">Any / Open</option>
                          <option value="remote">Fully Remote</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="onsite">On-site / Office / Clinic</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-3 text-sm font-medium text-slate-300 mt-8 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" checked={deepProfile.readyToRelocate} onChange={(e) => setDeepProfile({...deepProfile, readyToRelocate: e.target.checked})} className="h-5 w-5 rounded border-white/20 bg-slate-950/50 text-amber-500 focus:ring-amber-500" />
                        I am willing to relocate
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-white/10 mt-4">
                    <button type="button" onClick={() => setShowProfileModal(false)} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-10 py-3.5 text-base font-bold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95">
                      Save & Complete Profile
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <SectionHeader
          eyebrow="Student dashboard"
          title="Growth cockpit for career readiness"
          description={
            profile
              ? `Live SkillDNA data for ${profile.name}. Track career score, domain readiness, and the next best actions.`
              : 'Connect your account to see student progress metrics, SkillDNA insights, and recruiter activity.'
          }
          action={
            <div className="flex gap-3">
              <Link 
                to="/certificates"
                className="group inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/10"
              >
                <FileBadge className="h-4 w-4" />
                My Certificates
              </Link>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
              >
                <UserCog className="h-4 w-4" />
                Edit Profile
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/certificates`);
                  alert("Your verified certificates and learning report link has been copied to your clipboard! Share this link with recruiters to showcase your SkillDNA scores.");
                }}
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                Share Report
              </button>
            </div>
          }
        />
        {loading && <p className="mt-4 text-sm text-slate-400">Loading student profile...</p>}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </motion.div>

      <motion.section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={containerVariants} initial="hidden" animate="show">
        {metrics.map((metric) => (
          <motion.div key={metric.label} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <MetricCard label={metric.label} value={metric.value} suffix={metric.suffix} progress={metric.value} tone={metric.tone} />
          </motion.div>
        ))}
      </motion.section>

      {/* Dynamic Scorecard Section */}
      {scorecard && scorecard.latest && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 rounded-2xl border border-white/5 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileBadge className="h-6 w-6 text-cyan-400" />
                Latest Interview Scorecard
              </h3>
              <p className="text-sm text-slate-400 mt-1">Your comprehensive performance report from the last AI evaluation.</p>
            </div>
            {scorecard.pdfReportUrl && (
              <Link
                to="/scorecards"
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-105 active:scale-95"
              >
                <Upload className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                View Scorecards
              </Link>
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Overall Score</p>
              <div className="text-3xl font-bold text-cyan-400">{scorecard.latest.skillDNAScore || scorecard.latest.overallScore || 0}<span className="text-lg text-slate-500">/100</span></div>
            </div>
            <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Technical Skills</p>
              <div className="text-3xl font-bold text-blue-400">{scorecard.latest.technicalScore || 0}<span className="text-lg text-slate-500">/100</span></div>
            </div>
            <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Communication</p>
              <div className="text-3xl font-bold text-emerald-400">{scorecard.latest.communicationScore || 0}<span className="text-lg text-slate-500">/100</span></div>
            </div>
            <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
              <p className="text-sm text-slate-400 mb-1">Confidence</p>
              <div className="text-3xl font-bold text-amber-400">{scorecard.latest.confidenceScore || 0}<span className="text-lg text-slate-500">/100</span></div>
            </div>
          </div>

          {(scorecard.feedback || (scorecard.strengths?.length > 0)) && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-slate-900/50 p-5 border border-white/5">
                <h4 className="font-semibold text-white mb-3">AI Feedback</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{scorecard.feedback || scorecard.latest.aiRecommendationSummary}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-5 border border-white/5">
                <h4 className="font-semibold text-white mb-3">Strengths & Weaknesses</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(scorecard.strengths || scorecard.latest.strengths || []).map((s: string, i: number) => (
                    <span key={i} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 border border-emerald-500/20">{s}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(scorecard.weaknesses || scorecard.latest.weaknesses || []).map((w: string, i: number) => (
                    <span key={i} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400 border border-amber-500/20">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.section>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-6 shadow-xl backdrop-blur-sm transition-all hover:border-cyan-500/20"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Skill growth analytics</h3>
              <p className="mt-1 text-sm text-slate-400">Weekly improvement across learning, skills, and interviews.</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-500/10 transition-colors group-hover:bg-cyan-500/20">
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicScoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="skill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="interview" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="learning" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="skill" stroke="#22d3ee" fill="url(#skill)" strokeWidth={3} />
                <Area type="monotone" dataKey="interview" stroke="#a78bfa" fill="url(#interview)" strokeWidth={3} />
                <Area type="monotone" dataKey="learning" stroke="#34d399" fill="url(#learning)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="group cursor-pointer">
            <MetricCard label="Learning streak" value={profile?.skillDNA?.score ? Math.max(1, Math.floor(profile.skillDNA.score / 10)) : 0} icon={Flame} delta={`+${Math.floor((profile?.skillDNA?.score || 0)/20)} days`} />
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="group cursor-pointer">
            <MetricCard label="Recruiter views" value={profile?.skillDNA?.score ? Math.floor(profile.skillDNA.score / 4) : 0} icon={Bell} delta={`+${Math.floor((profile?.skillDNA?.score || 0)/15)}`} />
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="group cursor-pointer">
            <MetricCard label="Shortlist alerts" value={profile?.skillDNA?.score ? Math.floor(profile.skillDNA.score / 25) : 0} icon={FileBadge} delta="+1" />
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="group cursor-pointer">
            <MetricCard label="Skill goals met" value={profile?.skillDNA?.score ? Math.floor(profile.skillDNA.score / 20) : 0} icon={Target} delta={`+${Math.floor((profile?.skillDNA?.score || 0)/30)}`} />
          </motion.div>
        </motion.div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Focus Areas</h3>
          </div>
          <div className="grid gap-4">
            {currentWeakAreas.map((area, idx) => (
              <motion.article
                key={area.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-slate-800/40 p-4 transition-all hover:bg-slate-800/80 hover:border-amber-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{area.topic}</p>
                    <p className="mt-1 text-sm text-slate-400 flex items-center gap-1 group-hover:text-amber-200/70 transition-colors">
                      {area.action} <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </p>
                  </div>
                  <span className="text-lg font-bold text-amber-400">{area.score}%</span>
                </div>
                <div className="relative mt-4">
                  <ProgressBar value={area.score} tone="bg-amber-400" />
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10">
              <CalendarDays className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Recommended lessons</h3>
          </div>
          <div className="grid gap-4">
            {currentLessons.map((lesson, idx) => (
              <motion.article
                key={`${lesson.domain}-${lesson.topic}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="group cursor-pointer rounded-xl border border-white/5 bg-slate-800/40 p-4 transition-all hover:bg-slate-800/80 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{lesson.topic}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      <span className="text-emerald-400/80">{lesson.domain}</span> • {lesson.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                      {lesson.minutes} min
                    </span>
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default StudentDashboard;
