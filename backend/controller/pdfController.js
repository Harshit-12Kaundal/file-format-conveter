const path = require('path');
const oneFolderUp = path.resolve(__dirname, '..');
const { exec } = require('child_process');
const fs = require('fs');
const { convertWithPython } = require('../conversionFunction');
const {compressWithPython} =require("../conversionFunction")
const docxDir = path.join(__dirname, '../converted/docx');  
const compressDir =path.join(__dirname,'../converted/compressed')
const compressedDir = path.join(__dirname, '../converted/compressed');
const { PDFDocument } = require('pdf-lib');

if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
}

if (!fs.existsSync(docxDir)) {
    fs.mkdirSync(docxDir, { recursive: true });
}

if (!fs.existsSync(compressDir)) {
    fs.mkdirSync(compressDir, { recursive: true });
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

const multer = require('multer');

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Adjust as necessary

exports.compressPdf = async (req, res) => {
    try {
        // Check if the file is present
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please upload a PDF file.' });
        }

        const inputFilePath = req.file.path;
        console.log('Input file path:', inputFilePath);

        // Check if the uploaded file is a PDF
        // if (!inputFilePath.endsWith('.pdf')) {
        //     return res.status(400).json({ error: 'Only PDF files are allowed.' });
        // }

        // Define the output file path
        const outputFilePath = path.join(compressDir,req.file.originalname);
        console.log("outputfilepthis="+outputFilePath);
        // Ensure the output directory exists
        const outputDir = path.dirname(outputFilePath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log("Created output directory:", outputDir);
        }

        // Call the compression function and wait for it to complete
        await compressWithPython(inputFilePath, outputFilePath); // Ensure this function has its own error handling

        // Check if the file was created successfully
        if (!fs.existsSync(outputFilePath)) {
            console.error('Compressed file does not exist:', outputFilePath);
            return res.status(500).json({ error: 'Failed to create compressed file.' });
        }

        // Send the compressed PDF as a response
        res.download(outputFilePath, (err) => {
            if (err) {
                console.error('Error sending the file:', err);
                return res.status(500).json({ error: 'Failed to send the file.' });
            }

            // Clean up the temporary files after sending
    // Clean up files
            setImmediate(() => {
                try {
                    fs.unlinkSync(inputFilePath); // Delete the uploaded file
                    fs.unlinkSync(outputFilePath); // Delete the compressed file
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







