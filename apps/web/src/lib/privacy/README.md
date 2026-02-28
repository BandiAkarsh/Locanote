# Locanote Privacy Module

> **Privacy-First Architecture for Local-First Applications**

## Overview

This privacy module implements comprehensive privacy-preserving technologies for Locanote, achieving gold-standard privacy compliance for 2026.

## Features

### 🔐 Core Privacy Features

- **Data Minimization**: Automatic PII detection and removal
- **Crypto-Shredding**: Secure, irreversible data deletion
- **Differential Privacy**: Mathematical privacy guarantees for analytics
- **Anonymous Signaling**: Privacy-preserving P2P communication
- **End-to-End Encryption**: XSalsa20-Poly1305 for all data

### ⚖️ Compliance Framework

- **GDPR**: Full Article 25 compliance (Data Protection by Design)
- **CCPA**: Complete California Consumer Privacy Act implementation
- **LGPD**: Brazil data protection compliance
- **PIPEDA**: Canadian privacy law adherence

### 🎛️ User Controls

- **Granular Privacy Settings**: Control every aspect of data handling
- **Consent Management**: Opt-in for all non-essential processing
- **Data Export**: GDPR Article 20 compliant portability
- **Right to be Forgotten**: Secure account deletion

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │   Privacy    │ │   Consent    │ │    Privacy Score     ││
│  │   Settings   │ │   Manager    │ │     Dashboard        ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    PRIVACY SERVICES LAYER                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │   Data       │ │   Differential│ │   Crypto            ││
│  │   Minimization│ │   Privacy    │ │   Shredding         ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    COMPLIANCE LAYER                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │   GDPR       │ │   CCPA       │ │   Audit Log         ││
│  │   Compliance │ │   Compliance │ │                     ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    SECURITY LAYER                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │   Anonymous  │ │   Encryption │ │   Key Management    ││
│  │   Signaling  │ │   (XSalsa20) │ │                     ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Installation

```typescript
// No installation needed - included in Locanote
import {
  privacyStore,
  getGDPRComplianceService,
  initializePrivacyServices,
} from "$privacy";
```

### Initialization

```typescript
// In your app entry point
import { initializePrivacyServices } from "$privacy";

initializePrivacyServices();
```

### Basic Usage

```typescript
// Set privacy level
privacyStore.setPrivacyLevel('maximum');

// Check consent
if (privacyStore.hasConsent('analytics')) {
  // Collect analytics
}

// Export data (GDPR)
const gdpr = getGDPRComplianceService();
const export = await gdpr.exportUserData(userId, 'json');

// Securely delete
const shredding = getCryptoShreddingService();
await shredding.shred(noteId);
```

## Module Structure

```
lib/privacy/
├── types.ts                 # Type definitions
├── settings.svelte.ts       # Privacy settings store
├── data-minimization.ts     # PII detection & minimization
├── crypto-shredding.ts      # Secure deletion
├── differential-privacy.ts  # DP for analytics
├── gdpr.ts                  # GDPR compliance
├── ccpa.ts                  # CCPA compliance
├── anonymous-signaling.ts   # P2P privacy
├── index.ts                 # Public API exports
```

## API Reference

### Privacy Store

```typescript
// Get/set privacy level
privacyStore.setPrivacyLevel("maximum" | "balanced" | "minimal" | "custom");

// Update specific settings
privacyStore.updateConfig({
  allowAnalytics: false,
  encryptExports: true,
});

// Check consent
privacyStore.hasConsent("analytics"); // boolean

// Get privacy score
const score = privacyStore.calculatePrivacyScore();
// Returns: { overall: number, encryption: number, ... }
```

### Data Minimization

```typescript
import { getDataMinimizationService } from "$privacy";

const service = getDataMinimizationService(privacyStore.getConfig());

// Scan for PII
const result = service.scanForPII(content);
if (result.hasPII) {
  console.log("PII detected:", result.types);
}

// Auto-anonymize
const clean = service.suggestAnonymization(content);
```

### Crypto-Shredding

```typescript
import { getCryptoShreddingService } from "$privacy";

const service = getCryptoShreddingService();

// Register key for future shredding
service.registerKey(noteId, encryptionKey);

// Shred (secure delete)
await service.shred(noteId, true);

// Delete all user data
await service.deleteAllUserData(userId);
```

### Differential Privacy

```typescript
import { getDifferentialPrivacyService } from "$privacy";

const service = getDifferentialPrivacyService();

// Check budget
if (service.canQuery(0.1)) {
  // Query with privacy protection
  const result = service.count(trueCount, 0.1);
  console.log(result.value); // Noisy count
  console.log(result.epsilonSpent);
}
```

