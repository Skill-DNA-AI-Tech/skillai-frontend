import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Sparkles, UploadCloud, FileSpreadsheet, 
  Trash2, Eye, Loader2, CheckCircle2, Download, Search, 
  Filter, RefreshCw, X, Code, Send, Check 
} from 'lucide-react';
import { apiRequest, getApiBaseUrl, readStoredToken } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export const TopicNotesManagement: React.FC = () => {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'create' | 'ai-generate' | 'bulk-upload' | 'requests'>('catalog');

  // Notes Catalog State
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchTopic, setSearchTopic] = useState('');
  const [previewNote, setPreviewNote] = useState<any>(null);

  // Student Requests State
  const [contentRequests, setContentRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Manual Create Note State
  const [manualForm, setManualForm] = useState({
    career: 'Java Software Engineer',
    domain: 'Computer Science',
    topic: '',
    subtopic: '',
    content: '',
    keyTakeaways: '',
    codeLanguage: 'java',
    codeSnippet: '',
    youtubeUrl: '',
    youtubeTitle: '',
  });
  const [creatingNote, setCreatingNote] = useState(false);

  // AI Generate Note State
  const [aiGenerateForm, setAiGenerateForm] = useState({
    career: 'Java Software Engineer',
    domain: 'Computer Science',
    topic: '',
    subtopic: '',
    studentLevel: 'Intermediate',
  });
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);
  const [publishingDraft, setPublishingDraft] = useState(false);

  // Bulk Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFormat, setUploadFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [uploading, setUploading] = useState(false);

  const fetchNotes = async () => {
    if (!token) return;
    setNotesLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCareer !== 'ALL') params.append('career', selectedCareer);
      if (selectedDomain !== 'ALL') params.append('domain', selectedDomain);
      if (searchTopic) params.append('topic', searchTopic);

      const data = await apiRequest<any[]>(`/admin/notes?${params.toString()}`, { token });
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!token) return;
    setRequestsLoading(true);
    try {
      const data = await apiRequest<any[]>('/admin/notes/requests', { token });
      setContentRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load content requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [token, selectedCareer, selectedDomain]);

  useEffect(() => {
    if (activeSubTab === 'requests') {
      fetchRequests();
    }
  }, [activeSubTab]);

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete these published notes?')) return;
    try {
      await apiRequest(`/admin/notes/${noteId}`, { method: 'DELETE', token });
      alert('Note deleted successfully.');
      await fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleCreateManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.topic.trim() || !manualForm.content.trim()) {
      alert('Topic and Content markdown are required.');
      return;
    }
    setCreatingNote(true);
    try {
      const payload: any = {
        career: manualForm.career,
        domain: manualForm.domain,
        topic: manualForm.topic.trim(),
        subtopic: manualForm.subtopic.trim() || 'General',
        content: manualForm.content.trim(),
        keyTakeaways: manualForm.keyTakeaways
          ? manualForm.keyTakeaways.split('\n').map((k) => k.trim()).filter(Boolean)
          : [],
        status: 'PUBLISHED',
      };

      if (manualForm.codeSnippet.trim()) {
        payload.codeExamples = [
          {
            language: manualForm.codeLanguage,
            code: manualForm.codeSnippet.trim(),
            title: `${manualForm.topic} Example`,
          },
        ];
      }

      if (manualForm.youtubeUrl.trim()) {
        payload.youtubeResources = [
          {
            title: manualForm.youtubeTitle.trim() || `${manualForm.topic} Guide`,
            url: manualForm.youtubeUrl.trim(),
            channel: 'Curated Resource',
          },
        ];
      }

      await apiRequest('/admin/notes', {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
      });

      alert('Notes created and published to students successfully!');
      setManualForm({
        career: 'Java Software Engineer',
        domain: 'Computer Science',
        topic: '',
        subtopic: '',
        content: '',
        keyTakeaways: '',
        codeLanguage: 'java',
        codeSnippet: '',
        youtubeUrl: '',
        youtubeTitle: '',
      });
      setActiveSubTab('catalog');
      await fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to publish notes');
    } finally {
      setCreatingNote(false);
    }
  };

  const handleGenerateAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGenerateForm.topic.trim()) {
      alert('Please enter a topic to generate notes for.');
      return;
    }
    setGeneratingAi(true);
    try {
      const data = await apiRequest<any>('/admin/notes/generate-ai', {
        method: 'POST',
        body: JSON.stringify(aiGenerateForm),
        token,
      });

      setGeneratedDraft({
        career: aiGenerateForm.career,
        domain: aiGenerateForm.domain,
        topic: aiGenerateForm.topic,
        subtopic: aiGenerateForm.subtopic,
        content: data.notes?.content || data.notes || '',
        keyTakeaways: data.notes?.keyTakeaways || [],
        codeExamples: data.notes?.codeExamples || [],
      });
    } catch (err: any) {
      alert(err.message || 'AI note generation failed');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!generatedDraft) return;
    setPublishingDraft(true);
    try {
      await apiRequest('/admin/notes', {
        method: 'POST',
        body: JSON.stringify({
          ...generatedDraft,
          status: 'PUBLISHED',
        }),
        token,
      });

      alert('AI-generated notes reviewed and published successfully!');
      setGeneratedDraft(null);
      setActiveSubTab('catalog');
      await fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to publish draft note');
    } finally {
      setPublishingDraft(false);
    }
  };

  const handleDownloadTemplate = async (format: 'xlsx' | 'csv') => {
    try {
      const url = `${getApiBaseUrl()}/admin/notes/template?format=${format}`;
      const tokenVal = readStoredToken();
      const res = await fetch(url, {
        headers: tokenVal ? { Authorization: `Bearer ${tokenVal}` } : {},
      });
      if (!res.ok) throw new Error('Failed to download template');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `skilldna_topic_notes_template.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || 'Template download failed');
    }
  };

  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await apiRequest<any>('/admin/notes/bulk-upload', {
        method: 'POST',
        body: formData as any,
        token,
      });

      alert(res.message || 'Topic notes uploaded and published successfully!');
      setUploadFile(null);
      setActiveSubTab('catalog');
      await fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to upload topic notes');
    } finally {
      setUploading(false);
    }
  };

  const handleFulfillRequest = (req: any) => {
    setAiGenerateForm({
      career: req.career,
      domain: req.domain,
      topic: req.topic,
      subtopic: req.subtopic || 'General',
      studentLevel: 'Intermediate',
    });
    setActiveSubTab('ai-generate');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Active Curriculum &amp; Topic Notes Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Curate, review, and publish verified topic notes (Manual, AI-Generated, or Bulk Excel/CSV upload) and fulfill student requests.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        {[
          { id: 'catalog', label: 'Published Notes Catalog', icon: BookOpen },
          { id: 'create', label: 'Create Note Manually', icon: Plus },
          { id: 'ai-generate', label: 'AI Generate & Review', icon: Sparkles },
          { id: 'bulk-upload', label: 'Bulk Upload (Excel / CSV)', icon: UploadCloud },
          { id: 'requests', label: 'Student Content Requests', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition shrink-0 ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'requests' && contentRequests.length > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {contentRequests.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: CATALOG */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Careers</option>
                <option value="Java Software Engineer">Java Software Engineer</option>
                <option value="Full Stack Web Developer">Full Stack Web Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Domains</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchNotes()}
                  placeholder="Filter by topic..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                onClick={fetchNotes}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700"
              >
                Search
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {notesLoading ? (
              <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Loading topic notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-white">No Topic Notes Found</p>
                <p className="text-xs">Create notes manually, generate with AI, or upload via Excel/CSV.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Career &amp; Domain</th>
                      <th className="py-3 px-4">Topic &amp; Subtopic</th>
                      <th className="py-3 px-4">Takeaways / Code</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {notes.map((note) => (
                      <tr key={note._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{note.career || 'General'}</div>
                          <div className="text-[11px] text-slate-400">{note.domain}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-cyan-300">{note.topic}</div>
                          <div className="text-[11px] text-slate-400">{note.subtopic || 'General'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {note.keyTakeaways?.length || 0} takeaways • {note.codeExamples?.length || 0} code samples
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
                            {note.source || 'Manual'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            {note.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewNote(note)}
                              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-1.5 rounded-lg transition"
                              title="Preview Notes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-1.5 rounded-lg transition"
                              title="Delete Notes"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* SUB-TAB 2: CREATE NOTE MANUALLY */}
      {activeSubTab === 'create' && (
        <form onSubmit={handleCreateManualSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-3xl">
          <h3 className="text-base font-bold text-white mb-2">Create &amp; Publish Topic Notes</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Career Path *</label>
              <input
                type="text"
                value={manualForm.career}
                onChange={(e) => setManualForm({ ...manualForm, career: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Domain *</label>
              <input
                type="text"
                value={manualForm.domain}
                onChange={(e) => setManualForm({ ...manualForm, domain: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Topic *</label>
              <input
                type="text"
                value={manualForm.topic}
                onChange={(e) => setManualForm({ ...manualForm, topic: e.target.value })}
                placeholder="e.g. Java OOP Concepts"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Subtopic</label>
              <input
                type="text"
                value={manualForm.subtopic}
                onChange={(e) => setManualForm({ ...manualForm, subtopic: e.target.value })}
                placeholder="e.g. Encapsulation & Inheritance"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Study Notes (Markdown) *</label>
            <textarea
              value={manualForm.content}
              onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
              placeholder="Write detailed, structured technical notes for this curriculum topic..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-cyan-400"
              rows={8}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Key Takeaways (one per line)</label>
            <textarea
              value={manualForm.keyTakeaways}
              onChange={(e) => setManualForm({ ...manualForm, keyTakeaways: e.target.value })}
              placeholder="Encapsulation prevents direct mutation of state.&#10;Polymorphism allows interface-based dispatch."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-400"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Code Example</label>
            <textarea
              value={manualForm.codeSnippet}
              onChange={(e) => setManualForm({ ...manualForm, codeSnippet: e.target.value })}
              placeholder="// Sample demonstration code"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-cyan-400"
              rows={4}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={creatingNote}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md active:scale-95"
            >
              {creatingNote ? 'Publishing...' : 'Publish Notes to Students'}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: AI GENERATE & REVIEW */}
      {activeSubTab === 'ai-generate' && (
        <div className="space-y-6 max-w-3xl">
          <form onSubmit={handleGenerateAiSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              AI Note Generation Pipeline (with Admin Review Gate)
            </h3>
            <p className="text-xs text-slate-400">
              Generate notes for any curriculum topic. As Admin, you review, edit, and approve before publishing to ensure syllabus accuracy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Career</label>
                <input
                  type="text"
                  value={aiGenerateForm.career}
                  onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, career: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Domain</label>
                <input
                  type="text"
                  value={aiGenerateForm.domain}
                  onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, domain: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Topic *</label>
                <input
                  type="text"
                  value={aiGenerateForm.topic}
                  onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, topic: e.target.value })}
                  placeholder="e.g. Spring Boot Dependency Injection"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Subtopic</label>
                <input
                  type="text"
                  value={aiGenerateForm.subtopic}
                  onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, subtopic: e.target.value })}
                  placeholder="e.g. @Autowired & Component Scan"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generatingAi}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md active:scale-95 flex items-center gap-2"
            >
              {generatingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Draft...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Notes with AI
                </>
              )}
            </button>
          </form>

          {/* Review & Edit Draft */}
          {generatedDraft && (
            <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Review Generated Notes: {generatedDraft.topic}
                </h4>
                <span className="text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                  Draft • Not Yet Published
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Content Markdown (Edit as needed)</label>
                <textarea
                  value={generatedDraft.content}
                  onChange={(e) => setGeneratedDraft({ ...generatedDraft, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  rows={10}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGeneratedDraft(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handlePublishDraft}
                  disabled={publishingDraft}
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs transition shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> {publishingDraft ? 'Publishing...' : 'Approve & Publish to Students'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: BULK UPLOAD */}
      {activeSubTab === 'bulk-upload' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              Bulk Upload Topic Notes (Excel / CSV)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload multiple topic notes across careers and domains at once using standard spreadsheet templates.
            </p>
          </div>

          {/* Template Download Section */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200">1. Download Template</h4>
            <p className="text-[11px] text-slate-400">
              Use our standardized format containing columns: <code className="text-cyan-300">career, domain, topic, subtopic, content, keyTakeaways, codeSnippet</code>.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadTemplate('xlsx')}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Excel Template (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadTemplate('csv')}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> CSV Template (.csv)
              </button>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">2. Select Completed File</label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-xl p-2.5 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md active:scale-95 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading &amp; Validating...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" /> Upload &amp; Publish Notes
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 5: STUDENT CONTENT REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {requestsLoading ? (
              <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Loading student content requests...
              </div>
            ) : contentRequests.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-white">All Content Requests Fulfilled</p>
                <p className="text-xs">No students have requested notes for empty topics.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Career &amp; Domain</th>
                      <th className="py-3 px-4">Requested Topic &amp; Subtopic</th>
                      <th className="py-3 px-4">Requested Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {contentRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{req.studentId?.name || 'Student'}</div>
                          <div className="text-[11px] text-slate-400">{req.studentId?.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{req.career}</div>
                          <div className="text-[11px] text-slate-400">{req.domain}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-cyan-300">{req.topic}</div>
                          <div className="text-[11px] text-slate-400">{req.subtopic || 'General'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              req.status === 'FULFILLED'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => handleFulfillRequest(req)}
                              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[11px] transition shadow-sm"
                            >
                              Fulfill &amp; Generate Notes
                            </button>
                          )}
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

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <h3 className="text-base font-bold text-white">{previewNote.topic}</h3>
                <p className="text-xs text-cyan-300">{previewNote.career} • {previewNote.domain}</p>
              </div>
              <button onClick={() => setPreviewNote(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-slate-200 text-xs whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800">
              {previewNote.content}
            </div>

            {previewNote.keyTakeaways?.length > 0 && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[11px] font-bold text-cyan-300 uppercase">Key Takeaways:</p>
                <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
                  {previewNote.keyTakeaways.map((k: string, idx: number) => (
                    <li key={idx}>{k}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewNote(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
