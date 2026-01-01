import { pipeline, env } from "@huggingface/transformers";

// Configure transformers.js to use local assets if needed, 
// though by default it fetch from HF Hub and caches in Browser Cache API.
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber: any = null;

self.onmessage = async (event) => {
    const { type, model, audio, device } = event.data;

    try {
        switch (type) {
            case 'load':
                self.postMessage({ type: 'status', status: 'loading', message: `Loading ${model}...` });

                transcriber = await pipeline('automatic-speech-recognition', model, {
                    device: device || 'webgpu',
                    progress_callback: (p: any) => {
                        self.postMessage({ type: 'progress', progress: p });
                    }
                });

                self.postMessage({ type: 'status', status: 'ready', message: 'Model loaded successfully' });
                break;

            case 'transcribe':
                if (!transcriber) {
                    throw new Error('Model not loaded');
                }

                self.postMessage({ type: 'status', status: 'processing', message: 'Transcribing...' });

                const result = await transcriber(audio, {
                    chunk_length_s: 30,
                    stride_length_s: 5,
                    num_beams: 1,
                    max_new_tokens: 128,
                    callback_function: (beams: any) => {
                        try {
                            const decodedText = transcriber.tokenizer.decode(beams[0].output_token_ids, {
                                skip_special_tokens: true,
                            });
                            self.postMessage({
                                type: 'partial-result',
                                result: decodedText
                            });
                        } catch (e) {
                            console.error('Callback error:', e);
                        }
                    }
                });

                self.postMessage({ type: 'result', result });
                self.postMessage({ type: 'status', status: 'ready', message: 'Transcription complete' });
                break;
        }
    } catch (error: any) {
        self.postMessage({ type: 'error', error: error.message });
    }
};
