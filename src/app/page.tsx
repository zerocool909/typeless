'use client';

import { useState, useRef, useEffect } from 'react';
import { AudioCapture } from '@/components/AudioCapture/AudioCapture';
import { ModelStatus } from '@/components/ModelLoader/ModelStatus';
import { useTranscriber } from '@/hooks/useTranscriber';
import { Brain, Sparkles, FileText } from 'lucide-react';
import ASMRBackground from '@/components/ui/ASMRBackground';

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
    <main className="min-h-screen text-white selection:bg-primary/30 relative overflow-x-hidden antialiased">
      <ASMRBackground />

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
        <section className="relative pt-32 pb-16 px-4 flex flex-col items-center text-center overflow-hidden">
          <h1 className="text-8xl md:text-9xl font-black mb-8 tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-br from-white via-primary-light to-primary animate-in fade-in zoom-in duration-1000 font-outfit leading-none py-2">
            Typeless
          </h1>
          <p className="max-w-2xl text-xl md:text-3xl text-white/40 font-bold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Speak more, type less.
          </p>
          <p className="max-w-xl text-lg md:text-xl text-zinc-500 font-medium tracking-tight leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 mt-4">
            Fast and private transcription, powered by WebGPU and OpenAI Whisper.
          </p>
        </section>

        {/* Hero Transcription Area */}
        <section className="mb-32 flex flex-col items-center px-4">
          <AudioCapture
            onAudioCaptured={handleAudioCaptured}
            isProcessing={isProcessing}
            transcript={history ? history + ' ' + transcript : transcript}
            onStartRecording={clearTranscript}
            onTranscriptChange={setHistory}
            onClear={clearAll}
          />
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
