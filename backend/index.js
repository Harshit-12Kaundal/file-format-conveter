const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const { Console } = require('console');

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

const convertWithLibreOffice = async (inputPath, outputPath, format) => {
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

const convertWithPython = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, 'convert.py');
        console.log(pythonScriptPath);
        const command = `python ${pythonScriptPath} "${inputPath}" "${outputPath}"`;

        exec(command, (error, stdout, stderr) => {
            console.log(stdout);  // Log the standard output from the Python script
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return reject(stderr);
            }

            resolve();
        });
    });
};

// Route to handle file upload and conversion
app.post('/convertfile', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const id = req.body.id;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const inputFilePath = req.file.path;
        let outputFilePath;
        let convertedFileName;

        if (id === 'docx-to-pdf') {
            // Conversion from DOCX to PDF
            outputFilePath = path.join(pdfDir, file.filename + '.pdf');
            convertedFileName = file.originalname.replace(/\.[^/.]+$/, "") + '.pdf';
            await convertWithLibreOffice(inputFilePath, outputFilePath, 'pdf');
        } else if (id === 'pdf-to-docx') {
            // Conversion from PDF to DOCX
            outputFilePath = path.join(docxDir, file.filename + '.docx');
            convertedFileName = file.originalname.replace(/\.[^/.]+$/, "") + '.docx';
            await convertWithPython(inputFilePath, outputFilePath);
        } else {
            return res.status(400).send('Invalid conversion type.');
        }

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
