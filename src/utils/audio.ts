/**
 * Real-time Audio Processing Utilities for Gemini Live API
 * Handles 16kHz PCM linear16 recording, 24kHz PCM linear16 playback,
 * downsampling, gapless jitter buffering, and live visualizer analysis.
 */

// Convert Float32Array to 16-bit PCM ArrayBuffer
export function float32ToInt16PCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1]
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // Little-endian
  }
  return buffer;
}

// Convert ArrayBuffer or Int16Array to base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert base64 string to Float32Array for Web Audio API playback
export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit PCM little-endian
  const dataView = new DataView(bytes.buffer);
  const numSamples = Math.floor(bytes.byteLength / 2);
  const float32 = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 / (int16 < 0 ? 0x8000 : 0x7fff);
  }

  return float32;
}

// Downsample audio buffer from native sample rate to 16000Hz
export function downsampleTo16k(
  inputBuffer: Float32Array,
  inputSampleRate: number
): Float32Array {
  if (inputSampleRate === 16000) {
    return inputBuffer;
  }
  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(inputBuffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetInput = 0;

  while (offsetResult < result.length) {
    const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetInput; i < nextOffsetInput && i < inputBuffer.length; i++) {
      accum += inputBuffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetInput = nextOffsetInput;
  }
  return result;
}

/**
 * Gapless Audio Queue Player for Gemini Live 24kHz PCM Audio
 */
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public init() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playChunk(base64Audio: string) {
    this.init();
    if (!this.audioCtx || !this.analyser || this.isMuted) return;

    try {
      const float32Data = base64ToFloat32Array(base64Audio);
      if (float32Data.length === 0) return;

      const audioBuffer = this.audioCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyser);

      const currentTime = this.audioCtx.currentTime;
      // Schedule next start time to avoid gaps or overlaps
      const startTime = Math.max(currentTime + 0.01, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.error('Error playing live audio chunk:', err);
    }
  }

  // Barge-in: immediately stop playback and clear audio queue
  public stopAndFlush() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might already have ended
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(16);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAndFlush();
    }
  }

  public close() {
    this.stopAndFlush();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }
}

/**
 * Microphone Recorder for 16kHz PCM streaming to Gemini Live
 */
export class LiveAudioRecorder {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording: boolean = false;
  private onAudioChunkCallback: ((base64Chunk: string) => void) | null = null;

  public async start(onAudioChunk: (base64Chunk: string) => void): Promise<boolean> {
    try {
      this.onAudioChunkCallback = onAudioChunk;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.inputSource = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.inputSource.connect(this.analyser);

      // ScriptProcessor with 2048 or 4096 buffer size
      this.processor = this.audioCtx.createScriptProcessor(2048, 1, 1);
      this.inputSource.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);

      const sampleRate = this.audioCtx.sampleRate;

      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Downsample to 16000Hz
        const downsampled = downsampleTo16k(inputData, sampleRate);
        const pcmBuffer = float32ToInt16PCM(downsampled);
        const base64 = arrayBufferToBase64(pcmBuffer);

        if (this.onAudioChunkCallback && base64) {
          this.onAudioChunkCallback(base64);
        }
      };

      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start microphone:', err);
      return false;
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(16);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public stop() {
    this.isRecording = false;
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  public isActive(): boolean {
    return this.isRecording;
  }
}
