# AGENTS.md - Locanote Development Guide

> **AI Agent Guidelines for Locanote Development**

This document provides context for AI agents (Claude, GPT, Copilot, etc.) working on Locanote.

---

## Project Overview

**Locanote** is a local-first, privacy-focused collaborative note-taking application.

| Aspect           | Description                                     |
| ---------------- | ----------------------------------------------- |
| **Type**         | Local-first collaborative workspace             |
| **Target**       | Privacy-conscious users, teams                  |
| **Architecture** | Modular microarchitecture with swappable layers |

---

## Technology Stack (2026)

| Layer              | Technology                     | Version      |
| ------------------ | ------------------------------ | ------------ |
| **Framework**      | Svelte 5 (Runes)               | Latest       |
| **Meta-framework** | SvelteKit                      | Latest       |
| **Styling**        | Tailwind CSS 4                 | Latest       |
| **CRDT/Sync**      | Yjs + y-indexeddb + y-webrtc   | Latest       |
| **Editor**         | TipTap (ProseMirror)           | Latest       |
| **Auth**           | WebAuthn (Passkeys) + Password | W3C Standard |
| **Encryption**     | XSalsa20-Poly1305 (TweetNaCl)  | Stable       |
| **Storage**        | IndexedDB (via idb)            | Native       |
| **Signaling**      | Cloudflare Durable Objects     | Latest       |
| **Monorepo**       | TurboRepo + PNPM               | Latest       |
| **Testing**        | Playwright                     | Latest       |

---

## Directory Structure

```
locanote/
├── apps/
│   └── web/                    # Main SvelteKit application
│       └── src/
│           ├── lib/
│           │   ├── auth/       # Authentication (WebAuthn + Password)
│           │   ├── components/ # Reusable UI components
│           │   ├── crdt/       # Collaborative document (Yjs)
│           │   ├── crypto/     # End-to-end encryption
│           │   ├── db/         # IndexedDB + Repository pattern
│           │   ├── editor/     # Rich text editor (TipTap)
│           │   ├── keyboard/   # Keyboard shortcuts
│           │   ├── services/   # Business logic
│           │   ├── stores/     # Svelte 5 reactive state
│           │   ├── templates/  # Note templates
│           │   ├── types/      # Shared TypeScript types
│           │   └── utils/      # Utility functions
│           └── routes/         # SvelteKit routes
├── packages/
│   └── signaling/              # Cloudflare Worker for WebRTC signaling
└── [config files]
```

---

## Modular Architecture

Locanote uses a **microarchitecture** with swappable layers. Each major technology is behind an abstract interface.

### Layer Overview

| Module       | Interface               | Implementation     | Swap Difficulty    |
| ------------ | ----------------------- | ------------------ | ------------------ |
| **Crypto**   | `CryptoAdapter`         | TweetNaCl          | 1 file             |
| **Auth**     | `AuthStrategy`          | Passkey + Password | 1 file             |
| **Database** | `*Repository`           | IndexedDB          | 1-2 files          |
| **CRDT**     | `CollaborativeDocument` | Yjs                | 1 file             |
| **Editor**   | `EditorAdapter`         | TipTap             | 1 file + component |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Application Code                           │
│  (Routes, Services, Components)                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Abstract Interfaces                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │CryptoAdapter│ │AuthStrategy │ │ Repository  │ │EditorAdapter│
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬──────┘│
├─────────┼───────────────┼───────────────┼──────────────┼────────┤
│         ▼               ▼               ▼              ▼        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │  TweetNaCl  │ │Passkey/Pass │ │  IndexedDB  │ │  TipTap    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Swapping Technologies

To swap any technology:

1. **Crypto**: Implement `CryptoAdapter` in `lib/crypto/new-adapter.ts`
2. **Auth**: Implement `AuthStrategy` in `lib/auth/new-strategy.ts`
3. **Database**: Implement `*Repository` interfaces in `lib/db/repositories/`
4. **CRDT**: Implement `CollaborativeDocument` in `lib/crdt/new-adapter.ts`
5. **Editor**: Implement `EditorAdapter` in `lib/editor/new-adapter.ts`

