# Use an official Node.js runtime as the base image
FROM node:18 AS base  # Downgraded to Node.js 18 for better compatibility with ghostscript4js

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install && npm install -g npm@latest

# Install system dependencies: LibreOffice, Python, Ghostscript, and build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libreoffice \
        python3-pip \
        ghostscript \
        libgs-dev \
        python3-venv \
        build-essential \
        libxml2-dev \
        libxslt-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a virtual environment for Python
RUN python3 -m venv /opt/venv

# Install pdf2docx inside the virtual environment
RUN /opt/venv/bin/pip install pdf2docx

# Ensure the virtual environment binaries are in PATH
ENV PATH="/opt/venv/bin:$PATH"

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (based on express app configuration)
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
