const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
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
        console.log(inputFilePath)
        const outputFilePath = path.join(docxDir, file.filename + '.docx');
        console.log(outputFilePath);
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


exports.mergePdf= async(req,res)=>{
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
        
        // Send the merged PDF as a response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="merged.pdf"',
        });
        res.send(Buffer.from(mergedPdfBytes));

        // Clean up the uploaded files
        fs.unlinkSync(file1Path);
        fs.unlinkSync(file2Path);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to merge PDFs');
    }
};