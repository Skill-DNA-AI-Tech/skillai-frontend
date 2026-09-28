import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, Search, Filter, RefreshCw, CheckCircle2, Clock,
  AlertCircle, XCircle, Loader2, MessageSquare, Phone, Mail,
  Calendar, Check, X, ArrowRight, User, Star, Database, MessageSquareText
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface HelpdeskTicket {
  _id?: string;
  id?: string;
  ticketId: string;
  name: string;
  email: string;
  phone: string;
  issueType: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  respondedBy?: string;
}

interface UserFeedbackItem {
  _id: string;
  name: string;
  email: string;
  message: string;
  category: string;
  rating?: number;
  status?: string;
  createdAt: string;
}

export interface AdminHelpdeskPanelProps {
  defaultTab?: 'tickets' | 'feedback';
}

export const AdminHelpdeskPanel: React.FC<AdminHelpdeskPanelProps> = ({ defaultTab = 'tickets' }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'feedback'>(defaultTab);

  // Sync activeTab when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // ==========================================
  // 1. HELPDESK TICKETS STATE
  // ==========================================
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected ticket for modal response & status update
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('IN_PROGRESS');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // ==========================================
  // 2. USER FEEDBACK STATE
  // ==========================================
  const [feedbacks, setFeedbacks] = useState<UserFeedbackItem[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all');
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search: search.trim(),
        status: statusFilter,
      });

      const res = await apiRequest<{
        tickets: HelpdeskTicket[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/admin/helpdesk?${queryParams.toString()}`, { token });

      setTickets(res.tickets || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      setFeedbackError(null);
      const data = await apiRequest<any[]>('/admin/feedback', { token });
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to fetch user feedback');
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleOpenTicket = (t: HelpdeskTicket) => {
    setSelectedTicket(t);
    setUpdateStatus(t.status);
    setAdminResponse(t.adminResponse || '');
    setUpdateSuccess(false);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setUpdating(true);
      await apiRequest<{ message: string; ticket: HelpdeskTicket }>(
        `/admin/helpdesk/${selectedTicket.ticketId || selectedTicket.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: updateStatus,
            admin_response: adminResponse.trim() || undefined,
          }),
          token,
        }
      );

      setUpdateSuccess(true);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === selectedTicket.ticketId ? { ...t, status: updateStatus as any, adminResponse } : t
        )
      );

      setTimeout(() => {
        setSelectedTicket(null);
        setUpdateSuccess(false);
      }, 1200);
    } catch (err: any) {
      alert('Failed to update ticket: ' + (err?.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingFeedbackId(id);
      await apiRequest(`/admin/feedback/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
        token,
      });
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
      );
    } catch (err: any) {
      alert('Failed to update feedback status: ' + (err?.message || 'Unknown error'));
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  const handleBackupFeedbacks = async () => {
    try {
      const data = await apiRequest<any[]>('/admin/feedback/backup', { token });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skilldna_feedbacks_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to backup feedbacks: ' + (err?.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" /> New
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <XCircle className="w-3 h-3" /> Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400">
            {status}
          </span>
        );
    }
  };

  // Filtered feedbacks
  const filteredFeedbacks = feedbacks.filter((item) => {
    if (feedbackCategoryFilter !== 'all' && item.category !== feedbackCategoryFilter) return false;
    if (feedbackStatusFilter !== 'all') {
      const s = item.status || 'PENDING';
      if (s !== feedbackStatusFilter) return false;
    }
    if (feedbackSearch.trim()) {
      const q = feedbackSearch.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q);
      const matchMsg = item.message?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchMsg) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Strip (Merged Helpdesk & Support + User Feedback) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'tickets'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            Support Tickets
            {totalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/80 text-cyan-300 font-bold">
                {totalCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('feedback'); fetchFeedbacks(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'feedback'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            User Feedback Submissions
            {feedbacks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/80 text-cyan-300 font-bold">
                {feedbacks.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'feedback' && (
          <button
            onClick={handleBackupFeedbacks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Download JSON backup"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Backup Support Data
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: SUPPORT TICKETS (HELPDESK)                       */}
      {/* ======================================================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">Public Helpdesk &amp; Support Tickets</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Review user inquiries, technical assistance requests, and platform tickets. Update ticket statuses and track resolutions.
              </p>
            </div>
            <button
              onClick={() => fetchTickets()}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition self-start sm:self-auto cursor-pointer"
              title="Refresh Tickets"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-3">
            <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ticket ID, user name, email, or message..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </form>

            <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All Tickets' },
                { id: 'NEW', label: 'New' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
                { id: 'RESOLVED', label: 'Resolved' },
                { id: 'CLOSED', label: 'Closed' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setStatusFilter(s.id); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === s.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
            {loading ? (
              <div className="p-16 text-center">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Loading support tickets...</p>
              </div>
            ) : error ? (
              <div className="p-10 text-center text-rose-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs font-semibold">{error}</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <LifeBuoy className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-300 text-sm">No support tickets found</p>
                <p className="text-xs text-slate-500 mt-1">There are currently no tickets matching your filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 uppercase font-semibold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Ticket ID</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Message Preview</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tickets.map((t) => (
                      <tr key={t.ticketId || t._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                          {t.ticketId}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{t.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-cyan-400" />
                            <span>{t.email}</span>
                            {t.phone && (
                              <>
                                <span className="text-slate-600">•</span>
                                <Phone className="h-3 w-3 text-emerald-400" />
                                <span>{t.phone}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-medium">
                          {t.issueType}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                          {t.message}
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenTicket(t)}
                            className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
              <div>
                Showing <span className="font-semibold text-white">{tickets.length}</span> of <span className="font-semibold text-white">{totalCount}</span> total tickets
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: USER FEEDBACK (MERGED SECTION)                   */}
      {/* ======================================================== */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">User Feedback Submissions</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Review and resolve feedback submitted by platform users. Mark items as In Progress or Resolved.
              </p>
            </div>
            <button
              onClick={() => fetchFeedbacks()}
              disabled={feedbacksLoading}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition self-start sm:self-auto cursor-pointer"
              title="Refresh Feedback"
            >
              <RefreshCw className={`h-4 w-4 ${feedbacksLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={feedbackCategoryFilter}
                onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Categories</option>
                <option value="bug">Bugs</option>
                <option value="suggestion">Suggestions</option>
                <option value="complaint">Complaints</option>
                <option value="general">General</option>
              </select>

              <select
                value={feedbackStatusFilter}
                onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={feedbackSearch}
                onChange={(e) => setFeedbackSearch(e.target.value)}
                placeholder="Search feedback..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Feedback Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
            {feedbacksLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Loading user feedbacks...</p>
              </div>
            ) : feedbackError ? (
              <div className="p-10 text-center text-rose-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs font-semibold">{feedbackError}</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <MessageSquareText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="font-semibold text-slate-300 text-sm">No feedback submissions found</p>
                <p className="text-xs text-slate-500 mt-1">There are no feedback submissions matching your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 uppercase font-semibold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">User Details</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredFeedbacks.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-white">{item.name || 'Anonymous'}</p>
                          <p className="text-[11px] text-slate-400">{item.email}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </td>
                        <td className="px-4 py-3 max-w-sm">
                          <p className="text-xs text-slate-200 line-clamp-3 whitespace-pre-wrap">{item.message}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                              item.category === 'bug'
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : item.category === 'complaint'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : item.category === 'suggestion'
                                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {item.category || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (item.rating || 0) ? 'fill-amber-400' : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              item.status === 'RESOLVED'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : item.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                            }`}
                          >
                            {item.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== 'IN_PROGRESS' && item.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(item._id, 'IN_PROGRESS')}
                                disabled={updatingFeedbackId === item._id}
                                className="text-[11px] font-semibold rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-1 hover:bg-blue-500/25 transition cursor-pointer"
                              >
                                Investigate
                              </button>
                            )}
                            {item.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleUpdateFeedbackStatus(item._id, 'RESOLVED')}
                                disabled={updatingFeedbackId === item._id}
                                className="text-[11px] font-semibold rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 hover:bg-emerald-500/25 transition cursor-pointer"
                              >
                                Resolve
                              </button>
                            )}
                            {item.status === 'RESOLVED' && (
                              <span className="text-[11px] text-slate-500">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400">{selectedTicket.ticketId}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedTicket.issueType}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {updateSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Ticket updated successfully!</span>
              </div>
            )}

            {/* Sender Meta */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Submitted By:</span>
                <span className="font-bold text-white">{selectedTicket.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="text-cyan-300 font-mono">{selectedTicket.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="text-slate-200">{selectedTicket.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Date:</span>
                <span className="text-slate-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1">Inquiry / Message Content</label>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedTicket.message}
              </div>
            </div>

            {/* Update Controls */}
            <form onSubmit={handleUpdateTicket} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Ticket Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Internal Response / Resolution Notes</label>
                <textarea
                  rows={3}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Add resolution details or follow-up notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
