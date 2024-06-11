# Use an official Node.js runtime as the base image
FROM node:20

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice

# Install Python and pdf2docx
RUN apt-get install -y python3-pip && pip3 install pdf2docx

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
