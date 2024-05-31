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

// Route to handle file upload and conversion
app.post('/convertfile', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        console.log(file);
        const docxFilePath = path.join(docxDir, file.originalname+ path.extname(file.originalname));
        console.log(docxFilePath);
        const pdfFilePath = path.join(pdfDir, file.originalname + '.pdf');
        console.log(pdfFilePath);

        // Move the file to the docx directory
        fs.renameSync(file.path, docxFilePath);

        const input = fs.readFileSync(docxFilePath);

        libre.convert(input, '.pdf', undefined, (err, done) => {
            if (err) {
                console.error(`Error converting file: ${err}`);
                return res.status(500).send('Failed to convert file.');
            }

            fs.writeFileSync(pdfFilePath, done);

            res.download(pdfFilePath, file.filename + '.pdf', (err) => {
                if (err) {
                    console.error(`Error downloading file: ${err}`);
                    return res.status(500).send('Failed to download file.');
                }

                // Optionally, clean up the uploaded and converted files
                fs.unlinkSync(docxFilePath);
                fs.unlinkSync(pdfFilePath);
            });
        });
    } catch (error) {
        console.error(`Unexpected error: ${error}`);
        res.status(500).send('An unexpected error occurred.');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
