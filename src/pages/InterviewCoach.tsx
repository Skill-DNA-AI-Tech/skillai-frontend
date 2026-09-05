import { Mic, RotateCcw, Square, Video, Loader2, MicOff, Play, User, Bot, Volume2, Radio, Camera, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type InterviewState = 'idle' | 'ai_asking' | 'user_answering' | 'analyzing' | 'finished';

const QUESTIONS = [
  "Hello and welcome to the interview! Could you please introduce yourself and tell me about your background?",
  "That's great. What would you say are your primary strengths and weaknesses when it comes to professional work?",
  "Thank you. Lastly, where do you see your career heading in the next five years?"
];

const InterviewCoach = () => {
  const { token } = useAuth();
  
  const [questions, setQuestions] = useState<string[]>(QUESTIONS);
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState<{role: 'ai'|'user', text: string}[]>([]);
  const [results, setResults] = useState<any>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<any>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchPersonalizedQuestions = async () => {
      if (!token) return;
      try {
        const memory = await apiRequest<any>('/career-twin/me', { token });
        if (memory?.dynamicInterview?.personalizedQuestion) {
          const customQs = [
            "Hello! Welcome to your personalized interview. Let's start with your background and primary skills.",
            memory.dynamicInterview.personalizedQuestion,
          ];
          if (memory.dynamicInterview.followUpQuestion) {
            customQs.push(memory.dynamicInterview.followUpQuestion);
          }
          setQuestions(customQs);
        }
      } catch (err) {
        console.warn("Could not load personalized questions, using default interview questions.", err);
      }
    };
    fetchPersonalizedQuestions();
  }, [token]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
      };

      recognitionRef.current = recognition;
    }
    
    // Cleanup voices
    window.speechSynthesis.cancel();
    return () => {
      stopMedia();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Ensure video stream is displayed when element is mounted
  useEffect(() => {
    if (userVideoRef.current && mediaStreamRef.current && (interviewState === 'ai_asking' || interviewState === 'user_answering')) {
      userVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [interviewState]);

  const getFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Try to find a female voice
    return voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')) || voices[0];
  };

  const speakQuestion = (questionText: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questionText);
    const voice = getFemaleVoice();
    if (voice) utterance.voice = voice;
    utterance.pitch = 1.1;
    utterance.rate = 0.95;
    
    utterance.onend = () => {
      setInterviewState('user_answering');
      startRecording();
    };
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      
      // Setup recording
      recordedChunksRef.current = [];
      try {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          setRecordedVideoUrl(URL.createObjectURL(blob));
        };
        mediaRecorder.start(1000);
        mediaRecorderRef.current = mediaRecorder;
      } catch (e) {
        console.error("Specific mimeType failed, falling back to default.", e);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          setRecordedVideoUrl(URL.createObjectURL(blob));
        };
        mediaRecorder.start(1000);
        mediaRecorderRef.current = mediaRecorder;
      }
      
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser. Try Chrome.");
        return;
      }
      
      setResults(null);
      setFullTranscript([]);
      setCurrentQuestionIndex(0);
      setTranscript('');
      setRecordedVideoUrl(null);
      
      setInterviewState('ai_asking');
      
      // We need to wait for voices to load sometimes
      setTimeout(() => {
        const firstQ = questions[0];
        setFullTranscript([{ role: 'ai', text: firstQ }]);
        speakQuestion(firstQ);
      }, 500);

    } catch (err) {
      console.error("Error accessing camera/microphone.", err);
      alert("Could not access camera or microphone. Please allow permissions to enable the video call.");
    }
  };

  const startRecording = () => {
    setTranscript('');
    try {
      recognitionRef.current.start();
    } catch(e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    try { recognitionRef.current.stop(); } catch(e) {}
  };

  const stopMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    stopRecording();
    window.speechSynthesis.cancel();
  };

  const handleNextQuestion = () => {
    stopRecording();
    
    const updatedTranscript = [...fullTranscript, { role: 'user' as const, text: transcript || '(No answer provided)' }];
    setFullTranscript(updatedTranscript);
    
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setInterviewState('ai_asking');
      setTranscript('');
      
      const nextQ = questions[nextIdx];
      setFullTranscript(prev => [...prev, { role: 'ai', text: nextQ }]);
      speakQuestion(nextQ);
    } else {
      handleAnalyze(updatedTranscript);
    }
  };

  const handleAnalyze = async (finalTranscriptData: {role: string, text: string}[]) => {
    stopMedia();
    setInterviewState('analyzing');
    
    const combinedTranscript = finalTranscriptData.map(t => `${t.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${t.text}`).join('\n');
    
    // Extract actual Q&A pairs
    const qaPairs: Array<{ question: string; answer: string }> = [];
    for (let i = 0; i < finalTranscriptData.length; i++) {
      if (finalTranscriptData[i].role === 'ai') {
        const qText = finalTranscriptData[i].text;
        const nextAnswer = finalTranscriptData.slice(i + 1).find(m => m.role === 'user');
        qaPairs.push({
          question: qText,
          answer: nextAnswer ? nextAnswer.text : '',
        });
      }
    }

    // Calculate real user words spoken
    const userWordsCount = finalTranscriptData
      .filter(t => t.role === 'user')
      .reduce((sum, item) => sum + (item.text ? item.text.split(/\s+/).filter(Boolean).length : 0), 0);

    const estimatedDuration = Math.max(20, Math.round(userWordsCount * 0.8));
    const estimatedWpm = Math.max(10, Math.min(180, Math.round((userWordsCount / Math.max(1, estimatedDuration / 60)))));

    try {
      const demoToken = token || "demo-token";
      const data = await apiRequest<any>('/ai/interview', {
        method: 'POST',
        body: JSON.stringify({
          transcript: combinedTranscript,
          qaPairs,
          durationSeconds: estimatedDuration,
          wordsPerMinute: estimatedWpm,
        }),
        token: demoToken
      });
      setResults(data);
      setInterviewState('finished');
    } catch (err) {
      console.error(err);
      alert("Failed to analyze interview.");
      setInterviewState('idle');
    }
  };

  const resetInterview = () => {
    stopMedia();
    setInterviewState('idle');
    setResults(null);
    setFullTranscript([]);
    setTranscript('');
    setCurrentQuestionIndex(0);
    setRecordedVideoUrl(null);
  };

  const deleteRecording = () => {
    if (!token) {
      alert('You must be logged in to delete your recording.');
      return;
    }
    
    if (recordedVideoUrl) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
      alert('Recording deleted successfully.');
    }
  };

  const signals = results ? [
    { label: 'Eye contact', value: results.eyeContactScore || 0, tone: 'bg-cyan-400' },
    { label: 'Speaking clarity', value: results.speakingClarityScore || 0, tone: 'bg-emerald-400' },
    { label: 'Grammar', value: results.grammarScore || 0, tone: 'bg-violet-400' },
    { label: 'Hesitation control', value: results.hesitationScore || 0, tone: 'bg-amber-400' },
    { label: 'Body language', value: results.bodyLanguageScore || 0, tone: 'bg-rose-400' },
  ] : [
    { label: 'Eye contact', value: 0, tone: 'bg-slate-700' },
    { label: 'Speaking clarity', value: 0, tone: 'bg-slate-700' },
    { label: 'Grammar', value: 0, tone: 'bg-slate-700' },
    { label: 'Hesitation control', value: 0, tone: 'bg-slate-700' },
    { label: 'Body language', value: 0, tone: 'bg-slate-700' },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="AI Video Interview Coach"
        title="Practice with a real-time AI interviewer"
        description="Experience a live interview simulation with our AI recruiter. She will ask you questions verbally, and we will analyze your spoken answers."
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-white/10 bg-slate-900/[0.82] p-5">
          <div className="relative aspect-video rounded-lg border border-white/10 bg-black overflow-hidden flex items-center justify-center">
            
            {/* AI Image */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950">
               {(interviewState !== 'idle' && interviewState !== 'analyzing') ? (
                  <div className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${interviewState === 'ai_asking' ? 'scale-105' : 'scale-100 opacity-70'}`}>
                    {interviewState === 'ai_asking' && (
                       <div className="absolute inset-0 bg-cyan-500/20 animate-pulse mix-blend-overlay"></div>
                    )}
                    <img 
                      src="/images/ai_female_interviewer.png" 
                      alt="AI Interviewer" 
                      className="w-full h-full object-cover"
                    />
                    {interviewState === 'ai_asking' && (
                       <div className="absolute bottom-6 flex gap-2">
                         <div className="h-3 w-1 bg-cyan-400 animate-[bounce_1s_infinite] rounded-full"></div>
                         <div className="h-3 w-1 bg-cyan-400 animate-[bounce_1s_infinite_0.2s] rounded-full"></div>
                         <div className="h-3 w-1 bg-cyan-400 animate-[bounce_1s_infinite_0.4s] rounded-full"></div>
                       </div>
                    )}
                  </div>
               ) : (
                  <div className="flex flex-col items-center text-center p-6 text-slate-400">
                    <Bot className="h-20 w-20 mb-4 text-cyan-500/50" />
                    <p className="text-lg font-medium text-white mb-2">Ready for your interview</p>
                    <p className="text-sm max-w-sm">Click "Start Mock Interview" to meet your AI recruiter. Ensure your microphone and camera are connected.</p>
                  </div>
               )}
            </div>
            
            {/* User Camera PiP */}
            {(interviewState === 'ai_asking' || interviewState === 'user_answering') && (
              <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl z-20">
                <video 
                  ref={userVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover mirror-mode" 
                  style={{ transform: 'scaleX(-1)' }} 
                />
              </div>
            )}
            
            {/* Live Badges */}
            {interviewState === 'ai_asking' && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 z-20">
                <Volume2 className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold text-cyan-100 uppercase tracking-widest">AI Speaking</span>
              </div>
            )}

            {interviewState === 'user_answering' && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 z-20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="text-xs font-semibold text-rose-100 uppercase tracking-widest">Listening...</span>
              </div>
            )}
            
            {/* Live Transcript Overlay */}
            {(transcript || (fullTranscript.length > 0 && interviewState !== 'finished')) && (
              <div className="absolute bottom-4 left-4 right-52 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/10 max-h-40 overflow-y-auto flex flex-col gap-2 z-20">
                {fullTranscript.slice(-1).map((msg, idx) => (
                  <div key={idx} className={`text-sm ${msg.role === 'ai' ? 'text-cyan-300 font-medium' : 'text-slate-300'}`}>
                    <span className="opacity-70 mr-2">{msg.role === 'ai' ? 'AI:' : 'You:'}</span>
                    {msg.text}
                  </div>
                ))}
                {interviewState === 'user_answering' && (
                   <div className="text-sm text-white">
                      <span className="opacity-70 mr-2 text-slate-300">You:</span>
                      {transcript}
                      <span className="animate-pulse ml-1 inline-block w-1.5 h-4 bg-white align-middle"></span>
                   </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3">
              {interviewState === 'idle' || interviewState === 'finished' ? (
                <button onClick={startInterview} className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Play className="h-4 w-4" /> Start Mock Interview
                </button>
              ) : interviewState === 'user_answering' ? (
                <button onClick={handleNextQuestion} className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Mic className="h-4 w-4" /> {currentQuestionIndex < questions.length - 1 ? "Finish Answer & Next" : "Finish Interview"}
                </button>
              ) : interviewState === 'ai_asking' ? (
                <button disabled className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed">
                  <Volume2 className="h-4 w-4 animate-pulse" /> Please Listen...
                </button>
              ) : (
                <button disabled className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 opacity-50">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                </button>
              )}
              
              {interviewState !== 'idle' && (
                <button onClick={resetInterview} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/[0.08]">
                  <RotateCcw className="h-4 w-4" /> Restart
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <Camera className={`h-4 w-4 ${interviewState !== 'idle' && interviewState !== 'finished' ? 'text-cyan-400' : ''}`} />
              <Mic className={`h-4 w-4 ${interviewState !== 'idle' && interviewState !== 'finished' ? 'text-cyan-400' : ''}`} />
              <span className="ml-2">Question {interviewState !== 'idle' && interviewState !== 'finished' ? currentQuestionIndex + 1 : 0} of {questions.length}</span>
            </div>
          </div>

          {results?.tips && (
            <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                <Radio className="h-4 w-4" /> AI Feedback & Tips
              </h4>
              <ul className="list-disc list-inside text-sm text-emerald-100/80 grid gap-1.5">
                {results.tips.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <MetricCard label="Interview score" value={results?.interviewScore || 0} suffix="%" progress={results?.interviewScore || 0} tone="bg-cyan-400" />
          <MetricCard label="Communication" value={results?.communicationScore || 0} suffix="%" progress={results?.communicationScore || 0} tone="bg-emerald-400" />
          <MetricCard label="Technical depth" value={results?.technicalDepthScore || 0} suffix="%" progress={results?.technicalDepthScore || 0} tone="bg-violet-400" />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="grid gap-6">
          <div>
            <h3 className="font-semibold text-white">Analysis signals</h3>
            <div className="mt-4 grid gap-3">
              {signals.map((signal) => (
                <article key={signal.label} className="rounded-lg border border-white/10 bg-slate-900/80 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{signal.label}</p>
                    <span className="text-sm text-slate-300">{signal.value}%</span>
                  </div>
                  <ProgressBar value={signal.value} tone={signal.tone} />
                </article>
              ))}
            </div>
          </div>
          
          {/* Recorded Video Playback */}
          {recordedVideoUrl && results && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">Your Interview Recording</h3>
                  <p className="text-sm text-slate-400 mt-1">Review your performance to identify areas for improvement.</p>
                </div>
                <button
                  onClick={deleteRecording}
                  className="inline-flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                  title="Only you can delete your recording"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
              <div className="rounded-lg border border-white/10 bg-black overflow-hidden shadow-lg">
                <video 
                  src={recordedVideoUrl} 
                  controls 
                  className="w-full aspect-video object-cover" 
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Full Transcript Review */}
        {results && fullTranscript.length > 0 && (
           <div>
              <h3 className="font-semibold text-white">Interview Transcript</h3>
              <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/80 p-4 max-h-[600px] overflow-y-auto flex flex-col gap-4">
                 {fullTranscript.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${msg.role === 'ai' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/5 border border-white/10'}`}>
                       <p className={`text-xs font-semibold mb-1 ${msg.role === 'ai' ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {msg.role === 'ai' ? 'AI Recruiter' : 'You'}
                       </p>
                       <p className="text-sm text-slate-200">{msg.text}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </section>
    </main>
  );
};

export default InterviewCoach;
