import express from 'express';
const router = express.Router();

import multer from 'multer';
import { askAI,uploadfile } from '../controller/aicontroller.js';

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

router.post('/upload', upload.single('file'),uploadfile);
router.post('/ask',askAI);

export default router;