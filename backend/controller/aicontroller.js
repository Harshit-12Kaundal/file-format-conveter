import { spawn } from "child_process";

const PDF_EXTENSIONS = [".pdf"];

/* ─────────────────────────────────────────────────────────────
   POST /ai/upload
   Only runs the Python vector-embedding pipeline for PDFs.
   For DOCX / TXT / other files it still accepts the upload
   (multer saves the file) but skips pdfplumber indexing and
   returns a fileId so conversion routes still work.
───────────────────────────────────────────────────────────── */
export const uploadfile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileExt  = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    const isPdf    = PDF_EXTENSIONS.includes(fileExt);

    console.log(`File uploaded: ${filePath} (isPdf: ${isPdf})`);

    if (!isPdf) {
      // Non-PDF: skip pdfplumber, just return the fileId for conversion routes
      return res.json({
        message: "File uploaded (AI chat only available for PDFs)",
        fileId: filePath,
        indexed: false,
      });
    }

    // PDF: run vector embedding pipeline as normal
    const pythonProcess = spawn("py", [
      "-3.11",
      "ai/main_code.py",
      "upload",
      filePath,
    ]);

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    pythonProcess.on("close", () => {
      res.json({
        message: "PDF processed successfully",
        fileId: filePath,
        indexed: true,
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /ai/ask
───────────────────────────────────────────────────────────── */
export const askAI = async (req, res) => {
  try {
    const { fileId, question } = req.body;

    const pythonProcess = spawn("py", [
      "-3.11",
      "ai/main_code.py",
      "ask",
      fileId,
      question,
    ]);

    let result = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    pythonProcess.on("close", () => {
      res.json({ answer: result.trim() });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Question failed" });
  }
};