import { useState, useCallback, useRef } from 'react';
import { AudioRecorder } from '@/lib/audio/recorder';

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const recorderRef = useRef<AudioRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = useCallback(async (onChunk?: (blob: Blob) => void) => {
        try {
            if (!recorderRef.current) {
                recorderRef.current = new AudioRecorder();
            }
            await recorderRef.current.start(onChunk);
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration((d) => d + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }, []);

    const stopRecording = useCallback(async () => {
        if (!recorderRef.current) return null;

        const blob = await recorderRef.current.stop();
        setIsRecording(false);
        setAudioBlob(blob);

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        return blob;
    }, []);

    return {
        isRecording,
        audioBlob,
        duration,
        startRecording,
        stopRecording,
    };
}
