# Multi-stage Docker build for Railway deployment with Conda
FROM continuumio/miniconda3:latest AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    CONDA_AUTO_UPDATE_CONDA=false

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Copy environment file first for better caching
COPY environment.yml .

# Create conda environment and install dependencies
RUN conda env create -f environment.yml && \
    conda clean -afy

# Activate environment and download spaCy model
RUN /opt/conda/envs/ai-recommendation-service/bin/python -m spacy download en_core_web_sm

# Make sure we use the conda environment
ENV PATH="/opt/conda/envs/ai-recommendation-service/bin:$PATH"

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (Railway will override this)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests, os; requests.get(f'http://localhost:{os.getenv(\"PORT\", \"8000\")}/health')"

# Command to run the application
CMD ["bash", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
