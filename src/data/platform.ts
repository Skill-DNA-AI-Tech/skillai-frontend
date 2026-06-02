import {
  BadgeCheck,
  BrainCircuit,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  LineChart,
  MessageSquareText,
  Microscope,
  Scale,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  Video,
} from 'lucide-react';

export const domains = [
  { name: 'Medical', icon: Stethoscope, subjects: 'Anatomy, clinical practice, diagnostics', color: 'text-rose-300' },
  { name: 'Pharmacy', icon: HeartPulse, subjects: 'Pharmacology, formulation, compliance', color: 'text-emerald-300' },
  { name: 'Engineering', icon: GraduationCap, subjects: 'CS, mechanical, civil, EEE, ECE', color: 'text-sky-300' },
  { name: 'Science', icon: FlaskConical, subjects: 'Chemistry, physics, biology, mathematics', color: 'text-amber-300' },
  { name: 'Commerce & MBA', icon: LineChart, subjects: 'Finance, marketing, analytics, strategy', color: 'text-violet-300' },
  { name: 'Law & Arts', icon: Scale, subjects: 'Legal reasoning, writing, policy, humanities', color: 'text-cyan-300' },
];

export const heroStats = [
  { label: 'Education domains', value: '18+' },
  { label: 'AI readiness checks', value: '7' },
  { label: 'Report views tracked', value: '24K+' },
  { label: 'Avg match lift', value: '31%' },
];

export const studentMetrics = [
  { label: 'SkillDNA Score', value: 86, suffix: '%', tone: 'bg-violet-500' },
  { label: 'Interview Readiness', value: 78, suffix: '%', tone: 'bg-sky-500' },
  { label: 'Communication', value: 82, suffix: '%', tone: 'bg-emerald-500' },
  { label: 'Placement Ready', value: 74, suffix: '%', tone: 'bg-amber-500' },
];

export const scoreTrend = [
  { week: 'W1', skill: 58, interview: 42, learning: 50 },
  { week: 'W2', skill: 64, interview: 50, learning: 57 },
  { week: 'W3', skill: 70, interview: 61, learning: 68 },
  { week: 'W4', skill: 76, interview: 69, learning: 74 },
  { week: 'W5', skill: 82, interview: 73, learning: 80 },
  { week: 'W6', skill: 86, interview: 78, learning: 84 },
];

export const weakAreas = [
  { topic: 'Data Structures', score: 68, action: 'Practice tree traversals' },
  { topic: 'System Design', score: 61, action: 'Review scalable architectures' },
  { topic: 'React Performance', score: 72, action: 'Study useMemo and useCallback' },
  { topic: 'Algorithm Speed', score: 66, action: 'Daily LeetCode medium sprint' },
];

export const recommendedLessons = [
  { domain: 'Computer Science', topic: 'Advanced React Patterns', type: 'Video', minutes: 18, level: 'Advanced' },
  { domain: 'Computer Science', topic: 'Docker Containerization', type: 'Quiz', minutes: 12, level: 'Intermediate' },
  { domain: 'Computer Science', topic: 'Microservices Architecture', type: 'Case', minutes: 25, level: 'Advanced' },
  { domain: 'Computer Science', topic: 'REST vs GraphQL', type: 'Flashcards', minutes: 15, level: 'Foundation' },
];

export const dynamicWeakAreas: Record<string, typeof weakAreas> = {
  cs: weakAreas,
  engineering: [
    { topic: 'Thermodynamics', score: 65, action: 'Review heat cycles' },
    { topic: 'AutoCAD Basics', score: 58, action: 'Practice 3D modeling' },
    { topic: 'Fluid Mechanics', score: 71, action: 'Study Navier-Stokes' },
  ],
  medical: [
    { topic: 'Clinical Pharmacology', score: 62, action: 'Review drug interactions' },
    { topic: 'Anatomy: Nervous System', score: 55, action: 'Study cranial nerves' },
    { topic: 'Patient Diagnostics', score: 70, action: 'Practice case studies' },
  ],
  commerce: [
    { topic: 'Financial Accounting', score: 64, action: 'Review balance sheets' },
    { topic: 'Macroeconomics', score: 59, action: 'Study GDP impact models' },
    { topic: 'Business Law', score: 75, action: 'Read recent case laws' },
  ],
  arts: [
    { topic: 'Modern History', score: 68, action: 'Review WWII timelines' },
    { topic: 'Sociological Theory', score: 60, action: 'Study Marx and Weber' },
    { topic: 'Creative Writing', score: 72, action: 'Practice prose styling' },
  ],
  science: [
    { topic: 'Organic Chemistry', score: 54, action: 'Review reaction mechanisms' },
    { topic: 'Quantum Physics', score: 61, action: 'Study Schrödinger equation' },
    { topic: 'Cell Biology', score: 69, action: 'Review mitosis phases' },
  ]
};

