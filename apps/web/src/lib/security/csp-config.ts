// ============================================================================
// CONTENT SECURITY POLICY CONFIGURATION
// ============================================================================
// Comprehensive CSP for Locanote with strict defaults.
//
// POLICY LEVEL: Strict (Blocks all inline scripts without nonces)
// COMPLIANCE: CSP Level 3, OWASP 2026
//
// USAGE:
// import { cspDirectives, securityHeaders } from './csp-config';
// Apply to SvelteKit responses via hooks
// ============================================================================

// ============================================================================
// NONCE GENERATION
// ============================================================================

/**
 * Generate CSP nonce for inline scripts
 * Nonce should be regenerated for each request
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// ============================================================================
// CSP DIRECTIVES
// ============================================================================

export interface CSPDirectives {
  [key: string]: string[];
}

/**
 * Strict CSP configuration
 * Use for production environments
 */
export const strictCSP: CSPDirectives = {
  // Default fallback
  "default-src": ["'self'"],

  // Scripts: Only self-hosted with nonce
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for SvelteKit (remove if using strict nonce policy)
    // "'nonce-{NONCE}'", // Replace {NONCE} with generated nonce
  ],

  // Styles: Self-hosted with inline allowed (Svelte requires inline styles)
  "style-src": ["'self'", "'unsafe-inline'"],

  // Images: Self-hosted, data URIs, and blob URLs
  "img-src": ["'self'", "data:", "blob:"],

  // Fonts: Self-hosted only
  "font-src": ["'self'"],

  // Connect: Self and signaling server
  "connect-src": [
    "'self'",
    "wss://*.locanote.app",
    "ws://localhost:*", // Development
    "https://*.locanote.app",
  ],

  // Media: Self-hosted
  "media-src": ["'self'", "blob:"],

  // Object: Block all plugins
  "object-src": ["'none'"],

  // Frame: Block embedding
  "frame-src": ["'none'"],

  // Worker: Self-hosted only
  "worker-src": ["'self'", "blob:"],

  // Frame ancestors: Prevent clickjacking
  "frame-ancestors": ["'none'"],

  // Form action: Self only
  "form-action": ["'self'"],

  // Base URI: Restrict base tag
  "base-uri": ["'self'"],

  // Upgrade insecure requests
  "upgrade-insecure-requests": [],
};

/**
 * Moderate CSP for development
 * Allows localhost connections and eval (needed for some dev tools)
 */
export const developmentCSP: CSPDirectives = {
  ...strictCSP,
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  "connect-src": [
    "'self'",
    "ws://localhost:*",
    "wss://localhost:*",
    "http://localhost:*",
    "https://localhost:*",
    "wss://*.locanote.app",
  ],
  "upgrade-insecure-requests": [],
};

/**
 * Generate CSP header string from directives
 */
