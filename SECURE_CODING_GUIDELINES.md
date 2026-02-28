# Secure Coding Guidelines - Locanote

> **Version:** 1.0  
> **Last Updated:** February 28, 2026  
> **Classification:** Internal Use Only

These guidelines establish secure coding practices for all developers working on Locanote. All code must be reviewed against these standards before merge.

---

## Table of Contents

1. [General Principles](#general-principles)
2. [Cryptography](#cryptography)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [Input Validation](#input-validation)
6. [Output Encoding](#output-encoding)
7. [Session Management](#session-management)
8. [Error Handling](#error-handling)
9. [Logging](#logging)
10. [Dependencies](#dependencies)

---

## General Principles

### 1.1 Defense in Depth

Implement multiple layers of security controls:

- Client-side validation (UX)
- Server-side validation (security)
- Database constraints (integrity)

```typescript
// ❌ BAD: Only client-side validation
<input type="text" maxlength="100" />

// ✅ GOOD: Multiple layers
// Client: maxlength="100"
// Server: if (input.length > 100) throw new ValidationError()
// DB: VARCHAR(100)
```

### 1.2 Least Privilege

Grant minimum permissions necessary:

- Use specific imports instead of `*`
- Request only required permissions
- Limit API key scopes

```typescript
// ❌ BAD: Import everything
import * as crypto from "crypto";

// ✅ GOOD: Import only needed functions
import { encrypt, decrypt } from "$crypto/noble-crypto";
```

### 1.3 Fail Securely

When errors occur, default to secure state:

- Deny access on authentication errors
- Encrypt by default
- Log all failures

```typescript
// ❌ BAD: Fail open
try {
  return await authenticate(user);
} catch (e) {
  return { success: true }; // DANGEROUS!
}

// ✅ GOOD: Fail closed
try {
  return await authenticate(user);
} catch (e) {
  await logSecurityEvent("auth_failure", { error: e });
  return { success: false, error: "Authentication failed" };
}
```

---

## Cryptography

### 2.1 Use Approved Libraries Only

**ALWAYS** use audited cryptography libraries:

- ✅ `@noble/ciphers` - Modern, audited, tree-shakeable
- ✅ `Web Crypto API` - Browser native
- ❌ `crypto-js` - Deprecated, not audited
- ❌ `tweetnacl` - Legacy, use @noble instead

### 2.2 Key Management

```typescript
// ❌ BAD: Hardcoded keys
const SECRET_KEY = "my-secret-key-123";

// ✅ GOOD: Derive from secure source
const { key, salt } = await deriveKeyFromPassword(userPassword, generateSalt());

// ❌ BAD: Storing keys in code
const encryptionKey = new Uint8Array([1, 2, 3, ...]);

// ✅ GOOD: Secure key storage
await storeKey(userId, wrappedKey);
```

### 2.3 Encryption Practices

```typescript
// ❌ BAD: ECB mode, no authentication
const encrypted = cipher.update(plaintext);

// ✅ GOOD: Authenticated encryption
const { ciphertext, nonce } = encrypt(plaintext, key);

// ❌ BAD: Static IV/nonce
const nonce = new Uint8Array(24); // All zeros!

// ✅ GOOD: Random nonce for each encryption
const nonce = generateNonce();
```

### 2.4 Password Hashing

```typescript
// ❌ BAD: MD5, SHA1, or unsalted hashes
const hash = md5(password);

// ❌ BAD: Fast hashes
const hash = sha256(password);

// ✅ GOOD: Memory-hard KDF
const key = await argon2id(password, salt, {
  m: 65536, // 64MB memory
  t: 3, // 3 iterations
  p: 1, // 1 parallel thread
});
```

### 2.5 Random Numbers

```typescript
// ❌ BAD: Math.random() for security
const nonce = Math.random().toString();

// ✅ GOOD: Cryptographically secure RNG
const nonce = crypto.getRandomValues(new Uint8Array(24));
```

---

## Authentication & Authorization

### 3.1 Password Requirements

```typescript
// Enforce strong passwords
const policy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minEntropyBits: 50,
  preventCommonPasswords: true,
};

function validatePassword(password: string): boolean {
  // Check against common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return false;
  }

  // Check entropy
  if (calculateEntropy(password) < 50) {
    return false;
  }

  // ... other checks
  return true;
}
```

### 3.2 Rate Limiting

```typescript
// ❌ BAD: No rate limiting
async function login(username: string, password: string) {
  return await authenticate(username, password);
}

// ✅ GOOD: Rate limited
async function login(username: string, password: string) {
  const rateLimit = checkRateLimit(username);

  if (!rateLimit.allowed) {
    throw new RateLimitError(rateLimit.retryAfter);
  }

  const result = await authenticate(username, password);

  if (!result.success) {
    recordFailedAttempt(username);
  }

  return result;
}
```

### 3.3 Session Management

```typescript
// ❌ BAD: Long-lived sessions, no expiration
const session = { userId, createdAt: Date.now() };

// ✅ GOOD: Short-lived, sliding expiration
const session = {
  userId,
  createdAt: Date.now(),
  expiresAt: Date.now() + SESSION_DURATION,
  lastActivityAt: Date.now(),
};

// Check expiration on each request
function validateSession(session: Session): boolean {
  const now = Date.now();

  // Absolute timeout
  if (now > session.expiresAt) return false;

  // Inactivity timeout
  if (now - session.lastActivityAt > INACTIVITY_TIMEOUT) return false;

  return true;
}
```

### 3.4 WebAuthn/Passkeys

```typescript
// ❌ BAD: Accept any authenticator
const options = { authenticatorSelection: {} };

// ✅ GOOD: Require user verification
const options = {
  authenticatorSelection: {
    userVerification: "required",
    authenticatorAttachment: "platform", // or "cross-platform"
  },
  challenge: generateSecureRandom(32),
  rp: {
    id: "locanote.app",
    name: "Locanote",
  },
};
```

---

## Data Protection

### 4.1 Sensitive Data Handling

```typescript
// ❌ BAD: Logging sensitive data
console.log("User password:", user.password);

// ✅ GOOD: Redact sensitive data
console.log("User login attempt:", {
  username: user.username,
  success: result.success,
  // password is NOT logged
});

// ❌ BAD: Storing in plaintext
localStorage.setItem("apiKey", apiKey);

// ✅ GOOD: Encrypt before storage
const encrypted = await encryptWithPassword(apiKey, password);
localStorage.setItem("apiKey", JSON.stringify(encrypted));
```

### 4.2 Data Encryption

```typescript
// ❌ BAD: Encrypting without authentication
const encrypted = aesEncrypt(data, key);

// ✅ GOOD: Authenticated encryption
const { ciphertext, nonce } = encrypt(data, key);
// Built-in MAC prevents tampering

// ❌ BAD: Same key for everything
const encryptedNote = encrypt(note, masterKey);
const encryptedSettings = encrypt(settings, masterKey);

// ✅ GOOD: Unique keys per resource
const noteKey = await getOrCreateNoteKey(userId, noteId, masterKey);
const encryptedNote = encrypt(note, noteKey);
```

### 4.3 Secure Storage

```typescript
// ❌ BAD: Storing passwords recoverably
const password = await encrypt(userPassword, key);

// ✅ GOOD: One-way hash
const hash = await argon2id(password, salt, params);

// ❌ BAD: No encryption at rest
await db.put("notes", { id, content: plaintext });

// ✅ GOOD: Encryption at rest
const encrypted = encrypt(plaintext, noteKey);
await db.put("notes", { id, encrypted });
```

---

## Input Validation

### 5.1 Validate All Inputs

```typescript
// ❌ BAD: Trusting user input
const noteId = params.id;
const note = await getNote(noteId);

// ✅ GOOD: Validate input
const noteId = params.id;
if (!isValidUUID(noteId)) {
  throw new ValidationError("Invalid note ID");
}
const note = await getNote(noteId);
```

### 5.2 Type Validation

```typescript
// ❌ BAD: No type checking
function processData(data: any) {
  return data.value.toUpperCase();
}

// ✅ GOOD: Runtime type checking
function processData(data: unknown) {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Data must be an object");
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.value !== "string") {
    throw new ValidationError("Value must be a string");
  }

  return obj.value.toUpperCase();
}
```

### 5.3 Size Limits

```typescript
// ❌ BAD: No size limits
const note = await request.json();
await saveNote(note);

// ✅ GOOD: Enforce size limits
const MAX_NOTE_SIZE = 1024 * 1024; // 1MB

const note = await request.json();
const size = JSON.stringify(note).length;

if (size > MAX_NOTE_SIZE) {
  throw new ValidationError(
    `Note exceeds maximum size of ${MAX_NOTE_SIZE} bytes`,
  );
}

await saveNote(note);
```

---

## Output Encoding

### 6.1 Prevent XSS

```svelte
<!-- ❌ BAD: Unescaped user input -->
<div>{@html userContent}</div>

<!-- ✅ GOOD: Escaped by default -->
<div>{userContent}</div>

<!-- ✅ GOOD: Sanitize if HTML needed -->
<div>{@html DOMPurify.sanitize(userContent)}</div>
```

### 6.2 URL Encoding

```typescript
// ❌ BAD: Unencoded URL parameter
const url = `/api/notes/${userInput}`;

// ✅ GOOD: Encode URL components
const url = `/api/notes/${encodeURIComponent(userInput)}`;
```

### 6.3 JSON Serialization

```typescript
// ❌ BAD: Manual JSON construction
const json = `{"name": "${userName}"}`;

// ✅ GOOD: Use JSON.stringify
const json = JSON.stringify({ name: userName });
```

---

## Session Management

### 7.1 Secure Session Storage

```typescript
// ❌ BAD: Plaintext in localStorage
localStorage.setItem("session", JSON.stringify(session));

// ✅ GOOD: Encrypted session
const encrypted = await encryptWithPassword(
  JSON.stringify(session),
  await getSessionPassword(),
);
localStorage.setItem("session_encrypted", JSON.stringify(encrypted));
```

### 7.2 Session Timeout

```typescript
// Check session on each sensitive operation
async function performSensitiveAction() {
  if (!isSessionValid(currentSession)) {
    await logout();
    throw new SessionExpiredError();
  }

  // Update activity timestamp
  await updateLastActivity();

  // Perform action
}
```

### 7.3 Concurrent Session Handling

```typescript
// ❌ BAD: Allow unlimited concurrent sessions
// ✅ GOOD: Limit concurrent sessions
const MAX_CONCURRENT_SESSIONS = 5;

async function createSession(userId: string): Promise<Session> {
  const sessions = await getActiveSessions(userId);

  if (sessions.length >= MAX_CONCURRENT_SESSIONS) {
    // Revoke oldest session
    await revokeSession(sessions[0].id);
  }

  return await createNewSession(userId);
}
```

---

## Error Handling

### 8.1 Don't Leak Information

```typescript
// ❌ BAD: Detailed error messages
throw new Error(`Database connection failed: ${dbUrl} - ${password}`);

// ✅ GOOD: Generic error to user, detailed log internally
console.error("Database connection failed", { error: e, dbUrl });
throw new Error("Internal server error");
```

### 8.2 Structured Error Handling

```typescript
// ✅ GOOD: Typed error responses
interface ErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  retryAfter?: number;
}

class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public retryAfter?: number,
  ) {
    super(message);
  }
}

// Usage
try {
  await riskyOperation();
} catch (e) {
  if (e instanceof AppError) {
    return {
      success: false,
      error: e.message,
      code: e.code,
      retryAfter: e.retryAfter,
    };
  }

  // Unknown error - don't leak details
  console.error("Unexpected error:", e);
  return {
    success: false,
    error: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
}
```

### 8.3 Graceful Degradation

```typescript
// ✅ GOOD: Degrade gracefully on crypto failure
async function encryptIfPossible(data: string): Promise<string | null> {
  try {
    return await encrypt(data, await getKey());
  } catch (e) {
    console.error("Encryption failed:", e);
    // Log security event
    await logSecurityEvent("encryption_failure", { error: e });
    return null;
  }
}
```

---

## Logging

### 9.1 Security Event Logging

```typescript
// ✅ GOOD: Log security events
await logSecurityEvent("login_success", {
  userId,
  method: "passkey",
  ipHash: await hashIdentifier(clientIP),
});

await logSecurityEvent("login_failure", {
  username,
  reason: "invalid_credentials",
  ipHash: await hashIdentifier(clientIP),
});
```

### 9.2 Never Log Sensitive Data

```typescript
// ❌ BAD: Logging sensitive data
console.log("User login:", { username, password, ssn });

// ✅ GOOD: Sanitize before logging
console.log("User login:", {
  username,
  password: "[REDACTED]",
  ssn: "[REDACTED]",
});
```

### 9.3 Audit Trail

```typescript
// ✅ GOOD: Complete audit trail
interface AuditLog {
  timestamp: number;
  userId: string;
  action: string;
  resource: string;
  result: "success" | "failure";
  metadata: Record<string, unknown>;
}

// Log all data modifications
await auditLog({
  timestamp: Date.now(),
  userId: currentUser.id,
  action: "note_update",
  resource: noteId,
  result: "success",
  metadata: {
    previousVersion: oldVersion,
    newVersion: newVersion,
  },
});
```

---

## Dependencies

### 10.1 Dependency Selection

- ✅ Use packages with active maintenance
- ✅ Check for security audits
- ✅ Prefer packages with few dependencies
- ✅ Review package source code when possible

### 10.2 Vulnerability Scanning

```bash
# Run before every release
pnpm audit

# Fix automatically
pnpm audit --fix

# Check specific package
pnpm audit --json | jq '.advisories | to_entries[] | select(.value.module_name == "package-name")'
```

### 10.3 Lock Files

```bash
# Always commit lock files
# This ensures reproducible builds
git add pnpm-lock.yaml

# Never modify lock files manually
# Use pnpm commands instead
pnpm update --latest
pnpm remove package-name
```

### 10.4 Subresource Integrity

```html
<!-- ✅ GOOD: Include SRI hash -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"
></script>

<!-- ❌ BAD: No integrity check -->
<script src="https://cdn.example.com/lib.js"></script>
```

---

## Code Review Checklist

Before submitting PR, verify:

- [ ] No hardcoded secrets or credentials
- [ ] All user inputs are validated
- [ ] Cryptographic operations use approved libraries
- [ ] Sensitive data is encrypted at rest
- [ ] No sensitive data in logs or error messages
- [ ] Rate limiting applied to authentication
- [ ] Session timeout is implemented
- [ ] XSS prevention (output encoding)
- [ ] Dependencies are up to date (`pnpm audit`)
- [ ] Security events are logged

---

## Resources

- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [SANS Secure Coding](https://www.sans.org/secure-coding/)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Questions?** Contact security@locanote.app

**Report Vulnerabilities:** security@locanote.app (PGP key available)
