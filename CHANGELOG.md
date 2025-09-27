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
