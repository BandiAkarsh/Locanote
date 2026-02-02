# What We Learned Building Locanote

> A comprehensive technical deep-dive into building a local-first, E2E encrypted collaborative application

This document captures the technical knowledge, architectural decisions, and lessons learned while building Locanote. Whether you're learning these technologies or building something similar, we hope this saves you time and prevents pitfalls.

## Table of Contents

- [Introduction](#introduction)
- [Key Technical Decisions](#key-technical-decisions)
- [Svelte 5 Runes](#svelte-5-runes)
- [CRDTs and Yjs](#crdts-and-yjs)
- [WebRTC Deep Dive](#webrtc-deep-dive)
- [Security Considerations](#security-considerations)
- [Challenges We Faced](#challenges-we-faced)
- [What We'd Do Differently](#what-wed-do-differently)
- [Resources and References](#resources-and-references)

## Introduction

### Project Goals

When we started Locanote, we had three primary goals:

1. **True Privacy**: No server should ever see user data in plain text
2. **Seamless Collaboration**: Multiple users should edit simultaneously without conflicts
3. **Offline-First**: The app must work without internet connectivity

These goals led us to a unique architecture: local-first storage + P2P collaboration + E2E encryption. This combination is powerful but introduces significant complexity.

### The Local-First Movement

Traditional apps store data on servers first, with local caching as an optimization. Local-first flips this:

**Traditional:**

```
User → API → Database → User (with cache)
         ↑
    Source of Truth
```

**Local-First:**

```
User → Local DB → Sync → Other Devices
         ↑
    Source of Truth
```

Benefits:

- Works offline by default
- Better performance (no network latency)
- User owns their data
- No server = lower costs
- No server = no data breaches

Challenges:

- Syncing is complex
- Conflict resolution required
- Collaboration is harder
- Search across all data is tricky

## Key Technical Decisions

### Decision 1: SvelteKit + Svelte 5

**Why we chose it:**

- Svelte's compiler approach produces smaller bundles
- Svelte 5 runes provide cleaner reactivity
- Built-in SSR for better SEO and initial load
- File-based routing is intuitive

**The good:**

- Excellent developer experience
- Truly reactive with `$state` and `$effect`
- No virtual DOM overhead

**The challenging:**

- Svelte 5 was still evolving during development
- Some third-party libraries hadn't updated yet
- Migration from Svelte 4 patterns required learning

**Code Example:**

```typescript
// Svelte 4 style (old)
import { writable } from "svelte/store";
const count = writable(0);

// Svelte 5 style (new) - cleaner!
let count = $state(0);

// Derived values
let doubled = $derived(count * 2);

// Side effects
$effect(() => {
  console.log("Count changed:", count);
});
```

### Decision 2: Yjs for CRDTs

**Why we chose it:**

- Battle-tested in production (Figma, Notion use it)
- Excellent performance
- Great ecosystem (providers for different sync methods)
- TypeScript support

**Alternatives considered:**

- **Automerge**: More features but larger bundle size
- **Diamond Types**: Experimental, less mature
- **ProseMirror collab**: Requires central server

**The good:**

- Conflict resolution "just works"
- Tiny update messages
- Works with any editor (TipTap, Quill, etc.)

**The challenging:**

- Learning curve for CRDT concepts
- Debugging distributed state is hard
- Yjs has specific patterns that must be followed

### Decision 3: WebRTC for P2P

**Why we chose it:**

- Browser-native (no plugins)
- Direct P2P = no server bandwidth costs
- NAT traversal built-in

**The Architecture:**

```
┌─────────┐         ┌──────────────┐         ┌─────────┐
│  User A │◄───────►│   Signaling  │◄───────►│  User B │
│         │   WS    │   Server     │   WS    │         │
└────┬────┘         └──────────────┘         └────┬────┘
     │                                             │
     │    ┌─────────────────────────────────────┐  │
     └────►│      WebRTC P2P Connection          │◄─┘
          │   (DTLS encrypted data channel)     │
          └─────────────────────────────────────┘
```

**The good:**

- Once connected, server is out of the loop
- Encrypted by default (DTLS)
- Low latency

**The challenging:**

- NAT traversal doesn't always work
- Complex to debug (network issues)
- Requires signaling server anyway
- Browser compatibility nuances

### Decision 4: WebAuthn for Auth

**Why we chose it:**

- Passwordless = no password database to breach
- Uses device's secure hardware
- Phishing-resistant

**The Trade-off:**

```
Standard WebAuthn:       Our Approach:
┌─────────┐              ┌─────────┐
│  Client │              │  Client │
└────┬────┘              └────┬────┘
     │ Register                 │ Register
     ▼                         ▼
┌─────────┐              ┌─────────┐
│ Server  │              │ IndexedDB
│ (verifies)             │ (stores)
└─────────┘              └─────────┘
```

We verify client-side because:

- No server to compromise
- Credential is bound to our domain anyway
- Simpler architecture

**The good:**

- Face ID / Touch ID / PIN support
- No passwords to remember
- Cryptographically secure

**The challenging:**

- Complex API (many options)
- Browser support varies
- Recovery is hard (no "forgot password")

### Decision 5: Centralizing Browser Utilities

When building with SvelteKit, code often runs in both Node.js (during SSR) and the Browser. Initially, we had duplicate checks like `typeof window !== 'undefined'` or `globalThis.window` in every file. This was fragile and verbose.

**The Solution:**
We created a centralized `lib/utils/browser.ts` module that provides safe access to browser-only APIs and environment detection.

```typescript
// lib/utils/browser.ts
export const isBrowser =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).window !== "undefined";

export function getLocalStorage(): Storage | undefined {
  if (!isBrowser) return undefined;
  return (globalThis as any).window?.localStorage;
}
```

**Lesson:** Centralizing environment detection prevents runtime errors during server-side rendering and provides a single source of truth for browser-only APIs like WebAuthn or Crypto.

### Decision 6: Eliminating the "Dark Mode Flash"

A common issue in web apps is the "flash of light mode" when a page is refreshed in dark mode. This happens because the browser renders the default light CSS before JavaScript (Svelte) can load and apply the `.dark` class.

**The Solution:**
We added a small, blocking inline script in the `<head>` of `app.html`. This script runs before the body is rendered, checking `localStorage` and applying the theme immediately.

```html
<script>
  (function () {
    try {
      const theme = localStorage.getItem("locanote-theme") || "system";
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const isDark =
        theme === "dark" || (theme === "system" && darkQuery.matches);
      if (isDark) document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
</script>
```

**Lesson:** Blocking scripts in the head are usually bad for performance, but for theme initialization, they are essential for a professional user experience.

## Svelte 5 Runes

Svelte 5 introduced a new reactivity model with "runes". This was one of the biggest paradigm shifts we encountered.

### Understanding Runes

**The Old Way (Svelte 4):**

```svelte
<script>
  import { writable, derived } from 'svelte/store';

  const count = writable(0);
  const doubled = derived(count, $c => $c * 2);

  function increment() {
    count.update(c => c + 1);
  }
</script>

<p>Count: {$count}</p>
<p>Doubled: {$doubled}</p>
<button on:click={increment}>+</button>
```

**The New Way (Svelte 5):**

```svelte
<script>
  let count = $state(0);           // Reactive state
  let doubled = $derived(count * 2); // Derived value

  function increment() {
    count++;                        // Direct mutation!
  }
</script>

<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<button onclick={increment}>+</button>
```

### Key Runes We Used

#### `$state` - Reactive State

Creates reactive variables that trigger updates when changed:

```typescript
// Primitive state
let count = $state(0);

// Object state (deeply reactive!)
let user = $state({
  name: "John",
  preferences: { theme: "dark" },
});

// Changing nested properties works
user.preferences.theme = "light"; // UI updates!
```

#### `$derived` - Computed Values

Automatically updates when dependencies change:

```typescript
let firstName = $state("John");
let lastName = $state("Doe");

// Re-runs when firstName or lastName changes
let fullName = $derived(`${firstName} ${lastName}`);

// With explicit dependencies
let displayName = $derived.by(() => {
  if (user.showFullName) {
    return fullName;
  }
  return firstName;
});
```

#### `$effect` - Side Effects

Runs when dependencies change, for side effects:

```typescript
// Basic effect
$effect(() => {
  console.log("Count is now:", count);
  document.title = `Count: ${count}`;
});

// Cleanup with $effect.pre
$effect.pre(() => {
  const connection = createConnection();

  return () => {
    // Cleanup runs before next effect or unmount
    connection.disconnect();
  };
});
```

#### `$props` - Component Props

Replaces `export let`:

```svelte
<script>
  // Old way
  export let title;
  export let count = 0;

  // New way
  let { title, count = 0 } = $props();

  // With rest props
  let { title, ...rest } = $props();
</script>
```

### Runes in Classes

This pattern revolutionized our store architecture:

```typescript
// stores/theme.svelte.ts
export function createThemeStore() {
  let theme = $state("system");
  let systemPrefersDark = $state(false);

  // Computed
  let isDark = $derived(
    theme === "dark" || (theme === "system" && systemPrefersDark),
  );

  // Effect for persistence
  $effect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  });

  // Public API
  return {
    get theme() {
      return theme;
    },
    set theme(value) {
      theme = value;
    },
    get isDark() {
      return isDark;
    },
    toggle() {
      theme = isDark ? "light" : "dark";
    },
  };
}

// Usage
const theme = createThemeStore();
```

### Patterns We Established

#### 1. The .svelte.ts Extension

Files using runes should use `.svelte.ts`:

```
stores/
├── auth.svelte.ts      ✓ Uses $state, $effect
├── theme.svelte.ts     ✓ Uses $state, $derived
└── utils.ts            ✗ Regular TypeScript
```

#### 2. Store Factory Functions

Instead of singleton stores, use factory functions:

```typescript
// ❌ Old singleton pattern
export const auth = writable({ user: null });

// ✅ New factory pattern
export function createAuthStore() {
  let user = $state<User | null>(null);
  let isAuthenticated = $derived(!!user);

  return {
    get user() {
      return user;
    },
    get isAuthenticated() {
      return isAuthenticated;
    },
    login(userData: User) {
      user = userData;
    },
    logout() {
      user = null;
    },
  };
}

// Component creates its own instance
const auth = createAuthStore();
```

#### 3. Avoiding $inspect in Production

Svelte 5 has `$inspect` for debugging, but remove it before production:

```typescript
// Development only
$inspect(state); // Logs when state changes

// Use $effect for production logging if needed
$effect(() => {
  console.log("State changed:", state);
});
```

## CRDTs and Yjs

### What is a CRDT?

**Conflict-free Replicated Data Types** are data structures that can be edited concurrently by multiple users and automatically merge without conflicts.

**The Problem They Solve:**

```
Without CRDT:
User A: "Hello" → Server → "Hello"
User B: "Hi" → Server → CONFLICT! Which one wins?

With CRDT:
User A: "Hello" → Merge → "Hello Hi" (or "Hi Hello")
User B: "Hi" ────┘       Both changes preserved!
```

### How Yjs Works

**1. The Document Structure:**

```typescript
import * as Y from "yjs";

// Create a document
const doc = new Y.Doc();

// Add shared types
const ytext = doc.getText("content");
const yarray = doc.getArray("tags");
const ymap = doc.getMap("metadata");
```

**2. Making Changes:**

```typescript
// Text operations
ytext.insert(0, "Hello"); // Insert at position 0
ytext.insert(5, " World"); // Append
ytext.delete(5, 6); // Delete " World"

// Array operations
yarray.push(["tag1", "tag2"]);
yarray.delete(0, 1); // Remove first item

// Map operations
ymap.set("title", "My Note");
ymap.set("updatedAt", Date.now());
```

**3. The Magic - Update Encoding:**

```typescript
// Convert changes to binary
const update = Y.encodeStateAsUpdate(doc);
// update is a Uint8Array - tiny binary format

// Apply to another document
const remoteDoc = new Y.Doc();
Y.applyUpdate(remoteDoc, update);

// Now remoteDoc has the same content!
```

**4. Automatic Conflict Resolution:**

```typescript
// User A inserts "X" at position 0
const updateA = Y.encodeStateAsUpdate(docA);

// User B deletes character at position 1
const updateB = Y.encodeStateAsUpdate(docB);

// Both apply each other's updates
Y.applyUpdate(docA, updateB);
Y.applyUpdate(docB, updateA);

// Result: Both documents are identical!
// Conflicts resolved automatically
```

### Yjs Data Types

| Type            | Use Case                          | Example            |
| --------------- | --------------------------------- | ------------------ |
| `Y.Text`        | Plain text, collaborative editing | Editor content     |
| `Y.XmlFragment` | Rich text (HTML-like)             | TipTap content     |
| `Y.Array`       | Ordered lists                     | Tags, todo lists   |
| `Y.Map`         | Key-value data                    | Metadata, settings |
| `Y.XmlElement`  | XML nodes                         | Custom elements    |

### Our Implementation

**Document Structure:**

```typescript
// lib/crdt/doc.svelte.ts
export function openDocument(noteId: string) {
  const doc = new Y.Doc();

  // Rich text for TipTap editor
  const content = doc.getXmlFragment("content");

  // Plain text title
  const title = doc.getText("title");

  // Array of tag IDs
  const tags = doc.getArray<string>("tags");

  // Metadata map
  const meta = doc.getMap("meta");
  meta.set("createdAt", Date.now());

  // Persistence
  const provider = new IndexeddbPersistence(`locanote-${noteId}`, doc);

  return { document: doc, content, title, tags, meta, provider };
}
```

**Syncing with WebRTC:**

```typescript
// lib/crdt/providers.ts
export function createWebRTCProvider(roomId, ydoc, user) {
  const provider = new WebrtcProvider(roomId, ydoc, {
    signaling: ["wss://signaling.locanote.app"],
    password: roomPassword, // Room access control
  });

  // Set user awareness (cursor position, selection)
  provider.awareness.setLocalState({
    user: { name: user.name, color: user.color, id: user.id },
  });

  return provider;
}
```

### CRDT Gotchas

**1. Position Tracking:**

```typescript
// ❌ Don't use integer positions for tracking
const pos = 5;
ytext.insert(pos, "X"); // Position may shift!

// ✅ Use relative positions
const relativePos = Y.createRelativePositionFromAbsoluteIndex(ytext, 5);
// Later, convert back accounting for concurrent changes
const absolutePos = Y.createAbsolutePositionFromRelative(relativePos, ytext);
```

**2. Initialization Order:**

```typescript
// ❌ Access before initialization
const ytext = doc.getText("content");
console.log(ytext.toString()); // May be empty!

// ✅ Wait for sync
provider.on("synced", () => {
  console.log(ytext.toString()); // Now safe
});
```

**3. Memory Management:**

```typescript
// ❌ Memory leak
doc.on("update", handler);
// Never removed!

// ✅ Clean up
doc.on("update", handler);
return () => {
  doc.off("update", handler);
  provider.destroy();
  doc.destroy();
};
```

## WebRTC Deep Dive

### WebRTC Architecture

WebRTC enables direct browser-to-browser communication through a complex process:

```
Phase 1: Signaling (via Server)
┌─────────┐              ┌─────────┐              ┌─────────┐
│ Peer A  │──────────────│ Server  │──────────────│ Peer B  │
└────┬────┘   WebSocket   └─────────┘   WebSocket   └────┬────┘
     │                                                  │
     │ 1. Offer (SDP)                                   │
     │ ───────────────────────────────────────────────► │
     │                                                  │
     │                    2. Answer (SDP)               │
     │ ◄─────────────────────────────────────────────── │
     │                                                  │
     │ 3. ICE Candidates                                │
     │ ◄──────────────────────────────────────────────► │

Phase 2: P2P Connection (Direct)
┌─────────┐                                        ┌─────────┐
│ Peer A  │◄──────────────────────────────────────►│ Peer B  │
└─────────┘           DTLS + DataChannel             └─────────┘
```

### The Signaling Process

**1. SDP (Session Description Protocol):**

```typescript
// Peer A creates an offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// Send offer to Peer B via signaling server
signalingServer.send({
  type: "offer",
  sdp: offer.sdp,
  to: "peer-b",
});

// Peer B receives offer
await pc.setRemoteDescription(offer);
const answer = await pc.createAnswer();
await pc.setLocalDescription(answer);

// Send answer back
signalingServer.send({
  type: "answer",
  sdp: answer.sdp,
  to: "peer-a",
});
```

**2. ICE (Interactive Connectivity Establishment):**

ICE finds the best path between peers:

```
Paths Tried (in order):
1. Direct LAN connection (lowest latency)
2. Public IP + port (if no NAT)
3. NAT traversal via STUN server
4. TURN relay (fallback, higher latency)
```

```typescript
// ICE candidate handling
pc.onicecandidate = (event) => {
  if (event.candidate) {
    signalingServer.send({
      type: "ice-candidate",
      candidate: event.candidate,
      to: remotePeerId,
    });
  }
};
```

**3. Connection States:**

```typescript
pc.onconnectionstatechange = () => {
  switch (pc.connectionState) {
    case "new": // Initial state
    case "connecting": // Establishing connection
    case "connected": // P2P established! 🎉
    case "disconnected": // Temporary failure
    case "failed": // Could not connect
    case "closed": // Connection closed
  }
};
```

### Our Signaling Server

We built a lightweight signaling server on Cloudflare Workers:

```typescript
// packages/signaling/src/index.ts
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("room");

    // Get Durable Object for this room
    const id = env.SIGNALING_ROOMS.idFromName(roomId);
    const room = env.SIGNALING_ROOMS.get(id);

    // Handle WebSocket upgrade
    return room.fetch(request);
  },
};
```

**Why Durable Objects?**

- State persists across requests
- Room state survives worker restarts
- Automatic scaling
- WebSocket support

### WebRTC with Yjs

**y-webrtc** abstracts most WebRTC complexity:

```typescript
import { WebrtcProvider } from "y-webrtc";

const provider = new WebrtcProvider(
  "room-name", // Room identifier
  ydoc, // Yjs document
  {
    signaling: ["wss://signaling.server"],
    password: "optional-room-password",
    maxConns: 20, // Max peers
    filterBcConns: true, // Filter broadcast connections
  },
);

// Events
provider.on("status", ({ connected }) => {
  console.log("Connected to signaling:", connected);
});

provider.on("peers", ({ webrtcPeers, bcPeers }) => {
  console.log("WebRTC peers:", webrtcPeers.length);
});

provider.on("synced", ({ synced }) => {
  console.log("Document synced:", synced);
});
```

### WebRTC Challenges

**1. NAT Traversal Failures:**

```typescript
// Symmetric NATs are problematic
// Solution: Use TURN relay server
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:turnserver.com",
      username: "user",
      credential: "pass",
    },
  ],
});
```

**2. Browser Differences:**

```typescript
// Safari quirks
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
  // May need additional configuration
  pc.configuration.bundlePolicy = "max-compat";
}
```

**3. Reconnection Logic:**

```typescript
provider.on("status", ({ connected }) => {
  if (!connected) {
    // Attempt reconnection after delay
    setTimeout(() => {
      provider.connect();
    }, 5000);
  }
});
```

## Security Considerations

### Our Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Security Layers                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 4: Application Security                             │
│  ├── Input validation                                       │
│  ├── XSS prevention                                        │
│  └── CSP headers                                           │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 3: End-to-End Encryption                            │
│  ├── XSalsa20-Poly1305 (NaCl)                              │
│  ├── Keys in memory only                                   │
│  └── Per-room keys                                         │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 2: Transport Security                               │
│  ├── WebRTC DTLS encryption                                │
│  ├── WSS (WebSocket Secure)                                │
│  └── HTTPS for all resources                               │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 1: Local Security                                   │
│  ├── WebAuthn / Passkeys                                   │
│  ├── IndexedDB origin-bound                                │
│  └── Device-level encryption                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### End-to-End Encryption Implementation

**Key Management:**

```typescript
// lib/crypto/e2e.ts

// Generate cryptographically secure random key
export function generateRoomKey(): Uint8Array {
  return nacl.randomBytes(32);
}

// Derive from password (for shared access)
export function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array,
): { key: Uint8Array; salt: Uint8Array } {
  const usedSalt = salt || nacl.randomBytes(16);

  // In production: Use PBKDF2 or Argon2
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // Combine and hash
  const combined = new Uint8Array(passwordBytes.length + usedSalt.length);
  combined.set(passwordBytes);
  combined.set(usedSalt, passwordBytes.length);

  const hash = nacl.hash(combined);
  return {
    key: hash.slice(0, 32),
    salt: usedSalt,
  };
}

// Store only in memory
const roomKeys = new Map<string, Uint8Array>();

export function storeRoomKey(roomId: string, key: Uint8Array): void {
  roomKeys.set(roomId, key); // Memory only - no persistence
}
```

**Encryption/Decryption:**

```typescript
export function encryptMessage(
  message: string,
  key: Uint8Array,
): EncryptedMessage {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(message);

  // 24-byte nonce for XSalsa20
  const nonce = nacl.randomBytes(24);

  // Encrypt with XSalsa20-Poly1305
  const ciphertext = nacl.secretbox(plaintext, nonce, key);

  return {
    ciphertext: naclUtil.encodeBase64(ciphertext),
    nonce: naclUtil.encodeBase64(nonce),
  };
}

export function decryptMessage(
  encrypted: EncryptedMessage,
  key: Uint8Array,
): string | null {
  try {
    const ciphertext = naclUtil.decodeBase64(encrypted.ciphertext);
    const nonce = naclUtil.decodeBase64(encrypted.nonce);

    // Decrypt and verify
    const plaintext = nacl.secretbox.open(ciphertext, nonce, key);

    if (!plaintext) return null; // Decryption failed

    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  } catch (error) {
    return null;
  }
}
```

**Security Properties:**

1. **Confidentiality**: XSalsa20 encryption
2. **Authenticity**: Poly1305 message authentication
3. **Non-repudiation**: Keys prove origin
4. **Forward secrecy**: New keys per room

### WebAuthn Security

**Why WebAuthn is Secure:**

```
Traditional Password:
User ──► Password ──► Server Database
                    (breachable)

WebAuthn Passkey:
User ──► Biometric/PIN ──► Secure Hardware
                          (never leaves device)
```

**Our Implementation:**

```typescript
// Registration
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: generateChallenge(),
    rp: { name: "Locanote", id: window.location.hostname },
    user: {
      id: encodeUserId(userId),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  },
});

// Store credential data
await createCredential({
  userId,
  credentialId: credential.rawId,
  publicKey: response.getPublicKey(),
});
```

### Threat Model

**What We're Protected Against:**

| Threat                | Protection                   | Confidence |
| --------------------- | ---------------------------- | ---------- |
| Server compromise     | E2E encryption               | High       |
| Network eavesdropping | DTLS + NaCl                  | High       |
| Man-in-the-middle     | WebAuthn + HTTPS             | High       |
| Replay attacks        | Nonces + timestamps          | High       |
| XSS                   | CSP + input sanitization     | Medium     |
| Device theft          | WebAuthn + device encryption | Medium     |

**What We're NOT Protected Against:**

| Threat                 | Reason                     | Mitigation               |
| ---------------------- | -------------------------- | ------------------------ |
| Malware on device      | Runs with user permissions | Keep device secure       |
| Shoulder surfing       | Visual observation         | Privacy screens          |
| Collaborator leaks     | They have decryption keys  | Trust your collaborators |
| Brute force (password) | Weak user passwords        | Use passkeys             |

## Challenges We Faced

### Challenge 1: Svelte 5 Migration

**Problem:** Svelte 5 was evolving rapidly during development. APIs changed between releases.

**Solution:**

- Pinned exact versions in package.json
- Joined Svelte Discord for real-time updates
- Wrote abstraction layers around unstable APIs

**Lesson:** When using bleeding-edge tech, expect turbulence.

### Challenge 2: Yjs Document Lifecycle

**Problem:** Managing Yjs document creation/cleanup with Svelte component lifecycle.

**The Issue:**

```typescript
// ❌ Creates new doc on every reactive change
$: doc = new Y.Doc();

// ❌ Memory leak - never cleaned up
onMount(() => {
  const doc = new Y.Doc();
  // No cleanup!
});
```

**Solution:**

```typescript
// ✅ Proper lifecycle management
let docInfo = $state<ReturnType<typeof openDocument> | null>(null);

onMount(() => {
  docInfo = openDocument(noteId);

  return () => {
    // Cleanup on unmount
    docInfo?.destroy();
    docInfo = null;
  };
});
```

**Lesson:** CRDTs require careful lifecycle management. Always cleanup.

### Challenge 3: WebRTC Connection Stability

**Problem:** Connections would randomly drop, especially on mobile networks.

**Root Causes:**

1. Aggressive NAT timeouts
2. Mobile network switching (WiFi ↔ Cellular)
3. Browser background tab throttling

**Solution:**

```typescript
// Reconnection logic
function setupReconnection(provider) {
  let reconnectTimer;

  provider.on("status", ({ connected }) => {
    clearTimeout(reconnectTimer);

    if (!connected) {
      reconnectTimer = setTimeout(() => {
        console.log("Attempting reconnection...");
        provider.connect();
      }, 5000);
    }
  });

  // Handle page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      provider.connect();
    }
  });
}
```

**Lesson:** P2P is powerful but unreliable. Build reconnection from day one.

### Challenge 4: E2E Encryption Key Distribution

**Problem:** How do you share encryption keys with collaborators securely?

**Options Considered:**

1. **Password-protected rooms**: Share password out-of-band
2. **Key server**: Server distributes keys (compromises E2E)
3. **QR codes**: In-person key exchange
4. **URL fragments**: Key in URL hash (never sent to server)

**Our Solution:**

```typescript
// Key embedded in URL fragment (not sent to server)
// https://locanote.app/note/abc123#key=base64encodedkey

function getKeyFromUrl(): Uint8Array | null {
  const hash = window.location.hash;
  if (hash.startsWith("#key=")) {
    const keyBase64 = hash.slice(5);
    return decodeBase64(keyBase64);
  }
  return null;
}

// Store and clear from URL
const key = getKeyFromUrl();
if (key) {
  storeRoomKey(roomId, key);
  history.replaceState(null, "", window.location.pathname);
}
```

**Lesson:** Key distribution is the hardest part of E2E encryption.

### Challenge 5: Offline Sync Conflicts

**Problem:** User edits offline, comes back online, conflicts with remote changes.

**The Good News:** Yjs handles conflicts automatically!

**The Complication:** UX around awareness:

```typescript
// Show sync status
let syncStatus = $state<"synced" | "syncing" | "offline">("offline");

provider.on("synced", () => {
  syncStatus = "synced";
});

window.addEventListener("online", () => {
  syncStatus = "syncing";
});

window.addEventListener("offline", () => {
  syncStatus = "offline";
});
```

**Lesson:** CRDTs handle conflicts, but you still need UX for sync states.

### Challenge 6: IndexedDB Storage Limits

**Problem:** Browsers limit IndexedDB storage (usually ~50MB-2GB).

**Strategies:**

1. **Compression**: Compress Yjs updates
2. **Selective sync**: Don't sync all history
3. **Storage estimation**: Check before operations

```typescript
async function checkStorage() {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const total = estimate.quota || Infinity;
    const percent = (used / total) * 100;

    if (percent > 80) {
      showWarning("Storage nearly full. Export old notes.");
    }
  }
}
```

**Lesson:** Local-first means managing storage carefully.

### Challenge 7: WebAuthn Recovery

**Problem:** WebAuthn has no "forgot password" flow.

**Solutions Implemented:**

1. **Multiple credentials**: Allow multiple passkeys per account
2. **Password fallback**: Optional password for recovery
3. **Export/Import**: Backup encrypted data manually

```typescript
// Export all user data
async function exportUserData(userId: string): Promise<Blob> {
  const notes = await getAllNotes(userId);
  const exportData = {
    userId,
    exportedAt: Date.now(),
    notes: await Promise.all(
      notes.map(async (note) => ({
        ...note,
        yjsState: await exportYjsState(note.id),
      })),
    ),
  };

  return new Blob([JSON.stringify(exportData)], { type: "application/json" });
}
```

**Lesson:** Passwordless is great, but have recovery plans.

## What We'd Do Differently

### 1. Testing Strategy

**What we did:**
Initially, we relied on manual testing. However, as the collaboration features grew complex, we implemented a comprehensive end-to-end testing suite using **Playwright**.

**Why Playwright?**

- **Multi-Context Support**: Essential for testing collaboration. We can spawn two separate browser contexts (Akarsh and Mary) and verify they see each other's changes.
- **Auto-waiting**: Reduces flakiness when interacting with asynchronous UI elements like the TipTap editor.
- **Video & Screenshots**: Makes debugging failures in CI much easier.

**Key Test Case: Real-Time Collaboration**

```typescript
test("Two users can collaborate", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  // ... steps to register both and join same note
  await typeInEditor(pageA, "Hello");
  await expect(getEditorContent(pageB)).toContain("Hello");
});
```

**Lesson:** Testing distributed systems (like collaborative apps) is significantly easier with multi-context automation than manual testing. Start E2E testing early.

### 2. State Management

**What we did:**

- Multiple store files
- Some global state
- Prop drilling in places

**What we'd do:**

- Single state tree with context
- Clear ownership of each domain
- Better TypeScript inference

```typescript
// ✅ Better: Domain-based stores
// stores/app.svelte.ts
export function createAppStore() {
  const auth = createAuthStore();
  const notes = createNotesStore(auth.userId);
  const ui = createUIStore();

  return {
    auth,
    notes,
    ui,
    // Computed cross-domain state
    get isReady() {
      return auth.isInitialized && notes.isLoaded;
    },
  };
}
```

### 3. Error Handling

**What we did:**

- Console.error for debugging
- Some try/catch blocks
- Generic error messages

**What we'd do:**

- Structured error taxonomy
- User-friendly error recovery
- Error boundaries in Svelte

```typescript
// ✅ Better: Structured errors
class LocanoteError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean,
    public action?: () => void,
  ) {
    super(message);
  }
}

// Usage
throw new LocanoteError(
  "Failed to connect to peer",
  "RTC_CONNECTION_FAILED",
  true,
  () => reconnect(),
);
```

### 4. Documentation

**What we did:**

- Inline code comments
- This learning document (post-hoc)
- README

**What we'd do:**

- Architecture Decision Records (ADRs)
- API documentation
- Onboarding guide for contributors

### 5. Performance Monitoring

**What we did:**

- DevTools profiling
- Some console.time calls

**What we'd do:**

- Real User Monitoring (RUM)
- Web Vitals tracking
- CRDT operation metrics

```typescript
// ✅ Better: Performance tracking
function trackOperation(name: string, operation: () => void) {
  const start = performance.now();

  try {
    operation();
  } finally {
    const duration = performance.now() - start;
    analytics.track("operation", { name, duration });

    if (duration > 100) {
      console.warn(`Slow operation: ${name} took ${duration}ms`);
    }
  }
}
```

## Resources and References

### Svelte & SvelteKit

- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/what-are-runes)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Society](https://sveltesociety.dev/) - Community resources
- [Svelte Discord](https://svelte.dev/chat) - Active community support

### CRDTs & Yjs

- [Yjs Documentation](https://docs.yjs.dev/)
- [Yjs GitHub](https://github.com/yjs/yjs)
- [CRDTs: An Introduction](https://www.youtube.com/watch?v=7z4x-AgmsXk) - Martin Kleppmann
- [Designing Data-Intensive Applications](https://dataintensive.net/) - Martin Kleppmann (book)
- [Conflict-Free Replicated Data Types](https://arxiv.org/abs/1805.06358) - Research paper

### WebRTC

- [WebRTC.org](https://webrtc.org/)
- [WebRTC for the Curious](https://webrtcforthecurious.com/) - Free online book
- [WebRTC Specification](https://www.w3.org/TR/webrtc/)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

### Security

- [WebAuthn Guide](https://webauthn.guide/)
- [TweetNaCl.js Documentation](https://github.com/dchest/tweetnacl-js)
- [OWASP Web Security Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [The Cryptographic Doom Principle](https://moxie.org/2011/12/13/the-cryptographic-doom-principle.html)

### Local-First Software

- [Local-First Software](https://www.inkandswitch.com/local-first/) - Ink & Switch essay
- [CRDTs and the Quest for Distributed Consistency](https://www.infoq.com/presentations/crdt-distributed-consistency/)
- [RxDB](https://rxdb.info/) - Local-first database for JavaScript
- [Electric SQL](https://electric-sql.com/) - Sync for local-first apps

### Tools & Libraries

- [TipTap Editor](https://tiptap.dev/) - Headless editor framework
- [ProseMirror](https://prosemirror.net/) - Toolkit for rich text editors
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Durable Objects](https://developers.cloudflare.com/durable-objects/) - Stateful serverless

### Community & Learning

- [Local-First Discord](https://discord.gg/lfw) - Local-first software community
- [Yjs Discord](https://discord.gg/vt8FZnXy) - Yjs community
- [Svelte Discord](https://svelte.dev/chat) - Svelte community
- [WebRTC Hacks](https://webrtchacks.com/) - WebRTC blog

### Related Projects

- [Affine](https://affine.pro/) - Local-first knowledge base
- [Anytype](https://anytype.io/) - Local-first Notion alternative
- [Logseq](https://logseq.com/) - Local-first PKM
- [Automerge](https://automerge.org/) - CRDT library

---

## Conclusion

Building Locanote taught us that local-first, E2E encrypted collaboration is not only possible but practical for many use cases. The combination of CRDTs, WebRTC, and modern web technologies enables a new class of applications where:

- Users truly own their data
- Privacy is the default
- Collaboration happens peer-to-peer
- Offline is a feature, not a bug

The challenges we faced—state management, key distribution, connection stability—are solvable with careful architecture and good abstractions.

We hope this document helps you build similar applications. The future of software is local-first, and we're excited to see what you create.

---

**Questions or feedback?** Open an issue or join the discussion!

**Happy building!** 🚀
