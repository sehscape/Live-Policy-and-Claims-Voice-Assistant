/**
 * Screen & Document Visual Awareness Streamer
 * Streams frames at 1 FPS to Gemini Live API so the assistant
 * can visually observe the policy document or shared screen.
 */

export class ScreenStreamer {
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private intervalId: any = null;
  private isStreaming: boolean = false;
  private onFrameCallback: ((base64Jpeg: string) => void) | null = null;

  public async startScreenShare(onFrame: (base64Jpeg: string) => void): Promise<boolean> {
    try {
      this.onFrameCallback = onFrame;
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 5, max: 15 },
        },
        audio: false,
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.mediaStream;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;
      await this.videoElement.play();

      this.canvasElement = document.createElement('canvas');
      this.isStreaming = true;

      // Handle user stopping screen share via browser chrome bar
      this.mediaStream.getVideoTracks()[0].onended = () => {
        this.stop();
      };

      // Stream frames at exactly 1 frame per second (1 FPS) as specified in guidelines
      this.intervalId = setInterval(() => {
        this.captureAndEmit();
      }, 1000);

      // Send initial frame immediately
      setTimeout(() => this.captureAndEmit(), 200);

      return true;
    } catch (err) {
      console.warn('Screen share canceled or failed:', err);
      return false;
    }
  }

  // Stream an HTML Canvas element directly (e.g. rendered document view)
  public startCanvasStream(
    canvas: HTMLCanvasElement,
    onFrame: (base64Jpeg: string) => void
  ) {
    this.onFrameCallback = onFrame;
    this.canvasElement = canvas;
    this.isStreaming = true;

    this.intervalId = setInterval(() => {
      if (!this.canvasElement || !this.onFrameCallback) return;
      try {
        const dataUrl = this.canvasElement.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        if (base64) {
          this.onFrameCallback(base64);
        }
      } catch (e) {
        console.error('Canvas capture error:', e);
      }
    }, 1000);
  }

  private captureAndEmit() {
    if (!this.videoElement || !this.canvasElement || !this.isStreaming || !this.onFrameCallback) {
      return;
    }

    try {
      const video = this.videoElement;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const targetWidth = 1024;
      const scale = targetWidth / video.videoWidth;
      const targetHeight = Math.round(video.videoHeight * scale);

      this.canvasElement.width = targetWidth;
      this.canvasElement.height = targetHeight;

      const ctx = this.canvasElement.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const dataUrl = this.canvasElement.toDataURL('image/jpeg', 0.75);
      const base64 = dataUrl.split(',')[1];

      if (base64) {
        this.onFrameCallback(base64);
      }
    } catch (err) {
      console.error('Screen capture frame error:', err);
    }
  }

  public getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  public isActive(): boolean {
    return this.isStreaming;
  }

  public stop() {
    this.isStreaming = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.canvasElement = null;
    this.onFrameCallback = null;
  }
}
