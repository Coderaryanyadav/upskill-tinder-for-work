#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
section() {
    echo -e "\n${GREEN}==> $1${NC}"
}

# Function to safely remove files/directories
safe_remove() {
    if [ -e "$1" ] || [ -d "$1" ]; then
        echo -e "${YELLOW}Removing $1...${NC}"
        rm -rf "$1"
    fi
}

# Stop any running processes
section "Stopping Running Processes"
pkill -f "node|npm|vite|vercel|firebase" 2>/dev/null || echo -e "${YELLOW}No processes to stop${NC}"

# Remove build and cache directories
section "Cleaning Build Artifacts"
for dir in \
    node_modules \
    dist \
    build \
    .vercel \
    .vite \
    .next \
    coverage \
    .idea \
    .firebase \
    .cache \
    .nuxt \
    .svelte-kit \
    .svelte \
    .DS_Store \
    .vscode \
    .vs \
    .sublime-workspace \
    *.sublime-project \
    *.sublime-workspace \
    *.suo \
    *.ntvs* \
    *.njsproj \
    *.sln \
    *.sw? \
    Thumbs.db; do
    safe_remove "$dir"
done

# Remove lock files and caches
section "Removing Lock Files and Caches"
for file in \
    package-lock.json \
    pnpm-lock.yaml \
    yarn.lock \
    .eslintcache \
    .prettiercache \
    *.log \
    npm-debug.log* \
    yarn-debug.log* \
    yarn-error.log* \
    firebase-debug.log* \
    lerna-debug.log* \
    *.tmp \
    *.temp \
    *.swp \
    *.swo; do
    safe_remove "$file"
done

# Handle environment files
section "Managing Environment Files"
if [ -f ".env" ] && [ ! -f ".env.example" ]; then
    echo -e "${YELLOW}⚠️  Backing up .env to .env.example${NC}"
    cp .env .env.example
fi

# Remove environment files but keep .env.example
for env_file in .env .env.local .env.development .env.production .env.test .env.*.local; do
    if [ "$env_file" != ".env.example" ]; then
        safe_remove "$env_file"
    fi
done

# Clean up temporary directories
section "Cleaning Temporary Directories"
find . -type d -name 'tmp' -exec rm -rf {} \; 2>/dev/null || true

# Clean up git related files
section "Cleaning Git Files"
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Removing .git directory${NC}"
    rm -rf .git
fi

# Final cleanup
section "Final Cleanup"
echo -e "${GREEN}✅ Project cleanup completed!${NC}"
echo -e "${YELLOW}You can now run 'npm install' to reinstall dependencies.${NC}"

# Make the script executable
chmod +x "$0"
