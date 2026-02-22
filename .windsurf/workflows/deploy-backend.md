---
description: Deploy backend to Railway
---

Deploy VoterPrime backend to Railway production.

1. Ensure all tests pass
   cd backend && conda activate ai-recommendation-service && pytest

2. Commit changes with conventional commit
   git add .
   git commit -m "feat: your feature description"

3. Push to main (Railway auto-deploys)
   git push origin main

4. Verify deployment
   curl https://voter-mambo-production.up.railway.app/health

5. Check Railway logs
   Open Railway dashboard: https://railway.app
