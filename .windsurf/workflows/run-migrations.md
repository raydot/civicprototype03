---
description: Run database migrations
---

Apply pending database migrations.

// turbo
1. Run Alembic migrations
   cd backend && env $(grep -v '^#' .env.local | xargs) alembic upgrade head

2. Verify migration
   cd backend && env $(grep -v '^#' .env.local | xargs) alembic current
