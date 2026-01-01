'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Copy, Download, Eraser, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TranscriptEditorProps {
    transcript: string;
    isProcessing: boolean;
    onClear: () => void;
}

export function TranscriptEditor({ transcript, isProcessing, onClear }: TranscriptEditorProps) {
    const [editedText, setEditedText] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setEditedText(transcript);
    }, [transcript]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(editedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([editedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setEditedText('');
        onClear();
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    TRANSCRIPT
                </h3>

                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                        disabled={!editedText || isProcessing}
                    >
                        <Eraser className="w-3.5 h-3.5 mr-1.5" /> Clear
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                        disabled={!editedText}
                    >
                        {copied ? (
                            <><Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Copied</>
                        ) : (
                            <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy</>
                        )}
                    </Button>
                    <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleDownload}
                        className="text-[10px] font-black uppercase tracking-widest px-6"
                        disabled={!editedText}
                    >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Export
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative">
                <textarea
                    className={cn(
                        "w-full h-full bg-transparent border-none focus:ring-0 resize-none text-xl leading-extra-relaxed placeholder:text-white/10 scrollbar-hide font-medium"
                    )}
                    placeholder="Transcription will appear here..."
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                />

                {isProcessing && (
                    <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-primary-light rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">Listening</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
