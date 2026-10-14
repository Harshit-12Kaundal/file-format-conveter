import express from "express";
import { sendMail } from "../utils/mailer.js";
import { generateToken } from "../utils/jwt.js";
import { prisma } from "../prisma.js"; 

const router = express.Router();

/**
 * POST /api/auth/send-otp
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Request to send OTP to:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Clear any previous OTP for this email, then save the new one in the DB
    await prisma.otp.deleteMany({ where: { email } });
    await prisma.otp.create({ data: { email, otp, expiresAt } });

    // Send OTP email
    await sendMail(email, otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

/**
 * POST /api/auth/verify-otp
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("verify-otp received:", { email, otp });

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const record = await prisma.otp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    console.log("verify-otp store has:", record);

    if (!record) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (Date.now() > record.expiresAt.getTime()) {
      await prisma.otp.delete({ where: { id: record.id } });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(record.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP valid → delete (one-time use)
    await prisma.otp.delete({ where: { id: record.id } });

    const token = generateToken(email);
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // set to true if using HTTPS (production)
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
});

export default router;