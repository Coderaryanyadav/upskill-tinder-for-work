#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
section() {
    echo -e "\n${BLUE}==> $1${NC}"
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
echo -e "${YELLOW}🛑 Stopping any running processes...${NC}"
pkill -f "node|npm|vite|vercel|firebase" 2>/dev/null || echo -e "${YELLOW}No processes to stop${NC}"

# Remove build and cache directories
section "Cleaning Build Artifacts"
for dir in node_modules dist build .vercel .vite .next coverage .idea .firebase .cache .nuxt .svelte-kit .svelte .DS_Store; do
    safe_remove "$dir"
done

# Remove lock files and caches
section "Removing Lock Files and Caches"
for file in package-lock.json pnpm-lock.yaml yarn.lock .eslintcache .prettiercache; do
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

# Clean up log files
section "Cleaning Log Files"
find . -type f \( -name '*.log' -o -name 'npm-debug.log*' -o -name 'yarn-debug.log*' \
    -o -name 'yarn-error.log*' -o -name 'firebase-debug.log*' -o -name 'lerna-debug.log*' \) -delete

# Clean up temporary files
section "Cleaning Temporary Files"
find . -type f -name '*.tmp' -delete
find . -type f -name '*.temp' -delete
find . -type f -name '*.swp' -delete
find . -type f -name '*.swo' -delete
find . -type d -name 'tmp' -exec rm -rf {} \; 2>/dev/null || true

# Clean up editor and IDE specific files
section "Cleaning Editor Files"
for editor_file in .vscode .idea .vscode-test .history .vs .sublime-workspace \
    *.sublime-project *.sublime-workspace *.suo *.ntvs* *.njsproj *.sln \
    *.sw? .DS_Store Thumbs.db; do
    safe_remove "$editor_file"
done

# Clean up git related files
section "Cleaning Git Files"
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Removing .git directory${NC}"
    rm -rf .git
fi

# Ensure .gitignore exists with proper content
section "Updating .gitignore"
cat > .gitignore << 'EOL'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage
.nyc_output

# Production
/build
/dist
/.vercel

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
firebase-debug.log*

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# System Files
.DS_Store
Thumbs.db

# Local Netlify folder
.netlify

# Vercel
.vercel

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Build files
.next/
.nuxt/
.svelte-kit/

# Cache directories
.cache/
.temp/
.tmp/
.turbo/

# Logs
logs
*.log

# Local development
.env
!.env.example

# Build output
out/

# Vite
.vite/
*.local

# PWA
sw.js
workbox-*.js
workbox-*.js.map
workbox-*.js.LICENSE.txt

# Misc
.vercel
.vercel_build_output
.vercel_output

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test/

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Vercel
.vercel

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
.next
out

# Cache
.cache
.parcel-cache

# IDE
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# System Files
.DS_Store
Thumbs.db

# Local Netlify folder
.netlify

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Build files
.next/
.nuxt/
.svelte-kit/

# Cache directories
.cache/
.temp/
.tmp/
.turbo/

# Logs
logs
*.log

# Local development
.env
!.env.example

# Vite
.vite/
*.local

# PWA
sw.js
workbox-*.js
workbox-*.js.map
workbox-*.js.LICENSE.txt

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test/

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Vercel
.vercel

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
.next
out

# Cache
.cache
.parcel-cache

# IDE
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# System Files
.DS_Store
Thumbs.db

# Local Netlify folder
.netlify

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Build files
.next/
.nuxt/
.svelte-kit/

# Cache directories
.cache/
.temp/
.tmp/
.turbo/

# Logs
logs
*.log

# Local development
.env
!.env.example

# Vite
.vite/
*.local

# PWA
sw.js
workbox-*.js
workbox-*.js.map
workbox-*.js.LICENSE.txt

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test/

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Vercel
.vercel

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
.next
out

# Cache
.cache
.parcel-cache

# IDE
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# System Files
.DS_Store
Thumbs.db

# Local Netlify folder
.netlify

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Build files
.next/
.nuxt/
.svelte-kit/

# Cache directories
.cache/
.temp/
.tmp/
.turbo/

# Logs
logs
*.log

# Local development
.env
!.env.example

# Vite
.vite/
*.local

# PWA
sw.js
workbox-*.js
workbox-*.js.map
workbox-*.js.LICENSE.txt

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test/

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Vercel
.vercel

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
.next
out

# Cache
.cache
.parcel-cache

# IDE
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# System Files
.DS_Store
Thumbs.db

# Local Netlify folder
.netlify

# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Build files
.next/
.nuxt/
.svelte-kit/

# Cache directories
.cache/
.temp/
.tmp/
.turbo/

# Logs
logs
*.log

# Local development
.env
!.env.example

# Vite
.vite/
*.local

# PWA
sw.js
workbox-*.js
workbox-*.js.map
workbox-*.js.LICENSE.txt

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test/

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
EOL

# Final cleanup
section "Final Cleanup"
echo -e "${GREEN}✅ Project cleanup completed!${NC}"
echo -e "${YELLOW}You can now run 'npm install' to reinstall dependencies.${NC}"

# Make the script executable
chmod +x "$0"
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/
out/

# Misc
.DS_Store
*.pem

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
firebase-debug.log

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Vercel
.vercel

# Vite
.vite/

# Local development
*.local
EOL

# Install fresh dependencies
echo "📦 Installing fresh dependencies..."
npm install

# Create production build
echo "🔨 Creating production build..."
npm run build

echo -e "\n✅ Cleanup complete! The project is ready for GitHub and Vercel deployment."
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git init"
echo "3. Run: git add ."
echo "4. Run: git commit -m 'Initial commit'"
echo "5. Follow GitHub instructions to add remote and push"
echo "6. Deploy to Vercel by importing the GitHub repository"
