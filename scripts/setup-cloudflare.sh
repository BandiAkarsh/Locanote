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

# Save for later
echo "$ACCOUNT_ID" > .cloudflare-account-id
echo "$ACCOUNT_EMAIL" > .cloudflare-email

echo "=============================================="
echo "  Next Steps"
echo "=============================================="
echo ""
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo ""
echo "2. Click 'Create Custom Token'"
echo ""
echo "3. Use these settings:"
echo ""
echo "   ┌────────────────────────────────────────────┐"
echo "   │ Name: Locanote Deployment                │"
echo "   ├────────────────────────────────────────────┤"
echo "   │ Permissions (add these):                  │"
echo "   │                                            │"
echo "   │ • Account - Workers - Edit               │"
echo "   │ • Account - Workers KV - Edit            │"
echo "   │ • Account - Pages - Edit                 │"
echo "   │ • Zone - Zone - Read                    │"
echo "   │                                            │"
echo "   │ [ + Add more ]                           │"
echo "   └────────────────────────────────────────────┘"
echo ""
echo "4. Set 'Account Resources' to:"
echo "   ☑ Include: Specific account - $ACCOUNT_ID"
echo ""
echo "5. Click 'Continue to summary' then 'Create Token'"
echo ""
echo "6. Copy the token and add to GitHub:"
echo ""
echo "   Secrets:"
echo "   • CF_API_TOKEN = <paste your token>"
echo "   • CF_ACCOUNT_ID = $ACCOUNT_ID"
echo ""
echo "   Variables:"
echo "   • PUBLIC_SIGNALING_URL = wss://locanote-signaling.workers.dev"
echo "   • ALLOWED_ORIGINS = https://locanote.pages.dev"
echo ""
echo "Done! 🎉"
