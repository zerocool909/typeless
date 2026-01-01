export class AudioRecorder {
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private rawBuffer: Float32Array = new Float32Array(0);
    private lastEmittedIndex = 0;
    private onDataCallback?: (blob: Blob) => void;

    private downsample(buffer: Float32Array, fromRate: number, toRate: number): Float32Array {
        if (fromRate === toRate) return buffer;
        const ratio = fromRate / toRate;
        const newLength = Math.round(buffer.length / ratio);
        const result = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            const nextIndex = i * ratio;
            const leftIndex = Math.floor(nextIndex);
            const rightIndex = Math.ceil(nextIndex);
            const weight = nextIndex - leftIndex;

            if (rightIndex >= buffer.length) {
                result[i] = buffer[leftIndex];
            } else {
                result[i] = buffer[leftIndex] * (1 - weight) + buffer[rightIndex] * weight;
            }
        }
        return result;
    }

    async start(onData?: (blob: Blob) => void): Promise<void> {
        this.onDataCallback = onData;
        this.rawBuffer = new Float32Array(0);
        this.lastEmittedIndex = 0;
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            }
        });

        // Initialize at native sample rate (crucial for Windows stability)
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const nativeRate = this.audioContext.sampleRate;

        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        let lastEmitTime = Date.now();
        const EMIT_INTERVAL = 3000;

        this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);

            // Append to rawBuffer efficiently
            const newBuffer = new Float32Array(this.rawBuffer.length + inputData.length);
            newBuffer.set(this.rawBuffer);
            newBuffer.set(inputData, this.rawBuffer.length);
            this.rawBuffer = newBuffer;

            // Check if it's time to emit a chunk
            const now = Date.now();
            if (onData && now - lastEmitTime >= EMIT_INTERVAL) {
                const rawChunk = this.rawBuffer.slice(this.lastEmittedIndex);
                if (rawChunk.length > 0) {
                    // Resample to 16kHz for Whisper
                    const resampledChunk = this.downsample(rawChunk, nativeRate, 16000);
                    const blob = new Blob([resampledChunk.buffer as ArrayBuffer], { type: 'audio/raw-pcm' });
                    onData(blob);
                    this.lastEmittedIndex = this.rawBuffer.length;
                }
                lastEmitTime = now;
            }
        };
    }

    async stop(): Promise<Blob> {
        const nativeRate = this.audioContext?.sampleRate || 16000;

        if (this.audioContext) {
            await this.audioContext.close();
        }

        const rawChunk = this.rawBuffer.slice(this.lastEmittedIndex);
        const resampledChunk = this.downsample(rawChunk, nativeRate, 16000);
        const blob = new Blob([resampledChunk.buffer as ArrayBuffer], { type: 'audio/raw-pcm' });

        this.cleanup();
        return blob;
    }

    private cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        this.audioContext = null;
    }

    static async processAudio(blob: Blob): Promise<Float32Array> {
        if (blob.type === 'audio/raw-pcm') {
            const arrayBuffer = await blob.arrayBuffer();
            return new Float32Array(arrayBuffer);
        }

        // Fallback for file uploads
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
        });

        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        let audioData = audioBuffer.getChannelData(0);

        if (audioBuffer.numberOfChannels > 1) {
            for (let i = 1; i < audioBuffer.numberOfChannels; i++) {
                const channelData = audioBuffer.getChannelData(i);
                for (let j = 0; j < audioData.length; j++) {
                    audioData[j] += channelData[j];
                }
            }
            for (let j = 0; j < audioData.length; j++) {
                audioData[j] /= audioBuffer.numberOfChannels;
            }
        }

        await audioContext.close();
        return audioData;
    }
}
