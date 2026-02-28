# Locanote Privacy Implementation Guide

> **Step-by-Step Guide for Implementing Privacy Features**

This guide walks through implementing the privacy architecture in Locanote applications.

---

## Quick Start

### 1. Initialize Privacy Services

Add to your app's entry point (`+layout.svelte` or `app.ts`):

```typescript
import { initializePrivacyServices } from "$privacy";

// Initialize on app startup
initializePrivacyServices();
```

### 2. Add Privacy Settings Page

Update your settings page to include privacy controls:

```svelte
<script lang="ts">
  import { privacyStore, PrivacyLevel } from "$privacy";

  function setPrivacyLevel(level: PrivacyLevel) {
    privacyStore.setPrivacyLevel(level);
  }
</script>

<div class="privacy-settings">
  <h2>Privacy Level</h2>
  <button onclick={() => setPrivacyLevel("maximum")}>Maximum Privacy</button>
  <button onclick={() => setPrivacyLevel("balanced")}>Balanced</button>
  <button onclick={() => setPrivacyLevel("minimal")}>Minimal</button>
</div>
```

---

## Detailed Implementation

### Privacy by Design Integration

#### 1. Data Minimization

```typescript
import { getDataMinimizationService, DATA_REGISTRY } from "$privacy";

// Initialize with current config
const minimizationService = getDataMinimizationService(
  privacyStore.getConfig(),
);

// Scan content for PII before saving
async function saveNote(content: string) {
  const scanResult = minimizationService.scanForPII(content);

  if (scanResult.hasPII) {
    // Warn user or auto-anonymize
    console.warn(`Detected ${scanResult.count} PII instances`);

    // Option 1: Show warning
    showPiiWarning(scanResult.types);

    // Option 2: Auto-anonymize (with user consent)
    // content = minimizationService.suggestAnonymization(content);
  }

  // Save the note
  await saveToDatabase(content);
}
```

#### 2. Secure Deletion (Crypto-Shredding)

```typescript
import { getCryptoShreddingService } from "$privacy";

const shreddingService = getCryptoShreddingService();

// Register encryption key when creating a note
async function createEncryptedNote(noteId: string, content: string) {
  const key = await generateEncryptionKey();

  // Register key for future shredding
  shreddingService.registerKey(noteId, key);

  // Encrypt and save content
  const encrypted = await encrypt(content, key);
  await saveEncrypted(noteId, encrypted);
}

// Securely delete a note
async function deleteNoteSecurely(noteId: string) {
  const result = await shreddingService.shred(noteId, true);

  if (result.success) {
    console.log(`Note ${noteId} securely deleted`);
    console.log(`Method: ${result.method}`);
    console.log(`Verified: ${result.verified}`);
  }
}

// Delete all user data (Right to be Forgotten)
async function deleteAllUserData(userId: string) {
  const result = await shreddingService.deleteAllUserData(userId);

  if (result.success) {
    console.log(`Deleted ${result.deletedResources.length} resources`);
  } else {
    console.error("Some resources failed to delete:", result.failedResources);
  }
}
```

#### 3. Differential Privacy for Analytics

```typescript
import { getDifferentialPrivacyService, collectPrivateEvent } from "$privacy";

const dpService = getDifferentialPrivacyService();

// Collect private analytics
function trackFeatureUsage(featureName: string) {
  if (!privacyStore.hasConsent("analytics")) return;

  const event = collectPrivateEvent("feature_used", 1, "engagement", dpService);

  // Store locally (never transmitted raw)
  storeAnalyticsEvent(event);
}

// Query with differential privacy
function getPrivateStats(count: number) {
  // Check if we have budget
  if (!dpService.canQuery(0.1)) {
    console.log("Privacy budget exhausted");
    return null;
  }

  // Get noisy count
  const result = dpService.count(count, 0.1);

  console.log(`True count: ${count}, Private count: ${result.value}`);
  console.log(`Epsilon spent: ${result.epsilonSpent}`);
  console.log(`Remaining budget: ${result.remainingBudget}`);

  return result.value;
}
```

#### 4. Anonymous P2P Signaling

