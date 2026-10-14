// backend/routes/files.js
import express from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../prisma.js";

const router = express.Router();

// GET /files/:id -> stream back the actual file for a given FileConversion row
router.get("/files/:id", async (req, res) => {
  try {
    const record = await prisma.fileConversion.findUnique({
      where: { id: req.params.id },
    });

    if (!record || !record.filePath) {
      return res.status(404).json({ message: "File not found" });
    }

    if (!fs.existsSync(record.filePath)) {
      // The database row exists, but the actual file was deleted from
      // disk (manual cleanup, moved folders, etc.) - tell the frontend
      // clearly instead of a generic error.
      return res.status(410).json({ message: "File no longer exists on disk" });
    }

    const originalBaseName = path.basename(
      record.originalName,
      path.extname(record.originalName)
    );
    const outputExtension = path.extname(record.filePath);
    const downloadName = `${originalBaseName || "shared-file"}${outputExtension}`;

    res.download(record.filePath, downloadName);
  } catch (err) {
    console.error("Get file error:", err);
    res.status(500).json({ message: "Failed to retrieve file" });
  }
});

export default router;