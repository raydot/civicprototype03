#!/bin/bash
set -e

echo "🔍 Current directory: $(pwd)"
echo "📁 Listing files:"
ls -la

echo "🗄️ Running database migrations..."
/opt/conda/envs/ai-recommendation-service/bin/alembic upgrade head

echo "✅ Migrations complete!"
echo "🚀 Starting web server..."
/opt/conda/envs/ai-recommendation-service/bin/python -m uvicorn app.main:app --host 0.0.0.0
