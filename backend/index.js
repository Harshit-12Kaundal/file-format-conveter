const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
// const { Pool } = require('pg');
const pool =require('./Config/db')

const app = express();
app.use(express.json());

// CORS and other middlewares
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV,
  credentials: true,
};

app.use(cors(corsOptions));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Route imports
const docxRoutes = require('./routes/docxRoute');  //path for file
const pdfRoutes = require('./routes/pdfRoute');
const RegRoutes =require('./routes/RegRoutes') //path for file
// const User =require('./routes/RegRoutes'); //path for file

// Basic route to test the server
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello' });
});

// Routes for file conversions
app.use('/convertfile/docx', docxRoutes);
app.use('/convertfile/pdf', pdfRoutes);
app.use('/reg',RegRoutes);
// app.use('/convertfile/reg',User);

// Set the port from .env or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
