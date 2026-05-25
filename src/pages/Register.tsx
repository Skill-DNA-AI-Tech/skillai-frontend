import { KeyRound, Mail, ShieldCheck, UserPlus, Sparkles, AlertCircle, Camera, Upload, CheckCircle2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    educationBg: '',
    semester: '',
    interest: '',
    specialty: '',
    skillLevel: '',
    careerGoal: ''
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (showError) setShowError(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any field is empty or if no avatar is uploaded
    const isFormIncomplete = Object.values(formData).some(value => value.trim() === '') || !avatarPreview;

    if (isFormIncomplete) {
      setShowError(true);
      // Simulating the email notification logic
      console.log("Email Notification Sent: Incomplete Profile Registration Attempted");
      
      // Auto-hide error after 5 seconds
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setShowSuccess(true);
    
    // Simulate API delay for creating the deep profile
    setTimeout(() => {
      login(
        {
          _id: window.crypto?.randomUUID?.() ?? `${formData.email}-${Date.now()}`,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          role: 'student',
          avatarUrl: avatarPreview ?? undefined,
        },
        window.crypto?.randomUUID?.() ?? `${formData.email}-${Date.now()}`
      );
      navigate('/dashboard');
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start min-h-[80vh] overflow-hidden">
      {/* Toast Notification for Validation Error */}
      <AnimatePresence>
        {showError && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex max-w-md items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 backdrop-blur-xl shadow-2xl shadow-red-500/20"
          >
            <AlertCircle className="h-6 w-6 shrink-0 text-red-400" />
            <div>
              <h4 className="font-bold text-red-400">Mandatory Profile Fields Missing</h4>
              <p className="mt-1 text-sm text-red-200/80">In-depth analysis requires all fields and a profile image to be completed. A notification has been sent to your email regarding this attempt.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section 
        className="relative z-10 sticky top-24"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] animate-pulse" />
        <motion.div variants={itemVariants}>
          <SectionHeader
            eyebrow="Create Account"
            title="In-Depth Profile Analysis"
            description="We need deep insights into your educational background to build an accurate, personalized learning and career roadmap."
          />
        </motion.div>
        
        <motion.div className="mt-10 grid gap-5" variants={containerVariants}>
          {[
            { icon: ShieldCheck, title: 'Mandatory Completion', text: 'All fields are strictly required for AI analysis to function properly.' },
            { icon: Mail, title: 'Smart Match', text: 'Get personalized course recommendations based on your exact semester and specialty.' },
            { icon: KeyRound, title: 'Identity Verification', text: 'Your profile image will be verified against institution records.' },
          ].map((item, i) => (
            <motion.article 
              key={item.title} 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-emerald-500/20 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]"
            >
              <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section 
        className="relative"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 -left-20 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/[0.7] p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
                  <Sparkles className="h-6 w-6 text-slate-950" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Student Registration</h2>
                  <p className="text-sm text-slate-400">Complete all fields for accurate analysis</p>
                </div>
              </div>
              
              {/* Profile Image Upload */}
              <div className="relative group">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-16 w-16 overflow-hidden rounded-full border-2 transition-all cursor-pointer ${avatarPreview ? 'border-emerald-500' : 'border-dashed border-slate-500 hover:border-emerald-400'}`}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-slate-950/50 text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                {!avatarPreview && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-red-400">
                    * Mandatory
                  </div>
                )}
              </div>
            </div>
            
            <form className="grid gap-6">
              
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  First Name <span className="text-red-400">*</span>
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="John" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Last Name <span className="text-red-400">*</span>
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Doe" />
                </label>
              </div>
              
              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Email Address <span className="text-red-400">*</span>
                <input name="email" value={formData.email} onChange={handleInputChange} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" type="email" placeholder="name@example.com" />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Education Background <span className="text-red-400">*</span>
                  <div className="relative">
                    <select name="educationBg" value={formData.educationBg} onChange={handleInputChange} className="h-11 w-full appearance-none rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                      <option value="" disabled>Select your degree/major</option>
                      <option value="cs">Computer Science / IT</option>
                      <option value="engineering">Mechanical / Civil / Core Engineering</option>
                      <option value="medical">Medical / Pharmacy / Nursing</option>
                      <option value="commerce">B.Com / MBA / Finance</option>
                      <option value="arts">Arts / Humanities / Law</option>
                      <option value="science">Basic Sciences (B.Sc / M.Sc)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                </label>
                
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Current Year/Semester <span className="text-red-400">*</span>
                  <div className="relative">
                    <select name="semester" value={formData.semester} onChange={handleInputChange} className="h-11 w-full appearance-none rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                      <option value="" disabled>Select your progress</option>
                      <option value="1st_year">1st Year / Sem 1-2</option>
                      <option value="2nd_year">2nd Year / Sem 3-4</option>
                      <option value="3rd_year">3rd Year / Sem 5-6</option>
                      <option value="4th_year">4th Year / Sem 7-8</option>
                      <option value="graduated">Already Graduated</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Broad Field of Interest <span className="text-red-400">*</span>
                  <input name="interest" value={formData.interest} onChange={handleInputChange} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="e.g. Web Development" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Niche Specialty to Master <span className="text-red-400">*</span>
                  <input name="specialty" value={formData.specialty} onChange={handleInputChange} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="e.g. React.js, Java Spring" />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Current Skill Level <span className="text-red-400">*</span>
                  <div className="relative">
                    <select name="skillLevel" value={formData.skillLevel} onChange={handleInputChange} className="h-11 w-full appearance-none rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                      <option value="" disabled>Select your level</option>
                      <option value="beginner">Complete Beginner</option>
                      <option value="intermediate">Intermediate / Some Experience</option>
                      <option value="advanced">Advanced / Building Projects</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                </label>
                
                <label className="grid gap-2 text-sm font-medium text-slate-300">
                  Primary Career Goal <span className="text-red-400">*</span>
                  <div className="relative">
                    <select name="careerGoal" value={formData.careerGoal} onChange={handleInputChange} className="h-11 w-full appearance-none rounded-lg border-white/10 bg-slate-950/50 px-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                      <option value="" disabled>Select primary objective</option>
                      <option value="job">Secure a Full-time Job</option>
                      <option value="internship">Find an Internship</option>
                      <option value="freelance">Freelance / Contract Work</option>
                      <option value="masters">Prepare for Higher Studies</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-400">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-slate-300">
                Password <span className="text-red-400">*</span>
                <input name="password" value={formData.password} onChange={handleInputChange} className="h-11 rounded-lg border-white/10 bg-slate-950/50 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" type="password" placeholder="••••••••" />
              </label>
              
              <div className="mt-6 grid gap-3">
                <motion.button 
                  type="button"
                  onClick={handleRegister}
                  disabled={showSuccess}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 text-sm font-bold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] disabled:opacity-80"
                >
                  <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    {showSuccess ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Analyzing Profile...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
                        Submit Profile for Analysis
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link to="/auth" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.section>
    </main>
  );
};

export default Register;
