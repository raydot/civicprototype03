---
description: Check OpenAI API usage and costs
---

Monitor OpenAI API costs and usage patterns.

**Required Environment Variables:**
- `ADMIN_TOKEN` - Your admin authentication token
- `BACKEND_URL_PROD` - Production backend URL (default: https://voter-mambo-production.up.railway.app)

// turbo
1. Check today's costs
   curl "${BACKEND_URL_PROD:-https://voter-mambo-production.up.railway.app}/admin/openai-costs/today?token=${ADMIN_TOKEN}" | jq

// turbo
2. Check 7-day summary
   curl "${BACKEND_URL_PROD:-https://voter-mambo-production.up.railway.app}/admin/openai-costs/summary?days=7&group_by=endpoint&token=${ADMIN_TOKEN}" | jq

// turbo
3. Check cost alerts
   curl "${BACKEND_URL_PROD:-https://voter-mambo-production.up.railway.app}/admin/openai-costs/alerts?threshold=25&token=${ADMIN_TOKEN}" | jq

4. Open cost dashboard
   Open: https://voter-mambo-production.up.railway.app/admin/cost-dashboard
