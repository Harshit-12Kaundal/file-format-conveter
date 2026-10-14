import { Worker } from 'bullmq';
import { connection } from '../Config/redis.js';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { chunkText } from './textutils.js';
import { fileURLToPath } from 'url';
import {setChunks} from './storeChunk.js';

// 🧭 Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const worker = new Worker(
  'file-upload-queue',
  async job => {
    console.log('👷 Worker received job:', job.data);

    const { path: filePath } = job.data;

    // ✅ Build absolute path from project root, not from worker folder
    const resolvedPath = path.resolve(__dirname, '..', filePath.replace(/\\/g, '/'));

    console.log('Resolved file path:', resolvedPath);

    if (fs.existsSync(resolvedPath)) {
      console.log(`📘 Processing file: ${resolvedPath}`);

      // Read and parse PDF
      const buffer = fs.readFileSync(resolvedPath);
      const data = await pdf(buffer);

      if (!data.text || data.text.trim().length === 0) {
        console.warn('⚠️ No text extracted from PDF. Possibly a scanned image.');
        return { status: 'no-text', filename: job.data.filename };
      }

      // Split into chunks
      const chunks = chunkText(data.text, 1000);
      console.log(`🧩 Total chunks created: ${chunks.length}`);
      await setChunks(job.data.filename, chunks);

      console.log(`✅ Finished processing file: ${job.data.filename}`);
    } else {
      console.log('⚠️ File not found:', resolvedPath);
    }

    return { status: 'done', filename: job.data.filename };
  },
  { connection }
);

worker.on('completed', job => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});
