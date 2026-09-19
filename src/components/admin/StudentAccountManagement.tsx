import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Award, Search, RefreshCw, CheckCircle2, AlertCircle,
  Loader2, Key, ShieldCheck, Copy, Check, ExternalLink, QrCode, ArrowRight,
  BookOpen, Building, GraduationCap, X, Eye, EyeOff
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export interface StudentListItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  mobile?: string;
  career: string;
  domain: string;
  college: string;
  degree: string;
  branch: string;
  requiresPasswordChange?: boolean;
  createdAt: string;
  activeCurriculum?: {
    curriculumId: string;
    title: string;
    domain: string;
    totalTopics: number;
    masteredTopics: number;
  };
  certificateCount: number;
}

const AVAILABLE_CAREERS = [
  { title: 'Java Software Engineer', domain: 'Computer Science', role: 'Java Backend Engineer' },
  { title: 'Full Stack Web Developer', domain: 'Computer Science', role: 'Full Stack Engineer' },
  { title: 'Data Science & AI Engineer', domain: 'Computer Science', role: 'Data Scientist & AI Specialist' },
  { title: 'Cloud DevOps Engineer', domain: 'Computer Science', role: 'Cloud Platform & DevOps Engineer' },
  { title: 'Mechanical Design Engineer', domain: 'Mechanical Engineering', role: 'CAD & Thermal Systems Engineer' },
  { title: 'Civil Structural Engineer', domain: 'Civil Engineering', role: 'Structural Analysis & BIM Engineer' },
  { title: 'Electronics & Embedded Engineer', domain: 'Electronics', role: 'Embedded Systems & IoT Engineer' },
  { title: 'Corporate Finance Analyst', domain: 'Finance', role: 'Financial Planning & Valuation Analyst' },
  { title: 'Digital Marketing & Growth Lead', domain: 'Marketing', role: 'Performance Marketer & Growth Strategist' },
  { title: 'Human Resources Specialist', domain: 'HR', role: 'Talent Acquisition & People Operations' },
];

const generateSecurePassword = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  let pass = '';
  for (let i = 0; i < 6; i++) pass += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 2; i++) pass += digits.charAt(Math.floor(Math.random() * digits.length));
  pass += special.charAt(Math.floor(Math.random() * special.length));
  return pass;
};

