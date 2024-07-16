const { exec } = require('child_process');
const path = require('path');

exports.convertWithLibreOffice = (inputFilePath, outputFilePath, format = 'pdf') => {
    return new Promise((resolve, reject) => {
        const command = `soffice --headless --convert-to ${format} --outdir ${path.dirname(outputFilePath)} ${inputFilePath}`;
        console.log(`Executing command: ${command}`);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error}`);
                console.error(`stderr: ${stderr}`);
                return reject(error);
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            resolve(stdout || stderr);
        });
    });
};


exports.convertWithPython = (inputFilePath, outputFilePath) => {
    return new Promise((resolve, reject) => {
        // Assuming you have a Python script to handle PDF to DOCX conversion
        const command = `python3 pdf_to_docx.py ${inputFilePath} ${outputFilePath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            resolve(stdout || stderr);
        });
    });
};
