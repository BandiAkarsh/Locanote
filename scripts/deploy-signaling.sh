#!/bin/bash
# =============================================================================
# LOCANOTE DEPLOYMENT SCRIPTS
# =============================================================================
# Quick deploy scripts for Locanote services
#
# Usage:
#   ./scripts/deploy-signaling.sh     # Deploy signaling server
#   ./scripts/deploy-web.sh          # Deploy web (via Pages)
#   ./scripts/deploy-all.sh          # Deploy everything
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Locanote Deployment${NC}\n"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Installing Wrangler...${NC}"
    npm install -g wrangler
fi

# Check if logged in
echo -e "${YELLOW}Checking Cloudflare authentication...${NC}"
wrangler whoami 2>/dev/null || {
    echo -e "${RED}Not logged in to Cloudflare! Run: wrangler login${NC}"
    exit 1
}

# Deploy signaling server
echo -e "${YELLOW}Deploying signaling server...${NC}"
cd packages/signaling

# Create KV namespaces if they don't exist
echo "Setting up KV namespaces..."
wrangler kv:namespace create "locanote-rate-limit" 2>/dev/null || true
wrangler kv:namespace create "locanote-room-cache" 2>/dev/null || true

# Set secrets
echo "Setting secrets..."
if [ -z "$SIGNALING_SECRET" ]; then
    echo "Generating new SIGNALING_SECRET..."
    export SIGNALING_SECRET=$(openssl rand -hex 32)
fi

echo "$SIGNALING_SECRET" | wrangler secret put SIGNALING_SECRET

# Deploy
echo "Deploying to Cloudflare Workers..."
wrangler deploy --env production

echo -e "${GREEN}✅ Signaling server deployed!${NC}"
echo "WebSocket URL: wss://locanote-signaling.workers.dev"

# Update environment variables for web app
cd ../..
echo ""
echo -e "${YELLOW}To update web app with signaling URL:${NC}"
echo "Add to GitHub Actions variables:"
echo "  PUBLIC_SIGNALING_URL=wss://locanote-signaling.workers.dev"
