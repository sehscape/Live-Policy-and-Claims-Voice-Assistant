/**
 * Live Policy & Claims Voice Assistant — BFSI / Insurance
 * NSOffice.AI AI Centre of Excellence
 * Built with Gemini Live API (Audio-to-Audio WebSocket) and gemini-3-flash-preview
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DocumentViewer } from './components/DocumentViewer';
import { LiveVoiceAssistant, AdjudicationResult } from './components/LiveVoiceAssistant';
import { FnolModal, ClaimsListModal, FnolRecord } from './components/FnolModal';
import { InfoModal } from './components/InfoModal';
import { POLICIES, InsurancePolicy } from './data/policies';
import { LiveAudioPlayer, LiveAudioRecorder } from './utils/audio';
import { ScreenStreamer } from './utils/screenStreamer';

export default function App() {
  // Policies state
  const [policies, setPolicies] = useState<InsurancePolicy[]>(POLICIES);
  const [currentPolicy, setCurrentPolicy] = useState<InsurancePolicy>(POLICIES[0]);

  // Voice Call & Streaming state
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isDocumentStreaming, setIsDocumentStreaming] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');

  // Adjudication & Grounding state
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [latestSpokenResponse, setLatestSpokenResponse] = useState<string | null>(null);
  const [adjudication, setAdjudication] = useState<AdjudicationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // FNOL Claims & Modals
  const [fnolClaims, setFnolClaims] = useState<FnolRecord[]>([]);
  const [activeClaimDraft, setActiveClaimDraft] = useState<AdjudicationResult['fnolDraft'] | null>(null);
  const [isFnolModalOpen, setIsFnolModalOpen] = useState(false);
  const [isClaimsListOpen, setIsClaimsListOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Visualizer bars state (16 bars)
  const [visualizerLevels, setVisualizerLevels] = useState<number[]>(new Array(16).fill(0.08));

  // Refs for audio, WebSocket, and screen capture
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const audioRecorderRef = useRef<LiveAudioRecorder | null>(null);
  const screenStreamerRef = useRef<ScreenStreamer | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize audio player on mount
  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer();
    audioRecorderRef.current = new LiveAudioRecorder();
    screenStreamerRef.current = new ScreenStreamer();

    return () => {
      stopAllStreams();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Visualizer animation frame loop
  useEffect(() => {
    const updateVisualizer = () => {
      let data: Uint8Array = new Uint8Array(16);

      if (audioPlayerRef.current && isCallActive) {
        const pData = audioPlayerRef.current.getVisualizerData();
        const rData = audioRecorderRef.current?.getVisualizerData();

        // Sample 16 bins
        const bins: number[] = [];
        const step = Math.max(1, Math.floor(pData.length / 16));
        for (let i = 0; i < 16; i++) {
          const pVal = pData[i * step] || 0;
          const rVal = rData ? rData[i * step] || 0 : 0;
          const maxVal = Math.max(pVal, rVal) / 255;
          bins.push(Math.max(0.08, maxVal));
        }
        setVisualizerLevels(bins);
      } else {
        setVisualizerLevels(new Array(16).fill(0.08));
      }

      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCallActive]);

  // Stop all streams and active calls
  const stopAllStreams = () => {
    if (webSocketRef.current) {
      try {
        webSocketRef.current.close();
      } catch (e) {
        // ignore
      }
      webSocketRef.current = null;
    }
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stopAndFlush();
    }
    if (screenStreamerRef.current) {
      screenStreamerRef.current.stop();
    }
    setIsCallActive(false);
    setIsScreenSharing(false);
    setIsDocumentStreaming(false);
  };

  // Start Live Voice Call (WebSocket to /live)
  const handleStartCall = async () => {
    try {
      setIsCallActive(true);
      audioPlayerRef.current?.init();

      // Establish WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to /live');
        // Initialize Gemini Live session with current policy text
        ws.send(
          JSON.stringify({
            type: 'init',
            policyTitle: currentPolicy.title,
            policyText: currentPolicy.fullDocumentText,
            voice: selectedVoice,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            console.log('Gemini Live session ready:', msg.model);
          }

          if (msg.type === 'audio' && msg.audio) {
            audioPlayerRef.current?.playChunk(msg.audio);
          }

          if (msg.type === 'interrupted') {
            console.log('Caller barged in: flushing audio queue');
            audioPlayerRef.current?.stopAndFlush();
          }

          if (msg.type === 'text' && msg.text) {
            setLatestSpokenResponse((prev) => (prev ? prev + ' ' + msg.text : msg.text));
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection notice:', err);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Start Microphone Capture (16kHz PCM linear16)
      await audioRecorderRef.current?.start((base64Chunk) => {
        if (!isMicMuted && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'audio', audio: base64Chunk }));
        }
      });
    } catch (err) {
      console.error('Failed to start voice call:', err);
      setIsCallActive(false);
    }
  };

  const handleEndCall = () => {
    stopAllStreams();
  };

  const handleToggleMicMute = () => {
    setIsMicMuted((prev) => !prev);
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamerRef.current?.stop();
      setIsScreenSharing(false);
    } else {
      const ok = await screenStreamerRef.current?.startScreenShare((base64Jpeg) => {
        if (webSocketRef.current?.readyState === WebSocket.OPEN) {
          webSocketRef.current.send(JSON.stringify({ type: 'video', video: base64Jpeg }));
        }
      });

      if (ok) {
        setIsScreenSharing(true);
        // Connect stream to video element for preview
        const mediaStream = screenStreamerRef.current?.getMediaStream();
        if (mediaStream && screenVideoRef.current) {
          screenVideoRef.current.srcObject = mediaStream;
        }
      }
    }
  };

  // Render current policy document view to offscreen canvas and stream at 1 FPS
  const renderDocumentToCanvas = useCallback(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw document representation for visual model
    ctx.fillStyle = '#080C14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header banner
    ctx.fillStyle = '#0066FF';
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`NSOFFICE AI — ${currentPolicy.title}`, 30, 40);

    // Meta details
    ctx.fillStyle = '#94A3B8';
    ctx.font = '16px monospace';
    ctx.fillText(`Policy No: ${currentPolicy.policyNumber}  |  Insured: ${currentPolicy.policyholder}`, 30, 95);
    ctx.fillText(`Deductible: ${currentPolicy.summary.deductible}`, 30, 120);

    // Clauses
    let y = 160;
    currentPolicy.clauses.forEach((c) => {
      if (y > 720) return;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(25, y - 20, 974, 90);
      ctx.fillStyle = '#0066FF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${c.clauseNumber}: ${c.title}`, 40, y);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '13px sans-serif';
      const snippet = c.content.slice(0, 150) + '...';
      ctx.fillText(snippet, 40, y + 25);
      y += 105;
    });
  }, [currentPolicy]);

  // Toggle Document Streaming
  const handleToggleDocumentStream = () => {
    if (isDocumentStreaming) {
      screenStreamerRef.current?.stop();
      setIsDocumentStreaming(false);
    } else {
      renderDocumentToCanvas();
      if (offscreenCanvasRef.current) {
        screenStreamerRef.current?.startCanvasStream(
          offscreenCanvasRef.current,
          (base64Jpeg) => {
            if (webSocketRef.current?.readyState === WebSocket.OPEN) {
              webSocketRef.current.send(JSON.stringify({ type: 'video', video: base64Jpeg }));
            }
          }
        );
        setIsDocumentStreaming(true);
      }
    }
  };

  // Re-render canvas snapshot when policy changes if streaming is on
  useEffect(() => {
    if (isDocumentStreaming) {
      renderDocumentToCanvas();
    }
  }, [currentPolicy, isDocumentStreaming, renderDocumentToCanvas]);

  // Clause Grounding & Adjudication Query (gemini-3-flash-preview)
  const handleQueryAdjudication = async (userQuery: string) => {
    setIsProcessing(true);
    try {
      // Also send text over WebSocket if call is active
      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(JSON.stringify({ type: 'text', text: userQuery }));
      }

      const res = await fetch('/api/policy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: currentPolicy.id,
          policyName: currentPolicy.title,
          policyText: currentPolicy.fullDocumentText,
          userQuery,
        }),
      });

      if (!res.ok) {
        throw new Error('Adjudication API returned error');
      }

      const data: AdjudicationResult = await res.json();
      setAdjudication(data);
      setLatestSpokenResponse(data.spokenExplanation);

      // Match and highlight clause in document viewer
      const matchedClause = currentPolicy.clauses.find(
        (c) =>
          data.applicableClause.toLowerCase().includes(c.clauseNumber.toLowerCase()) ||
          c.title.toLowerCase().includes(data.applicableClause.toLowerCase())
      );
      if (matchedClause) {
        setActiveClauseId(matchedClause.id);
      } else {
        setActiveClauseId(currentPolicy.clauses[0]?.id || null);
      }

      // Automatically synthesize speech via Gemini TTS
      handleReplayAudio(data.spokenExplanation);
    } catch (err) {
      console.error('Adjudication error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Synthesize Speech via Gemini TTS (gemini-3-flash-preview)
  const handleReplayAudio = async (textToSpeak: string) => {
    if (!textToSpeak || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voice: selectedVoice,
        }),
      });

      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();

      if (data.audio) {
        audioPlayerRef.current?.stopAndFlush();
        audioPlayerRef.current?.playChunk(data.audio);
      }
    } catch (err) {
      console.warn('TTS playback notice:', err);
    } finally {
      setTimeout(() => setIsPlayingAudio(false), 2000);
    }
  };

  // Jump to clause when clicking clause pill
  const handleSelectClause = (clauseCitation: string) => {
    const matched = currentPolicy.clauses.find(
      (c) =>
        clauseCitation.toLowerCase().includes(c.clauseNumber.toLowerCase()) ||
        c.title.toLowerCase().includes(clauseCitation.toLowerCase())
    );
    if (matched) {
      setActiveClauseId(matched.id);
    }
  };

  // Upload Custom Policy
  const handleUploadCustomPolicy = (customPolicy: InsurancePolicy) => {
    setPolicies((prev) => [customPolicy, ...prev]);
    setCurrentPolicy(customPolicy);
  };

  // Save FNOL claim record
  const handleSaveClaim = (record: FnolRecord) => {
    setFnolClaims((prev) => [record, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-[#F3F4F6] selection:bg-[#0066FF] selection:text-white">
      {/* Top Header */}
      <Header
        isCallActive={isCallActive}
        isScreenSharing={isScreenSharing}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenFnolList={() => setIsClaimsListOpen(true)}
        fnolCount={fnolClaims.length}
      />

      {/* Main Content: Split View (Document Viewer on Left, Voice Concierge on Right) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        {/* Left Column: Interactive Policy Document & Visual Screen Awareness (7 cols) */}
        <section className="lg:col-span-7 h-[650px] lg:h-[calc(100vh-6.5rem)] flex flex-col min-h-0">
          <DocumentViewer
            policies={policies}
            currentPolicy={currentPolicy}
            onSelectPolicy={(pol) => {
              setCurrentPolicy(pol);
              setActiveClauseId(null);
            }}
            activeClauseId={activeClauseId}
            highlightedText={highlightedText}
            onUploadCustomPolicy={handleUploadCustomPolicy}
            isScreenSharing={isScreenSharing}
            isDocumentStreaming={isDocumentStreaming}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleDocumentStream={handleToggleDocumentStream}
            screenStreamRef={screenVideoRef}
          />
        </section>

        {/* Right Column: Live Voice Assistant & Spoken Grounding (5 cols) */}
        <section className="lg:col-span-5 h-[650px] lg:h-[calc(100vh-6.5rem)] flex flex-col min-h-0">
          <LiveVoiceAssistant
            currentPolicy={currentPolicy}
            isCallActive={isCallActive}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
            isMicMuted={isMicMuted}
            onToggleMicMute={handleToggleMicMute}
            visualizerLevels={visualizerLevels}
            latestSpokenResponse={latestSpokenResponse}
            adjudication={adjudication}
            onSelectClause={handleSelectClause}
            onOpenFnolModal={(claim) => {
              setActiveClaimDraft(claim);
              setIsFnolModalOpen(true);
            }}
            onSendTextMessage={handleQueryAdjudication}
            isProcessing={isProcessing}
            onReplayAudio={handleReplayAudio}
            isPlayingAudio={isPlayingAudio}
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
          />
        </section>
      </main>

      {/* FNOL First Notice of Loss Claim Modal */}
      <FnolModal
        isOpen={isFnolModalOpen}
        onClose={() => setIsFnolModalOpen(false)}
        activeClaim={activeClaimDraft}
        adjudication={adjudication}
        policy={currentPolicy}
        onSaveClaim={handleSaveClaim}
      />

      {/* Claims Registry Modal */}
      <ClaimsListModal
        isOpen={isClaimsListOpen}
        onClose={() => setIsClaimsListOpen(false)}
        claims={fnolClaims}
      />

      {/* Architecture & Assignment Overview Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}
