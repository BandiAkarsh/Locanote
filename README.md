# 📝 Locanote

**Locanote** is a next-generation, local-first, end-to-end encrypted collaborative note-taking application. Built with privacy and speed in mind, it allows you to capture ideas alone or collaborate with a team in real-time, all while maintaining total ownership of your data.

👉 **Live Site**: [https://locanote.pages.dev](https://locanote.pages.dev)

---

## 🌟 Key Features

- **🔒 Privacy First**: All notes are end-to-end encrypted using TweetNaCl. Your private keys never leave your device.
- **📡 Real-Time Collaboration**: Peer-to-peer sync via WebRTC and Yjs CRDTs. No central server sees your content.
- **🌗 Advanced Visual Engine**: 4 distinct styles including **Glass Design**, **Radium Cyberpunk**, and **Modern Inception**.
- **📶 Offline-Ready**: Works perfectly without an internet connection. Changes sync automatically when you're back online.
- **📱 PWA Support**: Install it on your phone or desktop for a native-like experience.
- **🔗 Smart Sharing**: Modern share menu with integration for WhatsApp, Telegram, X, and more.

## 🤝 Open for Collaboration

We are actively looking for contributors! Whether you are a designer, developer, or documentation wizard, your help is welcome.

**Areas where we need help:**

- **UI/UX Design**: Creating new visual themes or refining existing ones.
- **Backend/Edge**: Optimizing the signaling server performance.
- **Editor Extensions**: Adding support for tables, images, and math (LaTeX).
- **Mobile**: Improving the touch experience and PWA integration.

Check out our [CONTRIBUTING.md](./CONTRIBUTING.md) to get started!

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/BandiAkarsh/Locanote.git
cd Locanote

# Install dependencies
pnpm install

# Start development servers (Signaling + Frontend)
pnpm dev
```

## 🏗️ Architecture

- **Frontend**: SvelteKit 5, TipTap Editor, Tailwind CSS 4.
- **Sync Engine**: Yjs (CRDT) + y-webrtc.
- **Signaling**: Cloudflare Workers + Durable Objects.
- **Encryption**: XSalsa20-Poly1305 (TweetNaCl).
- **Storage**: IndexedDB (Local-first).

## 🧪 Testing

We use **Playwright** for robust E2E testing of our collaboration and theme engines.

```bash
cd apps/web
pnpm test          # Run all tests
pnpm test:headed   # Run with visible browser
```

---

Built with ❤️ by [Bandi Akarsh](https://github.com/BandiAkarsh) and the open-source community.
