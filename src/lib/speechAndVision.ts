// Speech recognition, technical vocabulary preservation, and webcam engagement analysis

// Technical vocabulary mapping for domain-specific speech preservation
export const TECHNICAL_VOCABULARY_MAP: Record<string, string> = {
  'pie torch': 'PyTorch',
  'py torch': 'PyTorch',
  'pie torche': 'PyTorch',
  'tensor flow': 'TensorFlow',
  'tensurf flow': 'TensorFlow',
  'c a d': 'CAD',
  'see a d': 'CAD',
  'autocad': 'AutoCAD',
  'auto cad': 'AutoCAD',
  'solid works': 'SolidWorks',
  'solidworks': 'SolidWorks',
  'g d and t': 'GD&T',
  'gd and t': 'GD&T',
  'g d n t': 'GD&T',
  'b i m': 'BIM',
  'beam modeling': 'BIM modeling',
  'd c f': 'DCF',
  'dcf modeling': 'DCF modeling',
  'g s t': 'GST',
  'input tax credit': 'Input Tax Credit',
  't c p i p': 'TCP/IP',
  't c p': 'TCP',
  'u d p': 'UDP',
  'a w s': 'AWS',
  'dock er': 'Docker',
  'dockers': 'Docker',
  'k 8 s': 'Kubernetes',
  'cube netties': 'Kubernetes',
  'kube netties': 'Kubernetes',
  'type script': 'TypeScript',
  'java script': 'JavaScript',
  'react js': 'React.js',
  'next js': 'Next.js',
  'node js': 'Node.js',
  'post gres': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongo d b': 'MongoDB',
  'rest a p i': 'REST API',
  'graph q l': 'GraphQL',
  'ci cd': 'CI/CD',
  'c i c d': 'CI/CD',
  'plc scada': 'PLC/SCADA',
  'p l c': 'PLC',
  's c a d a': 'SCADA',
  'verilog': 'Verilog',
  'v h d l': 'VHDL',
  'fpga': 'FPGA',
  'f p g a': 'FPGA',
  'hvac': 'HVAC',
  'h vac': 'HVAC',
  'fea': 'FEA',
  'f e a': 'FEA',
  'cfd': 'CFD',
  'c f d': 'CFD',
  'ebitda': 'EBITDA',
  'e bit da': 'EBITDA',
};

// Client-side technical vocabulary cleanup
export function applyTechnicalVocabulary(text: string): string {
  if (!text) return '';
  let cleaned = text;
  for (const [misheard, standard] of Object.entries(TECHNICAL_VOCABULARY_MAP)) {
    const regex = new RegExp(`\\b${misheard}\\b`, 'gi');
    cleaned = cleaned.replace(regex, standard);
  }
  return cleaned;
}

export interface AudioMetrics {
  confidence: number;
  audioQuality: 'EXCELLENT' | 'GOOD' | 'LOW_CONFIDENCE' | 'POOR_AUDIO';
  volumeLevel: number; // 0..100
  isSpeaking: boolean;
}

export interface VisualMetrics {
  faceDetected: boolean;
  cameraFacingPercentage: number;
  lookingAwayPercentage: number;
  multipleFacesDetected: boolean;
  behaviorStatus: 'NORMAL' | 'LOOKING_AWAY_FREQUENTLY' | 'NO_FACE_DETECTED' | 'MULTIPLE_FACES_DETECTED' | 'AUDIO_ONLY_FALLBACK';
  sampleCount: number;
}

// Lightweight Speech-to-Text Manager with Web Speech API and AudioContext VAD
export class SpeechToTextSession {
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private confidences: number[] = [];
  
  public isSupported: boolean = false;
  public isListening: boolean = false;
  public transcript: string = '';
  public currentConfidence: number = 1.0;
  public currentVolume: number = 0;

