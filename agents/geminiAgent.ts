// geminiAgent.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_SYSTEM_PROMPT } from "@/prompts/geminiprompt";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // You can also try "gemini-1.5-pro"
  systemInstruction: GEMINI_SYSTEM_PROMPT,
});

/**
 * Stream response from Gemini
 */
export async function streamGeminiResponse(userPrompt: string) {
  const stream = await model.generateContentStream({
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
  });

  let finalText = "";
  for await (const chunk of stream.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText); // for CLI real-time streaming
    finalText += chunkText;
  }

  return finalText;
}
