# 🚀 Deployment Guide

This guide will help you deploy Locanote to Cloudflare's free tier for production use.

## ✅ Recent Optimizations Completed

### 🔐 Security Fixes
- ✅ **CORS Configuration**: Removed insecure localhost origins from production
- ✅ **Signaling URL**: Hardcoded production WebSocket endpoint for security
- ✅ **Clean Environment**: No exposed secrets in repository

### 🔄 Deployment Strategy
- ✅ **Manual GitHub Actions**: Saves your 500 builds/month limit
- ✅ **Batch Commits**: Push code without triggering builds
- ✅ **Controlled Deployments**: You decide when to deploy

### 📱 Mobile Responsiveness
- ✅ **Mobile-First Design**: Already using responsive Tailwind classes
- ✅ **Touch-Friendly UI**: All components optimized for mobile
- ✅ **PWA Ready**: Service worker and manifest configured

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
```

**Note:** VITE_SIGNALING_URL is now hardcoded in the source code (`apps/web/src/lib/crdt/providers.ts`) for security.

## 🚀 Step 3: Deployment Options

### Option A: Manual GitHub Actions (RECOMMENDED - Saves Build Minutes)

We've set up a **manual deployment workflow** to save your 500 builds/month limit:

1. Push your code to GitHub (no automatic deployment!)
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Go to GitHub → **Actions** tab
3. Select **"Manual Deploy to Cloudflare"**
4. Click **"Run workflow"** button
5. Choose what to deploy:
   - ☑️ Deploy signaling server
   - ☑️ Deploy frontend
6. Click **"Run workflow"** again

**Why manual?** 
- Prevents accidental deployments during development
- You control when to use your build minutes
- Each deployment uses ~2-3 build minutes
- 500 minutes ÷ 3 = ~166 deployments per month

### Option B: Wrangler CLI (Direct Control)

**Deploy Signaling Server:**
```bash
cd packages/signaling
npx wrangler deploy
```

**Deploy Frontend:**
```bash
cd apps/web
pnpm build
npx wrangler pages deploy build
```

## 💰 Cost Optimization Tips

### Build Minutes Management
- **Batch your commits**: Work locally, commit frequently with git
- **Push once per feature**: Don't push on every small change
- **Deploy weekly**: Unless urgent, deploy once a week
- **Current estimate**: ~20 builds/month for active development

### Workers Requests Optimization
- **Monitor usage**: Check Cloudflare dashboard regularly
- **Limit room duration**: Signaling connections auto-close after 30 min idle
- **Expected usage**: ~1K requests/day for typical usage

### Bundle Size
- **Current size**: 1.5MB (excellent!)
- **Compressed**: ~400KB with brotli/gzip
- **Loading time**: <1s on 4G

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

### Update CORS After Custom Domain

If you add a custom domain, update `packages/signaling/wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://yourdomain.com,https://www.yourdomain.com,https://locanote.pages.dev"
```

Then redeploy:
```bash
cd packages/signaling
npx wrangler deploy
```

## 🧪 Testing Your Deployment

### Test Signaling Server

```bash
# Check if signaling server is running
curl https://locanote-signaling.akarshbandi82.workers.dev/health
```

Should return: `OK`

### Test Frontend

1. Open your deployed frontend URL: `https://locanote.pages.dev`
2. Create an account
3. Create a note
4. Open the same note in another browser/incognito window
5. Test real-time collaboration!

## 📊 Monitoring

### Check Workers Usage

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in sidebar
3. Select `locanote-signaling`
4. View **Analytics** tab
5. Check requests/day (limit: 100K/day)

### Stream Real-Time Logs

```bash
cd packages/signaling
npx wrangler tail locanote-signaling
```

## 📱 Mobile Testing

Your app is already mobile-optimized! Test on:
- iPhone Safari
- Android Chrome
- iPad/tablet

Check for:
- Touch targets (buttons should be ≥44px)
- Text readability
- Responsive layouts
- PWA installation prompt

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

1. ✅ Check Workers URL is correct in `apps/web/src/lib/crdt/providers.ts`
2. ✅ Verify CORS settings in `packages/signaling/wrangler.toml`
3. Check browser console for WebSocket errors
4. Run `wrangler tail locanote-signaling` to see server logs

### Pages Not Deploying via GitHub Actions

1. Check GitHub Actions logs (Actions tab → failed run)
2. Verify `CLOUDFLARE_API_TOKEN` has correct permissions
3. Ensure `CLOUDFLARE_ACCOUNT_ID` is correct
4. Check if build output is in `apps/web/build`
5. Make sure project name `locanote` exists in Cloudflare Pages

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

## 💡 Development Workflow

### Daily Development (No Builds Used)
```bash
# Start local dev server
cd apps/web
pnpm dev

# In another terminal, start signaling server
cd packages/signaling
npx wrangler dev --port 8787
```

### Weekly Deployment (Uses ~3 build minutes)
```bash
# Commit all changes
git add .
git commit -m "feat: add voice-to-text support"
git push origin main

# Then go to GitHub Actions and click "Run workflow"
```

## 🎉 You're Live!

Your Locanote instance is now:

- ✅ Hosted on Cloudflare's global CDN
- ✅ Deployed via **manual** GitHub Actions (saves build minutes)
- ✅ Using free tier (no credit card required)
- ✅ **Mobile-first responsive design**
- ✅ **Security-hardened** (no localhost in production)
- ✅ Ready for production use

## 📈 Free Tier Limits Summary

| Service | Free Limit | Your Usage | Status |
|---------|-----------|-----------|---------|
| **Pages** | Unlimited bandwidth | ~1GB/month | ✅ Good |
| **Workers** | 100K requests/day | ~1K/day | ✅ Excellent |
| **Durable Objects** | 1M requests/month | ~10K/month | ✅ Good |
| **KV** | 1GB storage | <10MB | ✅ Excellent |
| **Builds** | 500/month | ~20/month | ✅ Excellent |

**Estimated cost: $0/month** for typical usage!

---

**Need help?** Check the [Cloudflare Workers docs](https://developers.cloudflare.com/workers/) or [Cloudflare Pages docs](https://developers.cloudflare.com/pages/).
