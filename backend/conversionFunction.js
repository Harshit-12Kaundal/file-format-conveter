import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Decide Python path based on OS (Windows vs Docker/Linux)
const PYTHON_PATH =
  process.platform === "win32"
    ? `"C:\\Users\\new\\AppData\\Local\\Python\\bin\\python.exe"` // optional for local dev
    : "python3";

// ---------------- DOCX -> PDF via LibreOffice ----------------
export function convertWithLibreOffice(inputFilePath, outputDir) {
  return new Promise((resolve, reject) => {
    const sofficePath = "soffice"; // works in Docker

    const input = path.resolve(inputFilePath).replace(/\\/g, '/');
    const outDir = path.resolve(outputDir).replace(/\\/g, '/');

    const cmd = `${sofficePath} --headless --nologo --nofirststartwizard --convert-to pdf "${input}" --outdir "${outDir}"`;

    console.log("Executing LibreOffice:", cmd);

    exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        console.error("LibreOffice error:", stderr);
        return reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

// ---------------- PDF -> DOCX via pdf2docx ----------------
export function convertWithPython(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'script', 'convert.py');

    const input = path.resolve(inputFilePath).replace(/\\/g, '/');
    const output = path.resolve(outputFilePath).replace(/\\/g, '/');
    const script = scriptPath.replace(/\\/g, '/');

    const cmd = `${PYTHON_PATH} "${script}" "${input}" "${output}"`;

    console.log("Executing PDF -> DOCX:", cmd);

    exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        console.error("pdf2docx error:", stderr);
        return reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}

// ---------------- Compression via Python ----------------
export function compressWithPython(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'script', 'filecompression.py');

    const input = path.resolve(inputFilePath).replace(/\\/g, '/');
    const output = path.resolve(outputFilePath).replace(/\\/g, '/');
    const script = scriptPath.replace(/\\/g, '/');

    const cmd = `${PYTHON_PATH} "${script}" "${input}" "${output}"`;

    console.log("Executing compression:", cmd);

    exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        console.error("compression error:", stderr);
        return reject(error);
      }
      resolve(stdout || stderr);
    });
  });
}
