import { askLlama } from "./hf_embeddings.js";

(async () => {
  const question = "Explain how SRAM works in VLSI design.";
  const answer = await askLlama(question);
  console.log("🧠 AI Answer:", answer);
})();
