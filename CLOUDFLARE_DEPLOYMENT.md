# Cloudflare Deployment Guide

> **Complete deployment setup for Locanote on Cloudflare Free Tier**

This guide covers deploying Locanote to Cloudflare Pages (frontend) and Cloudflare Workers (signaling server) using GitHub Actions workflows instead of automatic deployments.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Secrets Reference](#secrets-reference)
4. [GitHub Actions Setup](#github-actions-setup)
5. [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
6. [Cloudflare Workers Deployment](#cloudflare-workers-deployment)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Source    │  │   Build     │  │    GitHub Actions       │  │
│  │   Code      │──│   Output    │──│    Workflows            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Cloudflare Free Tier                        │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │   Cloudflare Pages      │  │   Cloudflare Workers         │  │
│  │   (Static Frontend)     │  │   (Signaling Server)         │  │
│  │   - SvelteKit SPA       │  │   - WebRTC Signaling         │  │
│  │   - 500 builds/month    │  │   - 100k requests/day        │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Free Tier Limits:**

- Cloudflare Pages: 500 builds/month, unlimited requests
- Cloudflare Workers: 100,000 requests/day
- KV Storage: 1GB total, 100k reads/day
- Durable Objects: Limited free tier

---

## Prerequisites

1. **GitHub Account** with repository access
2. **Cloudflare Account** (free tier works)
3. **Domain** (optional, Cloudflare provides subdomain)
4. **Node.js 20+** and **pnpm** installed locally

---

## Secrets Reference

### Required Secrets

| Secret Name        | Description                                | Where to Get                                   |
| ------------------ | ------------------------------------------ | ---------------------------------------------- |
| `CF_API_TOKEN`     | Cloudflare API token with edit permissions | Cloudflare Dashboard → My Profile → API Tokens |
| `CF_ACCOUNT_ID`    | Your Cloudflare account ID                 | Cloudflare Dashboard → sidebar bottom          |
| `SIGNALING_SECRET` | JWT signing secret for WebRTC auth         | Generate: `openssl rand -hex 32`               |

### Optional Secrets

| Secret Name         | Description               | Use Case                      |
| ------------------- | ------------------------- | ----------------------------- |
| `ANALYTICS_API_KEY` | Analytics API key         | If using Cloudflare Analytics |
| `SENTRY_DSN`        | Sentry error tracking URL | Error monitoring              |

### Local Development (.env)

Create `apps/web/.env`:

```env
# Cloudflare Workers (signaling server)
SIGNALING_SECRET=your-signaling-secret-here
SIGNALING_URL=wss://signaling.your-domain.com

# App Configuration
PUBLIC_APP_URL=https://locanote.pages.dev
PUBLIC_SIGNALING_URL=wss://signaling.your-domain.com

# Optional: Analytics
# PUBLIC_ANALYTICS_ID=your-analytics-id
```

Create `packages/signaling/.env`:

```env
# Signaling Server Secrets
SIGNALING_SECRET=your-signaling-secret-here
ALLOWED_ORIGINS=https://locanote.pages.dev,https://your-domain.com
```

---

## SIGNALING_SECRET Explained

### What is SIGNALING_SECRET?

`SIGNALING_SECRET` is a **JWT (JSON Web Token) signing key** used to authenticate clients connecting to your WebRTC signaling server.

### Why is it needed?

1. **Authentication**: Verifies that only legitimate users can join rooms
2. **Authorization**: Ensures users can only access rooms they're allowed in
3. **Security**: Prevents unauthorized access to peer-to-peer connections
4. **Rate Limiting**: Enables per-user rate limiting

### How it works:

```
1. Client requests token from frontend
2. Frontend generates JWT signed with SIGNALING_SECRET
3. Client connects to signaling server with JWT
4. Server verifies JWT signature
5. If valid, connection established
```

### Generating a Secure Secret:

```bash
# Generate 256-bit (32 byte) hex string
openssl rand -hex 32

# Example output:
# a1b2c3d4e5f6... (64 characters)
```

**⚠️ Security Note:**

- Never commit SIGNALING_SECRET to git
- Rotate secrets every 90 days
- Use different secrets for staging/production
- Store in GitHub Secrets, not in code

---

## GitHub Actions Setup

### 1. Add Secrets to GitHub

Navigate to: `Settings → Secrets and variables → Actions`

Add these **Repository secrets**:

```
Name: CF_API_TOKEN
Value: <your-cloudflare-api-token>

Name: CF_ACCOUNT_ID
Value: <your-cloudflare-account-id>

Name: SIGNALING_SECRET
Value: <your-generated-secret>
```

### 2. Create Workflow Files

#### Frontend Deployment (`.github/workflows/deploy-frontend.yml`)

```yaml
name: Deploy Frontend to Cloudflare Pages

on:
  push:
    branches: [main]
    paths:
      - "apps/web/**"
      - "packages/shared/**"
      - ".github/workflows/deploy-frontend.yml"
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build frontend
        run: pnpm run build
        env:
          SIGNALING_SECRET: ${{ secrets.SIGNALING_SECRET }}
          PUBLIC_SIGNALING_URL: ${{ vars.PUBLIC_SIGNALING_URL }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: locanote
          directory: apps/web/build
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

#### Signaling Server Deployment (`.github/workflows/deploy-signaling.yml`)

```yaml
name: Deploy Signaling Server to Workers

on:
  push:
    branches: [main]
    paths:
      - "packages/signaling/**"
      - ".github/workflows/deploy-signaling.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          workingDirectory: packages/signaling
          command: deploy
          secrets: |
            SIGNALING_SECRET
            ALLOWED_ORIGINS
        env:
          SIGNALING_SECRET: ${{ secrets.SIGNALING_SECRET }}
          ALLOWED_ORIGINS: ${{ vars.ALLOWED_ORIGINS }}
```

### 3. Add Repository Variables

Navigate to: `Settings → Secrets and variables → Actions → Variables`

Add these **Repository variables** (not secrets):

```
Name: PUBLIC_SIGNALING_URL
Value: wss://signaling.your-domain.com

Name: ALLOWED_ORIGINS
Value: https://locanote.pages.dev,https://your-domain.com

Name: PUBLIC_APP_URL
Value: https://locanote.pages.dev
```

---

## Cloudflare Pages Deployment

### 1. Create Pages Project

1. Go to Cloudflare Dashboard
2. Navigate to **Pages**
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your repository
6. Configure build settings:
   - **Build command:** `pnpm run build`
   - **Build output directory:** `apps/web/build`
   - **Root directory:** `/`

### 2. Configure Build Settings

Add these environment variables in Cloudflare Pages:

```
NODE_VERSION: 20
PNPM_VERSION: 8
SIGNALING_SECRET: <your-secret>
PUBLIC_SIGNALING_URL: wss://signaling.your-domain.com
```

### 3. Custom Domain (Optional)

1. Go to Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain
4. Follow DNS configuration steps

---

## Cloudflare Workers Deployment

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Authenticate

```bash
wrangler login
```

### 3. Create KV Namespaces

```bash
# Rate limiting KV
wrangler kv:namespace create "RATE_LIMIT_KV"

# Store the ID in wrangler.toml
```

### 4. Configure wrangler.toml

Create `packages/signaling/wrangler.toml`:

```toml
name = "locanote-signaling"
main = "src/index.ts"
compatibility_date = "2026-02-28"

# Durable Objects
[[durable_objects.bindings]]
name = "SIGNALING_ROOMS"
class_name = "SecuredSignalingRoom"

# KV Namespaces
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-namespace-id"

# Secrets (set via wrangler secret or GitHub Actions)
# SIGNALING_SECRET
# ALLOWED_ORIGINS
```

### 5. Deploy Manually (First Time)

```bash
cd packages/signaling

# Set secrets
wrangler secret put SIGNALING_SECRET
# Enter your secret when prompted

wrangler secret put ALLOWED_ORIGINS
# Enter: https://locanote.pages.dev

# Deploy
wrangler deploy
```

---

## Environment Variables

### Production Environment Variables

| Variable               | Location         | Description                 |
| ---------------------- | ---------------- | --------------------------- |
| `SIGNALING_SECRET`     | GitHub Secrets   | JWT signing key             |
| `CF_API_TOKEN`         | GitHub Secrets   | Cloudflare API access       |
| `CF_ACCOUNT_ID`        | GitHub Secrets   | Cloudflare account ID       |
| `PUBLIC_SIGNALING_URL` | GitHub Variables | WebSocket URL for signaling |
| `ALLOWED_ORIGINS`      | GitHub Variables | CORS allowed origins        |
| `PUBLIC_APP_URL`       | GitHub Variables | Frontend URL                |

### Cloudflare Pages Environment Variables

Set in: Pages → Project → Settings → Environment variables

```
NODE_VERSION=20
PNPM_VERSION=8
PUBLIC_SIGNALING_URL=wss://signaling.your-domain.com
SIGNALING_SECRET=<secret>
```

### Cloudflare Workers Secrets

Set via Wrangler or GitHub Actions:

```bash
wrangler secret put SIGNALING_SECRET
wrangler secret put ALLOWED_ORIGINS
```

---

## Complete .env.example

### apps/web/.env.example

```env
# Signaling Server
SIGNALING_SECRET=dev-secret-do-not-use-in-production
SIGNALING_URL=ws://localhost:8787

# Public URLs (used in browser)
PUBLIC_APP_URL=http://localhost:5173
PUBLIC_SIGNALING_URL=ws://localhost:8787

# Optional: Analytics
# PUBLIC_ANALYTICS_ID=

# Optional: Sentry
# PUBLIC_SENTRY_DSN=
```

### packages/signaling/.env.example

```env
# Signaling Server Configuration
SIGNALING_SECRET=dev-secret-do-not-use-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173

# Optional: Rate Limiting
# RATE_LIMIT_REQUESTS_PER_MINUTE=100
```

---

## GitHub Repository Variables vs Secrets

### Use **Secrets** for:

- API tokens (CF_API_TOKEN)
- Private keys (SIGNALING_SECRET)
- Passwords
- Any sensitive data

### Use **Variables** for:

- URLs (PUBLIC_SIGNALING_URL)
- Origins (ALLOWED_ORIGINS)
- Feature flags
- Non-sensitive configuration

**Why?** Variables are readable in workflow logs, secrets are masked.

---

## Troubleshooting

### Build Fails

```bash
# Check Node version
node --version  # Should be 20+

# Clear cache
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Build locally
pnpm run build
```

### Deployment Fails

1. **Check API Token permissions:**
   - Cloudflare API Tokens → Edit zone
   - Cloudflare Pages → Edit
   - Account → Read

2. **Verify Account ID:**
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
     -H "Authorization: Bearer <YOUR_API_TOKEN>" \
     -H "Content-Type: application/json"
   ```

### Signaling Connection Fails

1. Check SIGNALING_SECRET matches between frontend and worker
2. Verify ALLOWED_ORIGINS includes your frontend URL
3. Check WebSocket URL is correct (wss:// for production)

### Rate Limiting Issues

Free tier limits:

- Workers: 100,000 requests/day
- KV: 100,000 reads/day
- Pages: 500 builds/month

---

## Security Checklist

Before going live:

- [ ] SIGNALING_SECRET is strong (256-bit minimum)
- [ ] Secrets are in GitHub Secrets, not in code
- [ ] ALLOWED_ORIGINS only includes your domains
- [ ] API token has minimum required permissions
- [ ] HTTPS enabled on custom domain
- [ ] Rate limiting configured
- [ ] CSP headers enabled
- [ ] Error tracking configured (Sentry)

---

## Monitoring

### Cloudflare Analytics

1. Go to Workers → Analytics
2. Monitor request volume and errors
3. Set up alerts for:
   - Error rate > 1%
   - Request count approaching 100k/day

### GitHub Actions Monitoring

1. Go to Actions tab
2. Check deployment status
3. Review build logs for errors

---

## Support

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/

---

**Last Updated:** 2026-02-28  
**Version:** 1.0.0
