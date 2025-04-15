FROM node:18

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    cmake \
    build-essential \
    libboost-all-dev \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libopencv-dev \
    git \
    && apt-get clean

# Set working directory
WORKDIR /app

# Install Python packages one-by-one (especially dlib)
# Install numpy first to prevent errors
RUN pip3 install --no-cache-dir numpy

# Install dlib first (as it's heavy and easier to debug separately)
RUN pip3 install --no-cache-dir dlib==19.24.6

# Then install the rest
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
