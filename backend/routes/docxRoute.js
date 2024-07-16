const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const docxController = require('../controller/docxController');

router.post('/to-pdf', upload.single('file'), docxController.convertDocxToPdf);

module.exports = router;
