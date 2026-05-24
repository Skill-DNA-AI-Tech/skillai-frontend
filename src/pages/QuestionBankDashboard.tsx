import { Upload, Sparkles, BarChart3, FileText, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/SectionHeader';

interface QuestionStats {
  totalQuestions: number;
  byDifficulty: Array<{ _id: string; count: number }>;
  byField: Array<{ _id: string; count: number }>;
  pendingReview: number;
  mostAsked: Array<{ question: string; timesAsked: number }>;
}

interface GeneratedQuestion {
  _id: string;
  question: string;
  modelAnswer: string;
  field: string;
  topic: string;
  difficulty: string;
  interviewType: string;
  qualityScore: number;
  batchId: string;
}

const QuestionBankDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'generate' | 'review' | 'analytics'>('upload');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateResults, setDuplicateResults] = useState<any[]>([]);
  const [uploadFormat, setUploadFormat] = useState<'csv' | 'excel' | 'json' | 'manual'>('csv');
  const [generateForm, setGenerateForm] = useState({
    field: '',
    topic: '',
    subtopic: '',
    difficulty: 'Medium',
    count: 10,
  });

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('uploadFormat', uploadFormat);

      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append('file', fileInput.files[0]);
      }

      const response = await apiRequest<any>('/questions/admin/upload', {
        method: 'POST',
        body: formData as any,
        token,
      });

      alert(`${response.questions.length} questions uploaded successfully!`);
      fileInput.value = ''; // Clear input
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await apiRequest<any>('/questions/admin/generate', {
        method: 'POST',
        body: JSON.stringify(generateForm),
        token,
      });

      alert(`Generated ${response.questions.length} questions in batch ${response.batchId}`);
      setGenerateForm({ field: '', topic: '', subtopic: '', difficulty: 'Medium', count: 10 });
    } catch (error: any) {
      alert('Generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiRequest<QuestionStats>('/questions/admin/stats', { token });
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadPendingQuestions = async () => {
    try {
      const response = await apiRequest<GeneratedQuestion[]>('/questions/admin/pending-review', { token });
      setPendingQuestions(response);
    } catch (error) {
      console.error('Failed to load pending questions:', error);
    }
  };

  const approveQuestion = async (questionId: string) => {
    setApproving(questionId);
    try {
      await apiRequest<any>(`/questions/admin/approve/${questionId}`, {
        method: 'POST',
        token,
      });
      alert('Question approved and published!');
      loadPendingQuestions();
    } catch (error: any) {
      alert('Failed to approve question: ' + error.message);
    } finally {
      setApproving(null);
    }
  };

  const rejectQuestion = async (questionId: string) => {
    setApproving(questionId);
    try {
      await apiRequest<any>(`/questions/admin/reject/${questionId}`, {
        method: 'POST',
        token,
      });
      alert('Question rejected.');
      loadPendingQuestions();
    } catch (error: any) {
      alert('Failed to reject question: ' + error.message);
    } finally {
      setApproving(null);
    }
  };

  const checkDuplicates = async () => {
    const textArea = document.getElementById('duplicateCheckText') as HTMLTextAreaElement;
    const questions = textArea.value.split('\n').filter(q => q.trim());

    if (questions.length === 0) {
      alert('Please enter questions to check');
      return;
    }

    setCheckingDuplicates(true);
    try {
      const response = await apiRequest<any>('/questions/admin/check-duplicates', {
        method: 'POST',
        body: JSON.stringify({ questions }),
        token,
      });
      setDuplicateResults(response.duplicates);
    } catch (error: any) {
      alert('Duplicate check failed: ' + error.message);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Question Bank Management"
        title="AI Dynamic Interview Question Engine"
        description="Upload, generate, and manage interview questions. AI analyzes and creates variations."
      />

      {/* Tab Navigation */}
      <div className="mt-8 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 border-b-2 transition ${
            activeTab === 'upload'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Upload className="inline h-4 w-4 mr-2" />
          Upload Questions
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 border-b-2 transition ${
            activeTab === 'generate'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Sparkles className="inline h-4 w-4 mr-2" />
          Generate Questions
        </button>
        <button
          onClick={() => {
            setActiveTab('review');
            loadPendingQuestions();
          }}
          className={`px-4 py-2 border-b-2 transition ${
            activeTab === 'review'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <CheckCircle2 className="inline h-4 w-4 mr-2" />
          Review Questions
        </button>
        <button
          onClick={() => {
            setActiveTab('analytics');
            loadStats();
          }}
          className={`px-4 py-2 border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <BarChart3 className="inline h-4 w-4 mr-2" />
          Analytics
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Upload Bulk Questions
            </h3>

            <form onSubmit={handleUpload} className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Upload Format
                </label>
                <select
                  value={uploadFormat}
                  onChange={(e) => setUploadFormat(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                  <option value="manual">Manual Paste</option>
                </select>
              </div>

              {uploadFormat !== 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select File
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    accept={uploadFormat === 'csv' ? '.csv' : uploadFormat === 'excel' ? '.xlsx' : '.json'}
                    className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-950"
                    required
                  />
                </div>
              )}

              <div className="text-xs text-slate-400">
                Expected format: Question, Answer, Difficulty, Topic, Subtopic, Tags, Field, Interview Type
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Questions'}
              </button>
            </form>

            {/* Duplicate Check Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                Duplicate Detection
              </h4>
              
              <div className="space-y-4">
                <textarea
                  id="duplicateCheckText"
                  placeholder="Paste questions to check for duplicates (one per line)..."
                  className="w-full h-24 px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-amber-500 resize-none"
                />
                
                <button
                  onClick={checkDuplicates}
                  disabled={checkingDuplicates}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingDuplicates ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  {checkingDuplicates ? 'Checking...' : 'Check Duplicates'}
                </button>
              </div>

              {duplicateResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-medium text-white">Duplicate Analysis:</h5>
                  {duplicateResults.map((result, i) => (
                    <div key={i} className="p-3 rounded bg-slate-950 text-sm">
                      <div className="text-slate-300 mb-1">{result.newQuestion}</div>
                      {result.isDuplicate ? (
                        <div className="text-red-400">
                          ⚠ Duplicate of: {result.duplicateOf} (Similarity: {result.similarityScore}%)
                        </div>
                      ) : (
                        <div className="text-emerald-400">
                          ✓ Original (Similarity: {result.similarityScore}%)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Upload Tips
            </h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>✓ AI automatically analyzes uploaded questions</li>
              <li>✓ Extracts keywords and concepts</li>
              <li>✓ Detects duplicate questions</li>
              <li>✓ Classifies difficulty level</li>
              <li>✓ Questions enter Review status</li>
              <li>✓ Admin approval before publishing</li>
            </ul>
          </div>
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Generate AI Questions
            </h3>

            <form onSubmit={handleGenerate} className="grid gap-4">
              <input
                type="text"
                placeholder="Field (e.g., Computer Science)"
                value={generateForm.field}
                onChange={(e) => setGenerateForm({ ...generateForm, field: e.target.value })}
                className="px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Topic (e.g., JavaScript)"
                value={generateForm.topic}
                onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                className="px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Subtopic (optional)"
                value={generateForm.subtopic}
                onChange={(e) => setGenerateForm({ ...generateForm, subtopic: e.target.value })}
                className="px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500"
              />
              <select
                value={generateForm.difficulty}
                onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                className="px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white focus:border-cyan-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
              <input
                type="number"
                placeholder="Number of questions"
                min="1"
                max="200"
                value={generateForm.count}
                onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) })}
                className="px-4 py-2 rounded-lg border border-white/10 bg-slate-950 text-white placeholder-slate-500 focus:border-cyan-500"
                required
              />

              <button
                type="submit"
                disabled={generating}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? 'Generating...' : 'Generate Questions'}
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-violet-500/20 bg-violet-950/30 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-400" />
              Generated Questions Include
            </h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>✓ Main interview questions</li>
              <li>✓ Model answers with explanations</li>
              <li>✓ Follow-up questions</li>
              <li>✓ Scenario variations</li>
              <li>✓ Case study questions</li>
              <li>✓ MCQ format</li>
              <li>✓ Rapid-fire variations</li>
              <li>✓ Question metadata</li>
            </ul>
          </div>
        </div>
      )}

      {/* Review Tab */}
      {activeTab === 'review' && (
        <div className="mt-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Review AI-Generated Questions</h3>
            <p className="text-sm text-slate-400">
              Review and approve questions generated by AI before they are added to the question bank.
            </p>
          </div>

          {pendingQuestions.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No questions pending review at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingQuestions.map((q) => (
                <div key={q._id} className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400">
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-violet-500/20 text-violet-400">
                          {q.field}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400">
                          {q.interviewType}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">{q.question}</h4>
                      <p className="text-sm text-slate-400 mb-2">Topic: {q.topic}</p>
                      <div className="text-xs text-slate-500">Batch: {q.batchId}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-slate-400 mb-2">Quality Score</div>
                      <div className="text-lg font-semibold text-cyan-400">{q.qualityScore}/100</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-lg p-4 mb-4">
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Model Answer:</h5>
                    <p className="text-sm text-slate-400">{q.modelAnswer}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approveQuestion(q._id)}
                      disabled={approving === q._id}
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
                    >
                      {approving === q._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectQuestion(q._id)}
                      disabled={approving === q._id}
                      className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 flex items-center gap-2"
                    >
                      {approving === q._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && stats && (
        <div className="mt-8 grid gap-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
              <p className="text-sm text-slate-400">Total Questions</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalQuestions}</p>
            </div>
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-950/30 p-6">
              <p className="text-sm text-slate-400">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pendingReview}</p>
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-6">
              <p className="text-sm text-slate-400">Questions Asked</p>
              <p className="text-3xl font-bold text-cyan-400 mt-2">
                {stats.mostAsked.reduce((a, b) => a + b.timesAsked, 0)}
              </p>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white mb-4">By Difficulty</h3>
            <div className="space-y-2">
              {stats.byDifficulty.map((d) => (
                <div key={d._id} className="flex items-center justify-between">
                  <span className="text-slate-300">{d._id}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-48 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${(d.count / stats.totalQuestions) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-400">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Asked */}
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <h3 className="font-semibold text-white mb-4">Most Asked Questions</h3>
            <div className="space-y-2">
              {stats.mostAsked.map((q, i) => (
                <div key={i} className="p-3 rounded bg-slate-950 text-sm">
                  <div className="text-slate-300">{q.question}</div>
                  <div className="text-xs text-slate-500 mt-1">Asked {q.timesAsked} times</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default QuestionBankDashboard;
