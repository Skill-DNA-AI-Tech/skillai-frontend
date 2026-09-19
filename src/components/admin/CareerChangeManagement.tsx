import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, CheckCircle2, XCircle, Clock, Search, Filter, 
  Loader2, RefreshCw, AlertCircle, User, Briefcase, Calendar, Check, X 
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface CareerChangeRequestItem {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  currentCareer: string;
  requestedCareer: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  reviewedAt?: string;
  createdAt: string;
}

export const CareerChangeManagement: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<CareerChangeRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Review modal state
  const [selectedRequest, setSelectedRequest] = useState<CareerChangeRequestItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<any>('/career-change-requests', { token });
      setRequests(Array.isArray(data) ? data : (data?.requests || []));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch career change requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleOpenReview = (request: CareerChangeRequestItem, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes(action === 'APPROVED' ? 'Approved based on student progression and career goals.' : '');
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (reviewAction === 'REJECTED' && !reviewNotes.trim()) {
      alert('Please provide review notes explaining why the request is rejected.');
      return;
    }

    setSubmittingReview(true);
    try {
      await apiRequest(`/career-change-requests/${selectedRequest._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          status: reviewAction,
          reviewNotes: reviewNotes.trim(),
        }),
        token,
      });

      alert(`Request has been successfully ${reviewAction.toLowerCase()}! Student profile and active curriculum updated.`);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const studentName = r.studentId?.name?.toLowerCase() || '';
    const studentEmail = r.studentId?.email?.toLowerCase() || '';
    const reqCareer = r.requestedCareer?.toLowerCase() || '';
    const curCareer = r.currentCareer?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();

    const matchesSearch = !term || studentName.includes(term) || studentEmail.includes(term) || reqCareer.includes(term) || curCareer.includes(term);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-cyan-400" />
            Career Change Governance &amp; Approvals
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review student requests to switch their locked Career &amp; Active Curriculum. Architected for Main Admin &amp; Support Team approval.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Total Requests</p>
          <p className="text-2xl font-bold text-white mt-1">{requests.length}</p>
        </div>
        <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-2xl">
          <p className="text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl">
          <p className="text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-2xl">
          <p className="text-xs text-red-300 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </p>
          <p className="text-2xl font-bold text-red-400 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st === 'ALL' ? 'All Requests' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student or career..."
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No Career Change Requests Found</p>
            <p className="text-xs">No student requests match the current status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Current Career</th>
                  <th className="py-3.5 px-4">Requested Career</th>
                  <th className="py-3.5 px-4">Student Justification</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {req.studentId?.name || 'Unknown Student'}
                      </div>
                      <div className="text-[11px] text-slate-400">{req.studentId?.email || 'No email'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {req.currentCareer}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-300">
                      {req.requestedCareer}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate italic text-slate-300" title={req.reason}>
                        "{req.reason}"
                      </p>
                      {req.reviewNotes && (
                        <p className="text-[10px] text-cyan-400 mt-0.5 truncate" title={req.reviewNotes}>
                          Review: {req.reviewNotes}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {req.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReview(req, 'APPROVED')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[11px] transition active:scale-95 shadow-sm flex items-center gap-1"
                            title="Approve Career Change"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(req, 'REJECTED')}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition active:scale-95 flex items-center gap-1"
                            title="Reject Career Change"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {reviewAction === 'APPROVED' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Approve Career Change
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" /> Reject Career Change
                  </>
                )}
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div>
                <span className="text-slate-400">Student:</span>{' '}
                <span className="text-white font-semibold">{selectedRequest.studentId?.name}</span> ({selectedRequest.studentId?.email})
              </div>
              <div>
                <span className="text-slate-400">Current Career:</span>{' '}
                <span className="text-slate-300">{selectedRequest.currentCareer}</span>
              </div>
              <div>
                <span className="text-slate-400">Requested Career:</span>{' '}
                <span className="text-cyan-400 font-bold">{selectedRequest.requestedCareer}</span>
              </div>
              <div>
                <span className="text-slate-400">Student Reason:</span>
                <p className="text-slate-300 italic mt-0.5">"{selectedRequest.reason}"</p>
              </div>
            </div>

            <form onSubmit={handleConfirmReview} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Administrative Review Notes {reviewAction === 'REJECTED' && <span className="text-red-400">*</span>}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes for audit record and student feedback..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                  rows={3}
                  required={reviewAction === 'REJECTED'}
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`flex-1 font-bold py-2 rounded-xl text-xs transition shadow-md ${
                    reviewAction === 'APPROVED'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-red-500 hover:bg-red-400 text-white'
                  }`}
                >
                  {submittingReview ? 'Submitting...' : `Confirm ${reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
