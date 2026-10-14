// backend/utils/logConversion.js
import { prisma } from "../prisma.js";

export async function logConversion({ uid, email, originalName, type, filePath, status = "success" }) {
  try {
    const user = await prisma.user.upsert({
      where: { uid },
      update: {},
      create: { uid, email: email || "" },
    });

    await prisma.fileConversion.create({
      data: {
        userId: user.id,
        originalName,
        type,
        filePath,
        status,
      },
    });

    // NEW: confirm success in the terminal - previously this was
    // completely silent on success, making it look like nothing
    // happened even when it worked correctly.
    console.log(`Logged conversion: ${originalName} (${type}) for user ${uid}`);
  } catch (err) {
    console.error("Failed to log conversion:", err);
  }
}