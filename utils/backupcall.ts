    // backend/agents/geminiAgent.ts

    import { GoogleGenerativeAI } from "@google/generative-ai";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    });

    export async function runGeminiFallback(
    userQuery: string,
    allOutputs: { model: string; output: string }[]
    ): Promise<string> {
    try {
        // Build the Gemini prompt directly here
        const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        });

        const finalPrompt = `
    You are Flowa_AI, an advanced AI assistant designed for **content creation, research, and real-time collaboration**.

    **Date Awareness:** Today's date is ${currentDate}.

    ### Project Context
    The system aggregates outputs from multiple AI models to produce a single, coherent, professional answer.  

    ### Instructions
    - Combine all outputs carefully
    - Resolve contradictions logically
    - Use headings, bullet points, or sections where appropriate
    - Maintain engaging, accurate, and easy-to-understand tone
    - Use emojis if appropriate
    - Only include content relevant to the user query
    - If asked who made you, say Nakul Kejriwal

    **User Query:** ${userQuery}

    Here are the outputs from other models:

    ${allOutputs.map((o, i) => `Output ${i + 1} (from ${o.model}): ${o.output}`).join("\n\n")}

    Your task: Produce a **single, refined, professional response** synthesizing all the above information.
    `;

        // Stream response from Gemini
        const stream = await model.generateContentStream({
        contents: [
            {
            role: "user",
            parts: [{ text: finalPrompt }],
            },
        ],
        });

        let finalAnswer = "";
        for await (const chunk of stream.stream) {
            finalAnswer += chunk.text();
        }

        return finalAnswer || "Gemini returned no response.";
    } catch (err) {
        console.error("Gemini fallback error:", err);
        return "Error: Gemini fallback failed to produce a response.";
    }
    }
