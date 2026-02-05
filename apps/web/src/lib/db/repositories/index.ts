// ============================================================================
// REPOSITORIES MODULE INDEX
// ============================================================================
// Central export point for repository pattern.
//
// ARCHITECTURE:
// - types.ts: Abstract interfaces
// - idb-repositories.ts: IndexedDB implementations
//
// TO SWAP STORAGE BACKEND:
// 1. Create new implementation file (e.g., sqlite-repositories.ts)
// 2. Update this file to export new implementations
// 3. All consuming code continues to work unchanged
// ============================================================================

// ============================================================================
// TYPES (Abstract Interfaces)
// ============================================================================

export type {
  Repository,
  UserRepository,
  NoteRepository,
  TagRepository,
  CredentialRepository,
  RepositoryFactory,
} from "./types";

export {
  EntityNotFoundError,
  DuplicateEntityError,
  RepositoryError,
} from "./types";

// ============================================================================
// IMPLEMENTATIONS (IndexedDB)
// ============================================================================

export {
  idbRepositoryFactory,
  userRepository,
  noteRepository,
  tagRepository,
  credentialRepository,
  createIDBRepositoryFactory,
} from "./idb-repositories";

// ============================================================================
// DEFAULT FACTORY
// ============================================================================
// Alias for easy swapping of default implementation

export { idbRepositoryFactory as repositoryFactory } from "./idb-repositories";
