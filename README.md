# Locanote

> A local-first, end-to-end encrypted collaborative note-taking application

[![Svelte](https://img.shields.io/badge/Svelte-5.0-ff3e00?logo=svelte)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT-green)](https://yjs.dev)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-333333?logo=webrtc)](https://webrtc.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Security](#security)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Overview

Locanote is a privacy-focused, collaborative note-taking application built with modern web technologies. It combines the power of **local-first architecture** with **real-time collaboration**, ensuring your data remains private and accessible even offline.

### Key Principles

- **Local-First**: Your data lives on your device first, cloud second
- **Privacy by Design**: End-to-end encryption keeps your notes truly private
- **Real-time Collaboration**: Edit together with peers via WebRTC P2P connections
- **Offline-First**: Full functionality without an internet connection
- **Modern UX**: Beautiful, responsive interface with dark mode support

## Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Rich Text Editor** | Full-featured editor with formatting, lists, and tasks | ✅ |
| **Offline Support** | Complete offline functionality with automatic sync | ✅ |
| **Dark Mode** | Automatic and manual theme switching | ✅ |
| **Tags & Organization** | Categorize notes with color-coded tags | ✅ |
| **Export** | Export notes to HTML and Markdown | ✅ |

### Authentication & Security

| Feature | Description | Status |
|---------|-------------|--------|
| **WebAuthn/Passkeys** | Passwordless authentication with biometrics | ✅ |
| **Password Login** | Traditional password-based authentication | ✅ |
| **End-to-End Encryption** | XSalsa20-Poly1305 encryption for collaboration | ✅ |
| **Local Storage** | All data stored locally in IndexedDB | ✅ |

### Collaboration

| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time Collaboration** | Edit simultaneously with multiple users | ✅ |
| **Live Cursors** | See where others are typing | ✅ |
| **Conflict Resolution** | Automatic merge with CRDTs (no conflicts) | ✅ |
| **P2P Connections** | Direct browser-to-browser communication | ✅ |

### Advanced Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Service Worker** | Background sync and offline caching | ✅ |
| **Keyboard Shortcuts** | Power-user shortcuts for efficiency | ✅ |
| **Responsive Design** | Works on desktop, tablet, and mobile | ✅ |
| **PWA Ready** | Installable as a Progressive Web App | ✅ |

## Tech Stack

### Frontend

```
SvelteKit 5          - Modern reactive framework with runes
TypeScript 5         - Type-safe development
Tailwind CSS 4       - Utility-first styling
TipTap Editor        - ProseMirror-based rich text editor
```

### Collaboration & Data

```
Yjs                  - CRDT library for conflict-free collaboration
y-webrtc             - WebRTC provider for P2P connections
y-indexeddb          - IndexedDB persistence for Yjs documents
```

### Authentication & Security

```
WebAuthn API         - Native passkey/passwordless auth
tweetnacl            - XSalsa20-Poly1305 E2E encryption
idb                  - IndexedDB wrapper with TypeScript support
```

### Infrastructure

```
Cloudflare Workers   - WebRTC signaling server
Durable Objects      - Room state management
KV Storage           - Room metadata persistence
```

### Build Tools

```
Vite 6               - Next-gen build tool
Turborepo            - Monorepo task runner
pnpm                 - Fast, disk-space efficient package manager
```

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                           │
│              (SvelteKit 5 + Tailwind CSS)                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  Application Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Editor     │  │     Auth     │  │   Themes     │      │
│  │   (TipTap)   │  │  (WebAuthn)  │  │  (Svelte 5)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                Collaboration Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Yjs      │  │   WebRTC     │  │     E2E      │      │
│  │    (CRDT)    │  │   (P2P)      │  │  (NaCl)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  IndexedDB   │  │  IndexedDB   │  │ LocalStorage │      │
│  │   (Yjs)      │  │  (Metadata)  │  │  (Settings)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. **Editor Layer** (`lib/editor/`)

The rich text editor is built on **TipTap** (ProseMirror abstraction) with Yjs integration:

- **Editor.svelte**: Main editor component with collaboration
- **Toolbar.svelte**: Formatting controls
- **extensions.ts**: Custom TipTap extensions

**Features:**
- Rich text formatting (bold, italic, headings, lists)
- Task lists with checkboxes
- Text highlighting
- Typography enhancements (smart quotes, em dashes)
- Collaborative cursors showing other users
- Placeholder text when empty

#### 2. **CRDT Layer** (`lib/crdt/`)

**Yjs** powers our conflict-free collaborative editing:

- **doc.svelte.ts**: Document management and persistence
- **providers.ts**: WebRTC provider configuration

**How it works:**
1. Each note has a Yjs `Y.Doc` instance
2. Document contains `Y.XmlFragment` for editor content
3. `y-indexeddb` persists to browser storage
4. `y-webrtc` syncs with peers over WebRTC

#### 3. **Authentication Layer** (`lib/auth/`)

Multiple authentication methods for flexibility:

- **webauthn.svelte.ts**: Passkey registration and login
- **password.svelte.ts**: Password-based authentication
- **challenge.ts**: Cryptographic challenge generation
- **types.ts**: Auth type definitions

**Security Features:**
- Client-side credential verification
- No server storage of private keys
- Biometric/PIN verification via WebAuthn

#### 4. **Encryption Layer** (`lib/crypto/`)

End-to-end encryption using **TweetNaCl**:

- **e2e.ts**: Room key management and encryption

**Encryption Scheme:**
- Algorithm: XSalsa20-Poly1305 (authenticated encryption)
- Keys: 32-byte random keys per room
- Storage: Keys kept in memory only (never persisted)
- Key Derivation: Password-based with salt

#### 5. **Database Layer** (`lib/db/`)

**IndexedDB** stores via the `idb` library:

- **index.ts**: Database schema and initialization
- **users.ts**: User profile management
- **credentials.ts**: Auth credential storage
- **notes.ts**: Note metadata (not content)
- **tags.ts**: Tag definitions

**Schema:**
```typescript
interface User { id, username, createdAt, lastLoginAt }
interface Credential { id, userId, type, publicKey, credentialId }
interface Note { id, userId, title, tags, createdAt, updatedAt, yjsDocId }
interface Tag { id, userId, name, color, createdAt }
```

#### 6. **Service Worker** (`service-worker.js`)

Enables offline functionality and PWA features:

- **Caching**: Static assets cached for offline use
- **Strategies**: 
  - Cache-first for assets (JS, CSS, images)
  - Network-first for HTML pages
- **Background Sync**: Queue changes when offline
- **Push Notifications**: Framework for future notifications

#### 7. **Signaling Server** (`packages/signaling/`)

**Cloudflare Worker** facilitates WebRTC connections:

- **index.ts**: WebSocket upgrade handling
- **room.ts**: Durable Object for room management

**Role:**
- ONLY helps peers find each other
- Never sees document content
- Relays signaling messages (offers/answers/ICE)
- Once P2P established, server is out of the loop

## Installation

### Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** >= 10.0.0

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/locanote.git
cd locanote

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Setting Up the Signaling Server

The WebRTC signaling server runs on Cloudflare Workers:

```bash
# Navigate to signaling package
cd packages/signaling

# Install dependencies
pnpm install

# Configure wrangler.toml
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml with your settings

# Deploy to Cloudflare
pnpm deploy
```

**wrangler.toml configuration:**
```toml
name = "locanote-signaling"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ALLOWED_ORIGINS = "https://locanote.app, https://localhost:5173"
MAX_PEERS_PER_ROOM = "10"
ROOM_TIMEOUT_MS = "3600000"

[[durable_objects.bindings]]
name = "SIGNALING_ROOMS"
class_name = "SignalingRoom"

[[migrations]]
tag = "v1"
new_classes = ["SignalingRoom"]
```

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Variables

Create `.env` in `apps/web/`:

```env
# Signaling server URL
PUBLIC_SIGNALING_URL=wss://your-signaling-server.workers.dev

# App configuration
PUBLIC_APP_NAME=Locanote
PUBLIC_APP_URL=https://locanote.app
```

## Usage

### Getting Started

1. **Open the app** in your browser at `http://localhost:5173`
2. **Register** with a username and passkey (Face ID, Touch ID, or PIN)
3. **Create your first note** from the dashboard
4. **Start typing** - your note is automatically saved locally

### Creating Notes

1. Click the **"New Note"** button on the dashboard
2. Enter a title and start typing in the editor
3. Use the toolbar or keyboard shortcuts for formatting
4. Add tags to organize your notes

### Real-time Collaboration

1. **Share the note URL** with collaborators (e.g., `/app/note/abc123`)
2. **Collaborators open the link** and authenticate
3. **Edit simultaneously** - changes sync in real-time
4. **See live cursors** showing where others are typing

### Offline Usage

- The app works **completely offline**
- Changes are **queued for sync** when connection returns
- **Service worker** caches the app for offline access
- All data is stored **locally in IndexedDB**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + K` | Insert link |
| `Ctrl/Cmd + Shift + 7` | Numbered list |
| `Ctrl/Cmd + Shift + 8` | Bulleted list |
| `Ctrl/Cmd + /` | Toggle dark mode |

### Exporting Notes

1. Open the note you want to export
2. Click the **Export** button in the toolbar
3. Choose format: **HTML** or **Markdown**
4. File downloads automatically

## Project Structure

```
locanote/
├── apps/
│   └── web/                    # Main SvelteKit application
│       ├── src/
│       │   ├── routes/         # SvelteKit routes
│       │   │   ├── +page.svelte       # Landing page
│       │   │   ├── app/               # App routes
│       │   │   │   ├── +page.svelte   # Dashboard
│       │   │   │   └── note/[id]/     # Note editor
│       │   │   └── +layout.svelte     # Root layout
│       │   ├── lib/
│       │   │   ├── auth/       # Authentication modules
│       │   │   │   ├── webauthn.svelte.ts
│       │   │   │   ├── password.svelte.ts
│       │   │   │   └── types.ts
│       │   │   ├── components/ # Svelte components
│       │   │   │   ├── Button.svelte
│       │   │   │   ├── Modal.svelte
│       │   │   │   └── Toast.svelte
│       │   │   ├── crdt/       # Yjs/CRDT modules
│       │   │   │   ├── doc.svelte.ts
│       │   │   │   └── providers.ts
│       │   │   ├── crypto/     # Encryption modules
│       │   │   │   └── e2e.ts
│       │   │   ├── db/         # IndexedDB modules
│       │   │   │   ├── index.ts
│       │   │   │   ├── users.ts
│       │   │   │   ├── notes.ts
│       │   │   │   └── tags.ts
│       │   │   ├── editor/     # Editor components
│       │   │   │   ├── Editor.svelte
│       │   │   │   └── Toolbar.svelte
│       │   │   ├── export/     # Export utilities
│       │   │   │   ├── html.ts
│       │   │   │   └── markdown.ts
│       │   │   ├── keyboard/   # Keyboard shortcuts
│       │   │   │   └── shortcuts.ts
│       │   │   └── stores/     # Svelte 5 stores
│       │   │       ├── auth.svelte.ts
│       │   │       ├── theme.svelte.ts
│       │   │       └── network.svelte.ts
│       │   ├── app.html        # HTML template
│       │   ├── app.css         # Global styles
│       │   ├── app.d.ts        # Type declarations
│       │   └── service-worker.js # PWA service worker
│       ├── static/             # Static assets
│       ├── package.json
│       ├── svelte.config.js
│       └── vite.config.ts
│
├── packages/
│   └── signaling/              # WebRTC signaling server
│       ├── src/
│       │   ├── index.ts        # Worker entry point
│       │   └── room.ts         # Durable Object
│       ├── wrangler.toml
│       └── package.json
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace config
├── turbo.json                  # Turborepo configuration
└── README.md                   # This file
```

### Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/lib/editor/Editor.svelte` | Main collaborative editor |
| `apps/web/src/lib/crdt/doc.svelte.ts` | Yjs document management |
| `apps/web/src/lib/crypto/e2e.ts` | End-to-end encryption |
| `apps/web/src/lib/auth/webauthn.svelte.ts` | Passkey authentication |
| `apps/web/src/service-worker.js` | Offline/PWA support |
| `packages/signaling/src/index.ts` | WebRTC signaling server |

## Security

### Security Model

Locanote is designed with privacy as the top priority:

```
┌──────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Local-First                                        │
│  • Data stored on device first                               │
│  • No cloud dependency for core functionality                │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: E2E Encryption                                     │
│  • XSalsa20-Poly1305 encryption for all collaboration        │
│  • Keys never leave the device                               │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: WebAuthn                                           │
│  • Biometric/PIN authentication                              │
│  • No passwords stored on server                             │
├──────────────────────────────────────────────────────────────┤
│  Layer 4: WebRTC P2P                                         │
│  • Direct browser-to-browser connections                     │
│  • Signaling server sees only metadata                       │
└──────────────────────────────────────────────────────────────┘
```

### End-to-End Encryption

**Algorithm:** XSalsa20-Poly1305 (NaCl standard)

**Key Properties:**
- **Confidentiality**: Only room members with the key can read content
- **Authenticity**: Tampered messages are detected and rejected
- **Forward Secrecy**: Compromised key doesn't reveal past messages

**Key Management:**
```typescript
// Generate random 32-byte key
const key = generateRoomKey();

// Or derive from password
const { key, salt } = deriveKeyFromPassword(password);

// Store in memory only
storeRoomKey(roomId, key);

// Encrypt before sending
const encrypted = encryptMessage(message, key);

// Decrypt on receipt
const decrypted = decryptMessage(encrypted, key);
```

### Privacy Guarantees

| What | How | Guarantee |
|------|-----|-----------|
| Note Content | Yjs + E2E Encryption | Only you and collaborators can read |
| Authentication | WebAuthn | No passwords on our servers |
| Collaboration | WebRTC P2P | Direct connection, no middleman |
| Storage | IndexedDB | Data stays on your device |
| Metadata | Minimal collection | We don't track your usage |

### Threat Model

**Protected Against:**
- Server compromise (no access to content)
- Network eavesdropping (E2E encrypted)
- Man-in-the-middle attacks (DTLS + NaCl)
- Offline data access (device encryption)

**Not Protected Against:**
- Device compromise (malware with root access)
- Shoulder surfing (use privacy screens)
- Collaborator betrayal (they have the key)

## Screenshots

> Note: Add your own screenshots here

```markdown
![Dashboard](screenshots/dashboard.png)
*Main dashboard showing all your notes with search and tags*

![Editor](screenshots/editor.png)
*Collaborative editor with formatting toolbar and live cursors*

![Dark Mode](screenshots/dark-mode.png)
*The same editor in dark mode - automatically follows system preference*

![Collaboration](screenshots/collaboration.png)
*Multiple users editing simultaneously with live cursors*

![Mobile](screenshots/mobile.png)
*Responsive design works great on mobile devices*
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/locanote.git

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Svelte**: Follow Svelte 5 runes patterns
- **CSS**: Tailwind CSS utility classes
- **Linting**: Prettier + ESLint

## Learning Resources

For a deep dive into the technical decisions and what we learned building Locanote, see [LEARNING.md](./LEARNING.md).

Topics covered:
- Svelte 5 runes patterns
- CRDTs and Yjs internals
- WebRTC deep dive
- Security considerations
- Challenges and solutions

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using SvelteKit, Yjs, and WebRTC**

*Your notes, your control.*
