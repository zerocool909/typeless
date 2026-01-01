'use client';

import { useState, useRef, useEffect } from 'react';
import { AudioCapture } from '@/components/AudioCapture/AudioCapture';
import { TranscriptEditor } from '@/components/Transcript/TranscriptEditor';
import { ModelStatus } from '@/components/ModelLoader/ModelStatus';
import { useTranscriber } from '@/hooks/useTranscriber';
import { Brain, Sparkles, FileText } from 'lucide-react';

export default function Home() {
  const [history, setHistory] = useState<string>('');

  const {
    isReady,
    isProcessing,
    progress,
    status,
    transcript,
    error,
    transcribe,
    clearTranscript
  } = useTranscriber();

  const handleAudioCaptured = (blob: Blob, isFinal: boolean) => {
    transcribe(blob);
  };

  useEffect(() => {
    if (!isProcessing && transcript) {
      setHistory(prev => {
        // Noise filter: remove non-speech tokens like (whistling), [BLANK_AUDIO], etc.
        const cleanTranscript = transcript
          .replace(/\[[^\]]*\]/g, '') // Remove [ ... ]
          .replace(/\([^)]*\)/g, '')   // Remove ( ... )
          .replace(/\s+/g, ' ')      // Normalize whitespace
          .trim();

        if (!cleanTranscript) return prev;
        if (!prev) return cleanTranscript;

        // 1. Sentence-level fuzzy similarity helper
        const getSimilarity = (s1: string, s2: string) => {
          const clean = (s: string) => s.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
          const clean1 = clean(s1);
          const clean2 = clean(s2);
          if (!clean1 || !clean2) return 0;
          if (clean1 === clean2) return 1;

          const words1 = new Set(clean1.split(/\s+/));
          const words2 = new Set(clean2.split(/\s+/));
          const intersection = new Set([...words1].filter(x => words2.has(x)));
          const union = new Set([...words1, ...words2]);
          return intersection.size / union.size;
        };

        // 2. Split into sentences and filter duplicates
        const newSentences = cleanTranscript.split(/(?<=[.!?])\s+/);
        const historySentences = prev.split(/(?<=[.!?])\s+/).slice(-5);

        const filteredNew = newSentences.filter((newSent: string) => {
          // Skip if similar to anything in recent history
          return !historySentences.some(histSent => getSimilarity(newSent, histSent) > 0.7);
        });

        if (filteredNew.length === 0) return prev;

        return prev.trim() + ' ' + filteredNew.join(' ').trim();
      });
      clearTranscript();
    }
  }, [isProcessing, transcript, clearTranscript]);

  const clearAll = () => {
    setHistory('');
    clearTranscript();
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Model Status - Floating Badge */}
      <div className="fixed top-6 right-6 z-50">
        <ModelStatus
          status={status}
          progress={progress}
          isReady={isReady}
          error={error}
        />
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center pt-24 pb-16 text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary-light text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Local AI Inference</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter gradient-text py-2">
            Typeless
          </h1>

          <p className="max-w-2xl text-muted-foreground text-xl md:text-2xl font-medium leading-tight">
            Privacy-first, browser-based audio transcription powered by WebGPU and OpenAI Whisper.
          </p>
        </section>

        {/* Hero Transcription Area */}
        <section className="mb-32 flex flex-col items-center">
          <AudioCapture
            onAudioCaptured={handleAudioCaptured}
            isProcessing={isProcessing}
            transcript={history ? history + ' ' + transcript : transcript}
            onStartRecording={clearTranscript}
          />
        </section>

        {/* Content Section: Editor */}
        <section className="mb-40 grid grid-cols-1 gap-12">
          <div className="w-full h-[600px]">
            <TranscriptEditor
              transcript={history ? history + '\n' + transcript : transcript}
              isProcessing={isProcessing}
              onClear={clearAll}
            />
          </div>
        </section>

        {/* Feature Sections */}
        <section className="pb-40 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center space-y-4 hover:bg-zinc-800/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">WebGPU Fast</h3>
            <p className="text-muted-foreground leading-relaxed">
              Audio is processed locally in your browser using <strong>WebGPU</strong> acceleration for near-instant results.
            </p>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center space-y-4 hover:bg-zinc-800/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">100% Private</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your data never leaves your device. No servers, no tracking. Just native browser privacy.
            </p>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center space-y-4 hover:bg-zinc-800/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">Offline Ready</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Whisper model is cached securely in your browser, allowing for instant transcription even without internet.
            </p>
          </div>
        </section>
      </div>

      {/* Modern Slim Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold tracking-tighter text-white/40">TYPELESS © {new Date().getFullYear()}</p>
          <div className="flex gap-8">
            <span className="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors cursor-pointer">Privacy</span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors cursor-pointer">Terms</span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors cursor-pointer">Github</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
