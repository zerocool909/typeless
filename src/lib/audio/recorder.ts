export class AudioRecorder {
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private processor: ScriptProcessorNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private rawBuffer: number[] = [];
    private lastEmittedIndex = 0;
    private onDataCallback?: (blob: Blob) => void;

    async start(onData?: (blob: Blob) => void): Promise<void> {
        this.onDataCallback = onData;
        this.rawBuffer = [];
        this.lastEmittedIndex = 0;
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
        });

        this.source = this.audioContext.createMediaStreamSource(this.stream);
        // Using 4096 buffer size for a balance of latency and stability
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        let lastEmitTime = Date.now();
        const EMIT_INTERVAL = 3000;

        this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);

            // Add to our raw buffer
            for (let i = 0; i < inputData.length; i++) {
                this.rawBuffer.push(inputData[i]);
            }

            // Check if it's time to emit a chunk
            const now = Date.now();
            if (onData && now - lastEmitTime >= EMIT_INTERVAL) {
                const chunk = new Float32Array(this.rawBuffer.slice(this.lastEmittedIndex));
                if (chunk.length > 0) {
                    const blob = new Blob([chunk.buffer], { type: 'audio/raw-pcm' });
                    onData(blob);
                    this.lastEmittedIndex = this.rawBuffer.length;
                }
                lastEmitTime = now;
            }
        };
    }

    async stop(): Promise<Blob> {
        if (this.audioContext) {
            await this.audioContext.close();
        }

        // Return only the final NEW samples transcribed since the last emit
        const chunk = new Float32Array(this.rawBuffer.slice(this.lastEmittedIndex));
        const blob = new Blob([chunk.buffer], { type: 'audio/raw-pcm' });

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

    /**
     * Converts the custom raw-pcm Blob back to Float32Array
     */
    static async processAudio(blob: Blob): Promise<Float32Array> {
        if (blob.type === 'audio/raw-pcm') {
            const arrayBuffer = await blob.arrayBuffer();
            return new Float32Array(arrayBuffer);
        }

        // Fallback for file uploads (non-streaming)
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
