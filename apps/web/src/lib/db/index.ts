// ============================================================================
// INDEXEDDB DATABASE CONFIGURATION
// ============================================================================
// This file sets up my browser database using the 'idb' library.
// Think of this as the "database schema" for my application.
//
// WHAT IS INDEXEDDB?
// - A NoSQL database built into every browser
// - Can store objects, arrays, binary data (unlike localStorage)
// - Persists even when browser is closed
// - Works offline
//
// DATABASE STRUCTURE:
// - Database name: 'locanote'
// - Current version: 1
// - Stores (tables): 'users', 'credentials', 'notes', 'tags'
//
// STORES EXPLAINED:
// 1. users - User profile information (username, created date)
// 2. credentials - Authentication credentials (passkeys, password hashes)
// 3. notes - Note metadata (title, tags list, timestamps)
// 4. tags - Tag definitions (name, color)
//
// NOTE: Actual note CONTENT is stored by Yjs in separate databases,
// not in this main database. Yjs handles its own persistence.
// ============================================================================

import { openDB, type DBSchema, type IDBPDatabase } from "idb"; // Import idb library with types

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// These define the shape of my data

// User profile information
export interface User {
  id: string; // Unique user ID (UUID)
  username: string; // Display name
  createdAt: number; // Unix timestamp (ms)
  lastLoginAt: number; // Unix timestamp (ms)
}

// Authentication credential (passkey or password hash)
export interface Credential {
  id: string; // Credential ID
  userId: string; // Link to user
  type: "passkey" | "password"; // Type of credential
  // For passkeys:
  publicKey?: ArrayBuffer; // WebAuthn public key
  credentialId?: ArrayBuffer; // WebAuthn credential ID
  // For passwords:
  passwordHash?: string; // Argon2 hash
  salt?: string; // Password salt
  createdAt: number; // When created
}

// Note metadata (content is in Yjs)
export interface Note {
  id: string; // Unique note ID
  userId: string; // Owner
  title: string; // Note title
  tags: string[]; // Array of tag IDs
  createdAt: number; // Created timestamp
  updatedAt: number; // Last modified
  yjsDocId: string; // Link to Yjs document
  isProtected?: boolean; // Whether note is password protected
  passwordSalt?: string; // Salt for key derivation (base64)
}

// Tag definition
export interface Tag {
  id: string; // Tag ID
  userId: string; // Owner
  name: string; // Display name
  color: string; // Hex color code
  createdAt: number; // Created timestamp
}

// ============================================================================
// DATABASE SCHEMA
// ============================================================================
// This interface defines the structure for TypeScript

interface LocanoteDB extends DBSchema {
  users: {
    key: string; // Primary key is user.id
    value: User;
    indexes: {
      // Indexes for fast lookups
      "by-username": string; // Lookup by username
    };
  };
  credentials: {
    key: string; // Primary key is credential.id
    value: Credential;
    indexes: {
      "by-user": string; // Lookup all credentials for a user
      "by-type": string; // Lookup by type (passkey/password)
    };
  };
  notes: {
    key: string; // Primary key is note.id
    value: Note;
    indexes: {
      "by-user": string; // Lookup all notes for a user
      "by-tag": string; // Lookup notes by tag
    };
  };
  tags: {
    key: string; // Primary key is tag.id
    value: Tag;
    indexes: {
      "by-user": string; // Lookup all tags for a user
    };
  };
}

// ============================================================================
// DATABASE INSTANCE
// ============================================================================
// I keep a reference to the open database

let db: IDBPDatabase<LocanoteDB> | null = null; // Will hold the database instance

// ============================================================================
// INITIALIZE DATABASE
// ============================================================================
// Opens/creates the database and sets up the schema

export async function initDB(): Promise<IDBPDatabase<LocanoteDB>> {
  if (db) return db; // Return existing if already open

  try {
    db = await openDB<LocanoteDB>("locanote", 1, {
      // Open 'locanote' db, version 1
      upgrade(db, oldVersion, newVersion, transaction) {
        // Called when creating or upgrading
        // --------------------------------------------------------------------
        // CREATE USERS STORE
        // --------------------------------------------------------------------
        if (!db.objectStoreNames.contains("users")) {
          // Check if store exists
          const userStore = db.createObjectStore("users", {
            // Create the store
            keyPath: "id", // Use 'id' field as primary key
          });
          userStore.createIndex("by-username", "username"); // Index for username lookup
        }

        // --------------------------------------------------------------------
        // CREATE CREDENTIALS STORE
        // --------------------------------------------------------------------
        if (!db.objectStoreNames.contains("credentials")) {
          const credStore = db.createObjectStore("credentials", {
            keyPath: "id",
          });
          credStore.createIndex("by-user", "userId"); // Lookup by user ID
          credStore.createIndex("by-type", "type"); // Lookup by credential type
        }

        // --------------------------------------------------------------------
        // CREATE NOTES STORE
        // --------------------------------------------------------------------
        if (!db.objectStoreNames.contains("notes")) {
          const noteStore = db.createObjectStore("notes", {
            keyPath: "id",
          });
          noteStore.createIndex("by-user", "userId"); // Lookup notes by user
          noteStore.createIndex("by-tag", "tags", { multiEntry: true }); // Multi-entry for array of tags
        }

        // --------------------------------------------------------------------
        // CREATE TAGS STORE
        // --------------------------------------------------------------------
        if (!db.objectStoreNames.contains("tags")) {
          const tagStore = db.createObjectStore("tags", {
            keyPath: "id",
          });
          tagStore.createIndex("by-user", "userId"); // Lookup tags by user
        }
      },
    });

    return db;
  } catch (error) {
    console.error("[Database] Failed to initialize IndexedDB:", error);
    throw new Error(
      "Failed to initialize database. This may be due to private browsing mode or blocked storage. Please try again with storage permissions enabled.",
    );
  }
}

// ============================================================================
// GET DATABASE INSTANCE
// ============================================================================
// Returns the database, initializing if necessary

export async function getDB(): Promise<IDBPDatabase<LocanoteDB>> {
  if (!db) {
    await initDB(); // Initialize if not ready
  }
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

// ============================================================================
// DATABASE VERSION
// ============================================================================
// Returns the current database version (useful for debugging)

export async function getDBVersion(): Promise<number> {
  const database = await getDB();
  return database.version;
}

// ============================================================================
// CLOSE DATABASE
// ============================================================================
// Closes the database connection (rarely needed)

export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}
