import { x as attr_class, y as stringify, z as bind_props, F as head } from "../../chunks/index.js";
import "../../chunks/network.svelte.js";
import { a as attr } from "../../chunks/attributes.js";
import { k as escape_html } from "../../chunks/escaping.js";
import { a as auth } from "../../chunks/auth.svelte.js";
import { openDB } from "idb";
function Spinner($$renderer, $$props) {
  let {
    size = "md",
    // Default to medium size
    class: className = ""
    // Custom classes
  } = $$props;
  const sizeClasses = {
    sm: "h-4 w-4",
    // Small: 16px
    md: "h-6 w-6",
    // Medium: 24px
    lg: "h-8 w-8"
    // Large: 32px
  };
  $$renderer.push(`<svg${attr_class(`animate-spin ${stringify(sizeClasses[size])} ${stringify(className)}`)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" role="status"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span class="sr-only">Loading...</span>`);
}
function AuthCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      authState = { status: "idle" },
      onPasskeyLogin,
      onPasswordLogin,
      onSwitchToRegister
    } = $$props;
    let username = "";
    let isLoading = false;
    $$renderer2.push(`<div class="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"><div class="absolute inset-0 overflow-hidden"><div class="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div> <div class="absolute top-1/2 -right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div> <div class="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div></div> <div class="relative z-10 flex min-h-screen items-center justify-center p-4"><div class="w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]"><div class="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"><div class="relative p-8 text-center"><div class="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300"><svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></div> <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1> <p class="text-white/70 text-sm">Sign in to access your notes</p></div> <div class="px-8 pb-8 space-y-4"><div class="space-y-2"><label for="auth-username" class="block text-sm font-medium text-white/90 ml-1">Username</label> <div class="relative"><input id="auth-username" type="text"${attr("value", username)} placeholder="Enter your username" class="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm svelte-a034u4"/> <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (authState.status === "error") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2 animate-in slide-in-from-top-1"><svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${escape_html(authState.error)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (authState.status === "loading") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-4">`);
      Spinner($$renderer2, { class: "text-white" });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="space-y-3 pt-2">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button${attr("disabled", isLoading, true)} class="w-full py-4 px-6 rounded-xl bg-white text-indigo-600 font-semibold shadow-lg shadow-white/25 hover:shadow-xl hover:shadow-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> Sign in with Passkey</button> <button${attr("disabled", isLoading, true)} class="w-full py-4 px-6 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg> Sign in with Password</button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="relative py-4"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/20"></div></div> <div class="relative flex justify-center"><span class="px-4 text-xs font-medium text-white/50 bg-transparent">or</span></div></div> <div class="text-center"><button class="text-white/80 hover:text-white font-medium text-sm transition-colors duration-200 underline underline-offset-4 decoration-white/30 hover:decoration-white">Create a new account</button></div></div> <div class="px-8 pb-6"><div class="flex items-center justify-center gap-2 text-xs text-white/50"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> <span>End-to-end encrypted • Local-first</span></div></div></div></div></div></div>`);
    bind_props($$props, { authState });
  });
}
function RegisterCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      authState = { status: "idle" },
      onRegisterPasskey,
      onRegisterPassword,
      onSwitchToLogin
    } = $$props;
    let username = "";
    $$renderer2.push(`<div class="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500"><div class="absolute inset-0 overflow-hidden"><div class="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div> <div class="absolute bottom-20 right-10 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div> <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div></div> <div class="relative z-10 flex min-h-screen items-center justify-center p-4"><div class="w-full max-w-md transform transition-all duration-500 hover:scale-[1.01]"><div class="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"><div class="p-8 text-center"><div class="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-3 transition-transform duration-300"><svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg></div> <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1> <p class="text-white/70 text-sm">Join Locanote and start collaborating</p></div> <div class="px-8 pb-8 space-y-6"><div class="space-y-2"><label for="reg-username" class="block text-sm font-medium text-white/90 ml-1">Choose a username</label> <input id="reg-username" type="text"${attr("value", username)} placeholder="e.g., john_doe" class="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"/></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"><span class="block text-sm font-medium text-white/90 ml-1">Choose authentication method</span> <button class="w-full p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-left group"><div class="flex items-center gap-4"><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div> <div><div class="font-semibold text-white">Passkey</div> <div class="text-sm text-white/60">Face ID, fingerprint, or device PIN</div></div> <div class="ml-auto"><svg class="w-5 h-5 text-white/40 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div></div></button> <button class="w-full p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-left group"><div class="flex items-center gap-4"><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg></div> <div><div class="font-semibold text-white">Password</div> <div class="text-sm text-white/60">Create a secure password</div></div> <div class="ml-auto"><svg class="w-5 h-5 text-white/40 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div></div></button></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (authState.status === "error") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2"><svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${escape_html(authState.error)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (authState.status === "loading") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-4">`);
      Spinner($$renderer2, { class: "text-white" });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="relative py-4"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/20"></div></div> <div class="relative flex justify-center"><span class="px-4 text-xs font-medium text-white/50 bg-transparent">or</span></div></div> <div class="text-center"><button class="text-white/80 hover:text-white font-medium text-sm transition-colors duration-200 underline underline-offset-4 decoration-white/30 hover:decoration-white">Already have an account? Sign in</button></div> <div class="flex items-center justify-center gap-2 text-xs text-white/50 pt-2"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> <span>Your data stays on your device</span></div></div></div></div></div></div>`);
    bind_props($$props, { authState });
  });
}
function generateChallenge() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array.buffer;
}
function generateUserId() {
  return crypto.randomUUID();
}
function generateCredentialId() {
  return crypto.randomUUID();
}
let db = null;
async function initDB() {
  if (db) return db;
  db = await openDB("locanote", 1, {
    // Open 'locanote' db, version 1
    upgrade(db2, oldVersion, newVersion, transaction) {
      if (!db2.objectStoreNames.contains("users")) {
        const userStore = db2.createObjectStore("users", {
          // Create the store
          keyPath: "id"
          // Use 'id' field as primary key
        });
        userStore.createIndex("by-username", "username");
      }
      if (!db2.objectStoreNames.contains("credentials")) {
        const credStore = db2.createObjectStore("credentials", {
          keyPath: "id"
        });
        credStore.createIndex("by-user", "userId");
        credStore.createIndex("by-type", "type");
      }
      if (!db2.objectStoreNames.contains("notes")) {
        const noteStore = db2.createObjectStore("notes", {
          keyPath: "id"
        });
        noteStore.createIndex("by-user", "userId");
        noteStore.createIndex("by-tag", "tags", { multiEntry: true });
      }
      if (!db2.objectStoreNames.contains("tags")) {
        const tagStore = db2.createObjectStore("tags", {
          keyPath: "id"
        });
        tagStore.createIndex("by-user", "userId");
      }
    }
  });
  return db;
}
async function getDB() {
  if (!db) {
    await initDB();
  }
  return db;
}
async function createUser(user) {
  const db2 = await getDB();
  await db2.add("users", user);
  return user;
}
async function getUserById(id) {
  const db2 = await getDB();
  return db2.get("users", id);
}
async function getUserByUsername(username) {
  const db2 = await getDB();
  const index = db2.transaction("users").store.index("by-username");
  return index.get(username);
}
async function updateUser(user) {
  const db2 = await getDB();
  await db2.put("users", user);
  return user;
}
async function updateLastLogin(userId) {
  const user = await getUserById(userId);
  if (!user) return void 0;
  user.lastLoginAt = Date.now();
  return updateUser(user);
}
async function usernameExists(username) {
  const user = await getUserByUsername(username);
  return !!user;
}
async function createCredential(credential) {
  const db2 = await getDB();
  await db2.add("credentials", credential);
  return credential;
}
async function getCredentialsByUser(userId) {
  const db2 = await getDB();
  const index = db2.transaction("credentials").store.index("by-user");
  return index.getAll(userId);
}
async function getCredentialByType(userId, type) {
  const credentials = await getCredentialsByUser(userId);
  return credentials.find((cred) => cred.type === type);
}
async function loginWithPasskey(username) {
  try {
    let userId;
    if (username) ;
    const challenge = generateChallenge();
    const publicKeyCredentialRequestOptions = {
      // The challenge that must be signed
      challenge,
      // Timeout: 2 minutes
      timeout: 12e4,
      // The relying party (our app)
      rpId: window.location.hostname,
      // Allow any credential (we'll filter client-side if needed)
      allowCredentials: [],
      // User verification: try to get biometric/PIN if available
      userVerification: "preferred"
    };
    if (userId) {
      const credentials = await getCredentialsByUser(userId);
      const passkeyCreds = credentials.filter((c) => c.type === "passkey" && c.credentialId);
      if (passkeyCreds.length === 0) {
        return {
          success: false,
          error: "No passkey found for this user. Please use password login or register a passkey.",
          code: "NO_PASSKEY"
        };
      }
      publicKeyCredentialRequestOptions.allowCredentials = passkeyCreds.map((cred) => ({
        type: "public-key",
        id: cred.credentialId,
        transports: ["internal", "hybrid"]
      }));
    }
    const assertion = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
    if (!assertion) {
      return {
        success: false,
        error: "Authentication cancelled.",
        code: "CANCELLED"
      };
    }
    if (!userId) {
      const credId = arrayBufferToBase64(assertion.rawId);
      return {
        success: false,
        error: "Please enter your username to login.",
        code: "USERNAME_REQUIRED"
      };
    }
    const user = await getUserByUsername(username);
    if (user) {
      await updateLastLogin(user.id);
    }
    return {
      success: true,
      userId,
      username: user?.username || username,
      method: "passkey",
      credentialId: arrayBufferToBase64(assertion.rawId)
    };
  } catch (error) {
    console.error("Passkey login error:", error);
    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "Authentication failed. Please verify with your passkey.",
          code: "NOT_ALLOWED"
        };
      }
      if (error.name === "AbortError") {
        return { success: false, error: "Login cancelled.", code: "ABORTED" };
      }
    }
    return {
      success: false,
      error: "Login failed. Please try again.",
      code: "UNKNOWN_ERROR"
    };
  }
}
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
const MIN_LENGTH = 8;
const ITERATIONS = 1e5;
const KEY_LENGTH = 256;
const HASH_ALGORITHM = "SHA-256";
function validatePassword(password) {
  if (password.length < MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${MIN_LENGTH} characters long.`
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter."
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number."
    };
  }
  return { isValid: true, error: null };
}
function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return arrayToBase64(array);
}
async function hashPassword(password, salt) {
  const passwordBuffer = new TextEncoder().encode(password);
  const saltBuffer = base64ToArray(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    // Raw key material
    passwordBuffer,
    { name: "PBKDF2" },
    // Algorithm
    false,
    // Not extractable
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM
    },
    keyMaterial,
    KEY_LENGTH
  );
  return arrayToBase64(new Uint8Array(derivedBits));
}
async function registerWithPassword(username, password) {
  try {
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || "Invalid password.",
        code: "INVALID_PASSWORD"
      };
    }
    const exists = await usernameExists(username);
    if (exists) {
      return {
        success: false,
        error: "Username already taken. Please choose a different one.",
        code: "USERNAME_EXISTS"
      };
    }
    const userId = generateUserId();
    const credentialId = generateCredentialId();
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const now = Date.now();
    await createUser({ id: userId, username, createdAt: now, lastLoginAt: now });
    await createCredential({
      id: credentialId,
      userId,
      type: "password",
      passwordHash,
      // Store the hash
      salt,
      // Store the salt
      createdAt: now
    });
    return { success: true, userId, username, credentialId };
  } catch (error) {
    console.error("Password registration error:", error);
    return {
      success: false,
      error: "Failed to create account. Please try again.",
      code: "UNKNOWN_ERROR"
    };
  }
}
async function verifyPassword(userId, password) {
  try {
    const credential = await getCredentialByType(userId, "password");
    if (!credential || !credential.passwordHash || !credential.salt) {
      return false;
    }
    const computedHash = await hashPassword(password, credential.salt);
    return computedHash === credential.passwordHash;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}
function arrayToBase64(array) {
  let binary = "";
  for (let i = 0; i < array.byteLength; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}
function base64ToArray(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
async function loginWithPassword(username, password) {
  try {
    if (!username || !password) {
      return {
        success: false,
        error: "Please enter both username and password.",
        code: "MISSING_CREDENTIALS"
      };
    }
    const user = await getUserByUsername(username);
    if (!user) {
      return {
        success: false,
        error: "Invalid username or password.",
        code: "INVALID_CREDENTIALS"
      };
    }
    const isValid = await verifyPassword(user.id, password);
    if (!isValid) {
      return {
        success: false,
        error: "Invalid username or password.",
        code: "INVALID_CREDENTIALS"
      };
    }
    await updateLastLogin(user.id);
    return {
      success: true,
      userId: user.id,
      username: user.username,
      method: "password",
      credentialId: user.id
      // Using userId as credentialId for passwords
    };
  } catch (error) {
    console.error("Password login error:", error);
    return {
      success: false,
      error: "Login failed. Please try again.",
      code: "UNKNOWN_ERROR"
    };
  }
}
async function registerWithPasskey(username) {
  try {
    const exists = await usernameExists(username);
    if (exists) {
      return {
        // Return error
        success: false,
        error: "Username already taken. Please choose a different one.",
        code: "USERNAME_EXISTS"
      };
    }
    const userId = generateUserId();
    const credentialId = generateCredentialId();
    const challenge = generateChallenge();
    const publicKeyCredentialCreationOptions = {
      // The challenge that the authenticator must sign
      challenge,
      // Information about our app (the "relying party")
      rp: {
        name: "Locanote",
        // App name shown to user
        id: window.location.hostname
        // Domain (e.g., "localhost" or "locanote.app")
      },
      // Information about the user
      user: {
        id: new TextEncoder().encode(userId),
        // User ID as bytes
        name: username,
        // Username
        displayName: username
        // Display name
      },
      // What type of credentials we want
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        // ES256 (Elliptic Curve P-256 with SHA-256)
        { type: "public-key", alg: -257 }
        // RS256 (RSASSA-PKCS1-v1_5 with SHA-256)
      ],
      // Timeout: how long the user has to authenticate (5 minutes)
      timeout: 3e5,
      // What types of authenticators we accept
      authenticatorSelection: {
        // authenticatorAttachment: 'platform' means built-in (Face ID, Touch ID, Windows Hello)
        // 'cross-platform' would accept USB security keys
        // undefined accepts both
        authenticatorAttachment: void 0,
        // residentKey: 'required' means the credential is stored on the device
        // This allows the user to select their credential without typing username
        residentKey: "required",
        // requireResidentKey is the old name for residentKey (for backwards compatibility)
        requireResidentKey: true,
        // userVerification: 'preferred' means try to get biometric/PIN if available
        // but don't fail if the authenticator doesn't support it
        userVerification: "preferred"
      },
      // attestation: 'none' means we don't need hardware attestation
      // This is simpler and works with all authenticators
      attestation: "none"
    };
    const credential = await navigator.credentials.create({
      // Browser API
      publicKey: publicKeyCredentialCreationOptions
      // Pass our options
    });
    if (!credential) {
      return {
        success: false,
        error: "Registration cancelled. Please try again.",
        code: "CANCELLED"
      };
    }
    const response = credential.response;
    const rawCredentialId = credential.rawId;
    const publicKey = response.getPublicKey();
    const attestationObject = response.attestationObject;
    const now = Date.now();
    await createUser({ id: userId, username, createdAt: now, lastLoginAt: now });
    await createCredential({
      id: credentialId,
      userId,
      type: "passkey",
      publicKey: publicKey || void 0,
      // Store public key if available
      credentialId: rawCredentialId,
      // Store raw credential ID
      createdAt: now
    });
    return { success: true, userId, username, credentialId };
  } catch (error) {
    console.error("Passkey registration error:", error);
    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "Permission denied. Please allow access to your authenticator.",
          code: "NOT_ALLOWED"
        };
      }
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Registration cancelled.",
          code: "ABORTED"
        };
      }
      if (error.name === "SecurityError") {
        return {
          success: false,
          error: "WebAuthn requires a secure context (HTTPS or localhost).",
          code: "SECURITY_ERROR"
        };
      }
    }
    return {
      success: false,
      error: "Failed to create passkey. Please try again.",
      code: "UNKNOWN_ERROR"
    };
  }
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let viewMode = "login";
    async function handlePasskeyLogin() {
      auth.setLoading("Authenticating with passkey...");
      const result = await loginWithPasskey();
      if (result.success) {
        auth.handleAuthSuccess(result);
      } else {
        auth.handleAuthError(result);
      }
    }
    async function handlePasswordLogin(username, password) {
      auth.setLoading("Authenticating...");
      const result = await loginWithPassword(username, password);
      if (result.success) {
        auth.handleAuthSuccess(result);
      } else {
        auth.handleAuthError(result);
      }
    }
    async function handleRegisterPasskey(username) {
      auth.setLoading("Creating your account...");
      const result = await registerWithPasskey(username);
      if (result.success) {
        auth.handleAuthSuccess({
          success: true,
          userId: result.userId,
          username: result.username,
          method: "passkey",
          credentialId: result.credentialId
        });
      } else {
        auth.handleAuthError(result);
      }
    }
    async function handleRegisterPassword(username, password) {
      auth.setLoading("Creating your account...");
      const result = await registerWithPassword(username, password);
      if (result.success) {
        auth.handleAuthSuccess({
          success: true,
          userId: result.userId,
          username: result.username,
          method: "password",
          credentialId: result.credentialId
        });
      } else {
        auth.handleAuthError(result);
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("1uha8ag", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Locanote - Local-First Collaborative Notes</title>`);
        });
        $$renderer4.push(`<meta name="description" content="A secure, local-first note-taking app with real-time collaboration. Your notes stay on your device."/>`);
      });
      if (viewMode === "login") {
        $$renderer3.push("<!--[-->");
        AuthCard($$renderer3, {
          onPasskeyLogin: handlePasskeyLogin,
          onPasswordLogin: handlePasswordLogin,
          onSwitchToRegister: () => viewMode = "register",
          get authState() {
            return auth.state;
          },
          set authState($$value) {
            auth.state = $$value;
            $$settled = false;
          }
        });
      } else {
        $$renderer3.push("<!--[!-->");
        RegisterCard($$renderer3, {
          onRegisterPasskey: handleRegisterPasskey,
          onRegisterPassword: handleRegisterPassword,
          onSwitchToLogin: () => viewMode = "login",
          get authState() {
            return auth.state;
          },
          set authState($$value) {
            auth.state = $$value;
            $$settled = false;
          }
        });
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
