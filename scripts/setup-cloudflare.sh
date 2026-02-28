#!/bin/bash
# =============================================================================
# CLOUDFLARE SETUP SCRIPT
# =============================================================================
# Quick setup for Cloudflare API credentials
# 
# Usage:
#   ./scripts/setup-cloudflare.sh
# =============================================================================

echo "=============================================="
echo "  Locanote Cloudflare Setup"
echo "=============================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing wrangler..."
    npm install -g wrangler
fi

# Check if already logged in
echo "Step 1: Checking Cloudflare login..."
if wrangler whoami &> /dev/null; then
    echo "✅ Already logged in!"
    ACCOUNT_EMAIL=$(wrangler whoami 2>&1 | grep -oE '[^ ]+@[^ ]+' | head -1)
    ACCOUNT_ID=$(wrangler whoami --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Email: $ACCOUNT_EMAIL"
    echo "   Account ID: $ACCOUNT_ID"
else
    echo "❌ Not logged in"
    echo ""
    echo "Run: wrangler login"
    echo "Then run this script again"
    exit 1
fi

echo ""
echo "Step 2: Creating API Token..."
echo ""
echo "📋 Please create a token at:"
echo "   https://dash.cloudflare.com/profile/api-tokens"
echo ""
echo "Use this template:"
echo "   ┌─────────────────────────────────────────┐"
echo "   │ Template: Custom                        │"
echo "   │ Name: Locanote Deployment              │"
echo "   │ Permissions:                           │"
echo "   │   - Account: Edit                      │"
echo "   │   - Workers: Edit                      │"
echo "   │   - Workers KV: Edit                   │"
echo "   │   - Pages: Edit                        │"
echo "   │   - Zone: Read                        │"
echo "   │ Account Resources: $ACCOUNT_ID        │"
echo "   │ Zone Resources: Include All           │"
echo "   └─────────────────────────────────────────┘"
echo ""

# Save account ID for convenience
echo "$ACCOUNT_ID" > .cloudflare-account-id
echo "✅ Account ID saved to .cloudflare-account-id"

echo ""
echo "Step 3: Next Steps"
echo "   1. Create API token at the URL above"
echo "   2. Add to GitHub Secrets:"
echo "      - CF_API_TOKEN: <your-token>"
echo "      - CF_ACCOUNT_ID: $ACCOUNT_ID"
echo "   3. Add to GitHub Variables:"
echo "      - PUBLIC_SIGNALING_URL: wss://locanote-signaling.workers.dev"
echo "      - ALLOWED_ORIGINS: https://locanote.pages.dev"
echo ""
echo "Done! 🎉"
