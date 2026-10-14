FROM node:20-bullseye

# Install LibreOffice and Python
RUN apt-get update && \
    apt-get install -y libreoffice python3 python3-pip && \
    pip3 install \
        pdf2docx==0.5.6 \
        PyMuPDF==1.21.1 \
        sentence-transformers \
        faiss-cpu \
        torch \
        numpy && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]