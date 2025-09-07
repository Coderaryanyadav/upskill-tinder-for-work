#!/bin/bash

# Deployment script for Tinder for Work App
# This script handles the build and deployment process with comprehensive error handling

set -euo pipefail  # Exit on error, undefined variable, and pipe failure

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment variables
ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"
NODE_VERSION="18"
BUILD_DIR="dist"
VERCEL_PROJECT_NAME="tinder-for-work"
FIREBASE_PROJECT_ID="$(grep -oP 'VITE_FIREBASE_PROJECT_ID=\K[^\n]+' "$ENV_FILE" 2>/dev/null || echo "")"

# Function to print section headers
section() {
    echo -e "\n${BLUE}==> $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
check_requirements() {
    section "Checking System Requirements"
    
    # Check Node.js version
    if ! command_exists node; then
        echo -e "${RED}Error: Node.js is not installed. Please install Node.js $NODE_VERSION or later.${NC}"
        exit 1
    fi

    CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$CURRENT_NODE_VERSION" -lt "${NODE_VERSION%%.*}" ]; then
        echo -e "${YELLOW}Warning: Node.js version $NODE_VERSION or later is recommended. Current version is $CURRENT_NODE_VERSION.${NC}"
        read -p "Do you want to continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Deployment cancelled.${NC}"
            exit 1
        fi
    fi

    # Check for Vercel CLI
    if ! command_exists vercel; then
        echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
        npm install -g vercel@latest
    fi

    # Check for Firebase CLI
    if ! command_exists firebase; then
        echo -e "${YELLOW}Firebase CLI not found. Installing...${NC}"
        npm install -g firebase-tools
    fi
}

# Setup environment
setup_environment() {
    section "Setting Up Environment"
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}Warning: $ENV_FILE not found. Creating from $ENV_EXAMPLE_FILE...${NC}"
        if [ -f "$ENV_EXAMPLE_FILE" ]; then
            cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
            echo -e "${YELLOW}Please update the $ENV_FILE with your configuration and run the script again.${NC}"
            exit 1
        else
            echo -e "${RED}Error: $ENV_EXAMPLE_FILE not found. Please create a .env file.${NC}"
            exit 1
        fi
    fi

    # Validate required environment variables
    local required_vars=(
        "VITE_FIREBASE_API_KEY"
        "VITE_FIREBASE_AUTH_DOMAIN"
        "VITE_FIREBASE_PROJECT_ID"
        "VITE_FIREBASE_STORAGE_BUCKET"
        "VITE_FIREBASE_MESSAGING_SENDER_ID"
        "VITE_FIREBASE_APP_ID"
    )

    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$ENV_FILE"; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "${RED}Error: Missing required environment variables in $ENV_FILE:${NC}"
        printf '  - %s\n' "${missing_vars[@]}"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    section "Installing Dependencies"
    
    # Clean install with exact versions
    echo -e "${GREEN}Running npm clean install...${NC}"
    npm ci --prefer-offline --no-audit --progress=false
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Clean install failed, trying with --legacy-peer-deps...${NC}"
        npm ci --prefer-offline --no-audit --progress=false --legacy-peer-deps || {
            echo -e "${RED}Failed to install dependencies.${NC}"
            exit 1
        }
    fi
}

# Run linting and tests
run_checks() {
    section "Running Code Quality Checks"
    
    # Linting
    echo -e "${GREEN}Running ESLint...${NC}"
    npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings=0 --fix
    
    # Type checking
    echo -e "${GREEN}Running TypeScript type checking...${NC}"
    npx tsc --noEmit
    
    # Run tests if available
    if grep -q "test" package.json; then
        echo -e "${GREEN}Running tests...${NC}"
        npm test -- --watchAll=false
    fi
}

# Build the application
build_app() {
    section "Building Application"
    
    # Clean previous build
    echo -e "${GREEN}Cleaning previous build...${NC}"
    rm -rf "$BUILD_DIR"
    
    # Build for production
    echo -e "${GREEN}Building for production...${NC}"
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        echo -e "${RED}Build failed: $BUILD_DIR directory not found.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Build completed successfully.${NC}"
}

# Deploy to Vercel
deploy_vercel() {
    section "Deploying to Vercel"
    
    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${YELLOW}VERCEL_TOKEN not set. Skipping Vercel deployment.${NC}"
        return 0
    fi
    
    echo -e "${GREEN}Preparing Vercel deployment...${NC}"
    
    # Set Vercel project name from environment or use default
    local vercel_project="${VERCEL_PROJECT:-$VERCEL_PROJECT_NAME}"
    
    # Deploy to Vercel
    echo -e "${GREEN}Deploying to Vercel project: $vercel_project${NC}"
    vercel --prod --confirm -t "$VERCEL_TOKEN" $([ -n "$vercel_project" ] && echo "--scope $vercel_project")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Vercel deployment initiated successfully!${NC}"
    else
        echo -e "${YELLOW}Vercel deployment encountered an issue.${NC}"
        return 1
    fi
}