export const StudentAccountManagement: React.FC = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create Student Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingStudent, setSubmittingStudent] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    password: generateSecurePassword(),
    career: 'Java Software Engineer',
    domain: 'Computer Science',
    college: 'SkillDNA Partner Institute',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Final Year',
    mobile: '',
  });

  // Created Student Success Modal
  const [createdStudentInfo, setCreatedStudentInfo] = useState<{
    name: string;
    email: string;
    password: string;
    career: string;
    domain: string;
  } | null>(null);
  const [credentialsCopied, setCredentialsCopied] = useState(false);

  // Issue Certificate Modal State
  const [showIssueCertModal, setShowIssueCertModal] = useState(false);
  const [showCertPreviewModal, setShowCertPreviewModal] = useState(false);
  const [adminConfirmed, setAdminConfirmed] = useState(false);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<StudentListItem | null>(null);
  const [submittingCert, setSubmittingCert] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [certForm, setCertForm] = useState({
    studentId: '',
    careerPath: '',
    courseName: '',
    overallScore: 85,
    technicalScore: 88,
    communicationScore: 82,
    problemSolvingScore: 85,
    confidenceScore: 84,
    sessionsCompleted: 3,
    interviewReadinessStatus: 'ADVANCED' as 'READY' | 'ADVANCED' | 'IN_PROGRESS',
    issueDate: new Date().toISOString().split('T')[0],
    officialRemark: 'Outstanding proficiency in domain concepts, technical depth, and professional problem-solving demonstrated during official assessment.',
  });

  // Student Details Modal State
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [inspectingStudent, setInspectingStudent] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Issued Certificate Success Modal State
  const [issuedCertResult, setIssuedCertResult] = useState<{
    certificateId: string;
    studentName: string;
    careerPath: string;
    overallScore: number;
    verificationUrl: string;
    qrCode: string;
  } | null>(null);
  const [certLinkCopied, setCertLinkCopied] = useState(false);

  const fetchStudents = async (targetPage = 1, searchQuery = search) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: '25',
        search: searchQuery.trim(),
      });
      const data = await apiRequest<{
        students: StudentListItem[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/students/list?${params.toString()}`, { token });

      setStudents(data?.students || []);
      setTotalStudents(data?.total || 0);
      setPage(data?.page || 1);
      setTotalPages(data?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, search);
  }, [token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(1, search);
  };

  const handleCareerChange = (careerTitle: string) => {
    const found = AVAILABLE_CAREERS.find((c) => c.title === careerTitle);
    setNewStudentForm((prev) => ({
      ...prev,
      career: careerTitle,
      domain: found?.domain || prev.domain,
    }));
  };

  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    if (!newStudentForm.name.trim() || !newStudentForm.email.trim()) {
      setStudentError('Name and email are required.');
      return;
    }

    if (newStudentForm.password.trim().length < 6) {
      setStudentError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmittingStudent(true);
      const res = await apiRequest<{
        message: string;
        user: any;
        profile: any;
        temporaryPassword: string;
      }>('/admin/students', {
        token,
        method: 'POST',
        body: JSON.stringify(newStudentForm),
      });

      setCreatedStudentInfo({
        name: newStudentForm.name.trim(),
        email: newStudentForm.email.trim().toLowerCase(),
        password: newStudentForm.password.trim(),
        career: newStudentForm.career,
        domain: newStudentForm.domain,
      });

      setShowCreateModal(false);
      // Reset form
      setNewStudentForm({
        name: '',
        email: '',
        password: generateSecurePassword(),
        career: 'Java Software Engineer',
        domain: 'Computer Science',
        college: 'SkillDNA Partner Institute',
        degree: 'B.Tech',
        branch: 'Computer Science & Engineering',
        semester: 'Final Year',
        mobile: '',
      });

      fetchStudents(1, search);
    } catch (err: any) {
      setStudentError(err.message || 'Failed to create student account.');
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleOpenIssueCert = (student: StudentListItem) => {
    setSelectedStudentForCert(student);
    setCertError(null);
    setAdminConfirmed(false);
    setShowCertPreviewModal(false);
    setCertForm({
      studentId: student._id,
      careerPath: student.career || student.domain || 'Software Development',
      courseName: student.activeCurriculum?.title || student.career || 'Software Engineering Program',
      overallScore: 85,
      technicalScore: 88,
      communicationScore: 82,
      problemSolvingScore: 86,
      confidenceScore: 84,
      sessionsCompleted: 3,
      interviewReadinessStatus: 'ADVANCED',
      issueDate: new Date().toISOString().split('T')[0],
      officialRemark: `Candidate ${student.name} demonstrated outstanding technical competency in ${student.career || 'Software Engineering'}, precise analytical reasoning, and structured professional articulation.`,
    });
    setShowIssueCertModal(true);
  };

  const handleOpenCertPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setCertError(null);

    if (certForm.overallScore < 75) {
      setCertError('Verified certificate issuance requires an overall score of at least 75%.');
      return;
    }

    if (!certForm.officialRemark.trim()) {
      setCertError('Official administrator remark is required before previewing and issuing.');
      return;
    }

    setAdminConfirmed(false);
    setShowIssueCertModal(false);
    setShowCertPreviewModal(true);
  };

  const handleConfirmAndIssueCert = async () => {
    if (!adminConfirmed) {
      setCertError('Explicit administrator confirmation is required to issue this certificate.');
      return;
    }

    try {
      setSubmittingCert(true);
      const res = await apiRequest<{
        message: string;
        certificate: any;
        verificationUrl: string;
        qrCode: string;
      }>('/admin/certificates/issue', {
        token,
        method: 'POST',
        body: JSON.stringify(certForm),
      });

      setShowCertPreviewModal(false);
      setIssuedCertResult({
        certificateId: res.certificate.certificateId,
        studentName: res.certificate.studentName,
        careerPath: res.certificate.careerPath,
        overallScore: res.certificate.overallScore,
        verificationUrl: res.verificationUrl || `${window.location.origin}/verify/${res.certificate.certificateId}`,
        qrCode: res.qrCode || res.certificate.qrCode,
      });

      fetchStudents(page, search);
    } catch (err: any) {
      setCertError(err.message || 'Failed to issue certificate.');
    } finally {
      setSubmittingCert(false);
    }
  };

  const handleViewStudentDetails = async (studentId: string) => {
    try {
      setLoadingDetails(true);
      const data = await apiRequest<any>(`/admin/students/${studentId}`, { token });
      setInspectingStudent(data);
      setShowStudentDetailsModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load student profile details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStudentStatus = async (student: StudentListItem) => {
    const nextStatus = student.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change ${student.name}'s account status to ${nextStatus}?`)) {
      return;
    }
    try {
      await apiRequest<any>(`/admin/students/${student._id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchStudents(page, search);
    } catch (err: any) {
      alert(err.message || 'Failed to update student status.');
    }
  };

  const copyCreatedCredentials = () => {
    if (!createdStudentInfo) return;
    const text = `SkillDNA AI Student Portal Login:\n` +
      `URL: ${window.location.origin}/auth\n` +
      `Email / User ID: ${createdStudentInfo.email}\n` +
      `Temporary Password: ${createdStudentInfo.password}\n` +
      `Assigned Career: ${createdStudentInfo.career}\n` +
      `Domain: ${createdStudentInfo.domain}\n\n` +
      `Please log in and update your profile and password immediately.`;

    navigator.clipboard.writeText(text);
    setCredentialsCopied(true);
    setTimeout(() => setCredentialsCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-cyan-400" />
            Student Account & Verification Management
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Securely register student accounts with locked career curricula and issue tamper-proof verified certificates with public QR codes.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setNewStudentForm((prev) => ({ ...prev, password: generateSecurePassword() }));
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, career, or institution..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </form>
        <button
          onClick={() => fetchStudents(1, search)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-850 text-slate-200 text-sm font-semibold transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            <span className="ml-3 text-sm text-slate-400">Loading student directory...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 px-4">
            <GraduationCap className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-white font-semibold">No students found</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {search ? 'Try adjusting your search criteria.' : 'Create student accounts to assign career paths and issue certificates.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="p-4">Student</th>
                  <th className="p-4">Assigned Career & Domain</th>
                  <th className="p-4">Active Curriculum</th>
                  <th className="p-4">College / Degree</th>
                  <th className="p-4 text-center">Certificates</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{student.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{student.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-semibold text-cyan-300">{student.career}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{student.domain}</div>
                    </td>
                    <td className="p-4">
                      {student.activeCurriculum ? (
                        <div>
                          <div className="text-xs font-medium text-slate-200 truncate max-w-[180px]">
                            {student.activeCurriculum.title}
                          </div>
                          <div className="text-[11px] text-cyan-400 mt-0.5">
                            {student.activeCurriculum.totalTopics} modules
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Initialized on first login</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-300 truncate max-w-[180px]">{student.college}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{student.degree} • {student.branch}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        student.certificateCount > 0
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-800/60 text-slate-400 border-white/5'
                      }`}>
                        <Award className="h-3 w-3 mr-1" />
                        {student.certificateCount}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          student.status === 'DISABLED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : student.requiresPasswordChange
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${student.status === 'DISABLED' ? 'bg-red-400' : student.requiresPasswordChange ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          {student.status === 'DISABLED' ? 'Disabled' : student.requiresPasswordChange ? 'Initial PW' : 'Active'}
                        </span>
                        <button
                          onClick={() => handleToggleStudentStatus(student)}
                          className="text-[11px] text-slate-400 hover:text-cyan-300 underline font-mono"
                          title="Toggle student active/disabled status"
                        >
                          {student.status === 'DISABLED' ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewStudentDetails(student._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleOpenIssueCert(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition"
                        >
                          <Award className="h-3.5 w-3.5" />
                          Issue Cert
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5 text-xs text-slate-400">
            <div>
              Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, totalStudents)} of {totalStudents} students
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchStudents(page - 1, search)}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40 text-white"
              >
                Previous
              </button>
              <button
                onClick={() => fetchStudents(page + 1, search)}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40 text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Create Student Account */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-white/10 max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Student Account</h2>
                <p className="text-xs text-slate-400">Assign locked career track and generate initial credentials.</p>
              </div>
            </div>

            {studentError && (
              <div className="my-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                {studentError}
              </div>
            )}

            <form onSubmit={handleCreateStudentSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  placeholder="e.g. Priya Venkatesh"
                  className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Email Address (Login Username) *</label>
                <input
                  type="email"
                  required
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  placeholder="e.g. priya.v@university.edu"
                  className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 text-xs font-semibold">Initial Temporary Password *</label>
                  <button
                    type="button"
                    onClick={() => setNewStudentForm({ ...newStudentForm, password: generateSecurePassword() })}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Regenerate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newStudentForm.password}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 pr-10 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Student will be required to change this on their first login.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-1 block">Selected Career Track *</label>
                  <select
                    value={newStudentForm.career}
                    onChange={(e) => handleCareerChange(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {AVAILABLE_CAREERS.map((c) => (
                      <option key={c.title} value={c.title} className="bg-slate-900 text-white">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-1 block">Career Domain</label>
                  <input
                    type="text"
                    readOnly
                    value={newStudentForm.domain}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/40 p-2.5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-1 block">College / University</label>
                  <input
                    type="text"
                    value={newStudentForm.college}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, college: e.target.value })}
                    placeholder="College name"
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-1 block">Degree & Branch</label>
                  <input
                    type="text"
                    value={newStudentForm.branch}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, branch: e.target.value })}
                    placeholder="Branch / Major"
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800/80 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStudent}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-sm font-bold text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
                >
                  {submittingStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {submittingStudent ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Student Account Created Credentials */}
      {createdStudentInfo && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Student Account Created!</h3>
                <p className="text-xs text-slate-400">Share these initial credentials with the student.</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4 space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-semibold">{createdStudentInfo.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Login Email:</span>
                <span className="text-cyan-300 font-mono">{createdStudentInfo.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Temporary Password:</span>
                <span className="text-amber-300 font-mono font-bold">{createdStudentInfo.password}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                <span className="text-slate-400">Career Track:</span>
                <span className="text-slate-200">{createdStudentInfo.career}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Domain:</span>
                <span className="text-slate-200">{createdStudentInfo.domain}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={copyCreatedCredentials}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-white/10 py-2.5 text-xs font-semibold text-white transition"
              >
                {credentialsCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-300" />}
                {credentialsCopied ? 'Credentials Copied!' : 'Copy Login Details'}
              </button>
              <button
                onClick={() => setCreatedStudentInfo(null)}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-xs font-bold text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Issue Certificate */}
      {showIssueCertModal && selectedStudentForCert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/20 max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowIssueCertModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Issue Verified Certificate</h2>
                <p className="text-xs text-slate-400">Generates unique credential ID, tamper-evident QR code, and ledger audit.</p>
              </div>
            </div>

            {certError && (
              <div className="my-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                {certError}
              </div>
            )}

            <form onSubmit={handleOpenCertPreview} className="space-y-4 mt-4">
              <div className="p-3 rounded-xl border border-white/5 bg-slate-950/50">
                <div className="text-xs text-slate-400">Issuing to Candidate:</div>
                <div className="text-sm font-bold text-white mt-0.5">{selectedStudentForCert.name}</div>
                <div className="text-xs text-slate-500 font-mono">{selectedStudentForCert.email}</div>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Career Path / Certificate Title *</label>
                <input
                  type="text"
                  required
                  value={certForm.careerPath}
                  onChange={(e) => setCertForm({ ...certForm, careerPath: e.target.value })}
                  placeholder="e.g. Java Software Engineer"
                  className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Overall Score (Min 75%) *</label>
                  <input
                    type="number"
                    min="75"
                    max="100"
                    required
                    value={certForm.overallScore}
                    onChange={(e) => setCertForm({ ...certForm, overallScore: Number(e.target.value) })}
                    className="w-full rounded-lg border border-cyan-500/30 bg-slate-950/70 p-2 text-sm font-bold text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Technical Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={certForm.technicalScore}
                    onChange={(e) => setCertForm({ ...certForm, technicalScore: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2 text-sm text-slate-200 text-center focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Communication</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={certForm.communicationScore}
                    onChange={(e) => setCertForm({ ...certForm, communicationScore: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2 text-sm text-slate-200 text-center focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] font-semibold mb-1 block">Problem Solving</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={certForm.problemSolvingScore}
                    onChange={(e) => setCertForm({ ...certForm, problemSolvingScore: Number(e.target.value) })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2 text-sm text-slate-200 text-center focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-1 block">Interview Readiness</label>
                  <select
                    value={certForm.interviewReadinessStatus}
                    onChange={(e) => setCertForm({ ...certForm, interviewReadinessStatus: e.target.value as any })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="READY">READY (Job Ready)</option>
                    <option value="ADVANCED">ADVANCED (High Distinction)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Foundation)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 text-xs font-semibold mb-1 block">Issue Date</label>
                  <input
                    type="date"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-semibold mb-1 block">Official Certification Remark *</label>
                <textarea
                  required
                  value={certForm.officialRemark}
                  onChange={(e) => setCertForm({ ...certForm, officialRemark: e.target.value })}
                  rows={3}
                  placeholder="e.g. Demonstrated exceptional technical mastery, structured problem-solving, and clear communication."
                  className="w-full rounded-lg border border-white/10 bg-slate-950/70 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowIssueCertModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800/80 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-sm font-bold text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  <Eye className="h-4 w-4" />
                  Preview Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3.5: Mandatory Certificate Live Preview & Explicit Confirmation */}
      {showCertPreviewModal && selectedStudentForCert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-cyan-500/40 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-6 text-slate-200">
            <button
              onClick={() => {
                setShowCertPreviewModal(false);
                setShowIssueCertModal(true);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">Official Credential Preview</span>
                <h3 className="text-xl font-bold text-white">Certificate Verification Layout</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PENDING ADMIN CONFIRMATION
              </span>
            </div>

            {/* Certificate Preview Card */}
            <div className="relative rounded-2xl border-4 border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 text-center shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
                <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-300">SkillDNA AI Certification Authority</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">Certificate of Competency</h2>
              <p className="text-xs text-slate-400 mt-0.5">Verified Career Track & Readiness Assessment</p>

              <div className="my-5">
                <p className="text-xs text-slate-400 uppercase tracking-widest">This certifies that</p>
                <p className="text-2xl font-bold text-cyan-300 font-serif tracking-wide mt-1 underline decoration-cyan-500/40 underline-offset-8">
                  {selectedStudentForCert.name}
                </p>
                <p className="text-xs text-slate-400 mt-3">has met all verification standards and demonstrated professional mastery in</p>
                <p className="text-lg font-bold text-white mt-1">{certForm.careerPath}</p>
              </div>

              {/* Verified Scores Grid */}
              <div className="grid grid-cols-4 gap-2 my-4 p-3 rounded-xl bg-slate-900/90 border border-white/5 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Overall</div>
                  <div className="text-base font-extrabold text-emerald-400">{certForm.overallScore}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Technical</div>
                  <div className="text-sm font-bold text-cyan-300">{certForm.technicalScore}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Comm.</div>
                  <div className="text-sm font-bold text-cyan-300">{certForm.communicationScore}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Problem Solving</div>
                  <div className="text-sm font-bold text-cyan-300">{certForm.problemSolvingScore}%</div>
                </div>
              </div>

              {/* Official Remark Box */}
              <div className="my-4 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-left">
                <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1">Official Certification Remark:</div>
                <p className="text-xs italic text-slate-200 leading-relaxed">"{certForm.officialRemark}"</p>
              </div>

              {/* Footer Layout: QR, Date, Signature */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-slate-400 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white p-1 border border-cyan-500/30 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/verify/SDNA-CERT-' + new Date().getFullYear() + '-PREVIEW')}`}
                      alt="QR Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] text-slate-300 font-bold">ID: SDNA-CERT-{new Date().getFullYear()}-XXXXXX</div>
                    <div className="text-[10px] text-slate-400">Issued: {certForm.issueDate}</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">Valid & Authentic</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif italic text-sm text-cyan-300 font-bold border-b border-white/20 pb-0.5">
                    SkillDNA AI Board of Examiners
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Cryptographic Digital Ledger Stamp</div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {certError && (
              <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                {certError}
              </div>
            )}

            {/* Mandatory Explicit Confirmation Checkbox */}
            <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={adminConfirmed}
                  onChange={(e) => setAdminConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-cyan-500/40 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <span>
                  <strong className="text-white font-semibold block mb-0.5">Administrator Authorization & Confirmation:</strong>
                  I officially confirm that I have reviewed the assessment data, verified the minimum passing score (75%+), and authorize the permanent ledger registration, QR code generation, and issuance of this certificate to {selectedStudentForCert.name}.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCertPreviewModal(false);
                  setShowIssueCertModal(true);
                }}
                className="flex-1 rounded-xl border border-white/10 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Back to Edit Details
              </button>
              <button
                type="button"
                onClick={handleConfirmAndIssueCert}
                disabled={!adminConfirmed || submittingCert}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-xs font-bold text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition disabled:opacity-50"
              >
                {submittingCert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                {submittingCert ? 'Minting & Issuing...' : 'Confirm & Issue Official Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Student Details Inspection */}
      {showStudentDetailsModal && inspectingStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 max-w-2xl w-full p-6 shadow-2xl relative my-8 text-slate-200">
            <button
              onClick={() => setShowStudentDetailsModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{inspectingStudent.student?.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{inspectingStudent.student?.email} • Status: {inspectingStudent.student?.status}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Career Track</div>
                  <div className="font-bold text-cyan-300 mt-0.5">{inspectingStudent.profile?.career || 'Software Engineering'}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Domain</div>
                  <div className="font-bold text-slate-200 mt-0.5">{inspectingStudent.profile?.domain || 'Computer Science'}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Target Role</div>
                  <div className="font-bold text-slate-200 mt-0.5">{inspectingStudent.student?.targetRole || 'Specialist'}</div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Skill DNA Score</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{inspectingStudent.profile?.skillDNA?.score || 0}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" />
                  Issued Certificates ({inspectingStudent.certificates?.length || 0})
                </h4>
                {inspectingStudent.certificates?.length > 0 ? (
                  <div className="space-y-2">
                    {inspectingStudent.certificates.map((cert: any) => (
                      <div key={cert._id} className="p-3 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-cyan-300 font-bold">{cert.certificateId}</div>
                          <div className="text-slate-400 text-[11px]">{cert.careerPath} • Score: {cert.overallScore}% • Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                        </div>
                        <a
                          href={`/verify/${cert.certificateId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> Verify
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No certificates issued yet.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-cyan-400" />
                  Recent Interview Sessions ({inspectingStudent.sessions?.length || 0})
                </h4>
                {inspectingStudent.sessions?.length > 0 ? (
                  <div className="space-y-2">
                    {inspectingStudent.sessions.map((sess: any) => (
                      <div key={sess._id} className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-semibold text-white">{sess.careerDomain || sess.field}</span>
                          <span className="text-slate-500 ml-2">Score: {sess.competencies?.overall || 0}% • Status: {sess.status}</span>
                        </div>
                        <span className="font-mono text-slate-400">{new Date(sess.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No interview sessions recorded yet.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStudentDetailsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Certificate Issued with QR Code */}
      {issuedCertResult && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 max-w-md w-full p-6 shadow-2xl relative text-center">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
              <Award className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-white">Certificate Successfully Issued!</h3>
            <p className="text-xs text-slate-400 mt-1">Official credential registered and signed on SkillDNA AI Ledger.</p>

            <div className="my-5 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl border border-cyan-500/30 shadow-xl">
                <img
                  src={issuedCertResult.qrCode}
                  alt="Certificate QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <p className="text-xs font-mono text-cyan-300 mt-2 font-bold">{issuedCertResult.certificateId}</p>
              <p className="text-xs text-slate-400">{issuedCertResult.studentName} • {issuedCertResult.careerPath} ({issuedCertResult.overallScore}%)</p>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`/verify/${issuedCertResult.certificateId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-xs font-bold text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition"
              >
                <ExternalLink className="h-4 w-4" />
                Open Public Verification Page
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(issuedCertResult.verificationUrl);
                  setCertLinkCopied(true);
                  setTimeout(() => setCertLinkCopied(false), 2000);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-750 py-2 text-xs font-semibold text-slate-300 transition"
              >
                {certLinkCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {certLinkCopied ? 'Link Copied to Clipboard!' : 'Copy Verification URL'}
              </button>

              <button
                onClick={() => setIssuedCertResult(null)}
                className="text-xs text-slate-400 hover:text-white py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
