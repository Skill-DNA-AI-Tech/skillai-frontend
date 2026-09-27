import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, Search, Filter, RefreshCw, CheckCircle2, Clock,
  AlertCircle, XCircle, Loader2, MessageSquare, Phone, Mail,
  Calendar, Check, X, ArrowRight, User
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

export const AdminHelpdeskPanel: React.FC = () => {
  const { token } = useAuth();
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

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

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
      const res = await apiRequest<{ message: string; ticket: HelpdeskTicket }>(
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
      // Update local state
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Public Helpdesk & Support Tickets</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review user inquiries, technical assistance requests, and platform feedback. Update ticket statuses and track resolutions.
          </p>
        </div>
        <button
          onClick={() => fetchTickets()}
          disabled={loading}
          className="p-2.5 rounded-xl border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh Tickets"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950/60 border border-white/5 rounded-2xl p-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket ID, user name, email, or message text..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </form>

        {/* Status Filters */}
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
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading support tickets...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-rose-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <LifeBuoy className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300 text-base">No support tickets found</p>
            <p className="text-xs text-slate-500 mt-1">There are currently no tickets matching your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-white/5">
                <tr>
                  <th className="px-5 py-4">Ticket ID</th>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Message Preview</th>
                  <th className="px-4 py-4">Submitted</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((t) => (
                  <tr key={t.ticketId || t._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-cyan-400">
                      {t.ticketId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{t.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
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
                    <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">
                      {t.issueType}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(t.status)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                      {t.message}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenTicket(t)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-all cursor-pointer"
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-slate-950/60 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{tickets.length}</span> of <span className="font-semibold text-white">{totalCount}</span> total tickets
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

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400">{selectedTicket.ticketId}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedTicket.issueType}</h3>
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
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs space-y-2">
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

            {/* User Message */}
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Message</p>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>

            {/* Admin Update Form */}
            <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Ticket Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Internal Response / Resolution Notes</label>
                <textarea
                  rows={3}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Add resolution details or follow-up notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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