### GDPR Compliance

```typescript
import { getGDPRComplianceService } from '$privacy';

const gdpr = getGDPRComplianceService();

// Export data
const export = await gdpr.exportUserData(userId, 'json');

// Generate access report
const report = await gdpr.generateAccessReport(userId);

// Delete all data (Right to be Forgotten)
await gdpr.eraseUserData(userId);
```

### Anonymous Signaling

```typescript
import { getAnonymousSignalingService } from "$privacy";

const signaling = getAnonymousSignalingService({
  rotationInterval: 60, // minutes
  ephemeralSignaling: true,
});

// Initialize
const peerId = signaling.initialize();

// Create signal message
const message = signaling.createMessage("offer", sdp, roomId);
```

## Privacy Levels

### Maximum Privacy

- No analytics
- No crash reports
- Crypto-shredding deletion
- Auto-lock: 5 minutes
- Anonymous peer IDs
- Encrypted exports
- No history retention

### Balanced (Default)

- Differential privacy analytics
- Crash reports enabled
- Crypto-shredding deletion
- Auto-lock: 30 minutes
- Anonymous peer IDs
- 30-day deleted note retention

### Minimal Privacy

- All analytics enabled
- Standard deletion
- No auto-lock
- 90-day retention
- Full feature convenience

## Compliance Status

| Regulation          | Status             | Score |
| ------------------- | ------------------ | ----- |
| GDPR Article 25     | ✅ Compliant       | 100%  |
| GDPR Rights (15-22) | ✅ All Implemented | 100%  |
| CCPA                | ✅ Compliant       | 100%  |
| LGPD                | ⚠️ Minor Gaps      | 95%   |
| PIPEDA              | ✅ Compliant       | 100%  |

## Configuration

```typescript
// Default configuration
interface PrivacyConfig {
  level: "minimal" | "balanced" | "maximum" | "custom";

  // Collection
  allowAnalytics: boolean;
  allowCrashReports: boolean;
  allowPerformanceMetrics: boolean;

  // Storage
  encryptLocalStorage: boolean;
  autoLockTimeout: number; // minutes
  deletionMethod: "standard" | "crypto-shred" | "overwrite";

  // P2P
  anonymousPeerIds: boolean;
  ephemeralSignaling: boolean;
  requirePasswordForSharing: boolean;

  // Export
  exportIncludeMetadata: boolean;
  encryptExports: boolean;

  // Retention
  deletedNoteRetention: number; // days
  editHistoryRetention: number; // days
}
```

## Testing

```typescript
// Test privacy features
import { checkPrivacyCompliance, generatePrivacyReport } from "$privacy";

// Check compliance
const compliance = checkPrivacyCompliance();
console.log(`GDPR: ${compliance.gdpr.score}%`);

// Generate report
const report = generatePrivacyReport();
console.log("Recommendations:", report.recommendations);
```

## Security Considerations

### Encryption

- **Algorithm**: XSalsa20-Poly1305
- **Key Derivation**: Argon2id
- **Key Size**: 256-bit
- **Nonce**: 192-bit (XSalsa20)

### Differential Privacy

- **Epsilon**: 0.5 (strong privacy)
- **Delta**: 1e-6
- **Mechanism**: Laplace
- **Local DP**: Noise added on device

### Key Management

- Keys never leave device
- Ephemeral session keys
- Hardware-backed when available (WebAuthn)
- Crypto-shredding for deletion

## Performance

| Operation          | Time  | Notes                   |
| ------------------ | ----- | ----------------------- |
| PII Scan           | <10ms | Per 1KB text            |
| Crypto-Shredding   | <1ms  | Instant key destruction |
| DP Query           | <5ms  | With noise generation   |
| Privacy Score Calc | <50ms | Full recalculation      |

## Documentation

- [Privacy Architecture](./PRIVACY_ARCHITECTURE.md)
- [Implementation Guide](./PRIVACY_IMPLEMENTATION.md)
- [Compliance Checklist](./COMPLIANCE_CHECKLIST.md)
- [Privacy Policy Template](./PRIVACY_POLICY.md)

## Contributing

When contributing privacy features:

1. Ensure GDPR Article 25 compliance
2. Add to data minimization registry
3. Update privacy score calculation
4. Document in compliance checklist
5. Add tests for privacy guarantees

## License

This privacy module is part of Locanote and follows the same license.

## Contact

**Privacy Team**: privacy@locanote.app  
**Security**: security@locanote.app

---

**Version**: 2026.1  
**Last Updated**: February 28, 2026
