#!/bin/bash
# =============================================================================
# GENERATE CLOUDFLARE API TOKEN
# =============================================================================
# Creates a scoped API token for Locanote deployment using wrangler
# 
# Usage:
#   ./scripts/generate-cloudflare-token.sh
# =============================================================================

set -e

echo "=============================================="
echo "  Generating Cloudflare API Token"
echo "=============================================="

# Check if logged in
echo ""
echo "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare!"
    echo "Run 'wrangler login' first"
    exit 1
fi

echo "✅ Logged in to Cloudflare"

# Get account ID
ACCOUNT_ID=$(wrangler whoami --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ACCOUNT_ID" ]; then
    echo "❌ Could not get account ID"
    exit 1
fi

echo "� Account ID: $ACCOUNT_ID"

# Create the API token using wrangler
echo ""
echo "Creating API token..."

# The token is created via the Cloudflare API
TOKEN_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/user/tokens" \
    -H "Authorization: Bearer $(wrangler whoami --json 2>/dev/null | grep -o '"api_token":"[^"]*"' | cut -d'"' -f4)" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Locanote Deployment Token\",
        \"policies\": [
            {
                \"effect\": \"allow\",
                \"action\": \"read\",
                \"resource\": {
                    \"composite\": {
                        \"include\": [\"composite:account:$ACCOUNT_ID\"],
                        \"exclude\": []
                    }
                }
            },
            {
                \"effect\": \"allow\",
                \"action\": \"write\",
                \"resource\": {
                    \"composite\": {
                        \"include\": [\"composite:account:$ACCOUNT_ID\"],
                        \"exclude\": []
                    }
                }
            },
            {
                \"effect\": \"allow\",
                \"action\": \"edit\",
                \"resource\": {
                    \"composite\": {
                        \"include\": [\"composite:account:$ACCOUNT_ID\"],
                        \"exclude\": []
                    }
                }
            }
        ],
        \"expires_at\": null
    }" 2>/dev/null || echo '{"success": false}')

if echo "$TOKEN_RESPONSE" | grep -q '"success":true'; then
    API_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"value":"[^"]*"' | cut -d'"' -f4)
    
    echo ""
    echo "=============================================="
    echo "  ✅ API Token Generated Successfully!"
    echo "=============================================="
    echo ""
    echo "Token: $API_TOKEN"
    echo ""
    echo "Add these to GitHub Secrets:"
    echo "  CF_API_TOKEN = $API_TOKEN"
    echo "  CF_ACCOUNT_ID = $ACCOUNT_ID"
    echo ""
    echo "Or add to your local .env:"
    echo "  CF_API_TOKEN=$API_TOKEN"
    echo "  CF_ACCOUNT_ID=$ACCOUNT_ID"
else
    echo "❌ Failed to create token"
    echo "You may need to create it manually at:"
    echo "  https://dash.cloudflare.com/profile/api-tokens"
fi
