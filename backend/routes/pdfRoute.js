import express from 'express';
const router = express.Router();
import multer from 'multer';
import {convertPdfToDocx} from '../controller/pdfController.js';
import {mergePdf} from '../controller/pdfController.js';
import {compressPdf} from '../controller/pdfController.js';

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

router.post('/to-docx', upload.single('file'), convertPdfToDocx);
router.post('/to-merge', upload.fields([{name:'file1'}, {name:'file2'}]),mergePdf)
router.post('/to-compress', upload.single('file'),compressPdf)

export default router;
