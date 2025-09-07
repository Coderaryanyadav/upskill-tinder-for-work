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

# Function to run commands with error handling
run_command() {
    echo -e "${YELLOW}Running: $1${NC}"
    eval $1
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to execute: $1${NC}"
        exit 1
    fi
}

# Start optimization
section "🚀 Starting Vercel Production Optimization"

# 1. Clean up the project
section "1. Cleaning up the project..."
run_command "rm -rf node_modules"
run_command "rm -rf .next"
run_command "rm -rf .vercel"
run_command "rm -f package-lock.json"
run_command "rm -f yarn.lock"
run_command "rm -f pnpm-lock.yaml"

# 2. Install dependencies with production flag
section "2. Installing production dependencies..."
if [ -f "yarn.lock" ]; then
    run_command "yarn install --production=false --frozen-lockfile"
elif [ -f "pnpm-lock.yaml" ]; then
    run_command "pnpm install --production=false --frozen-lockfile"
else
    if [ -f "package-lock.json" ]; then
        run_command "npm ci --prefer-offline --no-audit --progress=false"
    else
        run_command "npm install --prefer-offline --no-audit --progress=false"
    fi
fi

# 3. Create or update vercel.json if it doesn't exist
section "3. Configuring Vercel..."
if [ ! -f "vercel.json" ]; then
    cat > vercel.json << 'EOL'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
EOL
    echo -e "${GREEN}Created vercel.json configuration${NC}"
else
    echo -e "${YELLOW}vercel.json already exists, skipping creation${NC}"
fi

# 4. Optimize Next.js build
section "4. Optimizing Next.js build..."
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    # Add or update next.config.js with optimizations
    if [ ! -f "next.config.js" ] && [ -f "next.config.mjs" ]; then
        CONFIG_FILE="next.config.mjs"
    else
        CONFIG_FILE="next.config.js"
    fi

    if ! grep -q "swcMinify" $CONFIG_FILE; then
        echo -e "${GREEN}Adding optimizations to $CONFIG_FILE${NC}"
        sed -i.bak '1s/^/\/\* eslint-disable @next\/next\/no-img-element */\n/' $CONFIG_FILE
        echo -e "\nconst withBundleAnalyzer = require('@next/bundle-analyzer')({\n  enabled: process.env.ANALYZE === 'true',\n})\n\nmodule.exports = withBundleAnalyzer({\n  reactStrictMode: true,\n  swcMinify: true,\n  compress: true,\n  productionBrowserSourceMaps: false,
  images: {\n    domains: [],\n    formats: ['image/avif', 'image/webp'],\n    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days\n  },\n  experimental: {\n    optimizeCss: true,\n    scrollRestoration: true,\n    optimizePackageImports: [\n      'react-icons',\n      'lodash',\n      'date-fns',\n    ],\n  },\n  async headers() {\n    return [\n      {\n        source: '/(.*)',\n        headers: [\n          {\n            key: 'X-Content-Type-Options',\n            value: 'nosniff',\n          },\n          {\n            key: 'X-Frame-Options',\n            value: 'SAMEORIGIN',\n          },\n          {\n            key: 'X-XSS-Protection',\n            value: '1; mode=block',\n          },\n          {\n            key: 'Referrer-Policy',\n            value: 'strict-origin-when-cross-origin',\n          },\n        ],\n      },\n    ]\n  },\n})\n" >> $CONFIG_FILE
    else
        echo -e "${YELLOW}Optimizations already present in $CONFIG_FILE${NC}"
    fi
else
    echo -e "${YELLOW}Next.js config not found, skipping optimizations${NC}"
fi

# 5. Build the project
section "5. Building the project..."
if [ -f "package.json" ]; then
    run_command "npm run build"
else
    echo -e "${YELLOW}package.json not found, skipping build${NC}"
fi

# 6. Create .vercelignore if it doesn't exist
if [ ! -f ".vercelignore" ]; then
    echo -e "${GREEN}Creating .vercelignore file${NC}"
    cat > .vercelignore << 'EOL'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage
.nyc_output

# Production
/build

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local

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

# Build output
.next
out

# Cache
.cache
.parcel-cache
EOL
fi

# 7. Final steps
section "✅ Optimization Complete!"
echo -e "${GREEN}Your project is now optimized for Vercel deployment.${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Review the changes made to your project"
echo "2. Test the build locally with: npm run build"
echo "3. Deploy to Vercel with: vercel --prod"
echo -e "\n${GREEN}Happy deploying! 🚀${NC}"

# Make the script executable
chmod +x "$0"
