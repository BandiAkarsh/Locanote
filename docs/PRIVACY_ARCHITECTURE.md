# Locanote Privacy Architecture 2026

> **Privacy-First Design for the Gold Standard of Note-Taking Applications**

This document defines the comprehensive privacy architecture for Locanote, implementing 2026 privacy standards including GDPR Article 25, CCPA compliance, and advanced privacy-preserving technologies.

---

## 1. Privacy by Design Principles

### 1.1 Seven Foundational Principles (Cavoukian)

| Principle                     | Implementation in Locanote                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| **Proactive not Reactive**    | Privacy controls built before features; privacy impact assessments required          |
| **Privacy as Default**        | Maximum privacy settings active by default; no data sharing without explicit consent |
| **Privacy Embedded**          | Privacy integral to architecture, not bolted-on; zero-knowledge design               |
| **Full Functionality**        | No privacy/usability trade-off; all features work with maximum privacy               |
| **End-to-End Security**       | Data encrypted from creation to deletion; secure lifecycle management                |
| **Visibility & Transparency** | Clear privacy controls; audit logs; data flow visualization                          |
| **Respect for User**          | User-centric design; granular controls; data ownership                               |

### 1.2 Data Minimization Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA MINIMIZATION PYRAMID                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Level 5: Essential Only ──────────────────────────────┐          │
│          • Note content                                 │          │
│          • Username (pseudonym)                         │          │
│          • Cryptographic identifiers                    │          │
│                                                         │          │
│   Level 4: Temporal ───────────────────────────────┐    │          │
│          • Session timestamps (encrypted)          │    │          │
│          • Access logs (local-only)                │    │          │
│                                                    │    │          │
│   Level 3: Operational ───────────────────────┐    │    │          │
│          • Sync metadata (ephemeral)          │    │    │          │
│          • Collaboration state (encrypted)    │    │    │          │
│                                               │    │    │          │
│   Level 2: Analytics ────────────────────┐    │    │    │          │
│          • Differential privacy stats    │    │    │    │          │
│          • Aggregated usage (opt-in)     │    │    │    │          │
│                                          │    │    │    │          │
│   Level 1: Prohibited ──────────────┐    │    │    │    │          │
│          • Real names               │    │    │    │    │          │
│          • Email addresses          │    │    │    │    │          │
│          • Phone numbers            │    │    │    │    │          │
│          • Location data            │    │    │    │    │          │
│          • Third-party tracking     │    │    │    │    │          │
│                                     ▼    ▼    ▼    ▼    ▼          │
│                              COLLECTED DATA (Bottom-Up)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Privacy Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PRIVACY-PRESERVING ARCHITECTURE                           │
│                             Locanote Privacy Stack 2026                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         USER PRIVACY CONTROLS LAYER                          │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│   │
│  │  │   Consent    │ │ Granular     │ │ Data Export  │ │ Right to be          ││   │
│  │  │   Manager    │ │ Permissions  │ │ (GDPR Art 20)│ │ Forgotten            ││   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                      APPLICATION PRIVACY LAYER                               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│   │
│  │  │   Privacy    │ │  Audit Log   │ │  Anonymizer  │ │ Differential Privacy ││   │
│  │  │   Settings   │ │   Service    │ │   Service    │ │   Analytics          ││   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                      ZERO-KNOWLEDGE SECURITY LAYER                           │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│   │
│  │  │  XSalsa20-   │ │  Argon2id    │ │  Crypto      │ │  Secure Data         ││   │
│  │  │  Poly1305    │ │  Key Derive  │ │  Shredding   │ │  Deletion            ││   │
│  │  │  (E2E Encrypt)│ │             │ │              │ │                      ││   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                      P2P PRIVACY LAYER                                       │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│   │
│  │  │  Anonymous   │ │  Metadata    │ │  Ephemeral   │ │  Peer Identity       ││   │
│  │  │  Signaling   │ │  Minimizer   │ │  Exchange    │ │  Rotation            ││   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                      LOCAL-FIRST STORAGE LAYER                               │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│   │
│  │  │  Encrypted   │ │  IndexedDB   │ │  Yjs CRDT    │ │  Backup Encryption   ││   │
│  │  │  Storage     │ │  (Local-Only)│ │  (Encrypted) │ │  (Optional)          ││   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                      ADVANCED PRIVACY (2026)                                 │   │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────────┐ │   │
│  │  │  Zero-Knowledge  │ │  Secure Multi-   │ │  Homomorphic Encryption      │ │   │
│  │  │  Authentication  │ │  Party Compute   │ │  (Search - Optional)         │ │   │
│  │  │  (WebAuthn + ZKP)│ │  (Shared Notes)  │ │                              │ │   │
│  │  └──────────────────┘ └──────────────────┘ └──────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Analysis

