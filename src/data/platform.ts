import {
  BadgeCheck,
  BrainCircuit,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  LineChart,
  MessageSquareText,
  Microscope,
  Scale,
  Stethoscope,
  Target,
  User,
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

export const roadmap = [
  { title: 'Learn', detail: 'Complete adaptive lessons and topic quizzes', icon: BookOpen },
  { title: 'Improve', detail: 'Close weak areas with daily AI practice', icon: Microscope },
  { title: 'Get Verified', detail: 'Generate report card with QR verification', icon: BadgeCheck },
  { title: 'Get Hired', detail: 'Apply with match scores and recruiter links', icon: BriefcaseBusiness },
];

export const navItems = [
  { label: 'Home', href: '/', icon: GraduationCap },
  { label: 'Dashboard', href: '/dashboard', icon: LineChart },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Career Twin', href: '/career-twin', icon: BrainCircuit },
  { label: 'Learning', href: '/learning', icon: BookOpen },
  { label: 'Interview', href: '/interview', icon: Video },
  { label: 'Jobs', href: '/jobs', icon: BriefcaseBusiness },
  { label: 'HR', href: '/hr', icon: Building2 },
  { label: 'Admin', href: '/admin', icon: UsersRound },
  { label: 'Community', href: '/community', icon: MessageSquareText },
];
