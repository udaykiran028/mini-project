#!/bin/bash

# Update package list and install system dependencies
apt-get update && apt-get install -y cmake python3-dev libboost-all-dev

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt

# Start the Node.js server
node server.js