### 3.1 Zero-Data-Leak Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                                      │
│                           (Zero Data Leak to Servers)                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   USER DEVICE                                    EXTERNAL SERVICES                  │
│   ┌─────────────────────────────────────┐          ┌──────────────────────────┐     │
│   │                                     │          │                          │     │
│   │  ┌──────────────┐                   │          │  ┌──────────────────┐    │     │
│   │  │   Browser    │                   │          │  │  Signaling Server │    │     │
│   │  │   (Local)    │                   │          │  │  (Cloudflare DO) │    │     │
│   │  └──────┬───────┘                   │          │  │                  │    │     │
│   │         │                           │          │  │  • Routes peers  │    │     │
│   │         ▼                           │          │  │  • No data access│    │     │
│   │  ┌──────────────┐                   │          │  │  • Ephemeral IDs │    │     │
│   │  │  IndexedDB   │                   │          │  └────────┬─────────┘    │     │
│   │  │  (Encrypted) │                   │          │           │              │     │
│   │  └──────┬───────┘                   │          │           │              │     │
│   │         │                           │          │           │              │     │
│   │         ▼                           │          │           ▼              │     │
│   │  ┌──────────────┐                   │          │  ┌──────────────────┐    │     │
│   │  │   Yjs CRDT   │◄────ENCRYPTED────►│          │  │   Anonymous      │    │     │
│   │  │   (Local)    │    SYNC (WebRTC)  │          │  │   Signaling      │    │     │
│   │  └──────┬───────┘                   │          │  └──────────────────┘    │     │
│   │         │                           │          │                          │     │
│   │         ▼                           │          └──────────────────────────┘     │
│   │  ┌──────────────┐                   │                                           │
│   │  │   TipTap     │                   │                                           │
│   │  │   Editor     │                   │                                           │
│   │  └──────────────┘                   │                                           │
│   │                                     │                                           │
│   │  ═════════════════════════════════  │                                           │
│   │  NO DATA EVER LEAVES UNENCRYPTED    │                                           │
│   │  ═════════════════════════════════  │                                           │
│   └─────────────────────────────────────┘                                           │
│                                                                                     │
│   LEGEND:                                                                           │
│   ┌──┐ = Component     ───► = Data Flow     ═══ = Security Boundary               │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LIFECYCLE                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   CREATE ──────────► STORE ──────────► USE ──────────► SHARE ──────────► DELETE    │
│      │                │                │               │                │          │
│      ▼                ▼                ▼               ▼                ▼          │
│   ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐       │
│   │• E2E   │      │• Local │      │• Memory│      │• P2P   │      │• Crypto│       │
│   │ encrypt│      │ storage│      │ only   │      │ encrypt│      │shredding│      │
│   │• Key   │      │• Index │      │• No logs│     │• Anon  │      │• Overwrite│     │
│   │ derive │      │ encrypt│      │• Ephemeral│   │ peers  │      │• Verification│  │
│   └────────┘      └────────┘      └────────┘      └────────┘      └────────┘       │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Privacy Implementation Components

### 4.1 Data Minimization Service

Located in: `apps/web/src/lib/privacy/data-minimization.ts`

**Purpose**: Ensures only essential data is collected and stored

**Features**:

- Automatic PII detection and removal
- Data field classification (essential vs optional)
- Automatic data purging after retention period
- Minimal metadata collection

### 4.2 Differential Privacy Analytics

Located in: `apps/web/src/lib/privacy/differential-privacy.ts`

**Purpose**: Anonymous usage analytics with mathematical privacy guarantees

**Features**:

- Laplace noise addition to queries
- Epsilon budget management
- Local differential privacy (on device)
- No raw data ever transmitted

### 4.3 Crypto Shredding Service

Located in: `apps/web/src/lib/privacy/crypto-shredding.ts`

**Purpose**: Secure data deletion beyond recovery

**Features**:

- Key destruction (faster than overwrite)
- Multi-pass overwrite (optional)
- Verification of deletion
- Audit trail of deletion

### 4.4 Anonymous Signaling

Located in: `apps/web/src/lib/privacy/anonymous-signaling.ts`

**Purpose**: Privacy-preserving WebRTC signaling

**Features**:

- Ephemeral peer IDs
- No IP logging
- Metadata minimization
- Onion-routing ready architecture

### 4.5 Privacy Settings Manager

Located in: `apps/web/src/lib/privacy/settings.ts`

**Purpose**: Granular user privacy controls

**Features**:

- Granular permission controls
- Privacy level presets (Minimal, Balanced, Maximum)
- Feature-specific privacy toggles
- Privacy impact warnings

---

## 5. Compliance Framework

### 5.1 GDPR Article 25 - Data Protection by Design

| Requirement                 | Implementation                                         |
| --------------------------- | ------------------------------------------------------ |
| **Technical Measures**      | E2E encryption, local storage, anonymous P2P           |
| **Organizational Measures** | Privacy training, DPO appointment, privacy reviews     |
| **Default Settings**        | Maximum privacy by default, opt-in for any sharing     |
| **Pseudonymization**        | User IDs are random UUIDs, not linked to real identity |
| **Encryption**              | XSalsa20-Poly1305 for data, Argon2id for keys          |

### 5.2 GDPR Rights Implementation

