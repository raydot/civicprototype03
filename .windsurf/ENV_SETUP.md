# VoterPrime Environment Variables Setup

This document explains how to set up environment variables for VoterPrime development, particularly for Windsurf workflows.

## Required Environment Variables

### For Windsurf Workflows

We use `direnv` to automatically load project-specific environment variables. This is the standard practice and keeps variables scoped to the project directory.

**Project-level variables (via direnv):**

```bash
# .envrc (in project root, gitignored)
export ADMIN_TOKEN="voterPrime_admin_meNO9Kccs9JNOxVnOdrLdTYJcu8RuQFmgzAwFTX84qs"
export BACKEND_URL_PROD="https://voter-mambo-production.up.railway.app"
export BACKEND_URL_LOCAL="http://localhost:8000"
export FRONTEND_URL_PROD="https://voterprime.netlify.app"
export FRONTEND_URL_LOCAL="http://localhost:5173"
```

### For Backend Development

Create `backend/.env.local` with:

```bash
# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
PORT=8000

# Database
DATABASE_URL=postgresql://voterprime:voterprime_dev@localhost:5432/voterprime_dev

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Admin
ADMIN_TOKEN=voterPrime_admin_meNO9Kccs9JNOxVnOdrLdTYJcu8RuQFmgzAwFTX84qs
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Documentation
DOO_DOCZ=true
```

## Setup Instructions

### 1. Install direnv (One-time setup)

**macOS:**

```bash
brew install direnv
```

**Linux:**

```bash
# Ubuntu/Debian
sudo apt-get install direnv

# Fedora
sudo dnf install direnv
```

**Add to shell profile (one-time):**

```bash
# For zsh (macOS default)
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```

### 2. Create Project Environment File

**Copy the example file:**

```bash
cp .envrc.example .envrc
```

**Edit `.envrc` with your actual values:**

```bash
# .envrc (gitignored - your actual secrets)
export ADMIN_TOKEN="voterPrime_admin_meNO9Kccs9JNOxVnOdrLdTYJcu8RuQFmgzAwFTX84qs"
export BACKEND_URL_PROD="https://voter-mambo-production.up.railway.app"
export BACKEND_URL_LOCAL="http://localhost:8000"
export FRONTEND_URL_PROD="https://voterprime.netlify.app"
export FRONTEND_URL_LOCAL="http://localhost:5173"
```

**Allow direnv to load it:**

```bash
direnv allow
```

Now variables automatically load when you `cd` into the project and unload when you leave!

### 3. Backend Environment File

```bash
# Copy example file
cp backend/.env.example backend/.env.local

# Edit with your actual values
# Update OPENAI_API_KEY, DATABASE_URL, ADMIN_TOKEN
```

### 4. Verify Setup

```bash
# cd into project directory (direnv will load variables)
cd /path/to/voterPrime03

# Check variables are loaded
echo $ADMIN_TOKEN
echo $BACKEND_URL_PROD

# Test workflow
curl "${BACKEND_URL_PROD}/health"

# cd out of project (direnv will unload variables)
cd ~
echo $ADMIN_TOKEN  # Should be empty
```

## Security Notes

### ✅ Safe to Commit

- `.envrc.example` (template with placeholders)
- `.env.example` (template with placeholders)
- `.windsurf/ENV_SETUP.md` (this file)
- Workflow files using `${VARIABLE}` syntax

### 🚫 NEVER Commit

- `.envrc` (contains real secrets - gitignored)
- `.env.local` (contains real secrets - gitignored)
- `.env` (contains real secrets - gitignored)
- Any file with actual token values

## Token Rotation

When rotating the admin token:

1. Generate new token:

   ```bash
   python3 -c "import secrets; print('voterPrime_admin_' + secrets.token_urlsafe(32))"
   ```

2. Update in 3 places:

   - Project `.envrc` file
   - Backend code fallback values (admin.py, openai_costs.py, admin_migration.py)
   - Railway environment variables (production)

3. Reload direnv:

   ```bash
   direnv allow
   ```

4. Test with workflow:
   ```bash
   curl "${BACKEND_URL_PROD}/admin/openai-costs/today?token=${ADMIN_TOKEN}"
   ```

## Troubleshooting

### "ADMIN_TOKEN not set" error

Check if variable is exported:

```bash
echo $ADMIN_TOKEN
```

If empty, ensure you're in the project directory and direnv is allowed:

```bash
cd /path/to/voterPrime03
direnv allow
```

Check direnv status:

```bash
direnv status
```

### "Invalid admin token" error

Token mismatch between:

- Your shell environment (`$ADMIN_TOKEN`)
- Backend code fallback
- Railway production environment

Verify token matches in all locations.

### Workflows not using environment variables

Ensure you're using the correct syntax:

```bash
# ✅ CORRECT
curl "${BACKEND_URL_PROD}/health?token=${ADMIN_TOKEN}"

# ❌ WRONG
curl "https://api.example.com/health?token=hardcoded_token"
```

## For New Team Members

1. Clone repository
2. Install direnv (step 1 above)
3. Request admin token from team lead (don't use the one in this doc if it's been rotated)
4. Copy `.envrc.example` to `.envrc` and add your credentials
5. Run `direnv allow`
6. Create `backend/.env.local` with provided credentials
7. Test with: `/start-dev-environment` workflow

**Why direnv?**

- Automatically loads project variables when you `cd` into the directory
- Automatically unloads when you leave (keeps your shell clean)
- Standard practice in the industry
- No global pollution of your shell environment

## Production Deployment

Production environment variables are managed in:

- **Railway Dashboard**: Backend environment variables
- **Netlify Dashboard**: Frontend environment variables

Never commit production credentials to git.
