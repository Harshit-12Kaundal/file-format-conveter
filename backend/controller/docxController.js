import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { convertWithPythonConversion } from '../conversionFunction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pdfDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists for both uploaded and converted files
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
}

export const convertWithLibreOffice12 = async (req, res) => {
    try {
        const file = req.file;
        console.log(file)
        if (!file) {
            console.error('No file uploaded.');
            return res.status(400).send('No file uploaded.');
        }

        const inputFilePath = file.path;
        // Generate a random string for the filename
        const randomStr = Math.random().toString(36).substring(2, 10);
        const outputFileName = `Convertedtopdf-${randomStr}.pdf`;
        const outputFilePath = path.join(pdfDir, outputFileName);
        const convertedFileName = file.originalname.replace(/\.[^/.]+$/, '') + '.pdf';
        

        console.log(`Converting file: ${inputFilePath} to ${outputFilePath}`);
        console.log(`Converted file name: ${convertedFileName}`);
        await convertWithPythonConversion(inputFilePath, outputFilePath);
        console.log(`Conversion completed: ${outputFilePath}`);

        // If the file does not exist, try to convert again once
        if (!fs.existsSync(outputFilePath)) {
            console.warn(`Output file does not exist after first attempt: ${outputFilePath}. Retrying conversion...`);
            await convertWithPythonConversion(inputFilePath, outputFilePath);
        }

        if (!fs.existsSync(outputFilePath)) {
            console.error(`Output file still does not exist: ${outputFilePath}`);
            return res.status(500).send('Conversion failed.');
        }

        res.download(outputFilePath, convertedFileName, (err) => {
            if (err) {
                console.error(`Error downloading file: ${err}`);
                return res.status(500).send('Failed to download file.');
            }
            console.log(`File downloaded successfully: ${outputFilePath}`);
        });
    } catch (error) {
        console.error(`Unexpected error: ${error}`);
        res.status(500).send('An unexpected error occurred.');
    }
};
