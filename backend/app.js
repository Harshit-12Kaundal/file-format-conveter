import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Route imports
import docxRoutes from './routes/docxRoute.js';
import pdfRoutes from './routes/pdfRoute.js';
import Description from './routes/descriptionRoute.js';
import Auth from './routes/Auth.js';
import ProfileAvatarRoutes from './routes/ProfileAvatarRoutes.js';
import activityRoutes from './routes/activities.js';
import fileroutes from './routes/fileroutes.js'
import conversionRoutes from './routes/conversions.js'; 
import usersearchRoutes from './routes/usersearch.js';


dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

app.use(cors(corsOptions));

// Test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello' });
});

// Routes
app.use('/convertfile/docx', docxRoutes);
app.use('/convertfile/pdf', pdfRoutes);
app.use('/ai', Description);
app.use('/api/auth', Auth);
app.use('/data', ProfileAvatarRoutes);
app.use('/', activityRoutes);
app.use('/', fileroutes);
app.use('/', conversionRoutes); 
app.use('/users', usersearchRoutes);
app.use('/', usersearchRoutes);
export default app;