# AI Recommendation Service Backend

FastAPI-based backend for the AI recommendation system that learns from user feedback and provides personalized recommendations.

## 🏗️ Architecture

- **Framework**: FastAPI with async/await support
- **Deployment**: Railway (containerized)
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI/ML**: Sentence Transformers, spaCy, scikit-learn
- **Session Management**: Redis (optional)

## 🚀 Quick Start

### Prerequisites

- Conda (Miniconda or Anaconda)
- Docker and Docker Compose
- Supabase account and project

### Local Development Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Copy environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Create conda environment**
   ```bash
   conda env create -f environment.yml
   conda activate ai-recommendation-service
   ```

4. **Download spaCy model**
   ```bash
   python -m spacy download en_core_web_sm
   ```

5. **Run with Docker Compose (Recommended)**
   ```bash
   docker-compose up --build
   ```

6. **Or run directly with conda environment**
   ```bash
   conda activate ai-recommendation-service
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Access the application**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI application entry point
│   ├── config.py                  # Configuration settings
│   ├── dependencies.py            # FastAPI dependencies
│   │
│   ├── api/                       # API layer
│   │   └── routes/
│   │       └── health.py          # Health check endpoints
│   │
│   ├── schemas/                   # Pydantic models
│   │   ├── requests.py            # Request schemas
│   │   └── responses.py           # Response schemas
│   │
│   └── utils/                     # Utilities
│       ├── logging.py             # Logging configuration
│       └── exceptions.py          # Custom exceptions
│
├── requirements.txt               # Production dependencies
├── requirements-dev.txt           # Development dependencies
├── Dockerfile                     # Railway deployment
├── docker-compose.yml             # Local development
└── .env.example                   # Environment template
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment (development/staging/production) | development |
| `PORT` | Server port | 8000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_KEY` | Supabase anon key | - |
| `MODEL_NAME` | Sentence transformer model | all-MiniLM-L6-v2 |
| `LOG_LEVEL` | Logging level | INFO |

### Required Setup

1. **Supabase Project**
   - Create a new Supabase project
   - Get your project URL and anon key
   - Add them to your `.env` file

2. **Environment File**
   ```bash
   # Copy the example and fill in your values
   cp .env.example .env
   ```

## 🧪 Testing

```bash
# Activate conda environment first
conda activate ai-recommendation-service

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_health.py -v
```

## 🚀 Deployment

### Railway Deployment

1. **Connect Repository**
   - Connect your GitHub repository to Railway
   - Railway will automatically detect the Dockerfile

2. **Set Environment Variables**
   - Add all required environment variables in Railway dashboard
   - Ensure `ENVIRONMENT=production`

3. **Deploy**
   - Push to main branch
   - Railway will automatically build and deploy

### Health Checks

The application provides health check endpoints for monitoring:

- `GET /health` - Basic health check
- `GET /ready` - Readiness check with dependency verification

## 📊 Monitoring

### Logging

- All logs output to stdout (Railway compatible)
- Structured JSON logging for analytics
- Different log levels for development/production

### Metrics

Health endpoints provide:
- Service status
- Version information
- Environment details
- Dependency status

## 🔒 Security

- Non-root container user
- CORS configuration
- Trusted host middleware in production
- Environment-based configuration
- Input validation with Pydantic

## 🛠️ Development

### Adding New Endpoints

1. Create route file in `app/api/routes/`
2. Define Pydantic schemas in `app/schemas/`
3. Add route to main application in `app/main.py`
4. Add tests in `tests/`

### Code Quality

```bash
# Activate conda environment first
conda activate ai-recommendation-service

# Format code
black app/
isort app/

# Lint code
flake8 app/
mypy app/

# Run pre-commit hooks
pre-commit run --all-files
```

## 📚 API Documentation

When running in development mode, interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔄 Migration Path

This application is designed to be platform-agnostic:
- **Current**: Railway deployment
- **Future**: Easy migration to Google Cloud Run
- **Database**: Supabase remains consistent across platforms

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 8000
   lsof -ti:8000 | xargs kill -9
   ```

2. **Docker build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   ```

3. **Database connection fails**
   - Verify Supabase URL and key in `.env`
   - Check network connectivity
   - Verify database is running

### Logs

```bash
# View application logs
docker-compose logs -f api

# View Railway logs
# Check Railway dashboard
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Railway deployment logs
3. Verify environment configuration
4. Check Supabase connectivity