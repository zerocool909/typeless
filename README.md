# Typeless 🎙️✨

**Speak more, type less.** Typeless is a premium, privacy-first audio transcription tool that runs entirely in your browser using **WebGPU** and **OpenAI's Whisper** model.

![Landing Page Preview](https://audiohelper.vercel.app/og-image.png)

---

## ✨ Features

- 🚀 **100% Local Inference**: Your audio never leaves your device. All processing is done on your local GPU.
- 🎧 **Hero Orb Interface**: A mesmerizing, Gladia-inspired pulsing orb for a focused recording experience.
- ⚡ **Real-time Feedback**: Live transcript overlay that prioritizes the *latest* words you speak.
- 🧹 **Automatic Noise Filtering**: Smartly strips non-speech tokens like `(whistling)` or `[BLANK_AUDIO]`.
- 📋 **Auto-Copy**: Instantly copy your transcript to the clipboard as soon as you stop speaking.
- ☁️ **Cloud-Free**: No API keys, no subscriptions, no tracking.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI Engine**: Hugging Face `transformers.js` (WebGPU Backend)
- **Model**: OpenAI Whisper (Local)
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React

---

## 🚀 Getting Started

Follow these steps to get Typeless running on your local machine in less than 2 minutes.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **NPM** or **PNPM**
- **Modern Browser**: Chrome, Edge, or any browser with [WebGPU support](https://caniuse.com/webgpu).

### 2. Clone the Repository
```bash
git clone https://github.com/zerocool909/typeless.git
cd typeless
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and start speaking!

---

## 🏗️ Production Build

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## 🌍 Deployment

Typeless is optimized for **Vercel**. Since it's a client-side heavy application, it scales perfectly on any static hosting provider.

1. Push your code to GitHub.
2. Link your repository to Vercel.
3. Done! 🚀

---

## 🛡️ Privacy

Typeless is built on the principle of **Local-First AI**. Your voice is transcribed into text using your browser's hardware. We do not store, send, or analyze your audio data on any server.

---

## 📄 License

MIT © [zerocool909](https://github.com/zerocool909)
