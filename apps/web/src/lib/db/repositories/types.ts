// ============================================================================
// REPOSITORY INTERFACES
// ============================================================================
// Abstract interfaces for data access.
// These interfaces define the contract for any storage implementation.
//
// CURRENT IMPLEMENTATION: IndexedDB (via idb library)
//
// FUTURE IMPLEMENTATIONS COULD INCLUDE:
// - SQLite (via sql.js or OPFS)
// - Cloud sync (Firebase, Supabase, PocketBase)
// - In-memory (for testing)
// - Hybrid (IndexedDB + cloud backup)
//
// TO SWAP STORAGE:
// 1. Implement these interfaces with new storage backend
// 2. Update the db/index.ts to export new implementations
// 3. All consuming code continues to work unchanged
// ============================================================================

import type { User, Note, Tag, Credential } from "../index";

// ============================================================================
// BASE REPOSITORY INTERFACE
// ============================================================================

/**
 * Base interface for all repositories.
 * Provides common CRUD operations.
 */
export interface Repository<T, ID = string> {
  /** Create a new entity */
  create(entity: T): Promise<T>;

  /** Find entity by ID */
  findById(id: ID): Promise<T | undefined>;

  /** Update an existing entity */
  update(entity: T): Promise<T>;

  /** Delete entity by ID */
  delete(id: ID): Promise<void>;
}

// ============================================================================
// USER REPOSITORY
// ============================================================================

/**
 * Repository for user data.
 */
export interface UserRepository extends Repository<User> {
  /** Find user by username */
  findByUsername(username: string): Promise<User | undefined>;

  /** Check if username exists */
  usernameExists(username: string): Promise<boolean>;

  /** Update last login timestamp */
  updateLastLogin(userId: string): Promise<User | undefined>;
}

// ============================================================================
// NOTE REPOSITORY
// ============================================================================

/**
 * Repository for note metadata.
 * Note: Actual note content is stored in Yjs documents, not here.
 */
export interface NoteRepository extends Repository<Note> {
  /** Get all notes for a user */
  findByUserId(userId: string): Promise<Note[]>;

  /** Get notes with a specific tag */
  findByTag(tagId: string): Promise<Note[]>;

  /** Search notes by title */
  search(userId: string, query: string): Promise<Note[]>;

  /** Count notes for a user */
  count(userId: string): Promise<number>;

  /** Delete all notes for a user */
  deleteByUserId(userId: string): Promise<void>;
}

// ============================================================================
// TAG REPOSITORY
// ============================================================================

/**
 * Repository for tag data.
 */
export interface TagRepository extends Repository<Tag> {
  /** Get all tags for a user */
  findByUserId(userId: string): Promise<Tag[]>;

  /** Find tag by name (case-insensitive) */
  findByName(userId: string, name: string): Promise<Tag | undefined>;

  /** Check if tag name exists for user */
  tagExists(userId: string, name: string): Promise<boolean>;

  /** Delete all tags for a user */
  deleteByUserId(userId: string): Promise<void>;
}

// ============================================================================
// CREDENTIAL REPOSITORY
// ============================================================================

/**
 * Repository for authentication credentials.
 */
export interface CredentialRepository extends Repository<Credential> {
  /** Get all credentials for a user */
  findByUserId(userId: string): Promise<Credential[]>;

  /** Find credential by type */
  findByType(
    userId: string,
    type: "passkey" | "password",
  ): Promise<Credential | undefined>;

  /** Check if user has passkey */
  hasPasskey(userId: string): Promise<boolean>;

  /** Check if user has password */
  hasPassword(userId: string): Promise<boolean>;

  /** Delete all credentials for a user */
  deleteByUserId(userId: string): Promise<void>;
}

// ============================================================================
// REPOSITORY FACTORY
// ============================================================================

/**
 * Factory interface for creating repositories.
 * Allows swapping entire storage backend at once.
 */
export interface RepositoryFactory {
  /** Get user repository */
  users(): UserRepository;

  /** Get note repository */
  notes(): NoteRepository;

  /** Get tag repository */
  tags(): TagRepository;

  /** Get credential repository */
  credentials(): CredentialRepository;
}

// ============================================================================
// REPOSITORY ERRORS
// ============================================================================

/**
 * Error thrown when an entity is not found.
 */
export class EntityNotFoundError extends Error {
  constructor(entityType: string, id: string) {
    super(`${entityType} not found with ID: ${id}`);
    this.name = "EntityNotFoundError";
  }
}

/**
 * Error thrown when a duplicate entity is detected.
 */
export class DuplicateEntityError extends Error {
  constructor(entityType: string, field: string, value: string) {
    super(`${entityType} with ${field} "${value}" already exists`);
    this.name = "DuplicateEntityError";
  }
}

/**
 * Error thrown when a repository operation fails.
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}
