# Use Node.js base image
FROM node:18

# Install Python, pip, and required system dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libopencv-dev \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 3000

# Start your server
CMD ["node", "server.js"]
