#!/bin/bash

# FinConsult Deployment Helper Script
# This script prepares the project for deployment
# Usage: ./deploy.sh "description of changes"

set -e

PROJECT_DIR="/home/ubuntu/financial_consultant"
cd "$PROJECT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== FinConsult Deployment Helper ===${NC}"
echo ""

# Check if description was provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a description of changes${NC}"
    echo "Usage: ./deploy.sh \"description of changes\""
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh \"Fixed og:url bug\""
    echo "  ./deploy.sh \"Added new blog article\""
    echo "  ./deploy.sh \"Updated product pricing\""
    exit 1
fi

DESCRIPTION="$1"

echo -e "${YELLOW}Step 1: Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Error: Working directory has uncommitted changes${NC}"
    echo "Please commit or stash changes first:"
    echo "  git add ."
    echo "  git commit -m \"your message\""
    exit 1
fi
echo -e "${GREEN}✓ Working directory is clean${NC}"
echo ""

echo -e "${YELLOW}Step 2: Running tests...${NC}"
if ! pnpm test 2>&1 | tail -5; then
    echo -e "${RED}Warning: Tests failed. Continue anyway? (y/n)${NC}"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi
echo -e "${GREEN}✓ Tests completed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Type checking...${NC}"
if ! pnpm check 2>&1 | tail -5; then
    echo -e "${RED}Warning: TypeScript errors found. Continue anyway? (y/n)${NC}"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi
echo -e "${GREEN}✓ Type check completed${NC}"
echo ""

echo -e "${YELLOW}Step 4: Building project...${NC}"
if ! pnpm build 2>&1 | tail -10; then
    echo -e "${RED}Error: Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo -e "${YELLOW}Step 5: Pushing to GitHub...${NC}"
if git push github main 2>&1 | tail -3; then
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠ GitHub push failed (may need token)${NC}"
fi
echo ""

echo -e "${GREEN}=== Deployment Ready ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Open the Management UI (click panel icon in top right)"
echo "2. Go to 'Dashboard' or 'Version History'"
echo "3. Find the latest checkpoint"
echo "4. Click the 'Publish' button"
echo "5. Wait 60 seconds for deployment"
echo "6. Verify on production: https://finconsult-turcanelena.manus.space"
echo ""
echo -e "${YELLOW}Checkpoint description:${NC}"
echo "  $DESCRIPTION"
echo ""
echo -e "${GREEN}Ready to deploy!${NC}"
