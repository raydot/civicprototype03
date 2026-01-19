#!/bin/bash
# Test script for Category Admin Frontend Modules

echo "🧪 Testing Category Admin Frontend"
echo "===================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Server not running on localhost:8000"
    echo "   Start server first with: uvicorn app.main:app --reload"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Check if HTML loads
echo "1️⃣  Checking HTML page..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/static/category_admin.html)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTML page loads (200 OK)"
else
    echo "❌ HTML page failed ($HTTP_CODE)"
    exit 1
fi
echo ""

# Check if module files exist
echo "2️⃣  Checking module files..."
MODULES=("state.js" "api.js" "ui.js" "browse.js" "edit.js" "enhance.js" "create.js" "transform.js" "delete.js" "main.js")
FAILED=0

for module in "${MODULES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/static/js/category-admin/$module")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ $module"
    else
        echo "❌ $module ($HTTP_CODE)"
        FAILED=1
    fi
done
echo ""

if [ $FAILED -eq 1 ]; then
    echo "❌ Some modules failed to load"
    exit 1
fi

# Check API endpoints (read-only, no auth needed for GET)
echo "3️⃣  Checking API endpoints..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/category-admin/categories)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo "✅ List categories endpoint (HTTP $HTTP_CODE)"
else
    echo "❌ List categories endpoint ($HTTP_CODE)"
fi
echo ""

# Check static files
echo "4️⃣  Checking static files..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/static/css/category_admin.css)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ CSS file loads"
else
    echo "⚠️  CSS file not found ($HTTP_CODE) - may not exist"
fi
echo ""

echo "✅ Automated tests complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:8000/static/category_admin.html"
echo "   2. Login with admin credentials"
echo "   3. Test all features manually (see TESTING_GUIDE.md)"
echo "   4. Login with guest credentials"
echo "   5. Verify permission toasts appear"
echo "   6. Check browser console for errors (F12)"
echo ""
echo "🔍 Manual testing checklist:"
echo "   - Browse/filter/sort categories"
echo "   - Edit keywords (admin only)"
echo "   - Create category (admin only)"
echo "   - AI enhance (admin only)"
echo "   - Transform category (admin only)"
echo "   - Delete category (admin only)"
echo "   - Guest user sees permission toasts"
