// ============================================================================
// INDEXEDDB REPOSITORY IMPLEMENTATIONS
// ============================================================================
// Implementations of repository interfaces using IndexedDB (via idb library).
// This file wraps the existing database functions in the repository pattern.
// ============================================================================

import type {
  UserRepository,
  NoteRepository,
  TagRepository,
  CredentialRepository,
  RepositoryFactory,
} from "./types";
import type { User, Note, Tag, Credential } from "../index";
import { getDB } from "../index";

// ============================================================================
// IDB USER REPOSITORY
// ============================================================================

class IDBUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const db = await getDB();
    await db.add("users", user);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const db = await getDB();
    return db.get("users", id);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const db = await getDB();
    const index = db.transaction("users").store.index("by-username");
    return index.get(username);
  }

  async update(user: User): Promise<User> {
    const db = await getDB();
    await db.put("users", user);
    return user;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("users", id);
  }

  async usernameExists(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return !!user;
  }

  async updateLastLogin(userId: string): Promise<User | undefined> {
    const user = await this.findById(userId);
    if (!user) return undefined;
    user.lastLoginAt = Date.now();
    return this.update(user);
  }
}

// ============================================================================
// IDB NOTE REPOSITORY
// ============================================================================

class IDBNoteRepository implements NoteRepository {
  async create(note: Note): Promise<Note> {
    const db = await getDB();
    await db.add("notes", note);
    return note;
  }

  async findById(id: string): Promise<Note | undefined> {
    const db = await getDB();
    return db.get("notes", id);
  }

  async findByUserId(userId: string): Promise<Note[]> {
    const db = await getDB();
    const index = db.transaction("notes").store.index("by-user");
    const notes = await index.getAll(userId);
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async findByTag(tagId: string): Promise<Note[]> {
    const db = await getDB();
    const index = db.transaction("notes").store.index("by-tag");
    return index.getAll(tagId);
  }

  async update(note: Note): Promise<Note> {
    const db = await getDB();
    note.updatedAt = Date.now();
    await db.put("notes", note);
    return note;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("notes", id);
  }

  async search(userId: string, query: string): Promise<Note[]> {
    const notes = await this.findByUserId(userId);
    const lowerQuery = query.toLowerCase();
    return notes.filter((note) =>
      note.title.toLowerCase().includes(lowerQuery),
    );
  }

  async count(userId: string): Promise<number> {
    const notes = await this.findByUserId(userId);
    return notes.length;
  }

  async deleteByUserId(userId: string): Promise<void> {
    const db = await getDB();
    const notes = await this.findByUserId(userId);
    const tx = db.transaction("notes", "readwrite");
    for (const note of notes) {
      await tx.store.delete(note.id);
    }
    await tx.done;
  }
}

// ============================================================================
// IDB TAG REPOSITORY
// ============================================================================

class IDBTagRepository implements TagRepository {
  async create(tag: Tag): Promise<Tag> {
    const db = await getDB();
    await db.add("tags", tag);
    return tag;
  }

  async findById(id: string): Promise<Tag | undefined> {
    const db = await getDB();
    return db.get("tags", id);
  }

  async findByUserId(userId: string): Promise<Tag[]> {
    const db = await getDB();
    const index = db.transaction("tags").store.index("by-user");
    return index.getAll(userId);
  }

  async findByName(userId: string, name: string): Promise<Tag | undefined> {
    const tags = await this.findByUserId(userId);
    const lowerName = name.toLowerCase();
    return tags.find((tag) => tag.name.toLowerCase() === lowerName);
  }

  async update(tag: Tag): Promise<Tag> {
    const db = await getDB();
    await db.put("tags", tag);
    return tag;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("tags", id);
  }

  async tagExists(userId: string, name: string): Promise<boolean> {
    const tag = await this.findByName(userId, name);
    return !!tag;
  }

  async deleteByUserId(userId: string): Promise<void> {
    const db = await getDB();
    const tags = await this.findByUserId(userId);
    const tx = db.transaction("tags", "readwrite");
    for (const tag of tags) {
      await tx.store.delete(tag.id);
    }
    await tx.done;
  }
}

// ============================================================================
// IDB CREDENTIAL REPOSITORY
// ============================================================================

class IDBCredentialRepository implements CredentialRepository {
  async create(credential: Credential): Promise<Credential> {
    const db = await getDB();
    await db.add("credentials", credential);
    return credential;
  }

  async findById(id: string): Promise<Credential | undefined> {
    const db = await getDB();
    return db.get("credentials", id);
  }

  async findByUserId(userId: string): Promise<Credential[]> {
    const db = await getDB();
    const index = db.transaction("credentials").store.index("by-user");
    return index.getAll(userId);
  }

  async findByType(
    userId: string,
    type: "passkey" | "password",
  ): Promise<Credential | undefined> {
    const credentials = await this.findByUserId(userId);
    return credentials.find((cred) => cred.type === type);
  }

  async update(credential: Credential): Promise<Credential> {
    const db = await getDB();
    await db.put("credentials", credential);
    return credential;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("credentials", id);
  }

  async hasPasskey(userId: string): Promise<boolean> {
    const passkey = await this.findByType(userId, "passkey");
    return !!passkey;
  }

  async hasPassword(userId: string): Promise<boolean> {
    const password = await this.findByType(userId, "password");
    return !!password;
  }

  async deleteByUserId(userId: string): Promise<void> {
    const db = await getDB();
    const credentials = await this.findByUserId(userId);
    const tx = db.transaction("credentials", "readwrite");
    for (const cred of credentials) {
      await tx.store.delete(cred.id);
    }
    await tx.done;
  }
}

// ============================================================================
// IDB REPOSITORY FACTORY
// ============================================================================

/**
 * Factory for creating IndexedDB repositories.
 * Use this as the default implementation.
 */
class IDBRepositoryFactory implements RepositoryFactory {
  private userRepo: IDBUserRepository | null = null;
  private noteRepo: IDBNoteRepository | null = null;
  private tagRepo: IDBTagRepository | null = null;
  private credentialRepo: IDBCredentialRepository | null = null;

  users(): UserRepository {
    if (!this.userRepo) {
      this.userRepo = new IDBUserRepository();
    }
    return this.userRepo;
  }

  notes(): NoteRepository {
    if (!this.noteRepo) {
      this.noteRepo = new IDBNoteRepository();
    }
    return this.noteRepo;
  }

  tags(): TagRepository {
    if (!this.tagRepo) {
      this.tagRepo = new IDBTagRepository();
    }
    return this.tagRepo;
  }

  credentials(): CredentialRepository {
    if (!this.credentialRepo) {
      this.credentialRepo = new IDBCredentialRepository();
    }
    return this.credentialRepo;
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

/** Default repository factory using IndexedDB */
export const idbRepositoryFactory = new IDBRepositoryFactory();

/** Default repositories (convenience exports) */
export const userRepository = idbRepositoryFactory.users();
export const noteRepository = idbRepositoryFactory.notes();
export const tagRepository = idbRepositoryFactory.tags();
export const credentialRepository = idbRepositoryFactory.credentials();

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new IDB repository factory instance.
 * Useful for testing or creating isolated instances.
 */
export function createIDBRepositoryFactory(): RepositoryFactory {
  return new IDBRepositoryFactory();
}
