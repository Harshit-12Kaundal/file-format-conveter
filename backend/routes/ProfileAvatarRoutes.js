// backend/routes/profile.js  (data.js in your naming, based on Profile.jsx calling /data/*)
import express from "express";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/data/:uid", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { uid: req.params.uid } });
    if (!user) return res.status(404).json({ message: "No profile yet" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { userId, email, name, age, gender, bio, avatarSeed, avatarStyle } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const user = await prisma.user.upsert({
      where: { uid: userId },
      update: { email, name, age, gender, bio, avatarSeed, avatarStyle },
      create: { uid: userId, email, name, age, gender, bio, avatarSeed, avatarStyle },
    });

    res.json(user);
  } catch (err) {
    console.error("Save profile error:", err);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

export default router;