export const dynamicLessons: Record<string, typeof recommendedLessons> = {
  cs: recommendedLessons,
  engineering: [
    { domain: 'Mechanical Eng.', topic: 'Intro to Thermodynamics', type: 'Video', minutes: 20, level: 'Intermediate' },
    { domain: 'Civil Eng.', topic: 'Structural Analysis Basics', type: 'Case', minutes: 30, level: 'Advanced' },
    { domain: 'Electrical Eng.', topic: 'Circuit Laws', type: 'Flashcards', minutes: 10, level: 'Foundation' },
  ],
  medical: [
    { domain: 'Medicine', topic: 'Interpreting ECGs', type: 'Video', minutes: 25, level: 'Advanced' },
    { domain: 'Pharmacy', topic: 'Pharmacokinetics Intro', type: 'Quiz', minutes: 15, level: 'Intermediate' },
    { domain: 'Nursing', topic: 'Patient Care Ethics', type: 'Case', minutes: 20, level: 'Foundation' },
  ],
  commerce: [
    { domain: 'Finance', topic: 'DCF Valuation Models', type: 'Video', minutes: 35, level: 'Advanced' },
    { domain: 'Marketing', topic: 'Consumer Behavior', type: 'Case', minutes: 20, level: 'Intermediate' },
    { domain: 'Accounting', topic: 'Tax Compliance 101', type: 'Quiz', minutes: 15, level: 'Foundation' },
  ],
  arts: [
    { domain: 'Literature', topic: 'Analyzing Shakespeare', type: 'Video', minutes: 40, level: 'Advanced' },
    { domain: 'Law', topic: 'Constitutional Rights', type: 'Case', minutes: 25, level: 'Intermediate' },
    { domain: 'History', topic: 'Cold War Origins', type: 'Flashcards', minutes: 10, level: 'Foundation' },
  ],
  science: [
    { domain: 'Chemistry', topic: 'Spectroscopy Basics', type: 'Video', minutes: 25, level: 'Advanced' },
    { domain: 'Physics', topic: 'Electromagnetism', type: 'Quiz', minutes: 20, level: 'Intermediate' },
    { domain: 'Biology', topic: 'Genetics & DNA', type: 'Case', minutes: 30, level: 'Foundation' },
  ]
};

export const roadmap = [
  { title: 'Learn', detail: 'Complete adaptive lessons and topic quizzes', icon: BookOpen },
  { title: 'Improve', detail: 'Close weak areas with daily AI practice', icon: Microscope },
  { title: 'Get Verified', detail: 'Generate report card with QR verification', icon: BadgeCheck },
  { title: 'Get Hired', detail: 'Apply with match scores and recruiter links', icon: BriefcaseBusiness },
];

export const jobMatches = [
  { role: 'Clinical Research Associate', company: 'MedNova Labs', match: 91, domain: 'Medical', missing: 'GCP certificate' },
  { role: 'Junior Data Analyst', company: 'Apex Insights', match: 84, domain: 'MBA / Science', missing: 'SQL case project' },
  { role: 'Graduate Engineer Trainee', company: 'VoltEdge Systems', match: 79, domain: 'Electrical', missing: 'PLC basics' },
  { role: 'Legal Research Intern', company: 'Civic Law Studio', match: 76, domain: 'Law', missing: 'Case brief portfolio' },
];

export const recruiterCandidates = [
  { name: 'Aarav Sharma', field: 'Mechanical Engineering', score: 92, interview: 84, badge: 'Platinum' },
  { name: 'Nisha Rao', field: 'Pharmacy', score: 88, interview: 81, badge: 'Gold' },
  { name: 'Sara Thomas', field: 'MBA Marketing', score: 83, interview: 79, badge: 'Gold' },
  { name: 'Imran Khan', field: 'BSc Chemistry', score: 78, interview: 72, badge: 'Silver' },
];

export const adminAnalytics = [
  { label: 'Active students', value: '18,240', icon: UsersRound, delta: '+14%' },
  { label: 'Completion rate', value: '68%', icon: CalendarCheck, delta: '+9%' },
  { label: 'Placement success', value: '42%', icon: ShieldCheck, delta: '+6%' },
  { label: 'Recruiter engagement', value: '73%', icon: Building2, delta: '+18%' },
];

export const contentTypes = [
  'Notes',
  'PDFs',
  'Videos',
  'Quizzes',
  'Mock tests',
  'Assignments',
  'Flashcards',
  'Interview prep',
  'Career guidance',
  'Live webinars',
];

export const mentorSessions = [
  { mentor: 'Dr. Kavya Iyer', field: 'System Design Interviews', time: 'Today, 6:00 PM', seats: 4 },
  { mentor: 'Rahul Menon', field: 'Frontend / React.js Prep', time: 'Tomorrow, 7:30 PM', seats: 12 },
  { mentor: 'Ananya Sen', field: 'Data Structures & Algo', time: 'Friday, 5:00 PM', seats: 8 },
];

export const interviewTypes = [
  'HR round',
  'Technical round',
  'Behavioral round',
  'Domain interview',
  'Aptitude round',
  'Group discussion',
];

export const navItems = [
  { label: 'Home', href: '/', icon: GraduationCap },
  { label: 'Student', href: '/dashboard', icon: LineChart },
  { label: 'Scorecards', href: '/scorecards', icon: BadgeCheck },
  { label: 'Certificates', href: '/certificates', icon: BadgeCheck },
  { label: 'Career Twin', href: '/career-twin', icon: BrainCircuit },
  { label: 'Learning', href: '/learning', icon: BookOpen },
  { label: 'Interview', href: '/interview', icon: Video },
  { label: 'Jobs', href: '/jobs', icon: BriefcaseBusiness },
  { label: 'HR', href: '/hr', icon: Building2 },
  { label: 'Admin', href: '/admin', icon: UsersRound },
  { label: 'Main Admin', href: '/main-admin', icon: ShieldCheck },
  { label: 'Community', href: '/community', icon: MessageSquareText },
];
