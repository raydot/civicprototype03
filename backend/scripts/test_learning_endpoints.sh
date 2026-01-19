#!/bin/bash
# Test script for Learning API endpoints

BASE_URL="http://localhost:8000"

echo "🧪 Testing Learning API Endpoints"
echo "=================================="
echo ""

# Test 1: Get Learning Insights (Dashboard)
echo "📊 Test 1: Get Learning Insights"
echo "GET /learning/insights"
curl -s "${BASE_URL}/learning/insights?days=30" | python -m json.tool
echo ""
echo "---"
echo ""

# Test 2: Get Underperforming Categories
echo "⚠️  Test 2: Get Underperforming Categories"
echo "GET /learning/underperforming-categories"
curl -s "${BASE_URL}/learning/underperforming-categories?success_threshold=0.5&min_samples=5&days=30" | python -m json.tool
echo ""
echo "---"
echo ""

# Test 3: Get Category Performance (Category ID 1)
echo "📈 Test 3: Get Category Performance for Category 1"
echo "GET /learning/category-performance/1"
curl -s "${BASE_URL}/learning/category-performance/1?days=30" | python -m json.tool
echo ""
echo "---"
echo ""

# Test 4: Get Rejection Patterns
echo "🔍 Test 4: Get Rejection Patterns"
echo "GET /learning/rejection-patterns"
curl -s "${BASE_URL}/learning/rejection-patterns?days=30" | python -m json.tool
echo ""
echo "---"
echo ""

# Test 5: Identify Missing Categories
echo "💡 Test 5: Identify Missing Categories"
echo "GET /learning/missing-categories"
curl -s "${BASE_URL}/learning/missing-categories?confidence_threshold=0.5&frequency_threshold=3&days=30" | python -m json.tool
echo ""
echo "---"
echo ""

echo "✅ All tests complete!"
echo ""
echo "Next steps:"
echo "1. Review the output above"
echo "2. Check if data is being returned correctly"
echo "3. Verify metrics calculations are accurate"
