// backend/routes/conversions.js
import express from "express";
import { prisma } from "../prisma.js";

const router = express.Router();

// GET /conversions/:uid -> returns recent conversion history for the activity grid
router.get("/conversions/:uid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { uid: req.params.uid } });
    if (!user) return res.json([]); // no conversions yet, not an error

    const conversions = await prisma.fileConversion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json(conversions);
  } catch (err) {
    console.error("Get conversions error:", err);
    res.status(500).json({ message: "Failed to fetch conversion history" });
  }
});

export default router;