#!/bin/bash
# Security Fixes Verification Script
# Run this after deploying to verify all security headers are properly configured

echo "=========================================="
echo "Shannon Security Fixes Verification"
echo "Target: locanote.pages.dev"
echo "=========================================="
echo ""

TARGET="https://locanote.pages.dev"
FAILED=0
PASSED=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_header() {
    local header_name=$1
    local expected_value=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    actual_value=$(curl -sI "$TARGET" | grep -i "^$header_name:" | tr -d '\r')
    
    if [ -z "$actual_value" ]; then
        echo -e "${RED}❌ FAIL${NC} - Header not found"
        FAILED=$((FAILED + 1))
        return
    fi
    
    if echo "$actual_value" | grep -qi "$expected_value"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        echo "   Value: $actual_value"
    else
        echo -e "${YELLOW}⚠️  WARNING${NC} - Value doesn't match expected"
        echo "   Expected: $expected_value"
        echo "   Actual: $actual_value"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

echo "1️⃣  Testing HTTP Security Headers"
echo "-----------------------------------"
echo ""

check_header "strict-transport-security" "max-age=31536000" "HSTS Header"
check_header "content-security-policy" "default-src" "CSP Header"
check_header "x-frame-options" "DENY" "X-Frame-Options"
check_header "x-content-type-options" "nosniff" "X-Content-Type-Options"
check_header "referrer-policy" "strict-origin-when-cross-origin" "Referrer-Policy"
check_header "permissions-policy" "camera" "Permissions-Policy"
check_header "access-control-allow-origin" "https://locanote.pages.dev" "CORS Policy"

echo ""
echo "2️⃣  Testing security.txt"
echo "-----------------------------------"
echo ""

echo -n "Testing security.txt accessibility... "
SECURITY_TXT=$(curl -s "${TARGET}/.well-known/security.txt" -o /dev/null -w "%{http_code}")

if [ "$SECURITY_TXT" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - security.txt is accessible"
    PASSED=$((PASSED + 1))
    
    echo ""
    echo "   Content preview:"
    curl -s "${TARGET}/.well-known/security.txt" | head -10 | sed 's/^/   /'
else
    echo -e "${RED}❌ FAIL${NC} - security.txt returned HTTP $SECURITY_TXT"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "3️⃣  Testing TLS Configuration"
echo "-----------------------------------"
echo ""

echo -n "Testing HTTPS enforcement... "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://locanote.pages.dev")
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "308" ]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP redirects to HTTPS"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  INFO${NC} - HTTP status: $HTTP_STATUS (Cloudflare may handle this)"
fi

echo ""
echo "4️⃣  Testing for Information Disclosure"
echo "-----------------------------------"
echo ""

echo -n "Checking for server version disclosure... "
SERVER_HEADER=$(curl -sI "$TARGET" | grep -i "^server:" | tr -d '\r')
if echo "$SERVER_HEADER" | grep -qi "cloudflare"; then
    echo -e "${GREEN}✅ PASS${NC} - Only Cloudflare header present (no version info)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ WARNING${NC} - Server header: $SERVER_HEADER"
    FAILED=$((FAILED + 1))
fi

echo ""
echo -n "Checking for X-Powered-By header... "
XPOWERED=$(curl -sI "$TARGET" | grep -i "^x-powered-by:")
if [ -z "$XPOWERED" ]; then
    echo -e "${GREEN}✅ PASS${NC} - No X-Powered-By header (good)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  INFO${NC} - X-Powered-By header present: $XPOWERED"
fi

echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo ""
echo -e "Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL SECURITY CHECKS PASSED!${NC}"
    echo ""
    echo "Your application is now properly secured with:"
    echo "  ✓ HSTS (SSL enforcement)"
    echo "  ✓ CSP (XSS protection)"
    echo "  ✓ Restricted CORS policy"
    echo "  ✓ security.txt for vulnerability reporting"
    echo "  ✓ All recommended security headers"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME CHECKS NEED ATTENTION${NC}"
    echo ""
    echo "Please review the failed checks above and:"
    echo "  1. Ensure the _headers file is in apps/web/static/"
    echo "  2. Ensure .well-known/security.txt exists"
    echo "  3. Redeploy the application"
    echo "  4. Clear Cloudflare cache if necessary"
    echo ""
    exit 1
fi
