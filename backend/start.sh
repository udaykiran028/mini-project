#!/bin/bash

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Install Python dependencies inside the virtual environment
pip install -r requirements.txt

# Start the Node.js server
node server.js
