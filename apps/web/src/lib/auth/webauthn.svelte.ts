// ============================================================================
// WEBAUTHN PASSKEY REGISTRATION
// ============================================================================
// This file handles creating new passkeys for users.
// It uses the browser's Web Authentication API (WebAuthn).
//
// THE REGISTRATION FLOW:
// 1. User provides a username
// 2. We generate a challenge (random bytes)
// 3. We create WebAuthn options (telling the browser what we want)
// 4. Browser shows system prompt (Face ID, fingerprint, PIN)
// 5. Device creates a key pair (public + private)
// 6. We receive the public key and credential ID
// 7. We store these in IndexedDB
// 8. User can now login with this passkey
//
// SIMPLIFICATIONS FROM STANDARD WEBAUTHN:
// - Normally a server verifies the registration, but we verify client-side
// - This is secure for our use case because the credential is bound to our domain
// - The private key never leaves the user's device
// ============================================================================

import { generateChallenge, generateUserId, generateCredentialId } from './challenge';
import { createUser, usernameExists, getUserByUsername } from '$db/users';
import { createCredential } from '$db/credentials';
import type { RegistrationResult, RegistrationError } from './types';

// ============================================================================
// REGISTER WITH PASSKEY
// ============================================================================
// Main function to register a new user with a passkey
//
// @param username - The user's chosen display name
// @returns RegistrationResult on success, RegistrationError on failure

export async function registerWithPasskey(
  username: string
): Promise<RegistrationResult | RegistrationError> {
  try {
    // --------------------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------------------
    // Check if username is already taken
    const exists = await usernameExists(username);               // Check database
    if (exists) {
      return {                                                     // Return error
        success: false,
        error: 'Username already taken. Please choose a different one.',
        code: 'USERNAME_EXISTS'
      };
    }

    // --------------------------------------------------------------------
    // GENERATE IDS
    // --------------------------------------------------------------------
    const userId = generateUserId();                               // Unique user ID
    const credentialId = generateCredentialId();                   // Unique credential ID
    const challenge = generateChallenge();                         // Random challenge bytes

    // --------------------------------------------------------------------
    // CREATE WEBAUTHN OPTIONS
    // --------------------------------------------------------------------
    // These options tell the browser how to create the passkey
    
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      // The challenge that the authenticator must sign
      challenge: challenge,
      
      // Information about our app (the "relying party")
      rp: {
        name: 'Locanote',                                          // App name shown to user
        id: window.location.hostname                               // Domain (e.g., "localhost" or "locanote.app")
      },
      
      // Information about the user
      user: {
        id: new TextEncoder().encode(userId),                      // User ID as bytes
        name: username,                                            // Username
        displayName: username                                      // Display name
      },
      
      // What type of credentials we want
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },                            // ES256 (Elliptic Curve P-256 with SHA-256)
        { type: 'public-key', alg: -257 }                           // RS256 (RSASSA-PKCS1-v1_5 with SHA-256)
      ],
      
      // Timeout: how long the user has to authenticate (5 minutes)
      timeout: 300000,
      
      // What types of authenticators we accept
      authenticatorSelection: {
        // authenticatorAttachment: 'platform' means built-in (Face ID, Touch ID, Windows Hello)
        // 'cross-platform' would accept USB security keys
        // undefined accepts both
        authenticatorAttachment: undefined,
        
        // residentKey: 'required' means the credential is stored on the device
        // This allows the user to select their credential without typing username
        residentKey: 'required',
        
        // requireResidentKey is the old name for residentKey (for backwards compatibility)
        requireResidentKey: true,
        
        // userVerification: 'preferred' means try to get biometric/PIN if available
        // but don't fail if the authenticator doesn't support it
        userVerification: 'preferred'
      },
      
      // attestation: 'none' means we don't need hardware attestation
      // This is simpler and works with all authenticators
      attestation: 'none'
    };

    // --------------------------------------------------------------------
    // CALL WEBAUTHN API
    // --------------------------------------------------------------------
    // This triggers the browser's native UI (Face ID prompt, fingerprint, etc.)
    
    const credential = await navigator.credentials.create({        // Browser API
      publicKey: publicKeyCredentialCreationOptions                 // Pass our options
    }) as PublicKeyCredential;                                     // Cast to expected type

    // If user cancels (presses Cancel or fails biometric), credential will be null
    if (!credential) {
      return {
        success: false,
        error: 'Registration cancelled. Please try again.',
        code: 'CANCELLED'
      };
    }

    // --------------------------------------------------------------------
    // EXTRACT DATA FROM CREDENTIAL
    // --------------------------------------------------------------------
    // The credential contains the public key we need to store
    
    const response = credential.response as AuthenticatorAttestationResponse;
    
    // Get the raw credential ID
    const rawCredentialId = credential.rawId;                      // Raw bytes (ArrayBuffer)
    
    // Get the public key if available (some authenticators might not include it directly)
    const publicKey = response.getPublicKey();                     // May be null
    
    // Get the attestation object (contains additional data)
    const attestationObject = response.attestationObject;          // Raw bytes

    // --------------------------------------------------------------------
    // SAVE TO DATABASE
    // --------------------------------------------------------------------
    // 1. Create the user record
    const now = Date.now();
    await createUser({
      id: userId,
      username,
      createdAt: now,
      lastLoginAt: now
    });

    // 2. Create the credential record
    await createCredential({
      id: credentialId,
      userId,
      type: 'passkey',
      publicKey: publicKey || undefined,                           // Store public key if available
      credentialId: rawCredentialId,                               // Store raw credential ID
      createdAt: now
    });

    // --------------------------------------------------------------------
    // RETURN SUCCESS
    // --------------------------------------------------------------------
    return {
      success: true,
      userId,
      username,
      credentialId
    };

  } catch (error) {
    // --------------------------------------------------------------------
    // HANDLE ERRORS
    // --------------------------------------------------------------------
    console.error('Passkey registration error:', error);           // Log for debugging
    
    // Check for specific error types
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Permission denied. Please allow access to your authenticator.',
          code: 'NOT_ALLOWED'
        };
      }
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Registration cancelled.',
          code: 'ABORTED'
        };
      }
      if (error.name === 'SecurityError') {
        return {
          success: false,
          error: 'WebAuthn requires a secure context (HTTPS or localhost).',
          code: 'SECURITY_ERROR'
        };
      }
    }
    
    // Generic error
    return {
      success: false,
      error: 'Failed to create passkey. Please try again.',
      code: 'UNKNOWN_ERROR'
    };
  }
}

// ============================================================================
// CHECK IF WEBAUTHN IS AVAILABLE
// ============================================================================
// Tests if the browser supports WebAuthn
//
// @returns true if WebAuthn is supported

export function isWebAuthnAvailable(): boolean {
  return (
    window.PublicKeyCredential !== undefined &&                  // Check for WebAuthn API
    typeof window.PublicKeyCredential === 'function'             // Ensure it's a function
  );
}

// ============================================================================
// CHECK IF PLATFORM AUTHENTICATOR IS AVAILABLE
// ============================================================================
// Tests if the device has a built-in authenticator (Face ID, Touch ID, etc.)
// This is useful to show/hide the passkey option
//
// @returns Promise<boolean> true if platform authenticator available

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnAvailable()) return false;                      // WebAuthn not supported
  
  try {
    // Check if platform authenticator is available
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;                                                // Error checking availability
  }
}
