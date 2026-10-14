import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { convertWithPython, compressWithPython } from '../conversionFunction.js';
import { logConversion } from '../log/logConversion.js';
import { ConversionType } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const uploadDir  = path.join(__dirname, '../uploads');

/* ─────────────────────────────────────────────────────────────
   POST /convertfile/pdf/to-docx
───────────────────────────────────────────────────────────── */
export const convertPdfToDocx = async (req, res) => {
  try {
    const intent = req.body.intent ?? 'pdf_to_docx';
    const file   = req.file;
    const { uid, email } = req.body; // NEW - sent from frontend formData

    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const safeFilename  = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const newFilePath   = path.join(file.destination, safeFilename);
    fs.renameSync(file.path, newFilePath);
    file.path = newFilePath;

    const randomSuffix  = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const outputFileName = `convertedpdftodocx-${randomSuffix}.docx`;
    const outputFilePath = path.join(uploadDir, outputFileName);

    console.log(`[${intent}] Converting: ${file.path} → ${outputFilePath}`);
    await convertWithPython(file.path, outputFilePath);

    if (!fs.existsSync(outputFilePath)) {
      return res.status(500).json({ error: 'Conversion failed — output file missing.' });
    }

    // NEW: log this conversion to the database
    if (uid) {
      await logConversion({
        uid,
        email,
        originalName: file.originalname,
        type: ConversionType.PDF_TO_DOCX,
        filePath: outputFilePath,
      });
    } else {
      console.warn('No uid provided - skipping conversion log for', file.originalname);
    }

    res.download(outputFilePath, outputFileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({ error: 'Failed to download file.' });
      }
    });

  } catch (error) {
    console.error('convertPdfToDocx error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /convertfile/pdf/to-merge

   CHANGED: previously sent the merged buffer directly via res.send()
   with no file ever saved to disk - meaning a merged file could never
   be tracked in FileConversion.filePath or reopened later. Now we
   write it to uploadDir first, then res.download() from there, same
   pattern as your other two conversions.
───────────────────────────────────────────────────────────── */
export const mergePdf = async (req, res) => {
  try {
    const intent    = req.body.intent ?? 'pdf_merge';
    const { uid, email } = req.body; // NEW
    const file1Path = req.files?.file1?.[0]?.path;
    const file2Path = req.files?.file2?.[0]?.path;
    const file1Name = req.files?.file1?.[0]?.originalname;
    const file2Name = req.files?.file2?.[0]?.originalname;

    if (!file1Path || !file2Path) {
      return res.status(400).json({ error: 'Both file1 and file2 are required.' });
    }

    const [buf1, buf2]  = [fs.readFileSync(file1Path), fs.readFileSync(file2Path)];
    const [doc1, doc2]  = await Promise.all([PDFDocument.load(buf1), PDFDocument.load(buf2)]);
    const merged        = await PDFDocument.create();

    const pages1 = await merged.copyPages(doc1, doc1.getPageIndices());
    pages1.forEach((p) => merged.addPage(p));

    const pages2 = await merged.copyPages(doc2, doc2.getPageIndices());
    pages2.forEach((p) => merged.addPage(p));

    const mergedBytes = await merged.save();

    // NEW: write to disk instead of only sending in-memory, so this
    // file has a real path FileConversion can reference.
    const randomSuffix   = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const outputFileName = `merged-${randomSuffix}.pdf`;
    const outputFilePath = path.join(uploadDir, outputFileName);
    fs.writeFileSync(outputFilePath, mergedBytes);

    console.log(`[${intent}] Merged: ${file1Path} + ${file2Path} → ${outputFilePath}`);

    if (uid) {
      await logConversion({
        uid,
        email,
        originalName: `${file1Name} + ${file2Name}`,
        type: ConversionType.MERGE_PDF,
        filePath: outputFilePath,
      });
    } else {
      console.warn('No uid provided - skipping conversion log for merge');
    }

    res.download(outputFilePath, outputFileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({ error: 'Failed to download file.' });
      }
    });

    // Clean up the two SOURCE files (not the merged output - that one
    // stays, same as your other conversions).
    fs.unlinkSync(file1Path);
    fs.unlinkSync(file2Path);

  } catch (error) {
    console.error('mergePdf error:', error);
    res.status(500).json({ error: 'Failed to merge PDFs.' });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /convertfile/pdf/to-compress

   CHANGED: previously deleted BOTH the input and the compressed
   output immediately after sending (setImmediate cleanup). This
   directly conflicted with wanting month-old files to stay
   reopenable - so that cleanup is now removed. The compressed file
   persists on disk like your other conversions.
───────────────────────────────────────────────────────────── */
export const compressPdf = async (req, res) => {
  try {
    const intent = req.body.intent ?? 'pdf_compress';
    const { uid, email } = req.body; // NEW

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const inputFilePath  = req.file.path;
    const outputFilePath = path.join(uploadDir, req.file.filename + '.compressed.pdf');

    console.log(`[${intent}] Compressing: ${inputFilePath} → ${outputFilePath}`);
    await compressWithPython(inputFilePath, outputFilePath);

    if (!fs.existsSync(outputFilePath)) {
      return res.status(500).json({ error: 'Compression failed — output file missing.' });
    }

    if (uid) {
      await logConversion({
        uid,
        email,
        originalName: req.file.originalname,
        type: ConversionType.COMPRESS_PDF,
        filePath: outputFilePath,
      });
    } else {
      console.warn('No uid provided - skipping conversion log for', req.file.originalname);
    }

    res.download(outputFilePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({ error: 'Failed to send the file.' });
      }
      // NOTE: cleanup removed on purpose - see comment above.
      // If you want disk space management later, use a scheduled
      // cleanup job (e.g. delete files older than 30 days) instead
      // of deleting immediately after every single conversion.
    });

  } catch (error) {
    console.error('compressPdf error:', error);
    res.status(500).json({ error: 'Failed to compress PDF.' });
  }
};