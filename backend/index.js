const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); 

const app = express();

// Determine the environment and set the CORS origin
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV,
  credentials: true,
};

app.use(cors(corsOptions));

const upload = multer({ dest: 'uploads/' });

const docxRoutes = require('./routes/docxRoute');
const pdfRoutes = require('./routes/pdfRoute');

// Basic route to test the server
app.get('/', (req, res) => {
  res.status(200).json({ 'message': 'hello' });
});

app.use('/convertfile/docx', docxRoutes);
app.use('/convertfile/pdf', pdfRoutes);

// Set the port from .env or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
