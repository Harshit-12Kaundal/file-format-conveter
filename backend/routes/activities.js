// backend/routes/activity.js
import express from "express";
import { prisma } from "../prisma.js";

const router = express.Router();

// Helper: find-or-create the internal User row for a Firebase uid.
async function getOrCreateUser(uid, email = "") {
  return prisma.user.upsert({
    where: { uid },
    update: {},
    create: { uid, email },
  });
}

// POST /activity  -> log one event (create, edit, rename, branch, merge)
router.post("/activity", async (req, res) => {
  try {
    const { uid, email, fileName, type, title, detail, branch } = req.body;
    if (!uid || !fileName || !type || !title) {
      return res.status(400).json({ message: "uid, fileName, type, and title are required" });
    }

    const user = await getOrCreateUser(uid, email);

    const event = await prisma.changeEvent.create({
      data: {
        userId: user.id,
        fileName,
        type,
        title,
        detail,
        branch: branch || "main",
      },
    });

    res.json(event);
  } catch (err) {
    console.error("Log activity error:", err);
    res.status(500).json({ message: "Failed to log activity" });
  }
});

// GET /activity/:uid  -> full activity for the grid (all files)
router.get("/activity/:uid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { uid: req.params.uid } });
    if (!user) return res.json([]);

    const events = await prisma.changeEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 500, // plenty for a activity-grid-style view
    });

    res.json(events);
  } catch (err) {
    console.error("Get activity error:", err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

// GET /activity/:uid/:fileName  -> history scoped to one file (for ChangeHistory panel)
router.get("/activity/:uid/:fileName", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { uid: req.params.uid } });
    if (!user) return res.json([]);

    const events = await prisma.changeEvent.findMany({
      where: { userId: user.id, fileName: req.params.fileName },
      orderBy: { createdAt: "desc" },
    });

    res.json(events);
  } catch (err) {
    console.error("Get file activity error:", err);
    res.status(500).json({ message: "Failed to fetch file activity" });
  }
});

export default router;