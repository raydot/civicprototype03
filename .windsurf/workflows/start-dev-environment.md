---
description: Start local development environment (backend + frontend)
---

Start the complete VoterPrime development environment.

// turbo
1. Start backend server
   cd backend && conda activate ai-recommendation-service && python -m uvicorn app.main:app --reload --port 8000

// turbo
2. Start frontend dev server
   cd frontend && npm run dev

3. Verify services
   - Backend health: http://localhost:8000/health
   - Frontend: http://localhost:5173
   - API docs: http://localhost:8000/docs
