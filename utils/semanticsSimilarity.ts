// backend/utils/semanticSimilarity.ts
import { pipeline, env } from "@xenova/transformers";

// ✅ Force Transformers.js to use WASM (so it works on Vercel serverless)
(env as any).wasm = {
  proxy: true,
  numThreads: 1,
};
(env as any).allowLocalModels = false; // prevent native/onnxruntime fallback

// Lazy-load embeddings model (all-MiniLM-L6-v2)
let embedder: any;

async function getEmbedder() {
  if (!embedder) {
    // ⬅️ FIX: use "wasm" (not "cpu") to avoid onnxruntime native errors
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      device: "wasm",
    });
  }
  return embedder;
}

// Utility: flatten embedding tensor into 1D array
function flattenEmbedding(embedding: any): number[] {
  if (embedding?.data) {
    return Array.from(embedding.data); // typed array
  }
  if (Array.isArray(embedding)) {
    return embedding.flat(2); // handles nested arrays
  }
  throw new Error("Invalid embedding format");
}

// Cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new Error("Invalid vectors for cosine similarity");
  }
  const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB || 1e-10); // avoid NaN
}

// Main aggregator comparison
export async function findMostRelevantOutput(
  userQuery: string,
  llmOutputs: { model: string; output: string }[]
): Promise<{ model: string; output: string; scores: number[] }> {
  const embedder = await getEmbedder();

  // Get embedding for query
  const queryEmbeddingRaw = await embedder(userQuery, {
    pooling: "mean",
    normalize: true,
  });
  const queryEmbedding = flattenEmbedding(queryEmbeddingRaw);

  let scores: number[] = [];
  for (const item of llmOutputs) {
    try {
      const outputEmbeddingRaw = await embedder(item.output, {
        pooling: "mean",
        normalize: true,
      });
      const outputEmbedding = flattenEmbedding(outputEmbeddingRaw);

      const score = cosineSimilarity(queryEmbedding, outputEmbedding);
      scores.push(score);
    } catch (err) {
      console.error(`Embedding failed for model ${item.model}:`, err);
      scores.push(-1); // mark failure
    }
  }

  const maxIndex = scores.indexOf(Math.max(...scores));
  return {
    model: llmOutputs[maxIndex]?.model || "unknown",
    output: llmOutputs[maxIndex]?.output || "",
    scores,
  };
}
