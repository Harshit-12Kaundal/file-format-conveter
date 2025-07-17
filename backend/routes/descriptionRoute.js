import express from 'express';
import multer from 'multer';
import { PdfDescription } from '../controller/descriptioncontroller.js';
import { Queue } from 'bullmq';
const router = express.Router();
const queue = new Queue('file-upload-queue');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  queue.add('file-ready', JSON.stringify({
    filename: req.file.originalname,
    source: req.file.destination,
    path: req.file.path,
  }));
  res.status(200).json({ message: "File uploaded successfully", file: req.file });
});

router.post('/pdf-desc', upload.single('file'), PdfDescription);

export default router;
