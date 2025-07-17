import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(express.json());



// CORS and other middlewares
const corsOptions = {
  // origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV,
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
})

const upload = multer({ storage: storage })

// Route imports
import docxRoutes from './routes/docxRoute.js';  //path for file
import pdfRoutes from './routes/pdfRoute.js';
// import RegRoutes from './routes/RegRoutes.js'; //path for file
// import dataRoutes from './routes/dataSavingRoute.js';
// import Description from './routes/descriptionRoute.js';

// Basic route to test the server
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello' });
});


// Routes for file conversions
app.use('/convertfile/docx', docxRoutes);
app.use('/convertfile/pdf', pdfRoutes);
// app.use('/reg',RegRoutes);
// app.use('/data', dataRoutes);
// app.use('/des', Description);
// app.use('/convertfile/reg',User);

// Set the port from .env or default to 3000
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