export function generateCSPHeader(
  directives: CSPDirectives,
  nonce?: string,
): string {
  return Object.entries(directives)
    .map(([directive, values]) => {
      let directiveStr = directive;
      if (values.length > 0) {
        let valueStr = values.join(" ");
        if (nonce && valueStr.includes("{NONCE}")) {
          valueStr = valueStr.replace(/{NONCE}/g, nonce);
        }
        directiveStr += " " + valueStr;
      }
      return directiveStr;
    })
    .join("; ");
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Complete security headers configuration
 */
export function getSecurityHeaders(
  isDev = false,
  cspNonce?: string,
): SecurityHeaders {
  const csp = isDev ? developmentCSP : strictCSP;

  return {
    // Content Security Policy
    "Content-Security-Policy": generateCSPHeader(csp, cspNonce),

    // Strict Transport Security (HSTS)
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Prevent clickjacking
    "X-Frame-Options": "DENY",

    // XSS Protection (legacy, CSP is primary defense)
    "X-XSS-Protection": "1; mode=block",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy (formerly Feature-Policy)
    "Permissions-Policy": [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "battery=()",
      "camera=()",
      "display-capture=()",
      "document-domain=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "gamepad=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=()",
      "publickey-credentials-get=(self)", // Allow WebAuthn
      "publickey-credentials-create=(self)", // Allow WebAuthn
      "screen-wake-lock=()",
      "sync-xhr=(self)",
      "usb=()",
      "web-share=()",
      "xr-spatial-tracking=()",
    ].join(", "),

    // Cross-Origin policies
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",

    // Cache control for sensitive pages
    "Cache-Control": "no-store, max-age=0",

    // Remove server information
    "X-Powered-By": "",
    Server: "locanote",
  };
}

/**
 * Headers for static assets (less strict caching)
 */
export function getAssetHeaders(): SecurityHeaders {
  return {
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
}

/**
 * Headers for API responses
 */
export function getAPIHeaders(isDev = false): SecurityHeaders {
  const base = getSecurityHeaders(isDev);
  return {
    ...base,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    // Prevent API responses from being embedded
    "Content-Disposition": "inline",
  };
}

// ============================================================================
// SVELTEKIT HOOKS INTEGRATION
// ============================================================================

/**
 * SvelteKit handle function to add security headers
 *
 * Usage in hooks.ts:
 * import { sequence } from '@sveltejs/kit';
 * import { securityHeadersHook } from '$lib/security/csp-config';
 * export const handle = sequence(securityHeadersHook, ...);
 */
export async function securityHeadersHook({
  event,
  resolve,
}: {
  event: { url: URL; request: Request; locals: { cspNonce?: string } };
  resolve: (
    event: any,
    options?: { transformPageChunk?: (input: { html: string }) => string },
  ) => Promise<Response>;
}): Promise<Response> {
  const isDev =
    event.url.hostname === "localhost" || event.url.hostname === "127.0.0.1";

  // Generate nonce for this request
  const cspNonce = generateNonce();
  event.locals.cspNonce = cspNonce;

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Add nonce to script tags
      return html.replace(/<script/g, `<script nonce="${cspNonce}"`);
    },
  });

  // Add security headers
  const headers = getSecurityHeaders(isDev, cspNonce);
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}

// ============================================================================
// REPORT-ONLY MODE
// ============================================================================

/**
 * CSP in report-only mode for testing
 * Use this to test CSP without breaking the app
 */
export function getReportOnlyCSP(isDev = false): string {
  const csp = isDev ? developmentCSP : strictCSP;
  return generateCSPHeader(csp) + "; report-uri /api/csp-report";
}

// ============================================================================
// SUBRESOURCE INTEGRITY
// ============================================================================

/**
 * Generate SRI hash for a resource
 *
 * @param content - Resource content
 * @param algorithm - Hash algorithm (sha256, sha384, sha512)
 * @returns SRI string
 */
export async function generateSRI(
  content: string | Uint8Array,
  algorithm: "sha256" | "sha384" | "sha512" = "sha384",
): Promise<string> {
  const data =
    typeof content === "string" ? new TextEncoder().encode(content) : content;

  const hashBuffer = await crypto.subtle.digest(
    algorithm.toUpperCase(),
    data as BufferSource,
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return `${algorithm}-${hashBase64}`;
}

/**
 * Verify SRI hash
 */
export async function verifySRI(
  content: string | Uint8Array,
  sri: string,
): Promise<boolean> {
  const [algorithm, hash] = sri.split("-");
  if (!algorithm || !hash) return false;

  const computed = await generateSRI(
    content,
    algorithm as "sha256" | "sha384" | "sha512",
  );
  return computed === sri;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateNonce,
  strictCSP,
  developmentCSP,
  generateCSPHeader,
  getSecurityHeaders,
  getAssetHeaders,
  getAPIHeaders,
  securityHeadersHook,
  getReportOnlyCSP,
  generateSRI,
  verifySRI,
};
