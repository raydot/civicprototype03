## v0.11.1 (2025-09-30)

### Fix

- added docs endpoint toggle environment variable.

## v0.11.0 (2025-09-30)

### Feat

- complete Phase 1 - database operations and professional test suite

## v0.10.5 (2025-09-30)

### Fix

- proper database connection lifecycle management

## v0.10.4 (2025-09-30)

### Fix

- enable docs endpoint and fix remaining database parameter issues

## v0.10.3 (2025-09-30)

### Fix

- correct database query parameter format for Railway deployment

## v0.10.2 (2025-09-30)

### Fix

- make database connection optional to prevent Railway deployment crashes

## v0.10.1 (2025-09-30)

### Fix

- **deploy**: resolve Railway deployment issues for feedback system

## v0.10.0 (2025-09-30)

### Feat

- integrate issueTerminology.json with enhanced political categories

## v0.9.1 (2025-09-27)

### Fix

- resolve FastAPI lifespan parameter and add category quality guidelines

## v0.9.0 (2025-09-27)

### Feat

- add VoterPrime admin dashboard for category management

## v0.8.7 (2025-09-26)

### Fix

- Removed health check entirely.

## v0.8.6 (2025-09-26)

### Fix

- adding keyword 'python' to uvicorn call

## v0.8.5 (2025-09-26)

### Fix

- removed the port entirely from railway.json and Procfile.
- removing the start command from railway.json entirely.

## v0.8.4 (2025-09-26)

### Fix

- no longer escaping the  variable

## v0.8.3 (2025-09-26)

### Fix

- Hard coding the port to 8000
-  still not expanding properly.

## v0.8.2 (2025-09-26)

### Fix

- removed nixpacks.
- disabling health check.

## v0.8.1 (2025-09-26)

### Fix

- adjustment to Procfile to try to set port properly.
- missing from pydantic import Field import in config.py.
- removed bad  setting from railway config.
- allow all origins for CORS in production to fix Netlify connection

## v0.8.0 (2025-09-26)

### Feat

- deploy VoterPrime AI backend to Railway and configure production environment

## v0.7.0 (2025-09-26)

### Feat

- deploy VoterPrime AI backend to Railway and configure production environment

## v0.6.0 (2025-09-26)

### BREAKING CHANGE

- New sentiment analysis requires additional OpenAI API usage for chat completions

### Feat

- implement sentiment analysis and complete category matching system

## v0.5.0 (2025-09-26)

### BREAKING CHANGE

- Text encoder now requires OPENAI_API_KEY environment variable

### Feat

- migrate text encoder from sentence-transformers to OpenAI embeddings API

## v0.2.1 (2025-09-26)

## v0.2.0 (2025-09-26)

### Feat

- add automated versioning system with pre-commit hooks
- Add text encoder foundation with OpenAI embeddings API
