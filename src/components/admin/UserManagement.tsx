import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, CheckCircle2, AlertCircle, Loader2,
  ShieldCheck, ShieldAlert, Eye, UserPlus, RefreshCw, X, Lock,
  GraduationCap, Briefcase, Building, Mail, Phone, Calendar,
  Award, FileText, Check, AlertTriangle
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface UserItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  is_verified: boolean;
  mobile?: string;
  college?: string;
  degree?: string;
  branch?: string;
  certificatesCount?: number;
  interviewsCount?: number;
  createdAt?: string;
  created_at?: string;
}

interface UserDetail extends UserItem {
  profile?: any;
  recentSessions?: any[];
  certificates?: any[];
}

export const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected User Modal for detailed profile view
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    degree: 'B.Tech',
    branch: 'Computer Science',
    mobile: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search: search.trim(),
        role: roleFilter,
        status: statusFilter,
      });

      const res = await apiRequest<{
        users: UserItem[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/users?${queryParams.toString()}`, { token });

      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleViewDetail = async (userId: string) => {
    try {
      setLoadingDetail(true);
      const res = await apiRequest<UserDetail>(`/admin/users/${userId}`, { token });
      setSelectedUser(res);
    } catch (err: any) {
      alert('Failed to load user details: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const actionWord = nextStatus === 'ACTIVE' ? 'reactivate' : 'suspend';

    if (!window.confirm(`Are you sure you want to ${actionWord} the account for ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      const uId = user.id || user._id;
      await apiRequest(`/admin/users/${uId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
        token,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id || u._id === user._id ? { ...u, status: nextStatus } : u))
      );
      if (selectedUser && (selectedUser.id === user.id || selectedUser._id === user._id)) {
        setSelectedUser((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err: any) {
      alert('Failed to update status: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleVerifyAccount = async (user: UserItem) => {
    try {
      const uId = user.id || user._id;
      await apiRequest(`/admin/users/${uId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_verified: true }),
        token,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id || u._id === user._id ? { ...u, is_verified: true } : u))
      );
      if (selectedUser && (selectedUser.id === user.id || selectedUser._id === user._id)) {
        setSelectedUser((prev) => (prev ? { ...prev, is_verified: true } : null));
      }
    } catch (err: any) {
      alert('Failed to verify account: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserForm),
        token,
      });

      setCreateSuccess(`Account created successfully for ${newUserForm.name}!`);
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        college: '',
        degree: 'B.Tech',
        branch: 'Computer Science',
        mobile: '',
      });
      fetchUsers();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(null);
      }, 1500);
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create user account');
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = (role || '').toUpperCase();
    if (['MAIN_ADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(r)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (['HR', 'RECRUITER'].includes(r)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Briefcase className="w-3 h-3" /> HR
        </span>
      );
    }
    if (['TEACHER', 'INSTRUCTOR'].includes(r)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <GraduationCap className="w-3 h-3" /> Teacher
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Users className="w-3 h-3" /> Student
      </span>
    );
  };

  const getStatusBadge = (user: UserItem) => {
    if (user.status === 'SUSPENDED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-3 h-3" /> Suspended
        </span>
      );
    }
    if (!user.is_verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> Unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Platform User Management</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Search, filter, view profiles, and manage account statuses across all platform roles (Students, Teachers, HR, Admins).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950/60 border border-white/5 rounded-2xl p-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, college, or domain..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </form>

        {/* Role Filter Tabs */}
        <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'student', label: 'Students' },
            { id: 'teacher', label: 'Teachers' },
            { id: 'hr', label: 'HR' },
            { id: 'admin', label: 'Admins' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => { setRoleFilter(r.id); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === r.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Status' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'SUSPENDED', label: 'Suspended' },
            { id: 'UNVERIFIED', label: 'Unverified' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => { setStatusFilter(s.id); setPage(1); }}
              className={`px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading platform users...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-rose-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchUsers()}
              className="mt-3 px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300 text-base">No users found</p>
            <p className="text-xs text-slate-500 mt-1">Try refining your search terms or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-white/5">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Institution / Domain</th>
                  <th className="px-4 py-4 text-center">Interviews</th>
                  <th className="px-4 py-4 text-center">Certificates</th>
                  <th className="px-4 py-4">Registered</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  const uId = u.id || u._id || '';
                  const regDate = u.created_at || u.createdAt;
                  const dateStr = regDate ? new Date(regDate).toLocaleDateString() : 'N/A';

                  return (
                    <tr key={uId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{u.name || 'Unnamed User'}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3 text-cyan-400" />
                          <span>{u.email}</span>
                          {u.mobile && (
                            <>
                              <span className="text-slate-600">•</span>
                              <Phone className="h-3 w-3 text-emerald-400" />
                              <span>{u.mobile}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">{getRoleBadge(u.role)}</td>
                      <td className="px-4 py-3.5">{getStatusBadge(u)}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-slate-200 font-medium">{u.college || 'SkillDNA Partner'}</div>
                        <div className="text-[11px] text-slate-400">
                          {u.degree ? `${u.degree} - ` : ''}{u.branch || 'Engineering'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-white">
                        {u.interviewsCount ?? 0}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-cyan-400">
                        {u.certificatesCount ?? 0}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetail(uId)}
                            className="p-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {!u.is_verified && (
                            <button
                              onClick={() => handleVerifyAccount(u)}
                              className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
                              title="Manually Verify Student"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              u.status === 'SUSPENDED'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                            }`}
                          >
                            {u.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-slate-950/60 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{users.length}</span> of <span className="font-semibold text-white">{totalCount}</span> total users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Account Role</p>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
              </div>
              <div className="bg-slate-950 border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Account Status</p>
                <div className="mt-1">{getStatusBadge(selectedUser)}</div>
              </div>
              <div className="bg-slate-950 border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Verified</p>
                <p className="text-sm font-bold text-white mt-1">
                  {selectedUser.is_verified ? 'Yes' : 'Pending OTP/Admin'}
                </p>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Academic & Domain Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Institution / College</p>
                  <p className="font-semibold text-white mt-0.5">{selectedUser.college || (selectedUser.profile?.college) || 'SkillDNA Institute'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Degree & Branch</p>
                  <p className="font-semibold text-white mt-0.5">{selectedUser.degree || 'B.Tech'} - {selectedUser.branch || selectedUser.profile?.branch || 'Computer Science'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Mobile Phone</p>
                  <p className="font-semibold text-white mt-0.5">{selectedUser.mobile || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Registered Date</p>
                  <p className="font-semibold text-white mt-0.5">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificates List */}
            {selectedUser.certificates && selectedUser.certificates.length > 0 && (
              <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4 w-4" /> Issued Verified Certificates ({selectedUser.certificates.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedUser.certificates.map((c: any) => (
                    <div key={c._id || c.certificateId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs">
                      <div>
                        <span className="font-bold text-white">{c.certificateId}</span>
                        <p className="text-slate-400">{c.careerPath || 'Specialist'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">
                        {c.status || 'APPROVED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              {!selectedUser.is_verified && (
                <button
                  onClick={() => handleVerifyAccount(selectedUser)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
                >
                  Verify Student Account
                </button>
              )}
              <button
                onClick={() => handleToggleStatus(selectedUser)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                  selectedUser.status === 'SUSPENDED'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                {selectedUser.status === 'SUSPENDED' ? 'Reactivate Account' : 'Suspend Account'}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Platform User</h3>
                  <p className="text-xs text-slate-400">Create an active account for Student, Teacher, HR, or Admin.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Instructor</option>
                    <option value="hr">HR / Recruiter</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="user@skilldna.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">College / Organization</label>
                  <input
                    type="text"
                    value={newUserForm.college}
                    onChange={(e) => setNewUserForm({ ...newUserForm, college: e.target.value })}
                    placeholder="e.g. National Institute of Tech"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Branch / Department</label>
                  <input
                    type="text"
                    value={newUserForm.branch}
                    onChange={(e) => setNewUserForm({ ...newUserForm, branch: e.target.value })}
                    placeholder="e.g. Computer Science & Engg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Mobile Phone (Optional)</label>
                <input
                  type="text"
                  value={newUserForm.mobile}
                  onChange={(e) => setNewUserForm({ ...newUserForm, mobile: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
