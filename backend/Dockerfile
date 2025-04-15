# Start from Debian slim as base
FROM debian:bookworm-slim

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install core dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    gnupg \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    python3-opencv \
    cmake \
    g++ \
    git \
    wget \
    unzip \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-all-dev \
    libssl-dev \
    libffi-dev \
    libgl1-mesa-glx \
    libgl1-mesa-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ---------- Install Node.js LTS (e.g., 18.x) ----------
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    node -v && npm -v

# Create and activate Python virtual environment
RUN python3 -m venv $VIRTUAL_ENV

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir numpy dlib opencv-python

# Install Node.js dependencies
RUN npm install

# Expose your backend port (adjust if different)
EXPOSE 5000

# Start Node.js server (server.js is your entry point)
CMD ["node", "server.js"]
