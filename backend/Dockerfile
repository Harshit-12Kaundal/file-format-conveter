# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install LibreOffice, Python3, and pdf2docx
RUN apt-get update && \
    apt-get install -y libreoffice python3-pip && \
    pip3 install pdf2docx

# Copy the rest of the project files
COPY . .

# Expose the backend port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
