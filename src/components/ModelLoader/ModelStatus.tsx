'use client';

import React from 'react';
import { Loader2, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModelStatusProps {
    status: string;
    progress: number;
    isReady: boolean;
    error: string | null;
}

export function ModelStatus({ status, progress, isReady, error }: ModelStatusProps) {
    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500",
            isReady
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-ready"
                : "bg-[#6E4BFF]/10 border-[#6E4BFF]/30 text-[#9B87FF]",
            error && "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
            <div className="flex items-center gap-1.5 min-w-0">
                {error ? (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                ) : isReady ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                    <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                )}

                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                        {error ? "Error" : isReady ? "Engine Ready" : "Initializing"}
                    </span>
                    {!isReady && !error && progress > 0 && (
                        <div className="mt-1 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-[#6E4BFF] to-[#9B87FF] h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
