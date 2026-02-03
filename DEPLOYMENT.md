# 🚀 Locanote Deployment Guide

This guide provides a zero-to-production roadmap for deploying your own instance of Locanote on Cloudflare.

---

## ✅ The "Pro" Setup Checklist

### 🔒 Security First
- **Zero-Knowledge**: Locanote uses End-to-End Encryption (E2EE). The server (Cloudflare) never sees your plain-text notes.
- **Hardened CORS**: Production builds are locked to your specific domain to prevent unauthorized access.
- **Passkeys**: Built-in support for biometrics (FaceID/TouchID) for secure, passwordless login.

### 📱 Performance & Mobile
- **Static Export**: The frontend is built as a static site for near-instant load times globally.
- **PWA Ready**: Users can install Locanote as a native app on iOS, Android, and Desktop.
- **Edge Runtime**: The signaling server runs on Cloudflare's edge, ensuring low latency for real-time collaboration.

---

## 🛠️ Step-by-Step Deployment

### 1. Cloudflare Credentials
1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Create an **API Token**:
   - Template: "Edit Cloudflare Workers".
   - Permissions: Add `Account:Read` and `Zone:Read`.
3. Copy your **Account ID** from the dashboard sidebar.

### 2. GitHub Configuration
In your GitHub Repository, go to `Settings -> Secrets and variables -> Actions` and add:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 3. Triggering the Build
We use a **Manual Deployment** strategy to save your build minutes (500/mo limit):
1. Go to your GitHub repo -> **Actions** tab.
2. Select **"Manual Deploy to Cloudflare"**.
3. Click **Run workflow**.

---

## 💰 Resource & Cost Management

Locanote is optimized for the **Cloudflare Free Tier ($0/month)**.

| Resource | Free Limit | Why it's enough |
|----------|------------|-----------------|
| **Builds** | 500 / month | Manual triggers mean you only use 1 build per release. |
| **Workers** | 100k / day | P2P technology means the server only handles "handshakes." |
| **KV Storage** | 1 GB | We only store small metadata; your notes stay on your device. |

---

## 📱 Local Mobile Testing

You don't need to deploy to test mobile! 
1. Open your browser's **DevTools** (F12).
2. Click the **Device Toggle** (Ctrl+Shift+M).
3. Choose a phone (e.g., iPhone 14) to verify the responsive layout and touch targets.

---

Built for privacy. Built for speed. Deployed by you. 🚀