---

## Key Interfaces

### CryptoAdapter (`lib/crypto/types.ts`)

```typescript
interface CryptoAdapter {
  generateKey(): Uint8Array;
  deriveKeyFromPassword(password: string, salt?: Uint8Array): DerivedKey;
  encryptMessage(message: string, key: Uint8Array): EncryptedMessage;
  decryptMessage(encrypted: EncryptedMessage, key: Uint8Array): string | null;
  // ... storage methods
}
```

### AuthStrategy (`lib/auth/strategy.ts`)

```typescript
interface AuthStrategy {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  register(
    username: string,
    secret?: string,
  ): Promise<RegistrationResult | RegistrationError>;
  login(identifier: string, secret?: string): Promise<AuthResult | AuthError>;
}
```

### Repository Pattern (`lib/db/repositories/types.ts`)

```typescript
interface NoteRepository {
  create(note: Note): Promise<Note>;
  findById(id: string): Promise<Note | undefined>;
  findByUserId(userId: string): Promise<Note[]>;
  update(note: Note): Promise<Note>;
  delete(id: string): Promise<void>;
}
```

### CollaborativeDocument (`lib/crdt/types.ts`)

```typescript
interface CollaborativeDocument {
  readonly id: string;
  getTitle(): string;
  setTitle(value: string): void;
  onTitleChange(callback: (title: string) => void): () => void;
  getTags(): string[];
  getRawDocument(): unknown; // For editor integration
  destroy(): void;
}
```

### EditorAdapter (`lib/editor/types.ts`)

```typescript
interface EditorAdapter {
  getContent(): DocumentContent;
  getText(): string;
  toggleBold(): void;
  toggleHeading(level: 1 | 2 | 3): void;
  isActive(format: FormatType): boolean;
  onUpdate(callback: (content: DocumentContent) => void): () => void;
  destroy(): void;
}
```

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type check
pnpm check

# Run tests
pnpm test

# Build for production
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint
```

---

## Code Style Guidelines

1. **Svelte 5 Runes**: Use `$state`, `$derived`, `$effect` instead of stores
2. **TypeScript**: Strict mode, no `any` unless necessary
3. **Components**: Use `$props()` with typed interfaces
4. **File naming**: `kebab-case.ts`, `PascalCase.svelte`
5. **Imports**: Use path aliases (`$lib`, `$components`, `$stores`, etc.)

---

## Testing Strategy

- **E2E Tests**: Playwright in `apps/web/e2e/`
- **Type Safety**: `svelte-check` with zero errors policy
- **Component Testing**: Deep UI scan for all interactive elements

---

## Security Considerations

- All data persists locally first (IndexedDB)
- E2E encryption with XSalsa20-Poly1305
- WebAuthn for passwordless authentication
- No user data touches our servers (zero-knowledge)
- WebRTC for P2P sync (signaling server only routes, never sees content)

---

## Performance Optimizations

- **PerformanceScout**: Auto-detects device tier
- **Battery-aware**: Dark mode on low battery
- **Background engines**: Nebula, Crystalline, Aura, Static (performance tiers)
- **Mobile optimization**: Forces static background on small screens

---

## Common Tasks for AI Agents

### Adding a New Component

1. Create in `lib/components/NewComponent.svelte`
2. Use `$props()` with typed interface
3. Export from `lib/components/index.ts`
4. Use CSS variables for theming (`--ui-surface`, `--ui-text`, etc.)

### Adding a New Auth Method

1. Create `lib/auth/new-strategy.ts` implementing `AuthStrategy`
2. Register in `lib/auth/index.ts`
3. UI will auto-detect via `getAvailableStrategies()`

### Adding a New Storage Backend

1. Create implementations in `lib/db/repositories/`
2. Implement all `*Repository` interfaces
3. Update `lib/db/index.ts` exports

---

## Contact

Built by [Bandi Akarsh](https://github.com/BandiAkarsh)
