# Use an official Python image with dependencies
FROM python:3.10

# Install system dependencies required for dlib and face_recognition
RUN apt-get update && apt-get install -y \
    cmake \
    libopencv-dev \
    libgl1-mesa-glx

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the required port (change if necessary)
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
