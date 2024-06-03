const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
}));

const port = 3001;
const upload = multer({ dest: 'uploads/' }); // Temporary storage for multer

// Create directories for storing files if they don't exist
const docxDir = path.join(__dirname, 'docx');
const pdfDir = path.join(__dirname, 'pdf');

if (!fs.existsSync(docxDir)) fs.mkdirSync(docxDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const convertFile = async (inputPath, outputPath, format) => {
    const input = fs.readFileSync(inputPath);
    return new Promise((resolve, reject) => {
        libre.convert(input, format, undefined, (err, done) => {
            if (err) {
                return reject(err);
            }
            fs.writeFileSync(outputPath, done);
            resolve();
        });
    });
};

// Route to handle file upload and conversion
app.post('/convertfile', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const id = req.body.id;
        console.log(file);
        console.log(id);

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        const inputFilePath = req.file.path;// Use directly
        console.log(inputFilePath);
        let outputFilePath;
        let outputFormat;
        let convertedFileName;

        if (id === 'docx-to-pdf') {
            // Conversion from DOCX to PDF
            outputFilePath = path.join(pdfDir, file.filename + '.pdf');
            outputFormat = 'pdf';
            convertedFileName = file.originalname.replace(/\.[^/.]+$/, "") + '.pdf';
        } else if (id === 'pdf-to-docx') {
            // Conversion from PDF to DOCX
            outputFilePath = path.join(docxDir, file.filename + '.docx');
            outputFormat = 'docx';
            convertedFileName = file.originalname.replace(/\.[^/.]+$/, "") + '.docx';
        } else {
            return res.status(400).send('Invalid conversion type.');
        }

        await convertFile(inputFilePath, outputFilePath, outputFormat);

        res.download(outputFilePath, convertedFileName, (err) => {
            if (err) {
                console.error(`Error downloading file: ${err}`);
                return res.status(500).send('Failed to download file.');
            }

            // Cleanup uploaded and converted files
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
        });
    } catch (error) {
        console.error(`Unexpected error: ${error}`);
        res.status(500).send('An unexpected error occurred.');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