| Right                                 | Implementation Status | Location                               |
| ------------------------------------- | --------------------- | -------------------------------------- |
| **Right to Access (Art 15)**          | ✅ Complete           | `privacy/gdpr.ts` - `exportUserData()` |
| **Right to Rectification (Art 16)**   | ✅ Complete           | Note editing features                  |
| **Right to Erasure (Art 17)**         | ✅ Complete           | `privacy/crypto-shredding.ts`          |
| **Right to Restrict (Art 18)**        | ✅ Complete           | Privacy settings                       |
| **Right to Portability (Art 20)**     | ✅ Complete           | `export.svelte.ts` - JSON export       |
| **Right to Object (Art 21)**          | ✅ Complete           | Opt-out toggles                        |
| **Right to Not be Profiled (Art 22)** | ✅ Complete           | No profiling algorithms                |

### 5.3 CCPA Compliance Checklist

- [x] **Disclosure** - Privacy policy at onboarding
- [x] **Consumer Rights** - Access, delete, opt-out implemented
- [x] **Do Not Sell** - No data selling (N/A for local-first)
- [x] **Minors** - No users under 16 without consent
- [x] **Data Security** - Encryption, secure deletion
- [x] **Privacy Policy** - Comprehensive policy provided
- [x] **User Verification** - Authentication required for sensitive ops

---

## 6. Advanced Privacy Technologies

### 6.1 Zero-Knowledge Authentication

Combines WebAuthn with Zero-Knowledge Proofs for:

- Passwordless authentication
- No server knowledge of credentials
- Plausible deniability

### 6.2 Secure Multi-Party Computation (MPC)

For collaborative notes:

- Private set intersection for shared access
- Secure aggregation for collaborative statistics
- No central party sees all data

### 6.3 Homomorphic Encryption (Optional)

For encrypted search:

- Search without decrypting
- Privacy-preserving indexing
- Optional feature (performance intensive)

---

## 7. Privacy Threat Model

### 7.1 Threat Actors

| Actor                    | Threat                    | Mitigation                           |
| ------------------------ | ------------------------- | ------------------------------------ |
| **Network Eavesdropper** | Intercept sync data       | E2E encryption via XSalsa20-Poly1305 |
| **Malicious Peer**       | Access unauthorized notes | Cryptographic access control         |
| **Server Compromise**    | Access signaling data     | Zero-knowledge signaling, no logs    |
| **Local Attacker**       | Access device storage     | Encrypted IndexedDB, secure enclave  |
| **Insider (Developer)**  | Access user data          | Local-first, zero server data        |

### 7.2 Privacy Risks & Mitigations

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PRIVACY RISK MATRIX                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  High │                                         ┌───────────────────┐             │
│       │                                         │  Data Leak        │             │
│       │                                         │  (Mitigated by    │             │
│       │                                         │   E2E encrypt)    │             │
│       │                                         └───────────────────┘             │
│       │                                                                           │
│  Med  │     ┌──────────────┐              ┌──────────────┐                        │
│       │     │  Metadata    │              │  Side Channel │                        │
│       │     │  Analysis    │              │  Attacks      │                        │
│       │     │  (Anonymized │              │  (Constant-time│                        │
│       │     │   signaling) │              │   crypto)     │                        │
│       │     └──────────────┘              └──────────────┘                        │
│       │                                                                           │
│  Low  │  ┌──────────────────────────────────────────────────────────────┐          │
│       │  │  Physical Access  │  Social Engineering  │  Backup Leak     │          │
│       │  │  (Device encrypt) │  (User education)    │  (Client encrypt)│          │
│       │  └──────────────────────────────────────────────────────────────┘          │
│       │                                                                           │
│       └───────────────────────────────────────────────────────────────────────────┤
│            Low              Medium               High                    Critical  │
│                              IMPACT                                                │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Privacy Metrics & Monitoring

### 8.1 Privacy Score

```typescript
interface PrivacyScore {
  overall: number; // 0-100
  encryption: number; // Data at rest/transport
  minimization: number; // Data collected
  control: number; // User control granularity
  transparency: number; // Auditability
  compliance: number; // Regulatory compliance
}
```

### 8.2 Automated Privacy Checks

- Static analysis for PII in code
- Privacy test cases in CI/CD
- Data flow verification
- Encryption compliance scanning

---

## 9. Documentation & Resources

- **Implementation Guide**: `docs/PRIVACY_IMPLEMENTATION.md`
- **Compliance Checklist**: `docs/COMPLIANCE_CHECKLIST.md`
- **Privacy Policy Template**: `docs/PRIVACY_POLICY.md`
- **API Documentation**: `docs/PRIVACY_API.md`
- **Threat Model**: `docs/THREAT_MODEL.md`

---

## 10. References

- GDPR Article 25: Data Protection by Design
- CCPA Regulations (California Consumer Privacy Act)
- NIST Privacy Framework
- ISO/IEC 27701:2019 (Privacy Information Management)
- ENISA Cloud Computing Security & Privacy
- Privacy by Design Principles (Ann Cavoukian)

---

**Document Version**: 2026.1  
**Last Updated**: 2026-02-28  
**Classification**: Public  
**Owner**: Privacy Engineering Team