  constructor(
    private onTranscriptUpdate: (transcript: string, isFinal: boolean, confidence: number) => void,
    private onVolumeUpdate?: (volume: number) => void,
    private onStatusWarning?: (warning: string) => void
  ) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      this.isSupported = true;
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let latestConf = 0.9;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const item = res[0];
          if (item?.confidence) {
            latestConf = item.confidence;
            this.confidences.push(latestConf);
          }
          if (res.isFinal) {
            finalTranscript += item.transcript + ' ';
          } else {
            interimTranscript += item.transcript;
          }
        }

        const rawText = (finalTranscript || interimTranscript).trim();
        const cleanedText = applyTechnicalVocabulary(rawText);
        this.transcript = cleanedText;
        this.currentConfidence = latestConf;

        if (latestConf < 0.45 && this.onStatusWarning) {
          this.onStatusWarning('Low audio clarity detected. Please speak clearly into your microphone.');
        }

        this.onTranscriptUpdate(cleanedText, Boolean(finalTranscript), latestConf);
      };

      this.recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err.error);
        if (err.error === 'no-speech' && this.onStatusWarning) {
          this.onStatusWarning('No speech detected. Please check microphone input.');
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        }
      };
    }
  }

  public async start(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      this.isListening = true;
      this.confidences = [];
      this.transcript = '';
      this.recognition.start();

      // Setup Web Audio API volume monitoring for noise level and VAD
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          this.audioContext = new AudioContextClass();
          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          source.connect(this.analyser);

          const pcmData = new Uint8Array(this.analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!this.isListening || !this.analyser) return;
            this.analyser.getByteFrequencyData(pcmData);
            let sum = 0;
            for (let i = 0; i < pcmData.length; i++) {
              sum += pcmData[i];
            }
            const average = sum / pcmData.length;
            this.currentVolume = Math.min(100, Math.round((average / 128) * 100));
            if (this.onVolumeUpdate) {
              this.onVolumeUpdate(this.currentVolume);
            }
            this.animFrameId = requestAnimationFrame(checkVolume);
          };
          this.animFrameId = requestAnimationFrame(checkVolume);
        } catch (mediaErr) {
          console.warn('Microphone audio context fallback:', mediaErr);
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      return false;
    }
  }

  public stop(): AudioMetrics {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    const avgConfidence = this.confidences.length > 0
      ? this.confidences.reduce((a, b) => a + b, 0) / this.confidences.length
      : 0.85;

    let audioQuality: 'EXCELLENT' | 'GOOD' | 'LOW_CONFIDENCE' | 'POOR_AUDIO' = 'GOOD';
    if (avgConfidence >= 0.85) audioQuality = 'EXCELLENT';
    else if (avgConfidence >= 0.65) audioQuality = 'GOOD';
    else if (avgConfidence >= 0.45) audioQuality = 'LOW_CONFIDENCE';
    else audioQuality = 'POOR_AUDIO';

    return {
      confidence: Math.round(avgConfidence * 100) / 100,
      audioQuality,
      volumeLevel: this.currentVolume,
      isSpeaking: this.currentVolume > 10,
    };
  }
}

// Lightweight Face & Eye-Contact Engagement Tracker via Canvas Frame Analysis
export class EngagementVisualTracker {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private intervalId: any = null;
  private mediaStream: MediaStream | null = null;

  private totalFrames: number = 0;
  private faceDetectedFrames: number = 0;
  private cameraFacingFrames: number = 0;
  private lookingAwayFrames: number = 0;
  private multipleFaceEvents: number = 0;

  public isActive: boolean = false;
  public lastFaceDetected: boolean = false;
  public lastLookingAway: boolean = false;

  constructor(private onUpdate?: (metrics: VisualMetrics) => void) {}

  public async start(videoEl: HTMLVideoElement): Promise<boolean> {
    try {
      this.videoElement = videoEl;
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 120;
      this.canvasElement.height = 90;

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });

      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();

      this.isActive = true;
      this.totalFrames = 0;
      this.faceDetectedFrames = 0;
      this.cameraFacingFrames = 0;
      this.lookingAwayFrames = 0;
      this.multipleFaceEvents = 0;

