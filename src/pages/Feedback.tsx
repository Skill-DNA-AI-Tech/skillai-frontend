import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, Sparkles, MessageSquareText, CheckCircle2,
  AlertCircle, Phone, Mail, User, HelpCircle, Copy, Check, LifeBuoy
} from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/SectionHeader';

const Feedback = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    issue_type: 'Technical Support',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<{
    ticketId: string;
    message: string;
    createdAt?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields (Name, Email, Phone, and Message).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/helpdesk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          issue_type: formData.issue_type,
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Failed to submit support request');
      }

      setSuccessTicket({
        ticketId: data.ticketId || `SDNA-HD-${Date.now().toString().slice(-6)}`,
        message: data.message || 'Your support ticket has been registered successfully.',
        createdAt: data.createdAt,
      });

      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        issue_type: 'Technical Support',
        message: '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (successTicket?.ticketId) {
      navigator.clipboard.writeText(successTicket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const issueTypes = [
    'Technical Support',
    'AI Interview Assistance',
    'Certificate Verification Issue',
    'Student Account & Access',
    'Career Twin & Assessment Feedback',
    'Partnership / Institutional Query',
    'General Inquiries & Feedback',
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 relative selection:bg-cyan-500/30">
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          eyebrow="Helpdesk & Support"
          title="SkillDNA AI Support Registry"
          description="Have questions or encountering an issue? Submit a ticket below. Our engineering and academic teams respond promptly."
        />
      </motion.div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {successTicket ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-8 sm:p-10 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Ticket Generated
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">Support Request Registered</h2>
                <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {successTicket.message}
                </p>
              </div>

              {/* Ticket ID Box */}
              <div className="max-w-sm mx-auto p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase">Ticket Tracking Number</p>
                  <p className="text-lg font-black text-cyan-300 font-mono tracking-wider">{successTicket.ticketId}</p>
                </div>
                <button
                  onClick={copyTicketId}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Please retain this ticket number for tracking. Our support team will follow up via email and phone.
              </p>

              <button
                onClick={() => setSuccessTicket(null)}
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Submit Another Request
              </button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
            >
              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditi Roy"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone / Mobile <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Issue Category
                  </label>
                  <select
                    value={formData.issue_type}
                    onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {issueTypes.map((type) => (
                      <option key={type} value={type} className="bg-slate-900 text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Message / Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your issue, feedback, or inquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <LifeBuoy className="h-4 w-4 text-cyan-400" />
                  Public support endpoint • No login required
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Feedback;
