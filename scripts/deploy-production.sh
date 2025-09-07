#!/bin/bash

# =============================================================================
# CV-ANGULAR PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# Bu script production deployment için tüm adımları otomatikleştirir

set -e  # Exit on any error

echo "🚀 Starting CV-Angular Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# FUNCTIONS
# =============================================================================

print_step() {
    echo -e "${BLUE}📋 Step: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================

print_step "Pre-deployment security checks"

# Check if .env exists in server directory
if [ -f "server/.env" ]; then
    print_warning ".env file found in server directory"
    echo "This file should NOT be committed to Git!"
    echo "Make sure it's listed in .gitignore"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "angular.json" ]; then
    print_error "Please run this script from the CV-Angular root directory"
    exit 1
fi

print_success "Directory structure validated"

# =============================================================================
# ENVIRONMENT VALIDATION
# =============================================================================

print_step "Environment validation"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    print_warning "Angular CLI not found. Installing..."
    npm install -g @angular/cli@20.1.5
fi

print_success "Angular CLI available"

# =============================================================================
# DEPENDENCY INSTALLATION
# =============================================================================

print_step "Installing dependencies"

# Frontend dependencies
echo "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
cd ..
print_success "Backend dependencies installed"

# =============================================================================
# BUILD PROCESS
# =============================================================================

print_step "Building application"

# TypeScript type checking
echo "Checking TypeScript types..."
cd server
npx tsc --noEmit
cd ..
print_success "TypeScript types validated"

# Build backend
echo "Building backend..."
cd server
npm run build
cd ..
print_success "Backend built successfully"

# Build frontend
echo "Building frontend for production..."
npm run build:prod
print_success "Frontend built successfully"

# =============================================================================
# DEPLOYMENT PLATFORM SELECTION
# =============================================================================

print_step "Deployment platform selection"

echo "Select deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Railway"
echo "3) DigitalOcean App Platform"
echo "4) Manual deployment"

read -p "Enter your choice (1-4): " PLATFORM_CHOICE

case $PLATFORM_CHOICE in
    1)
        print_step "Deploying to Vercel"
        
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        echo "🔑 Make sure to set these environment variables in Vercel Dashboard:"
        echo "   - MONGODB_URI"
        echo "   - JWT_SECRET"
        echo "   - ADMIN_USERNAME"
        echo "   - ADMIN_PASSWORD"
        echo "   - CORS_ORIGINS"
        echo ""
        
        read -p "Have you set all environment variables? (y/n): " ENV_CONFIRMED
        
        if [ "$ENV_CONFIRMED" = "y" ] || [ "$ENV_CONFIRMED" = "Y" ]; then
            vercel --prod
            print_success "Deployed to Vercel!"
        else
            print_warning "Please set environment variables first"
            echo "Visit: https://vercel.com/dashboard"
            exit 1
        fi
        ;;
    2)
        print_step "Railway deployment instructions"
        echo "1. Push your code to GitHub"
        echo "2. Connect your GitHub repo to Railway"
        echo "3. Set environment variables in Railway dashboard"
        echo "4. Deploy automatically on push"
        ;;
    3)
        print_step "DigitalOcean App Platform deployment instructions"
        echo "1. Create new app on DigitalOcean"
        echo "2. Connect GitHub repository"
        echo "3. Configure build settings"
        echo "4. Set environment variables"
        ;;
    4)
        print_step "Manual deployment"
        echo "Build artifacts ready in:"
        echo "  - Frontend: dist/cv-angular/browser/"
        echo "  - Backend: server/dist/"
        ;;
    *)
        print_error "Invalid selection"
        exit 1
        ;;
esac

# =============================================================================
# POST-DEPLOYMENT CHECKLIST
# =============================================================================

print_step "Post-deployment checklist"

echo ""
echo "🔍 PRODUCTION SECURITY CHECKLIST:"
echo ""
echo "📋 MongoDB Atlas Configuration:"
echo "  □ M10+ cluster tier (not M0)"
echo "  □ Specific IP whitelist (NOT 0.0.0.0/0)"
echo "  □ Strong database password (32+ characters)"
echo "  □ VPC Peering enabled (if possible)"
echo ""
echo "🔐 Application Security:"
echo "  □ JWT_SECRET changed from default"
echo "  □ ADMIN_PASSWORD changed from 'admin123'"
echo "  □ CORS_ORIGINS set to production domains"
echo "  □ HTTPS enforced"
echo ""
echo "📊 Monitoring & Maintenance:"
echo "  □ MongoDB Atlas monitoring enabled"
echo "  □ Application logs configured"
echo "  □ Backup strategy implemented"
echo "  □ Error tracking setup"
echo ""

print_success "Deployment script completed!"
echo ""
echo "🌐 Next steps:"
echo "1. Verify your application is running"
echo "2. Test admin login with new credentials"
echo "3. Check MongoDB Atlas connection"
echo "4. Monitor application logs"
echo ""
echo "📚 For troubleshooting, see:"
echo "  - DEPLOYMENT.md"
echo "  - PRODUCTION-SECURITY.md"