import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2, Sparkles, MessageSquareText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/SectionHeader';

const Feedback = () => {
  const { user, token } = useAuth();
  const [category, setCategory] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          category,
          message: message.trim(),
          rating,
        }),
        token,
      });
      setSuccess(true);
      setMessage('');
      setRating(5);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: 'suggestion', label: 'Suggestion', description: 'Help us improve features' },
    { value: 'bug', label: 'Bug Report', description: 'Report technical issues' },
    { value: 'complaint', label: 'Complaint', description: 'Tell us what went wrong' },
    { value: 'other', label: 'Other', description: 'General feedback or inquiries' },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 relative">
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          eyebrow="We value your opinion"
          title="Share Your Feedback"
          description="Your thoughts and experiences help us build a better platform. Submit suggestions, report bugs, or request assistance."
        />
      </motion.div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-8 text-center backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">Thank You!</h2>
              <p className="mt-2 text-slate-300 max-w-md mx-auto leading-relaxed">
                Your feedback has been successfully submitted and routed to the platform Admin team. We appreciate your help in refining SkillDNA AI.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                Submit another response
              </button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md relative"
            >
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex gap-3 text-sm text-red-200">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* User details summary */}
              {user && (
                <div className="mb-6 rounded-xl bg-slate-950/60 p-4 border border-white/5 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitting as</span>
                    <span className="text-sm font-medium text-slate-200">{user.name} ({user.email})</span>
                  </div>
                  <div className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 border border-cyan-500/20">
                    Logged In
                  </div>
                </div>
              )}

              {/* Star Rating */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-200 mb-3">Overall Satisfaction Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-slate-500 hover:scale-110 active:scale-95 transition-all focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating ?? rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Select */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-200 mb-3">Feedback Category</label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col text-left rounded-xl p-4 border transition-all ${
                        category === cat.value
                          ? 'border-cyan-400/50 bg-cyan-400/5'
                          : 'border-white/5 bg-slate-950/20 hover:border-white/20 hover:bg-slate-950/40'
                      }`}
                    >
                      <span className={`text-sm font-bold ${category === cat.value ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">{cat.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message TextArea */}
              <div className="mb-8">
                <div className="flex justify-between items-baseline mb-3">
                  <label htmlFor="message-box" className="block text-sm font-semibold text-slate-200">Your Message</label>
                  <span className="text-xs text-slate-400">{message.length} characters</span>
                </div>
                <textarea
                  id="message-box"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[160px] rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all placeholder:text-slate-600"
                  placeholder="Type your feedback message here... Be as detailed as possible."
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Feedback
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
