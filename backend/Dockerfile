FROM python:3.11

# Install dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    libgtk-3-dev \
    libboost-all-dev

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Run the application
CMD ["bash", "./start.sh"]