```typescript
import { getAnonymousSignalingService } from "$privacy";

const signalingService = getAnonymousSignalingService({
  rotationInterval: 60, // Rotate IDs every 60 minutes
  ephemeralSignaling: true,
  minEncryptionLevel: "e2e-encrypted",
  connectionPolicy: "auto",
});

// Initialize on app start
const peerId = signalingService.initialize();
console.log(`Anonymous peer ID: ${peerId}`);

// Create signaling message
const offer = await createWebRTCOffer();
const signalMessage = signalingService.createMessage("offer", offer, roomId);

// Send to signaling server
await sendToSignalingServer(signalMessage);

// Validate incoming message
const validation = signalingService.validateMessage(incomingMessage);
if (!validation.valid) {
  console.warn("Message has excessive metadata:", validation.reason);
  // Use sanitized version
  const sanitized = validation.sanitized;
}
```

---

## GDPR Implementation

### Right to Access (Article 15)

```typescript
import { getGDPRComplianceService } from "$privacy";

const gdpr = getGDPRComplianceService();

// Generate access report
async function handleAccessRequest(userId: string) {
  const report = await gdpr.generateAccessReport(userId);

  return {
    userId: report.userId,
    generatedAt: report.generatedAt,
    dataCategories: report.dataCategories,
    processingPurposes: report.processingPurposes,
    retentionInfo: report.retentionInfo,
    sharingInfo: report.sharingInfo,
  };
}
```

### Right to Portability (Article 20)

```typescript
// Export user data
async function exportUserData(userId: string, format: "json" | "csv" | "html") {
  const exportData = await gdpr.exportUserData(userId, format);

  // Convert to requested format
  const formatted = gdpr.formatExport(exportData);

  // Download
  downloadFile(formatted, `locanote-export-${userId}.${format}`);
}
```

### Right to Erasure (Article 17)

```typescript
// Handle deletion request
async function handleDeletionRequest(userId: string) {
  const result = await gdpr.eraseUserData(userId);

  return {
    success: result.success,
    deletedItems: result.deletedResources,
    errors: result.failedResources,
  };
}
```

---

## CCPA Implementation

```typescript
import { getCCPAComplianceService, checkCCPACompliance } from "$privacy";

const ccpa = getCCPAComplianceService();

// Generate privacy notice
const notice = ccpa.generatePrivacyNotice();
console.log("Categories collected:", notice.categoriesCollected);
console.log("Third parties:", notice.thirdParties);

// Process opt-out
function handleOptOut(userId: string, category: CCPACategory) {
  ccpa.optOut(userId, category);
}

// Check compliance
const compliance = checkCCPACompliance();
console.log(`CCPA Compliance: ${compliance.score}%`);
console.log("Missing items:", compliance.missing);
```

---

## Privacy Settings UI

### Component Example

```svelte
<script lang="ts">
  import { privacyStore, type PrivacyLevel } from "$privacy";

  const privacyLevels: {
    level: PrivacyLevel;
    label: string;
    description: string;
  }[] = [
    {
      level: "maximum",
      label: "Maximum Privacy",
      description: "Minimal data collection, no analytics, secure deletion",
    },
    {
      level: "balanced",
      label: "Balanced",
      description: "Privacy with convenience features",
    },
    {
      level: "minimal",
      label: "Minimal",
      description: "Maximum convenience, basic privacy",
    },
  ];

  function setLevel(level: PrivacyLevel) {
    privacyStore.setPrivacyLevel(level);
  }

  function toggleAnalytics() {
    privacyStore.updateConfig({
      allowAnalytics: !privacyStore.config.allowAnalytics,
    });
  }
</script>

<div class="privacy-settings">
  <section class="privacy-presets">
    <h3>Privacy Level</h3>
    {#each privacyLevels as { level, label, description }}
      <button
        class="privacy-option"
        class:active={privacyStore.currentLevel === level}
        onclick={() => setLevel(level)}
      >
        <strong>{label}</strong>
        <p>{description}</p>
      </button>
    {/each}
  </section>

  <section class="granular-controls">
    <h3>Detailed Settings</h3>

    <label class="toggle">
      <input
        type="checkbox"
        checked={privacyStore.config.allowAnalytics}
        onchange={toggleAnalytics}
      />
      <span>Allow Anonymous Analytics</span>
      <small>Uses differential privacy - your data stays private</small>
    </label>

    <label class="toggle">
      <input
        type="checkbox"
        checked={privacyStore.config.encryptExports}
        onchange={() =>
          privacyStore.updateConfig({
            encryptExports: !privacyStore.config.encryptExports,
          })}
      />
      <span>Encrypt Exported Data</span>
    </label>
  </section>

  <section class="privacy-score">
    <h3>Privacy Score</h3>
    {#if privacyStore.calculatePrivacyScore().overall >= 80}
      <div class="score excellent">
        {privacyStore.calculatePrivacyScore().overall}/100
      </div>
    {:else}
      <div class="score good">
        {privacyStore.calculatePrivacyScore().overall}/100
      </div>
    {/if}

    <ul class="recommendations">
      {#each privacyStore.calculatePrivacyScore().recommendations as rec}
        <li>{rec}</li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .privacy-option {
    border: 2px solid #ddd;
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
  }

  .privacy-option.active {
    border-color: #4caf50;
    background: #f0f8f0;
  }

  .score {
    font-size: 2rem;
    font-weight: bold;
    padding: 1rem;
    border-radius: 8px;
  }

  .score.excellent {
    background: #4caf50;
    color: white;
  }

  .score.good {
    background: #ffc107;
    color: black;
  }
</style>
```

