---
description: Run backend test suite with coverage
---

Run the complete test suite for VoterPrime backend.

// turbo
1. Activate conda environment and run tests
   cd backend && conda activate ai-recommendation-service && pytest --cov=app --cov-report=html -v

2. Open coverage report
   open backend/htmlcov/index.html
