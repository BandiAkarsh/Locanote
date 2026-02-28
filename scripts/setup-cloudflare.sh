#!/bin/bash
# =============================================================================
# CLOUDFLARE QUICK SETUP
# =============================================================================
# Gets your Cloudflare credentials for GitHub Actions
# 
# Usage:
#   ./scripts/setup-cloudflare.sh
# =============================================================================

echo "=============================================="
echo "  Locanote Cloudflare Quick Setup"
echo "=============================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing wrangler..."
    npm install -g wrangler
fi

# Check if logged in
echo "Checking Cloudflare login..."
if ! wrangler whoami &> /dev/null; then
    echo "Not logged in. Running wrangler login..."
    wrangler login
fi

# Get account info
echo "Getting account info..."
ACCOUNT_INFO=$(wrangler whoami --json 2>/dev/null)
ACCOUNT_ID=$(echo "$ACCOUNT_INFO" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
ACCOUNT_EMAIL=$(echo "$ACCOUNT_INFO" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "=============================================="
echo "  Account Details"
echo "=============================================="
echo "Email: $ACCOUNT_EMAIL"
echo "Account ID: $ACCOUNT_ID"
echo ""

echo "=============================================="
echo "  Step 1: Create API Token"
echo "=============================================="
echo ""
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo ""
echo "2. Click 'Create Custom Token'"
echo ""
echo "3. Find and click: 'Edit Cloudflare Workers' template (blue button)"
echo "   ┌─────────────────────────────────────────┐"
echo "   │  ✨ Edit Cloudflare Workers          │"
echo "   │     Template (recommended)            │"
echo "   └─────────────────────────────────────────┘"
echo ""
echo "4. Set 'Account Resources':"
echo "   ☑ Include: Specific account - $ACCOUNT_ID"
echo ""
echo "5. Click 'Continue to summary' → 'Create Token'"
echo ""
echo "6. Copy the token!"
echo ""

echo "=============================================="
echo "  Step 2: Add to GitHub"
echo "=============================================="
echo ""
echo "Go to: https://github.com/BandiAkarsh/Locanote/settings/secrets/actions"
echo ""
echo "Add these SECRETS:"
echo "  • CF_API_TOKEN = <paste your token>"
echo "  • CF_ACCOUNT_ID = $ACCOUNT_ID"
echo ""
echo "Add these VARIABLES:"
echo "  • PUBLIC_SIGNALING_URL = wss://locanote-signaling.workers.dev"
echo "  • ALLOWED_ORIGINS = https://locanote.pages.dev"
echo ""
echo "=============================================="
echo "  Done!"
echo "=============================================="
echo ""
echo "Run: git push origin main"
echo "to trigger deployment!"
