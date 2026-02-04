# 🌌 Locanote

> **The Private, P2P, and AI-Enhanced Workspace of 2026.**

Locanote is a next-generation collaborative workspace built for absolute privacy and seamless teamwork. By combining **Local-First architecture**, **Peer-to-Peer (P2P) synchronization**, and **Generative UI**, we've created a platform where you own your data, and the interface adapts to you.

👉 **Experience the Future**: [https://locanote.pages.dev](https://locanote.pages.dev)

---

## ✨ Features Built for the Modern Era

### 🎙️ AI-Enhanced Accessibility (100% Offline)

- **Edge AI Voice-to-Text**: Dictate your thoughts hands-free. Powered by **OpenAI Whisper**, the AI runs entirely in your browser. No voice data ever leaves your device.
- **Generative UI (GenUI)**: The interface morphs based on your intent using high-performance regex matching. Writing a recipe? **Chef Mode** activates with specialized timers. Coding? The environment cools into a **Developer Portal** with syntax-aware tools.
- **Performance-Aware Rendering**: Powered by **PerformanceScout**, the app dynamically adjusts visual fidelity (blur, particles, FPS) based on your device's hardware tier (Low/Medium/High).

### 📡 Teamwork Without Boundaries

- **Real-Time Collaboration**: Edit with others instantly via **WebRTC**. No central server, no lag, just instant sync.
- **Offline-First**: Keep working in the subway or a plane. Locanote automatically syncs your changes the moment you're back online.
- **Shared Element Transitions**: A fluid, cinematic interface where note cards physically morph into the editor for a "Portal" experience using the **View Transitions API**.

### 🔒 Unbreakable Privacy

- **End-to-End Encryption**: Every note is locked with a unique XSalsa20-Poly1305 key that stays on your hardware.
- **Zero-Knowledge Architecture**: Our signaling infrastructure is blind to your content. We don't have your keys, so we can't read your notes.
- **Secure Multi-Format Export**: Save your work anytime as Markdown, HTML, or high-fidelity PDF.

---

## 🎨 Atmospheric Engines

Locanote features a high-performance visual engine with reactive, fluid themes:

- **Nebula**: Dynamic canvas blobs that react to movement and mouse parallax.
- **Crystalline**: Sharp, futuristic geometric shards with high-refraction effects.
- **Aura**: Soft, low-power color clouds for maximum battery efficiency.
- **Static**: A minimal, low-fidelity mode for maximum performance on older devices.

---

## 🏗️ Technical Architecture (Graduation 2026)

Built with the cutting-edge stack of 2026:

- **Frontend**: SvelteKit 5 (Runes) + Tailwind CSS 4
- **Language**: 100% Type-Safe TypeScript with strict inference.
- **AI Layer**: Transformers.js (Whisper Tiny Q4) in a multi-threaded Web Worker
- **Distributed State**: Yjs (CRDT) for conflict-free P2P merging
- **Infrastructure**: Cloudflare Pages + Durable Objects for signaling
- **Testing**: Playwright Deep UI Scan for verified component stability.
- **Security**: XSalsa20-Poly1305 (TweetNaCl) + Passkey Authentication.

---

## 🧪 Quality & Verification

The codebase is strictly validated via:

- **Zero-Error Policy**: Passes `svelte-check` with 0 errors and 0 warnings.
- **UI Deep Scan**: A comprehensive E2E suite that verifies every button, modal, and GenUI intent transition across different performance tiers.

Built with ❤️ by [Bandi Akarsh](https://github.com/BandiAkarsh).
_Reclaiming data sovereignty for the decentralized web._
