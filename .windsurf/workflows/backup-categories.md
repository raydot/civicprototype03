---
description: Backup political categories JSON
---

Create a timestamped backup of political categories.

// turbo
1. Create backup
   cp backend/app/data/political_categories.json backend/app/data/political_categories_backup_$(date +%Y%m%d_%H%M%S).json

2. Verify backup
   ls -lh backend/app/data/political_categories_backup_*