---

## Compliance Verification

### Automated Checks

```typescript
import { checkPrivacyCompliance, generatePrivacyReport } from "$privacy";

// Check overall compliance
const compliance = checkPrivacyCompliance();
console.log("GDPR Compliance:", compliance.gdpr.score + "%");
console.log("CCPA Compliance:", compliance.ccpa.score + "%");

// Generate full report
const report = generatePrivacyReport();
console.log("Privacy Score:", report.score);
console.log("Data Fields:", report.dataFields);
console.log("Recommendations:", report.recommendations);
```

### Testing Privacy Features

```typescript
// Test crypto-shredding
async function testCryptoShredding() {
  const service = getCryptoShreddingService();

  // Create test key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  service.registerKey("test-note", key);

  // Shred
  const result = await service.shred("test-note", true);

  console.assert(result.success, "Shredding should succeed");
  console.assert(result.verified, "Shredding should be verified");
  console.assert(service.getKeyCount() === 0, "Key should be removed");
}

// Test differential privacy
function testDifferentialPrivacy() {
  const service = getDifferentialPrivacyService();

  const trueCount = 100;
  const result = service.count(trueCount, 0.1);

  // Result should be close to true count but not exact
  console.assert(
    Math.abs(result.value - trueCount) < 50,
    "Noise should be reasonable",
  );
  console.assert(result.epsilonSpent === 0.1, "Epsilon should be tracked");
}
```

---

## Best Practices

### 1. Always Check Consent

```typescript
if (!privacyStore.hasConsent("analytics")) {
  return; // Don't collect
}
```

### 2. Validate Data Before Storage

```typescript
const validation = validateDataFields(data);
if (!validation.valid) {
  throw new Error(`Prohibited fields: ${validation.prohibited.join(", ")}`);
}
```

### 3. Audit Sensitive Operations

```typescript
import { auditLog } from "$privacy";

auditLog.log("data_export", userId, "User exported data", undefined, {
  format,
  timestamp: Date.now(),
});
```

### 4. Handle Privacy Budget Exhaustion

```typescript
if (!dpService.canQuery(0.1)) {
  // Show user-friendly message
  showNotification("Analytics temporarily unavailable for privacy protection");
  return;
}
```

---

## Troubleshooting

### Issue: Privacy settings not persisting

**Solution**: Ensure `initializePrivacyServices()` is called on app startup.

### Issue: Differential privacy results too noisy

**Solution**: Increase epsilon budget (reduces privacy, increases accuracy) or collect more data points.

### Issue: Crypto-shredding failing

**Solution**: Verify the key was registered with `registerKey()` before calling `shred()`.

### Issue: GDPR export incomplete

**Solution**: Ensure all data sources are integrated with the export function.

---

## Migration Guide

### From Legacy Privacy (v1.x)

1. Replace direct localStorage access with `privacyStore`
2. Update analytics to use `collectPrivateEvent()`
3. Replace deletion with `shred()` or `deleteAllUserData()`
4. Add consent management for new features

### From Other Apps

1. Import privacy module: `import { initializePrivacyServices } from '$privacy'`
2. Wrap existing data operations with privacy checks
3. Add privacy settings UI
4. Implement consent prompts
5. Set up audit logging

---

**Document Version**: 2026.1  
**Last Updated**: 2026-02-28
