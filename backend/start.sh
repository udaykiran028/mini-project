#!/bin/bash

# Install system dependencies (CMake, Boost, OpenBLAS, GTK)
apt-get update && apt-get install -y \
    cmake \
    libboost-all-dev \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    python3-dev

# Install Python dependencies in a virtual environment
python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install --no-cache-dir dlib face-recognition opencv-python numpy
