'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AudioRecorder } from '@/lib/audio/recorder';

export function useTranscriber() {
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing...');
    const [transcript, setTranscript] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [queue, setQueue] = useState<Blob[]>([]);

    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize Web Worker
        const worker = new Worker(new URL('@/workers/inference.worker.ts', import.meta.url), {
            type: 'module'
        });

        worker.onmessage = (event) => {
            const { type, status, progress, result, error, message } = event.data;

            switch (type) {
                case 'status':
                    setStatus(message);
                    if (status === 'ready') setIsReady(true);
                    break;
                case 'progress':
                    if (progress.status === 'progress') {
                        setProgress(progress.progress);
                    }
                    break;
                case 'partial-result':
                    setTranscript(result);
                    break;
                case 'result':
                    setTranscript(result.text);
                    setIsProcessing(false);
                    break;
                case 'error':
                    setError(error);
                    setIsProcessing(false);
                    break;
            }
        };

        workerRef.current = worker;

        // Default model load
        worker.postMessage({
            type: 'load',
            model: 'onnx-community/whisper-tiny.en',
            device: 'webgpu'
        });

        return () => {
            worker.terminate();
        };
    }, []);

    // Handle the queue
    useEffect(() => {
        if (!isProcessing && isReady && queue.length > 0 && workerRef.current) {
            const nextBlob = queue[0];
            setQueue(prev => prev.slice(1));

            const starttranscribe = async () => {
                setIsProcessing(true);
                setError(null);
                try {
                    const audioData = await AudioRecorder.processAudio(nextBlob);
                    workerRef.current?.postMessage({
                        type: 'transcribe',
                        audio: audioData
                    });
                } catch (err: any) {
                    setError(err.message);
                    setIsProcessing(false);
                }
            };

            starttranscribe();
        }
    }, [isProcessing, isReady, queue]);

    const transcribe = useCallback((audioBlob: Blob) => {
        setQueue(prev => [...prev, audioBlob]);
    }, []);

    const clearTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isReady,
        isProcessing: isProcessing || queue.length > 0,
        progress,
        status,
        transcript,
        error,
        transcribe,
        clearTranscript
    };
}
