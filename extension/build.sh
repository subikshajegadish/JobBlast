#!/bin/bash

# Build script for Chrome extension
echo "Building Chrome extension..."

# Build with Vite
npm run build

# Ensure icons directory exists in dist
mkdir -p dist/icons

# Create placeholder icons if they don't exist
if [ ! -f "icons/icon16.png" ]; then
    echo "Warning: Icons not found. Please add icon16.png, icon48.png, and icon128.png to the icons/ directory"
    echo "You can create icons using any image editor or online tool like https://www.favicon-generator.org/"
fi

echo "Build complete! Load the 'dist' folder in Chrome as an unpacked extension."

