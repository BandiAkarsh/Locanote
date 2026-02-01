// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================
// TypeScript type definitions for our authentication system.
// These ensure type safety when working with credentials and auth states.
// ============================================================================

// ============================================================================
// AUTHENTICATION METHODS
// ============================================================================
// Enum-like type for the two ways users can authenticate

export type AuthMethod = 'passkey' | 'password';                 // Only two options: passkey or password

// ============================================================================
// AUTHENTICATION RESULT
// ============================================================================
// Returned after successful authentication (login)

export interface AuthResult {
  success: true;                                                // Always true for successful auth
  userId: string;                                               // The authenticated user's ID
  username: string;                                             // The user's display name
  method: AuthMethod;                                           // How they authenticated
  credentialId: string;                                         // Which credential was used
}

// ============================================================================
// AUTHENTICATION ERROR
// ============================================================================
// Returned when authentication fails

export interface AuthError {
  success: false;                                               // Always false for failed auth
  error: string;                                                // Human-readable error message
  code: string;                                                 // Machine-readable error code
}

// ============================================================================
// REGISTRATION RESULT
// ============================================================================
// Returned after successful registration (new account)

export interface RegistrationResult {
  success: true;                                                // Registration succeeded
  userId: string;                                               // New user's ID
  username: string;                                             // User's chosen name
  credentialId: string;                                         // The new credential's ID
}

// ============================================================================
// REGISTRATION ERROR
// ============================================================================
// Returned when registration fails

export interface RegistrationError {
  success: false;                                               // Registration failed
  error: string;                                                // Error message
  code: string;                                                 // Error code
}

// ============================================================================
// USER SESSION
// ============================================================================
// Represents a logged-in user session

export interface UserSession {
  userId: string;                                               // User's unique ID
  username: string;                                             // Display name
  loggedInAt: number;                                           // When session started (timestamp)
  expiresAt: number;                                            // When session expires (timestamp)
}

// ============================================================================
// PASSWORD VALIDATION RESULT
// ============================================================================
// Returned when validating a password

export interface PasswordValidationResult {
  isValid: boolean;                                             // Does password meet requirements?
  error: string | null;                                         // Error message if invalid
}

// ============================================================================
// AUTH STATE
// ============================================================================
// Tracks whether user is logged in or not
// Used by our Svelte 5 state management

export type AuthState =
  | { status: 'idle' }                                          // No auth operation in progress
  | { status: 'loading'; message: string }                      // Auth operation in progress
  | { status: 'authenticated'; session: UserSession }           // User is logged in
  | { status: 'unauthenticated' }                               // User is not logged in
  | { status: 'error'; error: string };                         // Auth error occurred
