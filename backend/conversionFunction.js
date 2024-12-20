const { exec } = require('child_process');
const path = require('path');

const pythonPath = 'C:\\Python311\\python.exe';


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
        // Define the path to the Python script
        const scriptPath = path.join(__dirname, 'script', 'convert.py');
        
        // Construct the command to run the Python script with the correct file paths
        const command = `python "${scriptPath.replace(/\\/g, '/')}" ${inputFilePath.replace(/\\/g, '/')} ${outputFilePath.replace(/\\/g, '/')}`;
        
        // Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                // Handle any errors during execution
                console.error(`exec error: ${error}`);
                return reject(error);
            }
            // Resolve the promise with the command's output
            resolve(stdout || stderr);
        });
    });
};

exports.compressWithPython = (inputFilePath, outputFilePath) => {
    return new Promise((resolve, reject) => {
        // Define the path to the Python script
        const scriptPath = path.join(__dirname, 'script', 'filecompression.py');
        console.log("scriptpath="+scriptPath);

        // Construct the command to run the Python script with the correct file paths
        const command = `python "${scriptPath.replace(/\\/g, '/')}" "${inputFilePath.replace(/\\/g, '/')}" "${outputFilePath.replace(/\\/g, '/')}"`;


        // Log the command to check if it's correct
        console.log(`Executing command: ${command}`);

        // Execute the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                // Handle any errors during execution
                console.error(`exec error: ${error.message}`);
                return reject(new Error(`Error executing Python script: ${error.message}`));
            }
            // Resolve the promise with the command's output
            resolve(stdout || stderr);
        });
    });
};




