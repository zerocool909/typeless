'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Mic, Square, Upload, Globe, FileAudio, Check, Copy } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { cn } from '@/lib/utils/cn';

interface AudioCaptureProps {
    onAudioCaptured: (blob: Blob, isFinal: boolean) => void;
    isProcessing?: boolean;
    transcript?: string;
    onStartRecording?: () => void;
}

type InputMode = 'mic' | 'tab' | 'file';

export function AudioCapture({ onAudioCaptured, isProcessing, transcript, onStartRecording }: AudioCaptureProps) {
    const { isRecording, duration, startRecording, stopRecording } = useAudioRecorder();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [inputMode, setInputMode] = useState<InputMode>('mic');
    const [autoCopy, setAutoCopy] = useState(true);
    const [copied, setCopied] = useState(false);

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            const blob = await stopRecording();
            if (blob) onAudioCaptured(blob, true);
        } else {
            onStartRecording?.();
            await startRecording((blob) => onAudioCaptured(blob, false));
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onAudioCaptured(file, true);
        }
    };

    const handleCopy = async () => {
        if (transcript && typeof window !== 'undefined') {
            try {
                await navigator.clipboard.writeText(transcript);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.warn('Auto-copy failed:', err);
            }
        }
    };

    useEffect(() => {
        if (autoCopy && transcript && !isProcessing && !isRecording) {
            handleCopy();
        }
    }, [transcript, isProcessing, isRecording, autoCopy]);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Input Selectors (Pills) */}
            <div className="flex bg-zinc-900/80 p-1 rounded-full border border-white/5 mb-12 backdrop-blur-md">
                <button
                    onClick={() => setInputMode('mic')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest",
                        inputMode === 'mic' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    )}
                >
                    <Mic className="w-3.5 h-3.5" />
                    Microphone
                </button>
                <button
                    onClick={() => setInputMode('tab')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest",
                        inputMode === 'tab' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    )}
                >
                    <Globe className="w-3.5 h-3.5" />
                    Browser Tab
                </button>
                <button
                    onClick={() => {
                        setInputMode('file');
                        fileInputRef.current?.click();
                    }}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest",
                        inputMode === 'file' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    )}
                >
                    <FileAudio className="w-3.5 h-3.5" />
                    File
                </button>
            </div>

            {/* Hero Orb Section */}
            <div className="relative group cursor-pointer" onClick={handleToggleRecording}>
                {/* Massive Backdrop Glow */}
                <div className={cn(
                    "absolute -inset-24 rounded-full blur-[100px] transition-all duration-1000 opacity-60",
                    isRecording
                        ? "bg-red-500/20"
                        : "bg-primary/20 group-hover:bg-primary/30"
                )} />

                {/* Purple Orb */}
                <div className="relative">
                    {isRecording ? (
                        <div className="relative">
                            <div className="orb-container scale-150">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="orb-layer"
                                        style={{
                                            '--i': i,
                                            '--inset': `${i * 12}px`,
                                        } as React.CSSProperties}
                                    />
                                ))}
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    {/* Central stop indicator removed for cleaner look */}
                                </div>
                            </div>

                            {/* Live Transcript Overlay */}
                            <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                                <div className="max-w-[320px] text-center animate-in fade-in zoom-in duration-500">
                                    <p className="text-white text-base font-bold leading-tight drop-shadow-2xl line-clamp-4 tracking-tight">
                                        {(() => {
                                            const clean = (transcript || "")
                                                .replace(/\[[^\]]*\]/g, '')
                                                .replace(/\([^)]*\)/g, '')
                                                .replace(/\s+/g, ' ')
                                                .trim();

                                            if (!clean) return "Listening...";

                                            const words = clean.split(/\s+/);
                                            return words.slice(-15).join(" ");
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-56 h-56 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-light via-primary to-indigo-700 shadow-[0_0_100px_rgba(110,75,255,0.4)] transition-transform duration-500 group-hover:scale-105">
                            <div className="absolute inset-2 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/20" />
                            <div className="z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
                                <Mic className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Indicator (Floating) */}
                {isRecording && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white text-red-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        <span>Recording • {formatDuration(duration)}</span>
                    </div>
                )}
            </div>

            {/* CTA Button & Actions Row */}
            <div className="mt-24 w-full max-w-lg flex flex-col items-center gap-8">
                <button
                    onClick={handleToggleRecording}
                    disabled={isProcessing}
                    className={cn(
                        "w-full max-w-xs py-5 rounded-full font-black text-xl transition-all duration-500 shadow-2xl hover:translate-y-[-2px]",
                        isRecording
                            ? "bg-white text-red-600 hover:shadow-red-500/20"
                            : "bg-white text-black hover:shadow-primary/20"
                    )}
                >
                    {isRecording ? 'Stop Recording' : 'Test it live'}
                </button>

                <div className="flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            className={cn(
                                "w-10 h-5 rounded-full transition-all relative border border-white/10",
                                autoCopy ? "bg-primary" : "bg-white/5"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                setAutoCopy(!autoCopy);
                            }}
                        >
                            <div className={cn(
                                "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-md",
                                autoCopy ? "left-5.5" : "left-0.5"
                            )} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">Auto-copy</span>
                    </label>

                    {transcript && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied' : 'Copy Full'}
                        </button>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
            />
        </div>
    );
}
