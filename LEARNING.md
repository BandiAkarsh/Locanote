# Building the Future of Private Collaboration

Locanote is a case study in modern distributed systems, local-first architecture, and zero-knowledge security. Here is the technical journey behind its creation.

---

## 🏗️ Core Architecture

### 1. Local-First Design
Most apps use the "Cloud-First" model (Server is the source of truth). Locanote uses the "Local-First" model (Your Device is the source of truth).
- **Benefits**: Instant performance, offline capabilities, and total data ownership.
- **Tech**: [Yjs](https://yjs.dev/) handles the merging of data across devices without a central database.

### 2. Peer-to-Peer Networking
We bypass traditional servers for data transfer. 
- **Mechanism**: **WebRTC** allows browsers to talk directly to each other.
- **Handshake**: I built a lightweight signaling server using **Cloudflare Workers** and **Durable Objects**. It introduces peers to each other, but the actual note content never passes through it.

### 3. End-to-End Encryption (E2EE)
Security isn't an afterthought—it's the foundation.
- **Algorithm**: XSalsa20-Poly1305 (via TweetNaCl).
- **Key Exchange**: Encryption keys are stored in the URL fragment (`#key=...`), which is handled purely by the browser and is never sent to any server.

---

## 🎙️ AI & Accessibility (2026 Features)

### Persistent Voice-to-Text
I implemented a robust wrapper around the browser's native Speech Recognition. 
- **Persistence**: Unlike standard implementations that quit after 5 seconds of silence, Locanote uses an auto-restart loop to provide a "Dictation Mode" that stays active for long-form writing.

### Context-Aware Templates
The template system uses a **Session Vault** pattern. When a template is selected, its structure is staged in the browser session and injected into the editor during initialization. This prevents conflicts and ensures 100% reliable document creation.

---

## 🎨 Design System: The Linear Aesthetic

I chose a "Physical" design system inspired by high-end software like Linear and Notion.
- **Depth System**: I used 4 distinct layers of shadows and blurs to define visual hierarchy.
- **Glow Engine**: Active tools in the toolbar feature a real-time glowing border to provide clear tactile feedback.

---

## 🚀 Key Takeaways

1. **Distributed Systems require Event-Log thinking**: You don't "update a field," you "append a change."
2. **Privacy is a UX challenge**: Making complex encryption invisible to the user is the hardest part of security engineering.
3. **P2P scales better**: By offloading computation and bandwidth to the users, we create software that is both cheaper to run and more resilient.

---

Built for the future of the web. Deployed on the Edge. 🚀
