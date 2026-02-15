#!/bin/bash

# Generate icons from SVG for Tauri desktop app
# Requires: ImageMagick (convert command)

ICON_DIR="src-tauri/icons"
SVG_FILE="icon.svg"

echo "Generating icons from SVG..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Please install it:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  Windows: choco install imagemagick"
    exit 1
fi

# Generate PNG icons
convert -background none -resize 32x32 "$SVG_FILE" "$ICON_DIR/32x32.png"
convert -background none -resize 128x128 "$SVG_FILE" "$ICON_DIR/128x128.png"
convert -background none -resize 256x256 "$SVG_FILE" "$ICON_DIR/128x128@2x.png"
convert -background none -resize 512x512 "$ICON_FILE" "$ICON_DIR/icon.png"

# Generate ICO for Windows
convert -background none -resize 256x256 "$SVG_FILE" "$ICON_DIR/icon.ico"

# Generate ICNS for macOS (requires iconutil or png2icns)
if command -v png2icns &> /dev/null; then
    png2icns "$ICON_DIR/icon.icns" "$ICON_DIR/icon.png"
else
    echo "Note: png2icns not found. macOS icon (.icns) not generated."
    echo "Install libicns: brew install libicns"
fi

echo "Icons generated successfully!"
echo ""
echo "Generated files:"
ls -la "$ICON_DIR/"
