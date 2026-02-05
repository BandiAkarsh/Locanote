# Locanote Revisit Log

This log tracks identified problems, duplicate code, and potential errors discovered during the thorough scan on 2026-02-05.

## 🔴 High Priority / Bugs

- **Yjs Fragment Name Mismatch:** (FIXED) `Collaboration` extension was defaulting to `default` instead of `content`.
- **Note Sync Overlay:** (FIXED) "Syncing..." overlay stuck due to missing immediate check for sync state.
- **Title Sync Issues:** (FIXED) Collaborative users were not seeing the correct note title in local metadata.
- **Microphone Logic:** Potential issues in `voice.svelte.ts` - `ScriptProcessorNode` is deprecated; need to verify result insertion into Tiptap at current cursor position.

## 🟡 Duplicate Code / Redundancy

- **Editor Configuration:** (REFACTORED) Redundant extension configuration in `Editor.svelte` moved to `extensions.ts`.
- **Search Logic:**
  - `db/notes.ts`: Simple title-only search.
  - `services/search.svelte.ts`: Advanced content + metadata search.
  - _Recommendation:_ Consolidate into the service layer and use a single source of truth.
- **Authentication:**
  - `auth/password.svelte.ts` vs `auth/password-login.svelte.ts`.
  - `auth/webauthn.svelte.ts` vs `auth/webauthn-login.svelte.ts`.
  - _Recommendation:_ These could likely be merged into single `auth/method/*.ts` files to reduce import complexity.
- **Note Creation:** Fragmented logic between `notes.svelte.ts` and `+page.svelte`.

## 🔵 Technical Debt / Cleanup

- **Spatial UI:** `lib/utils/spatial.ts` and `SpatialDock.svelte` appear to be experimental or partially implemented features.
- **ScriptProcessorNode:** Deprecated API used in `VoiceService`. Should eventually move to `AudioWorklet`.
- **Yjs Text Extraction:** `searchNoteContent` implements custom recursive extraction. Check if `xmlContent.toString()` is sufficient for plain text search.

## 🟢 Verified Features

- **Shared Note Content:** Verified that using `field: 'content'` fixes the sync visibility issue.
- **E2E Encryption:** Key extraction from URL hash verified as secure (not sent to server).
