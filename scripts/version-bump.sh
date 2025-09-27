#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting version bump process...${NC}"

# Get the current directory (should be repo root)
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Check if we're on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠️  Not on main/master branch. Skipping version bump.${NC}"
    exit 0
fi

# Check if there are any commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
COMMITS_SINCE_TAG=$(git rev-list ${LAST_TAG}..HEAD --count 2>/dev/null || echo "1")

if [ "$COMMITS_SINCE_TAG" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No new commits since last tag. Skipping version bump.${NC}"
    exit 0
fi

# Read current version from frontend package.json
CURRENT_VERSION=$(node -p "require('./frontend/package.json').version" 2>/dev/null || echo "0.1.0")
echo -e "${YELLOW}📦 Current version: ${CURRENT_VERSION}${NC}"

# Analyze commit messages to determine bump type
COMMIT_MESSAGES=$(git log ${LAST_TAG}..HEAD --pretty=format:"%s" 2>/dev/null || git log --pretty=format:"%s" -n 10)

# Determine version bump type based on conventional commits
BUMP_TYPE="patch"  # default

if echo "$COMMIT_MESSAGES" | grep -q "BREAKING CHANGE\|^feat!:\|^fix!:"; then
    BUMP_TYPE="major"
elif echo "$COMMIT_MESSAGES" | grep -q "^feat:"; then
    BUMP_TYPE="minor"
elif echo "$COMMIT_MESSAGES" | grep -q "^fix:\|^perf:\|^refactor:"; then
    BUMP_TYPE="patch"
fi

echo -e "${YELLOW}🎯 Detected bump type: ${BUMP_TYPE}${NC}"

# Calculate new version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

case $BUMP_TYPE in
    "major")
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    "minor")
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    "patch")
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo -e "${GREEN}🚀 New version: ${NEW_VERSION}${NC}"

# Update frontend package.json
if [ -f "frontend/package.json" ]; then
    # Use node to update package.json properly
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
        pkg.version = '${NEW_VERSION}';
        fs.writeFileSync('frontend/package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    echo -e "${GREEN}✅ Updated frontend/package.json${NC}"
fi

# Create/update root VERSION file
echo "$NEW_VERSION" > VERSION
echo -e "${GREEN}✅ Updated VERSION file${NC}"

# Create/update backend version file (optional)
if [ -d "backend" ]; then
    echo "$NEW_VERSION" > backend/VERSION
    echo -e "${GREEN}✅ Updated backend/VERSION${NC}"
fi

# Stage the version files
git add frontend/package.json VERSION backend/VERSION 2>/dev/null || true

# Create git tag
TAG_NAME="v${NEW_VERSION}"

# Check if tag already exists
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Tag ${TAG_NAME} already exists. Skipping tag creation.${NC}"
    echo -e "${YELLOW}💡 You may need to manually commit version changes and push.${NC}"
    exit 0
else
    git tag -a "$TAG_NAME" -m "Release version ${NEW_VERSION}"
    echo -e "${GREEN}🏷️  Created tag: ${TAG_NAME}${NC}"
fi

echo -e "${GREEN}✨ Version bump complete!${NC}"
echo -e "${YELLOW}💡 Remember to commit the version changes: git add . && git commit -m 'chore: bump version to ${NEW_VERSION}'${NC}"