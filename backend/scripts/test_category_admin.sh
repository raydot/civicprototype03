#!/bin/bash
# Test script for AI Category Admin endpoints

BASE_URL="http://localhost:8000"

echo "🧪 Testing AI Category Admin Endpoints"
echo "========================================"
echo ""

# Test 1: Generate category preview
echo "1️⃣  Testing category generation..."
echo ""

curl -X POST "${BASE_URL}/category-admin/generate-preview" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I want to track candidates positions on cryptocurrency regulation and digital asset policy"
  }' | jq '.'

echo ""
echo ""

# Test 2: List existing categories
echo "2️⃣  Listing existing categories..."
echo ""

curl -X GET "${BASE_URL}/category-admin/categories" | jq '.total'

echo ""
echo ""

# Test 3: Get specific category
echo "3️⃣  Getting category ID 1..."
echo ""

curl -X GET "${BASE_URL}/category-admin/categories/1" | jq '.name, .description'

echo ""
echo ""

echo "✅ Tests complete!"
echo ""
echo "📝 To use the web interface, visit:"
echo "   ${BASE_URL}/static/category_admin.html"
