#!/bin/bash
# Railway build script for conda environment

set -e  # Exit on any error

echo "🐍 Setting up conda environment for Railway..."

# Install miniconda if not present
if ! command -v conda &> /dev/null; then
    echo "📦 Installing Miniconda..."
    wget -q https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh
    bash miniconda.sh -b -p $HOME/miniconda
    export PATH="$HOME/miniconda/bin:$PATH"
    source $HOME/miniconda/etc/profile.d/conda.sh
    conda init bash
fi

# Ensure conda is in PATH
export PATH="$HOME/miniconda/bin:$PATH"
source $HOME/miniconda/etc/profile.d/conda.sh

# Create conda environment from environment.yml
echo "🔧 Creating conda environment from environment.yml..."
conda env create -f environment.yml --force

echo "✅ Conda environment setup complete!"
echo "🚀 Environment 'ai-recommendation-service' is ready"
