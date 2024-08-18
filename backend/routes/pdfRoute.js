const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pdfController = require('../controller/pdfController');

router.post('/to-docx', upload.single('file'), pdfController.convertPdfToDocx);
router.post('/to-merge', upload.fields([{name:'file1'}, {name:'file2'}]),pdfController.mergePdf)

module.exports = router;
