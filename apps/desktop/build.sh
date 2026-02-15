#!/bin/bash

# Build script for Locanote Desktop App
# Usage: ./build.sh [dev|build|icons]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Rust
    if ! command -v rustc &> /dev/null; then
        print_error "Rust not found. Please install Rust:"
        echo "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi
    print_status "Rust: $(rustc --version)"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js:"
        echo "  https://nodejs.org/"
        exit 1
    fi
    print_status "Node.js: $(node --version)"
    
    # Check npm packages
    if [ ! -d "node_modules" ]; then
        print_warning "npm packages not found. Installing..."
        npm install
    fi
}

# Generate icons
generate_icons() {
    print_status "Generating icons..."
    
    # Check if icons exist
    if [ ! -f "src-tauri/icons/icon.png" ]; then
        print_status "Creating icons from SVG..."
        python3 generate-icons.py
        python3 create-ico.py
        python3 create-icns.py
    else
        print_status "Icons already exist"
    fi
}

# Development mode
dev() {
    print_status "Starting development server..."
    check_prerequisites
    generate_icons
    
    print_status "Launching Locanote Desktop (Dev Mode)..."
    npm run tauri dev
}

# Production build
build() {
    print_status "Building Locanote Desktop (Production)..."
    check_prerequisites
    generate_icons
    
    print_status "Building for current platform..."
    npm run tauri build
    
    print_status "Build complete!"
    echo ""
    echo "Installers available in:"
    echo "  - Windows: src-tauri/target/release/bundle/msi/*.msi"
    echo "  - macOS: src-tauri/target/release/bundle/dmg/*.dmg"
    echo "  - Linux: src-tauri/target/release/bundle/deb/*.deb"
    echo "           src-tauri/target/release/bundle/appimage/*.AppImage"
}

# Icons only
icons() {
    print_status "Generating icons only..."
    generate_icons
    print_status "Icons generated in src-tauri/icons/"
}

# Help
help() {
    echo "Locanote Desktop Build Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev       Start development server with hot reload"
    echo "  build     Build production installers"
    echo "  icons     Generate app icons only"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev           # Start development"
    echo "  $0 build         # Build for current platform"
    echo "  $0 icons         # Generate icons"
}

# Main
case "${1:-help}" in
    dev)
        dev
        ;;
    build)
        build
        ;;
    icons)
        icons
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
