import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askOpenAI(context, question) {
  console.log("🧪 API KEY:", process.env.OPENAI_API_KEY ? "Loaded" : "NOT LOADED");
  console.log("🧪 Context length:", context?.length || 0);
  console.log("🧪 Question:", question);

  const prompt = `
You are a PDF expert. Use ONLY the provided content to answer.

CONTENT:
${context}

QUESTION:
${question}

ANSWER:
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("✅ OpenAI SUCCESS");
    return response.choices[0].message.content;

  } catch (error) {
    console.error("❌ OpenAI ERROR:", error);
    return null;
  }
}
