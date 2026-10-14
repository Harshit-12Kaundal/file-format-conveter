import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,          // ✅ Use 587 (TLS) instead of 465
    secure: false,      // ✅ false for STARTTLS
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
    tls: {
      rejectUnauthorized: false,    // helps inside Docker
    },
  });

  await transporter.verify();
  console.log("SMTP CONNECTION OK");

  const info = await transporter.sendMail({
    from: `Your App <${process.env.EMAIL}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  console.log("Email sent:", info.messageId);
};
