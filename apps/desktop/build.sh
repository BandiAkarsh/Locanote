#!/bin/bash

# Build script for Locanote Desktop App
# Usage: ./build.sh [dev|build|icons|deps]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check and install system dependencies
install_deps() {
    print_info "Checking system dependencies..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Detect Ubuntu version
        if command -v lsb_release &> /dev/null; then
            UBUNTU_VERSION=$(lsb_release -rs)
            print_info "Detected Ubuntu $UBUNTU_VERSION"
        fi
        
        print_info "Installing dependencies..."
        
        # Common dependencies for all Ubuntu versions
        DEPS="libssl-dev pkg-config build-essential curl wget libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev"
        
        # Ubuntu 24.04+ uses webkit2gtk-4.1, older versions use 4.0
        if [[ "$UBUNTU_VERSION" == "24."* ]] || [[ "$UBUNTU_VERSION" > "24." ]]; then
            print_info "Ubuntu 24.04+ detected - using webkit2gtk-4.1"
            DEPS="$DEPS libwebkit2gtk-4.1-dev"
        else
            print_info "Older Ubuntu detected - using webkit2gtk-4.0"
            DEPS="$DEPS libwebkit2gtk-4.0-dev"
        fi
        
        echo ""
        print_warning "The following packages need to be installed:"
        echo "  $DEPS"
        echo ""
        print_info "Run this command to install them:"
        echo "  sudo apt-get update && sudo apt-get install -y $DEPS"
        echo ""
        
        # Check if dependencies are actually installed
        MISSING_DEPS=""
        
        if ! pkg-config --exists openssl; then
            MISSING_DEPS="$MISSING_DEPS libssl-dev"
        fi
        
        if [[ "$UBUNTU_VERSION" == "24."* ]] || [[ "$UBUNTU_VERSION" > "24." ]]; then
            if ! pkg-config --exists webkit2gtk-4.1; then
                MISSING_DEPS="$MISSING_DEPS libwebkit2gtk-4.1-dev"
            fi
        else
            if ! pkg-config --exists webkit2gtk-4.0; then
                MISSING_DEPS="$MISSING_DEPS libwebkit2gtk-4.0-dev"
            fi
        fi
        
        if [ -n "$MISSING_DEPS" ]; then
            print_error "Missing dependencies:$MISSING_DEPS"
            print_info "Install them with:"
            if [[ "$UBUNTU_VERSION" == "24."* ]] || [[ "$UBUNTU_VERSION" > "24." ]]; then
                echo "  sudo apt-get install -y libssl-dev pkg-config libwebkit2gtk-4.1-dev build-essential libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev"
            else
                echo "  sudo apt-get install -y libssl-dev pkg-config libwebkit2gtk-4.0-dev build-essential libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev"
            fi
            exit 1
        fi
        
        print_status "All system dependencies found"
    fi
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
    
    # Check system dependencies
    install_deps
    
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

# Build web app first
build_web() {
    print_status "Building web app first..."
    cd ../web
    
    if [ ! -d "node_modules" ]; then
        print_warning "Web app dependencies not found. Installing..."
        pnpm install
    fi
    
    pnpm build
    print_status "Web app built successfully"
    cd "$SCRIPT_DIR"
}

# Development mode
dev() {
    print_status "Starting development server..."
    check_prerequisites
    generate_icons
    build_web
    
    print_status "Launching Locanote Desktop (Dev Mode)..."
    npm run tauri dev
}

# Production build
build() {
    print_status "Building Locanote Desktop (Production)..."
    check_prerequisites
    generate_icons
    build_web
    
    print_status "Building desktop app..."
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

# Install dependencies only
deps() {
    install_deps
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
    echo "  deps      Check and show dependency install commands"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev           # Start development"
    echo "  $0 build         # Build for current platform"
    echo "  $0 deps          # Show dependencies needed"
    echo ""
    echo "Ubuntu 24.04 Note:"
    echo "  If you're on Ubuntu 24.04, install dependencies with:"
    echo "  sudo apt-get install -y libssl-dev pkg-config libwebkit2gtk-4.1-dev build-essential libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev"
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
    deps)
        deps
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
