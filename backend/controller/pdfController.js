import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { convertWithPython, compressWithPython } from '../conversionFunction.js';
import { PDFDocument } from 'pdf-lib';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

export const convertPdfToDocx = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const inputFilePath = file.path;
        const randomSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const outputFileName = `convertedpdftodocx-${randomSuffix}.docx`;
        const outputFilePath = path.join(uploadDir, outputFileName);
        
        console.log(`Converting file: ${inputFilePath} to ${outputFilePath}`);
        await convertWithPython(inputFilePath, outputFilePath);
        console.log(`Conversion completed: ${outputFilePath}`);

        if (!fs.existsSync(outputFilePath)) {
            console.error(`Output file does not exist: ${outputFilePath}`);
            return res.status(500).send('Conversion failed.');
        }

        res.download(outputFilePath, outputFileName, (err) => {
            if (err) {
                console.error(`Error downloading file: ${err}`);
                return res.status(500).send('Failed to download file.');
            }
            // Do not delete files after download
        });
    } catch (error) {
        console.error(`Unexpected error: ${error}`);
        res.status(500).send('An unexpected error occurred.');
    }
};

export const mergePdf = async (req, res) => {
    try {
        const file1Path = req.files['file1'][0].path;
        const file2Path = req.files['file2'][0].path;

        const file1Buffer = fs.readFileSync(file1Path);
        const file2Buffer = fs.readFileSync(file2Path);

        const pdfDoc1 = await PDFDocument.load(file1Buffer);
        const pdfDoc2 = await PDFDocument.load(file2Buffer);

        const mergedPdf = await PDFDocument.create();
        const copiedPages1 = await mergedPdf.copyPages(pdfDoc1, pdfDoc1.getPageIndices());
        copiedPages1.forEach((page) => mergedPdf.addPage(page));

        const copiedPages2 = await mergedPdf.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
        copiedPages2.forEach((page) => mergedPdf.addPage(page));

        const mergedPdfBytes = await mergedPdf.save();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="merged.pdf"',
        });
        res.send(Buffer.from(mergedPdfBytes));

        fs.unlinkSync(file1Path);
        fs.unlinkSync(file2Path);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to merge PDFs');
    }
};

export const compressPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please upload a PDF file.' });
        }

        const inputFilePath = req.file.path;
        const outputFilePath = path.join(uploadDir, req.file.filename + '.compressed.pdf');

        await compressWithPython(inputFilePath, outputFilePath);

        if (!fs.existsSync(outputFilePath)) {
            console.error('Compressed file does not exist:', outputFilePath);
            return res.status(500).json({ error: 'Failed to create compressed file.' });
        }

        res.download(outputFilePath, (err) => {
            if (err) {
                console.error('Error sending the file:', err);
                return res.status(500).json({ error: 'Failed to send the file.' });
            }

            setImmediate(() => {
                try {
                    fs.unlinkSync(inputFilePath);
                    fs.unlinkSync(outputFilePath);
                } catch (cleanupError) {
                    console.error('Error cleaning up files:', cleanupError);
                }
            });
        });
    } catch (error) {
        console.error('Error compressing PDF:', error);
        res.status(500).json({ error: 'Failed to compress PDF.' });
    }
};
