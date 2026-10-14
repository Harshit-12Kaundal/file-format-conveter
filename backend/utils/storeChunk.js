import { createClient } from 'redis';

// Create a Redis client
const client = createClient({
  url: 'redis://localhost:6379', // Change if using Render/Cloud
});

client.on('error', (err) => console.error('❌ Redis Client Error:', err));

// Connect to Redis (only once)
await client.connect();

/**
 * Save PDF text chunks to Redis
 * @param {string} fileId - Unique identifier for the file
 * @param {Array<string>} chunks - Array of text chunks
 */
export async function setChunks(fileId, chunks) {
  try {
    const key = `pdf_chunks:${fileId}`;
    await client.del(key); // Clear previous data
    await client.rPush(key, ...chunks);
    console.log(`✅ Stored ${chunks.length} chunks in Redis under key ${key}`);
  } catch (err) {
    console.error('❌ Error storing chunks:', err);
  }
}

/**
 * Retrieve chunks from Redis
 * @param {string} fileId
 * @returns {Promise<Array<string>>}
 */
export async function getChunks(fileId) {
  try {
    const key = `pdf_chunks:${fileId}`;
    const chunks = await client.lRange(key, 0, -1);
    console.log(`📦 Retrieved ${chunks.length} chunks from Redis`);
    return chunks;
  } catch (err) {
    console.error('❌ Error retrieving chunks:', err);
    return [];
  }
}