      // Sample every 500ms
      this.intervalId = setInterval(() => {
        this.processFrame();
      }, 500);

      return true;
    } catch (err) {
      console.warn('Webcam not available or access denied. Falling back to Audio-only mode:', err);
      this.isActive = false;
      return false;
    }
  }

  private processFrame() {
    if (!this.isActive || !this.videoElement || !this.canvasElement) return;

    try {
      const ctx = this.canvasElement.getContext('2d');
      if (!ctx || this.videoElement.videoWidth === 0) return;

      ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
      const imgData = ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      const data = imgData.data;

      // Detect skin-tone / facial feature pixel cluster
      let facePixelCount = 0;
      let sumX = 0;
      let sumY = 0;
      const width = this.canvasElement.width;
      const height = this.canvasElement.height;

      // Analyze pixels for typical facial luminance and tone
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Normalized skin luminance rule: r > 90, g > 40, b > 25, r > g, r > b, |r-g| > 12
          if (r > 90 && g > 40 && b > 25 && r > g && r > b && (r - g) > 12) {
            facePixelCount++;
            sumX += x;
            sumY += y;
          }
        }
      }

      this.totalFrames++;

      const isFacePresent = facePixelCount > 40; // Minimum cluster threshold
      this.lastFaceDetected = isFacePresent;

      if (isFacePresent) {
        this.faceDetectedFrames++;
        const centroidX = sumX / facePixelCount;
        const normalizedX = centroidX / width; // 0 (left) to 1 (right)

        // Centered between 0.28 and 0.72 means looking towards camera/screen
        if (normalizedX >= 0.28 && normalizedX <= 0.72) {
          this.cameraFacingFrames++;
          this.lastLookingAway = false;
        } else {
          this.lookingAwayFrames++;
          this.lastLookingAway = true;
        }
      } else {
        this.lookingAwayFrames++;
        this.lastLookingAway = true;
      }

      const metrics = this.getMetrics();
      if (this.onUpdate) {
        this.onUpdate(metrics);
      }
    } catch (e) {
      // Frame processing safeguard
    }
  }

  public getMetrics(): VisualMetrics {
    if (!this.isActive || this.totalFrames === 0) {
      return {
        faceDetected: false,
        cameraFacingPercentage: 100,
        lookingAwayPercentage: 0,
        multipleFacesDetected: false,
        behaviorStatus: 'AUDIO_ONLY_FALLBACK',
        sampleCount: 0,
      };
    }

    const cameraFacingPct = Math.round((this.cameraFacingFrames / this.totalFrames) * 100);
    const lookingAwayPct = Math.max(0, 100 - cameraFacingPct);
    const faceDetectedRatio = this.faceDetectedFrames / this.totalFrames;

    let behaviorStatus: 'NORMAL' | 'LOOKING_AWAY_FREQUENTLY' | 'NO_FACE_DETECTED' | 'MULTIPLE_FACES_DETECTED' | 'AUDIO_ONLY_FALLBACK' = 'NORMAL';
    if (faceDetectedRatio < 0.25) {
      behaviorStatus = 'NO_FACE_DETECTED';
    } else if (lookingAwayPct > 55) {
      behaviorStatus = 'LOOKING_AWAY_FREQUENTLY';
    } else if (this.multipleFaceEvents > 2) {
      behaviorStatus = 'MULTIPLE_FACES_DETECTED';
    } else {
      behaviorStatus = 'NORMAL';
    }

    return {
      faceDetected: this.lastFaceDetected,
      cameraFacingPercentage: cameraFacingPct,
      lookingAwayPercentage: lookingAwayPct,
      multipleFacesDetected: this.multipleFaceEvents > 0,
      behaviorStatus,
      sampleCount: this.totalFrames,
    };
  }

  public stop(): VisualMetrics {
    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    return this.getMetrics();
  }
}
