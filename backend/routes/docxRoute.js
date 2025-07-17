import express from 'express';
import multer from 'multer';
import { convertWithLibreOffice12 } from '../controller/docxController.js';

const router = express.Router();
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

router.post('/to-pdf', upload.single('file'), convertWithLibreOffice12);

export default router;
