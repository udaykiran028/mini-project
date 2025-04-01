#!/bin/bash

# Update package list and install system dependencies
apt-get update && apt-get install -y \
    cmake \
    python3-dev \
    libboost-all-dev \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    python3-pip

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install --no-cache-dir dlib face-recognition opencv-python numpy

# Start the Node.js server
node server.js
