# Base image with Node.js (consider using a slim or LTS variant for fewer vulnerabilities)
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies: LibreOffice and Python3
RUN apt-get update && \
    apt-get install -y libreoffice python3-pip && \
    pip3 install --break-system-packages pdf2docx && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the full application
COPY . .

# Create uploads directory (for multer)
RUN mkdir -p uploads

# Expose the port your app runs on
EXPOSE 8000

# Start the app
CMD ["npm", "start"]
