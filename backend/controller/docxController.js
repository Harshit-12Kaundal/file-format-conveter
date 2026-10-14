import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import { convertWithLibreOffice } from '../conversionFunction.js';
import { logConversion } from '../log/logconversion.js';
import { ConversionType } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const uploadDir  = path.join(__dirname, '../uploads');

/* ─────────────────────────────────────────────────────────────
   POST /convertfile/docx/to-pdf
───────────────────────────────────────────────────────────── */
export const convertWithLibreOffice12 = async (req, res) => {
  try {
    const intent = req.body.intent ?? 'docx_to_pdf';
    const file   = req.file;

    // NEW: uid/email sent from the frontend's formData, used to
    // attribute this conversion to the correct user.
    const { uid, email } = req.body;

    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const newFilePath  = path.join(file.destination, safeFilename);
    fs.renameSync(file.path, newFilePath);
    file.path = newFilePath;

    const libreOutputPath = path.join(
      uploadDir,
      path.basename(newFilePath).replace(/\.[^/.]+$/, '.pdf')
    );

    const randomSuffix   = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const outputFileName = `converteddocxtopdf-${randomSuffix}.pdf`;
    const outputFilePath = path.join(uploadDir, outputFileName);

    console.log(`[${intent}] Converting: ${newFilePath} → ${outputFilePath}`);

    await convertWithLibreOffice(newFilePath, uploadDir);

    if (!fs.existsSync(libreOutputPath)) {
      return res.status(500).json({ error: 'Conversion failed — LibreOffice output missing.' });
    }
    fs.renameSync(libreOutputPath, outputFilePath);

    // NEW: log the conversion NOW - it succeeded, the file exists on
    // disk, we're about to send it. If uid is missing (user somehow
    // not logged in), skip logging rather than crash the response.
    if (uid) {
      await logConversion({
        uid,
        email,
        originalName: file.originalname,
        type: ConversionType.DOCX_TO_PDF,
        filePath: outputFilePath,
      });
    } else {
      console.warn('No uid provided - skipping conversion log for', file.originalname);
    }

    res.download(outputFilePath, outputFileName, (err) => {
      if (err) console.error('Download error:', err);
      // optionally clean up: fs.unlinkSync(outputFilePath);
    });

  } catch (error) {
    console.error('convertWithLibreOffice12 error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};