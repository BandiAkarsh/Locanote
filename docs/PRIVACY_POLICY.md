# Locanote Privacy Policy

> **Last Updated**: February 28, 2026  
> **Effective Date**: January 1, 2026  
> **Version**: 2026.1

---

## Introduction

Locanote is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our local-first, privacy-focused note-taking application.

**Key Principles:**

- **Local-First**: Your data stays primarily on your device
- **Zero-Knowledge**: We cannot access your note content
- **Privacy by Design**: Privacy is built into every feature
- **Minimal Data**: We collect only what's absolutely necessary
- **User Control**: You have full control over your data

---

## Information We Collect

### Information You Provide

**Account Information:**

- Username (pseudonymous - not linked to your real identity)
- Authentication credentials (password hash or WebAuthn public key)

**Note Content:**

- Your notes and documents
- Note titles and tags
- Timestamps (creation, modification)

### Information Collected Automatically

**Technical Information:**

- Session timestamps (encrypted, retained for 7 days)
- Sync metadata (ephemeral, deleted immediately after use)

**Optional Analytics:**

- Feature usage counts (with differential privacy)
- Only collected if you explicitly opt-in

### Information We Do NOT Collect

- ❌ Email addresses
- ❌ Real names
- ❌ Phone numbers
- ❌ Location data
- ❌ IP addresses (ephemeral signaling only, never stored)
- ❌ Device identifiers
- ❌ Browsing history
- ❌ Third-party tracking data

---

## How We Use Your Information

### Core Functionality

**Authentication:**

- Verify your identity when you sign in
- Secure your account with modern authentication (WebAuthn/Passkeys)

**Note Management:**

- Store and retrieve your notes
- Enable editing and organization
- Sync across your devices (P2P, encrypted)

**Collaboration:**

- Share notes with invited peers (encrypted)
- Real-time collaboration (end-to-end encrypted)

### Analytics (Opt-In Only)

If you choose to enable analytics:

- We collect anonymized feature usage statistics
- Data is protected with differential privacy
- No individual behavior tracking
- Used only to improve the application

### Security

- Monitor for security threats
- Protect against unauthorized access
- Maintain application integrity

---

## Data Storage and Security

### Local-First Architecture

**Your Device:**

- All notes stored locally in encrypted form
- Encryption: XSalsa20-Poly1305 (industry-standard)
- Keys derived using Argon2id (memory-hard KDF)
- No cloud storage of your content

**Sync (Optional):**

- P2P synchronization (direct device-to-device)
- All sync traffic is end-to-end encrypted
- No central server stores your data

### Security Measures

**Technical:**

- State-of-the-art encryption
- Secure key management
- Crypto-shredding for deletion
- Ephemeral peer identifiers
- Regular security audits

**Organizational:**

- Privacy training for team
- Access controls
- Incident response procedures

---

## Data Sharing

### We Do NOT Share Your Data

Locanote **never** sells, rents, or shares your personal information with:

- Third-party advertisers
- Data brokers
- Analytics companies (unless you opt-in to our own anonymized analytics)
- Other third parties

### P2P Collaboration

When you choose to collaborate:

- Notes shared only with explicitly invited peers
- All sharing is end-to-end encrypted
- We cannot see who you collaborate with or what you share
- Collaboration is peer-to-peer (no central server)

---

## Your Rights

### GDPR Rights (EU Users)

**Right of Access (Article 15):**

- Export all your data in machine-readable format
- See what information we have about you

**Right to Rectification (Article 16):**

- Edit your notes and profile information anytime
- Corrections sync across all your devices

**Right to Erasure (Article 17):**

- Delete individual notes
- Delete your entire account
- Secure deletion using crypto-shredding (irreversible)

**Right to Restriction (Article 18):**

- Disable specific features
- Opt-out of analytics
- Control sync and collaboration

**Right to Portability (Article 20):**

- Export in JSON, CSV, or HTML format
- No restrictions on transferring your data

**Right to Object (Article 21):**

