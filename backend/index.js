const express = require('express');
const multer = require('multer');
const docxTopdf = require('docx-pdf');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3001;

// Enable CORS for a specific origin
app.use(cors({
    origin: "http://localhost:3000",
}));

// Setting up the file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/convertfile', upload.single("file"), (req, res) => {
    console.log(req.file);
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file was uploaded"
            });
        }

        const outputPath = path.join(__dirname, 'files', `${req.file.originalname}.pdf`);
        
        // Ensure the output directory exists
        const outputDir = path.join(__dirname, 'files');
        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir);
        }

        docxTopdf(req.file.path, outputPath, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error in converting Docx to Pdf file"
                });
            }
            console.log('result' + result);
            res.download(outputPath, () => {
                console.log("File downloaded");
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
