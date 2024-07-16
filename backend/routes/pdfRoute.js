const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pdfController = require('../controller/pdfController');

router.post('/to-docx', upload.single('file'), pdfController.convertPdfToDocx);

module.exports = router;