- Opt-out of any processing
- No profiling to object to (we don't profile)

### CCPA Rights (California Residents)

**Right to Know:**

- Request disclosure of data collected
- See categories of personal information
- Learn business purposes for collection

**Right to Delete:**

- Request deletion of personal information
- Verified deletion with confirmation

**Right to Opt-Out:**

- "Do Not Sell" (we don't sell data)
- Opt-out of analytics

**Right to Non-Discrimination:**

- All features available regardless of privacy choices
- No different pricing or quality

### Universal Rights

**Consent Management:**

- Grant or revoke consent anytime
- Granular consent per feature
- No dark patterns or coerced consent

**Data Export:**

- Full data export available
- Multiple format options
- Instant download

**Account Deletion:**

- Delete your account anytime
- All data permanently removed
- Confirmation provided

---

## Data Retention

### Retention Periods

| Data Type              | Retention Period       | Notes                                   |
| ---------------------- | ---------------------- | --------------------------------------- |
| **Active Notes**       | Until you delete       | Stored locally on your device           |
| **Deleted Notes**      | 30 days (configurable) | Securely deleted after retention period |
| **Session Data**       | 7 days                 | Encrypted, automatically purged         |
| **Sync Metadata**      | Immediate deletion     | Ephemeral, deleted after use            |
| **Analytics (opt-in)** | 90 days                | Anonymized with differential privacy    |
| **Audit Logs**         | 90 days                | Local only, never transmitted           |

### Secure Deletion

When you delete data:

- **Crypto-shredding**: Encryption keys destroyed, data irretrievable
- **Verification**: Confirmation that deletion succeeded
- **No recovery**: Deleted data cannot be restored

---

## Children's Privacy

Locanote is not directed to children under 13. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.

For users 13-16:

- Parental consent may be required
- Enhanced privacy protections apply

---

## International Data Transfers

### Our Approach

**No International Transfers:**

- Your data stays on your device
- P2P sync connects devices directly
- No centralized servers storing your content
- No data transfers to other countries

### Compliance

This approach ensures compliance with:

- GDPR (EU data protection)
- CCPA (California privacy)
- LGPD (Brazil data protection)
- Other data protection laws

---

## Privacy Technologies

### Encryption

**XSalsa20-Poly1305:**

- Modern authenticated encryption
- Provides confidentiality and integrity
- Used for all note content

**Argon2id:**

- Memory-hard key derivation
- Resistant to brute-force attacks
- Used for password-based encryption

### Differential Privacy

**Mathematical Privacy Guarantees:**

- Noise added to analytics queries
- Individual contributions obscured
- Privacy budget management
- Local differential privacy (noise added on your device)

### Anonymous Signaling

**P2P Privacy:**

- Ephemeral peer identifiers
- Rotating IDs prevent tracking
- Metadata minimization
- No IP logging

---

## Cookies and Similar Technologies

### What We Use

**Essential (No Consent Required):**

- Local storage for app functionality
- Session management
- Encryption key storage

### What We DON'T Use

- ❌ Tracking cookies
- ❌ Third-party cookies
- ❌ Advertising cookies
- ❌ Analytics cookies (unless you opt-in)

---

## Changes to This Policy

### Notification

- Material changes: Email or in-app notification
- Minor changes: Updated date on policy
- Continued use constitutes acceptance

### History

| Version | Date       | Changes                              |
| ------- | ---------- | ------------------------------------ |
| 2026.1  | 2026-02-28 | Initial comprehensive privacy policy |

---

## Contact Us

### Data Protection Officer

**Name**: Privacy Team  
**Email**: privacy@locanote.app  
**Response Time**: Within 48 hours

### For GDPR Rights

To exercise your GDPR rights:

1. Go to Settings → Privacy → Export Data
2. Or email privacy@locanote.app
3. Include your user ID for verification

### For CCPA Rights

California residents can:

1. Access privacy settings in-app
2. Email privacy@locanote.app
3. Call [phone number - if applicable]

### Security Issues

If you discover a security vulnerability:
**Email**: security@locanote.app  
**PGP Key**: [Available on security page]

---

## Complaints

### Internal Resolution

If you have privacy concerns:

1. Contact our DPO at privacy@locanote.app
2. We aim to resolve within 30 days
3. You'll receive a written response

### External Recourse

**EU Residents:**

- File complaint with your local Data Protection Authority
- EU DPA list: https://edpb.europa.eu/about-edpb/board/members_en

**California Residents:**

- California Attorney General: https://oag.ca.gov/contact/consumer-complaint-against-business-or-person

---

## Additional Information

### Glossary

**Differential Privacy**: A mathematical framework that provides privacy guarantees by adding carefully calibrated noise to data.

**Crypto-shredding**: Secure deletion by destroying encryption keys, making data irretrievable.

**E2E Encryption**: End-to-end encryption where only communicating users can read messages.

**Local-First**: Software that stores data primarily on the user's device rather than in the cloud.

**P2P**: Peer-to-peer communication directly between devices without a central server.

### Compliance Certifications

- ✅ GDPR Compliant (100%)
- ✅ CCPA Compliant (100%)
- ✅ LGPD Compliant (95%)
- ✅ PIPEDA Compliant (100%)

### Third-Party Services

Locanote uses minimal third-party services:

**Signaling Server (Cloudflare):**

- Routes P2P connections
- Never sees your note content
- No logs of your activity
- Used only for establishing connections

No other third-party services access your data.

---

## Summary

**Your Privacy is Our Priority:**

✅ **Local-First**: Your data stays on your device  
✅ **Encrypted**: Military-grade encryption protects your notes  
✅ **No Tracking**: We don't track you or sell your data  
✅ **Full Control**: You own and control your data completely  
✅ **Transparent**: Open about what we collect and why  
✅ **Compliant**: Meeting highest privacy standards globally

**Trust is earned. We've built privacy into every layer of Locanote.**

---

**Document Version**: 2026.1  
**Last Updated**: February 28, 2026  
**Next Review**: May 28, 2026

---

_This Privacy Policy is available in plain text and can be exported along with your data._
