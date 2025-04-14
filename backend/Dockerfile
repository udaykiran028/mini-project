# Base image with Node and Python
FROM node:18

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy package and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy rest of the code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
