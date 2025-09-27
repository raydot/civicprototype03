#!/bin/bash
# Railway build script for conda environment

# Install miniconda if not present
if ! command -v conda &> /dev/null; then
    echo "Installing Miniconda..."
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh
    bash miniconda.sh -b -p $HOME/miniconda
    export PATH="$HOME/miniconda/bin:$PATH"
    conda init bash
    source ~/.bashrc
fi

# Create conda environment from environment.yml
echo "Creating conda environment..."
conda env create -f environment.yml

echo "Build complete!"
