# 🚀 Deployment Guide

This guide will help you deploy Locanote to Cloudflare's free tier for production use.

## 📋 Prerequisites

1. **Cloudflare Account** (Free)
   - Sign up at: https://dash.cloudflare.com/sign-up

2. **GitHub Repository**
   - Push your code to GitHub

3. **Node.js 22+** and **pnpm**

## 🔑 Step 1: Get Cloudflare Credentials

### Get API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Custom token" template
4. Set these permissions:
   - **Zone:Read** (for custom domains, optional)
   - **Cloudflare Workers:Edit**
   - **Account:Read**
   - **Page Rules:Edit** (optional)
5. Include these resources:
   - All accounts
   - All zones (or specific zone if using custom domain)
6. Click "Continue to summary" → "Create token"
7. **Copy and save the token** (you won't see it again!)

### Get Account ID

1. Go to your Cloudflare dashboard: https://dash.cloudflare.com
2. Look at the right sidebar
3. Copy your **Account ID**

## 🔐 Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

```
Name: CLOUDFLARE_API_TOKEN
Value: your_api_token_from_step_1

Name: CLOUDFLARE_ACCOUNT_ID
Value: your_account_id_from_step_1

Name: VITE_SIGNALING_URL
Value: wss://locanote-signaling.YOUR_SUBDOMAIN.workers.dev
```

**Note:** The `VITE_SIGNALING_URL` will be updated after the first signaling server deployment.

## 🚀 Step 3: Manual First Deployment

### Deploy Signaling Server First

```bash
# Navigate to signaling package
cd packages/signaling

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler deploy
```

After deployment, you'll get a URL like:
`https://locanote-signaling.YOUR_SUBDOMAIN.workers.dev`

Copy this URL and update the `VITE_SIGNALING_URL` secret in GitHub.

### Deploy Frontend to Cloudflare Pages

**Option A: Using Wrangler CLI**

```bash
# Build the frontend
cd apps/web
pnpm build

# Deploy to Pages
npx wrangler pages deploy build
```

**Option B: Using GitHub Actions (Recommended)**

Just push to your main branch and the GitHub Actions workflow will deploy automatically!

```bash
git add .
git commit -m "Production deployment setup"
git push origin main
```

## 🌐 Step 4: Custom Domain (Optional)

### Add Custom Domain to Pages

1. Go to Cloudflare Dashboard → Pages
2. Select your `locanote` project
3. Click **Custom domains** → **Set up a custom domain**
4. Enter your domain (e.g., `locanote.yourdomain.com`)
5. Follow the DNS setup instructions

### Add Custom Domain to Workers

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your `locanote-signaling` worker
3. Click **Triggers** → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter your domain (e.g., `signal.yourdomain.com`)

## 🧪 Testing Your Deployment

### Test Signaling Server

```bash
# Check if signaling server is running
curl https://locanote-signaling.YOUR_SUBDOMAIN.workers.dev/health
```

Should return: `OK`

### Test Frontend

1. Open your deployed frontend URL
2. Create an account
3. Create a note
4. Open the same note in another browser/incognito window
5. Test real-time collaboration!

## 📊 Monitoring

### Cloudflare Analytics

- **Pages Analytics**: View traffic, builds, errors
- **Workers Analytics**: View requests, CPU time, errors
- **Real-time Logs**: Stream logs from Workers

### Add Monitoring (Optional)

```bash
# Install wrangler CLI globally
npm install -g wrangler

# Stream logs
wrangler tail locanote-signaling
```

## 🔄 Continuous Deployment

The GitHub Actions workflow is set up to:

1. **On every push to main:**
   - Deploy signaling server
   - Build and deploy frontend
   - Run type checking
   - **Run Playwright E2E tests** (Ensures no regression in collaboration/UI)
   - Verify build

2. **On pull requests:**
   - Run type checking
   - **Run Playwright E2E tests**
   - Build verification
   - No deployment (preview only)

## 💰 Free Tier Limits

Your deployment will use:

| Service             | Free Limit          | Your Usage             |
| ------------------- | ------------------- | ---------------------- |
| **Pages**           | Unlimited bandwidth | ✅ Perfect             |
| **Workers**         | 100K requests/day   | ✅ ~1K/day expected    |
| **Durable Objects** | 1M requests/month   | ✅ ~10K/month expected |
| **KV**              | 1GB storage         | ✅ <10MB expected      |
| **Builds**          | 500/month           | ✅ ~20/month expected  |

**Estimated cost: $0/month** for typical usage!

## 🆘 Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors
cd apps/web
pnpm check

# Check for build errors
pnpm build
```

### Signaling Server Not Connecting

1. Check if Workers URL is correct in `VITE_SIGNALING_URL`
2. Verify CORS settings in `wrangler.toml`
3. Check browser console for WebSocket errors
4. Run `wrangler tail locanote-signaling` to see server logs

### Pages Not Deploying

1. Check GitHub Actions logs
2. Verify `CLOUDFLARE_API_TOKEN` has correct permissions
3. Ensure `CLOUDFLARE_ACCOUNT_ID` is correct
4. Check if build output is in `apps/web/build`

### CORS Errors

Update `wrangler.toml` in `packages/signaling`:

```toml
[vars]
ALLOWED_ORIGINS = "https://yourdomain.com,https://www.yourdomain.com"
```

Then redeploy:

```bash
cd packages/signaling
npx wrangler deploy
```

## 🎉 You're Live!

Your Locanote instance is now:

- ✅ Hosted on Cloudflare's global CDN
- ✅ Deployed automatically via GitHub Actions
- ✅ Using free tier (no credit card required)
- ✅ Ready for production use

---

**Need help?** Check the [Cloudflare Workers docs](https://developers.cloudflare.com/workers/) or [Cloudflare Pages docs](https://developers.cloudflare.com/pages/).
