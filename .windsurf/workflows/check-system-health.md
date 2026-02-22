---
description: Check system health and performance
---

Verify all VoterPrime services are healthy.

**Required Environment Variables:**
- `BACKEND_URL_PROD` - Production backend URL (default: https://voter-mambo-production.up.railway.app)

// turbo
1. Check backend health
   curl ${BACKEND_URL_PROD:-https://voter-mambo-production.up.railway.app}/health | jq

// turbo
2. Check database connectivity
   cd backend && conda activate ai-recommendation-service && python -c "from app.db.database import database; import asyncio; asyncio.run(database.connect()); print('✅ Database connected')"

// turbo
3. Check category loading
   curl ${BACKEND_URL_PROD:-https://voter-mambo-production.up.railway.app}/api/categories | jq '.categories | length'

4. Open admin dashboards
   - Cost: https://voter-mambo-production.up.railway.app/admin/cost-dashboard
   - Categories: https://voter-mambo-production.up.railway.app/static/category_admin.html
