# Use an official Node.js runtime as the base image
FROM node:20

# Install system dependencies: LibreOffice, Python, and Ghostscript
RUN apt-get update && \
    apt-get install -y libreoffice python3-pip ghostscript && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install pdf2docx globally
RUN pip3 install pdf2docx

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (based on express app configuration)
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
