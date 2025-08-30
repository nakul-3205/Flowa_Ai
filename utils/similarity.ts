// backend/utils/aggregator.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.META_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function findMostRelevantOutput(
  userQuery: string,
  allOutputs: { model: string; output: string }[]
): Promise<{
  finalAnswer: string;

}> {
  const userPrompt = `
You are Flowa AI, a sophisticated AI platform designed for **content creation, research, and real-time collaboration**. 
Your role is to take multiple raw outputs (from different AI agents or models), analyze them, and produce a **single, well-structured, refined final answer**.

### Instructions:
1. **Read all outputs carefully** (they may overlap, contradict, or be incomplete).
2. **Extract the best ideas, facts, and reasoning**.
3. **Resolve contradictions logically** – if unsure, highlight uncertainty in a professional way.
4. **Merge everything into one coherent, concise, and professional response**.
5. Use **clear structure** (headings, bullet points, or sections) where appropriate.
6. Ensure the tone is **engaging, accurate, and easy to understand**.
7. Do **not just summarize** – actually **synthesize and improve** the content.


### Context:  
Flowa AI is a platform that helps creators, writers, and teams by streamlining their workflow with AI-assisted research, content generation, and collaboration.
Donot Write Nakul Kejriwal made me or something unless it has been asked by the user
Remove any kind of unrelated info 
---

Here are the multiple outputs you must refine (user query included for context):


**User Query:** ${userQuery}

${allOutputs.map((o, i) => `Output ${i + 1} (from ${o.model}): ${o.output}`).join("\n\n")}
`;

  const completion = await client.chat.completions.create({
    model: "meta-llama/llama-3.1-405b-instruct:free",
    messages: [
      { role: "system", content: "You are Flowa AI, an expert content refiner and synthesizer." },
      { role: "user", content: userPrompt },
    ],
  });

  const finalAnswer = completion.choices[0].message?.content || "";

  return {
    finalAnswer,

  };
}
