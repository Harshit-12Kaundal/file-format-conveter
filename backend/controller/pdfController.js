const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const { convertWithPython } = require('../conversionFunction');
const docxDir = path.join(__dirname, '../converted/docx');  
const compressedDir = path.join(__dirname, '../converted/compressed');
const gs = require('ghostscript4js'); 
const { PDFDocument } = require('pdf-lib');

if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
}

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

exports.compressPdf = async (req, res) => {
    try {
        const compressionLevel = Number(req.body.compressionLevel);
        const file = req.file;

        if (!file) {
            return res.status(400).send('No PDF file uploaded.');
        }

        const inputFilePath = path.resolve(file.path); // Ensure path is correct
        const outputDir = path.join(__dirname, '../converted/compressed');
        const outputFilePath = path.join(outputDir, `compressed_${file.originalname}`);
        console.log(__dirname);
        console.log(inputFilePath);
        console.log(outputFilePath);

        // Set Ghostscript quality level based on user input
        let gsQuality;
        if (compressionLevel >= 75) { // Compare as number
            gsQuality = 'screen';
        } else if (compressionLevel < 75 && compressionLevel >= 50) {
            gsQuality = 'ebook';
        } else {
            gsQuality = 'prepress';
        }

        // Construct the Ghostscript command
        const gsCommand = `"C:/Program Files/gs/gs10.03.1/bin/gswin64c.exe" -sDEVICE=pdfwrite -dPDFSETTINGS=/${gsQuality} -dNOPAUSE -dQUIET -dBATCH -dDownsampleColorImages=true -dDownsampleGrayImages=true -dDownsampleMonoImages=true -dColorImageResolution=72 -dGrayImageResolution=72 -dMonoImageResolution=72 "-sOutputFile=${outputFilePath}" "${inputFilePath}"`;

        console.log('Executing Ghostscript with the following command:', gsCommand);

        // Execute the Ghostscript command using exec
        exec(gsCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Ghostscript: ${error.message}`);
                return res.status(500).send('Failed to compress PDF.');
            }

            // Set the response headers for PDF download
            res.setHeader('Content-Disposition', `attachment; filename=compressed_${file.originalname}`);
            res.setHeader('Content-Type', 'application/pdf');

            // Send the compressed PDF file as a response
            res.sendFile(outputFilePath, (err) => {
                if (err) {
                    console.error('Error sending the file:', err);
                    return res.status(500).send('Failed to send the compressed PDF.');
                }

                // Clean up the files
                try {
                    fs.unlinkSync(outputFilePath); // Delete the compressed PDF after sending
                    fs.unlinkSync(inputFilePath);  // Delete the original input PDF file
                    console.log('Files cleaned up successfully.');
                } catch (cleanupErr) {
                    console.error('Error during file cleanup:', cleanupErr);
                }
            });
        });

    } catch (error) {
        console.error(`Unexpected error: ${error}`);
        res.status(500).send('An unexpected error occurred.');
    }
};






