---
description: Check political category performance metrics
---

Query category analytics from the admin API.

**Required Environment Variables:**
- `ADMIN_TOKEN` - Your admin authentication token
- `BACKEND_URL_PROD` - Production backend URL (default: https://voter-mambo-production.up.railway.app)

// turbo
1. Get category analytics
   curl "${BACKEND_URL_PROD:-https://voter-mambo-production.up.railway.app}/admin/categories/analytics?token=${ADMIN_TOKEN}" | jq

// turbo
2. Get detailed performance
   curl "${BACKEND_URL_PROD:-https://voter-mambo-production.up.railway.app}/admin/categories/performance?token=${ADMIN_TOKEN}" | jq

3. Open category admin dashboard
   Open: https://voter-mambo-production.up.railway.app/static/category_admin.html
