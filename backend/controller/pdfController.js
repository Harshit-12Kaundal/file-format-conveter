const path = require('path');
const fs = require('fs');
const { convertWithPython } = require('../conversionFunction');

const docxDir = path.join(__dirname, '../converted/docx');

if (!fs.existsSync(docxDir)) {
    fs.mkdirSync(docxDir, { recursive: true });
}

exports.convertPdfToDocx = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const inputFilePath = file.path;
        const outputFilePath = path.join(docxDir, file.filename + '.docx');
        const convertedFileName = file.originalname.replace(/\.[^/.]+$/, "") + '.docx';

        await convertWithPython(inputFilePath, outputFilePath);

        if (!fs.existsSync(outputFilePath)) {
            console.error(`Output file does not exist: ${outputFilePath}`);
            return res.status(500).send('Conversion failed.');
        }

        res.download(outputFilePath, convertedFileName, (err) => {
            if (err) {
                console.error(`Error downloading file: ${err}`);
                return res.status(500).send('Failed to download file.');
            }

            console.log(`File downloaded successfully: ${outputFilePath}`);

            try {
                fs.unlinkSync(inputFilePath);
                fs.unlinkSync(outputFilePath);
                console.log(`Cleaned up files: ${inputFilePath}, ${outputFilePath}`);
            } catch (cleanupError) {
                console.error(`Error cleaning up files: ${cleanupError}`);
            }
        });
    } catch (error) {
        console.error(`Unexpected error: ${error}`);
        res.status(500).send('An unexpected error occurred.');
    }
};