# Deploy to Firebase Hosting
deploy_firebase() {
    section "Deploying to Firebase"
    
    if [ -z "$FIREBASE_TOKEN" ]; then
        echo -e "${YELLOW}FIREBASE_TOKEN not set. Skipping Firebase deployment.${NC}"
        return 0
    }
    
    if [ -z "$FIREBASE_PROJECT_ID" ]; then
        echo -e "${YELLOW}FIREBASE_PROJECT_ID not found. Skipping Firebase deployment.${NC}"
        return 0
    fi
    
    echo -e "${GREEN}Preparing Firebase deployment...${NC}"
    
    # Login to Firebase if not already logged in
    if ! firebase projects:list | grep -q "$FIREBASE_PROJECT_ID"; then
        echo -e "${GREEN}Logging in to Firebase...${NC}"
        firebase login:ci --no-localhost --token "$FIREBASE_TOKEN"
    fi
    
    # Deploy to Firebase
    echo -e "${GREEN}Deploying to Firebase project: $FIREBASE_PROJECT_ID${NC}"
    firebase deploy --only hosting,firestore:rules --project "$FIREBASE_PROJECT_ID" --token "$FIREBASE_TOKEN" --non-interactive
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Firebase deployment completed successfully!${NC}"
    else
        echo -e "${YELLOW}Firebase deployment encountered an issue.${NC}"
        return 1
    fi
}

# Run Lighthouse audit
run_lighthouse_audit() {
    if ! command_exists lighthouse; then
        echo -e "${YELLOW}Lighthouse CLI not found. Installing...${NC}"
        npm install -g lighthouse
    fi
    
    local url="${1:-http://localhost:3000}"
    
    section "Running Lighthouse Audit"
    echo -e "${GREEN}Auditing URL: $url${NC}"
    
    lighthouse "$url" --output=html --output-path=./lighthouse-report.html --chrome-flags="--headless --no-sandbox"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Lighthouse report generated: $(pwd)/lighthouse-report.html${NC}
"
        # Extract scores
        local performance=$(grep -oP '"performance":\s*\K\d+' lighthouse-report.html | head -1)
        local accessibility=$(grep -oP '"accessibility":\s*\K\d+' lighthouse-report.html | head -1)
        local best_practices=$(grep -oP '"best-practices":\s*\K\d+' lighthouse-report.html | head -1)
        local seo=$(grep -oP '"seo":\s*\K\d+' lighthouse-report.html | head -1)
        
        echo -e "${GREEN}Lighthouse Scores:${NC}"
        echo -e "Performance:      ${performance}/100"
        echo -e "Accessibility:    ${accessibility}/100"
        echo -e "Best Practices:   ${best_practices}/100"
        echo -e "SEO:              ${seo}/100"
        
        # Check if scores meet minimum requirements
        local min_score=90
        if [ "$performance" -lt $min_score ] || [ "$accessibility" -lt $min_score ] || 
           [ "$best_practices" -lt $min_score ] || [ "$seo" -lt $min_score ]; then
            echo -e "${YELLOW}Warning: Some scores are below the minimum threshold of $min_score${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}Lighthouse audit failed.${NC}"
        return 1
    fi
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    # Show deployment banner
    echo -e "\n${GREEN}🚀 Starting Tinder for Work Deployment 🚀${NC}"
    echo -e "----------------------------------------"
    
    # Execute deployment steps
    check_requirements
    setup_environment
    install_dependencies
    run_checks
    build_app
    
    # Run Lighthouse audit on local build
    if [ "$1" != "--skip-audit" ]; then
        (npm run preview &) > /dev/null 2>&1
        local preview_pid=$!
        sleep 5  # Wait for the preview server to start
        
        if run_lighthouse_audit "http://localhost:3000"; then
            echo -e "${GREEN}✓ Lighthouse audit passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Lighthouse audit had warnings${NC}"
        fi
        
        # Kill the preview server
        kill $preview_pid 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠️  Skipping Lighthouse audit${NC}"
    fi
    
    # Deploy to Vercel and Firebase
    deploy_vercel
    deploy_firebase
    
    # Calculate and display deployment time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo -e "\n${GREEN}✅ Deployment completed in ${duration} seconds!${NC}"
    echo -e "${GREEN}🌐 Your app should be live shortly!${NC}"
}

# Execute main function with all arguments
main "$@"
