# 🚀 Locanote Deployment Roadmap

Everything you need to launch your own zero-cost, privacy-first instance of Locanote on Cloudflare.

---

## ✅ Production Readiness Checklist

### 🔒 Security & Privacy

- **E2E Encryption**: Ensure your production domain is correctly set in `wrangler.toml` for hardened CORS.
- **Zero-Knowledge**: The architecture ensures servers are blind to content.
- **Passkey Support**: Secure, passwordless login using device biometrics.
- **Type-Safe Deployment**: The CI/CD pipeline ensures `svelte-check` passes with zero errors before release.

### 📱 Performance & Mobile

- **Static Export**: Frontend is built as a static site for near-instant load times globally.
- **Performance Tiering**: High-fidelity backgrounds are automatically disabled on low-power devices in production.
- **PWA Ready**: Installable on iOS, Android, and Desktop with offline support.
- **Adaptive UI**: High-fidelity experience optimized for all screen sizes.

---

## 🧪 Production Verification

Before releasing a new version, run the **Deep Scan** to verify UI integrity:

```bash
# Verify every button, modal, and GenUI intent in production-like environment
pnpm --filter @locanote/web exec playwright test e2e/ui-deep-scan.spec.ts
```

---

## 🛠️ How to Deploy

### 1. Cloudflare Credentials

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Generate an **API Token** with `Account:Read`, `Zone:Read`, and `Worker:Edit` permissions.
3. Note your **Account ID** from the dashboard sidebar.

### 2. GitHub Configuration

Add these as **GitHub Secrets** in your repository:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 3. Deployment Strategy

We use **GitHub Actions** for high-integrity deployments.

- **Trigger**: Every push to the `main` branch.
- **Verification**: The pipeline automatically runs `svelte-check` and type-checks before deploying.
- **Manual Overide**: You can trigger a deploy manually via the "Actions" tab.

### 4. GitHub Configuration

Add these as **GitHub Secrets** in your repository:

- `CLOUDFLARE_API_TOKEN`: Create a token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) with `Account:Read`, `Zone:Read`, and `Worker:Edit` permissions.
- `CLOUDFLARE_ACCOUNT_ID`: Found on your Cloudflare dashboard sidebar.

---

## 💰 Resource & Cost Management

Locanote is engineered to run entirely on the **Cloudflare Free Tier**.

| Resource       | Limit       | Why Locanote fits                                          |
| -------------- | ----------- | ---------------------------------------------------------- |
| **Builds**     | 500 / month | Manual triggers mean you only use 1 build per release.     |
| **Workers**    | 100k / day  | P2P technology means the server only handles "handshakes." |
| **KV Storage** | 1 GB        | We store small metadata; notes stay on your device.        |

---

Built for privacy. Built for speed. Deployed by you. 🚀
