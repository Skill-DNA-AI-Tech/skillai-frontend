export const canonicalRoles = [
  'MAIN_ADMIN',
  'ADMIN',
  'HR',
  'STUDENT',
  'SUPPORT_TEAM',
  'RECRUITER',
  'INTERVIEW_COACH',
  'SALES_TEAM',
] as const;

export type CanonicalRole = typeof canonicalRoles[number];
export type UserStatus = 'PENDING' | 'ACTIVE' | 'DISABLED' | 'REJECTED';
export type AnyRole = CanonicalRole | 'student' | 'recruiter' | 'admin' | 'employee' | 'staff';

export const normalizeRole = (role?: string | null): CanonicalRole => {
  const original = (role ?? '').trim();
  const upper = original.toUpperCase();

  if (original === 'student' || upper === 'STUDENT') return 'STUDENT';
  if (original === 'admin' || original === 'employee' || original === 'staff' || upper === 'ADMIN') return 'ADMIN';
  if (original === 'recruiter' || upper === 'HR') return 'HR';
  if (upper === 'MAIN_ADMIN') return 'MAIN_ADMIN';
  if (upper === 'SUPPORT_TEAM') return 'SUPPORT_TEAM';
  if (upper === 'RECRUITER') return 'RECRUITER';
  if (upper === 'INTERVIEW_COACH') return 'INTERVIEW_COACH';
  if (upper === 'SALES_TEAM') return 'SALES_TEAM';

  return 'STUDENT';
};

export const roleLabel = (role?: string | null) => {
  const labels: Record<CanonicalRole, string> = {
    MAIN_ADMIN: 'Main Admin',
    ADMIN: 'Admin',
    HR: 'HR',
    STUDENT: 'Student',
    SUPPORT_TEAM: 'Support Team',
    RECRUITER: 'Recruiter',
    INTERVIEW_COACH: 'Interview Coach',
    SALES_TEAM: 'Sales Team',
  };

  return labels[normalizeRole(role)];
};

export const roleHome = (role?: string | null) => {
  const normalized = normalizeRole(role);
  if (normalized === 'MAIN_ADMIN') return '/main-admin';
  if (normalized === 'ADMIN') return '/admin';
  if (normalized === 'HR') return '/hr';
  return '/dashboard';
};
