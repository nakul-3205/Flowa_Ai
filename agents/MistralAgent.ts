    // backend/agents/MistralAgent.ts
    import { mistralPrompt } from "../prompts/mistralPrompts";

    const API_KEY = process.env.MISTRAL_API_KEY || "";

    export async function MistralAgent(
    userInput: string,
    context: string = ""
    ): Promise<string> {
    try {
        const prompt = mistralPrompt();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            messages: [
            { role: "system", content:prompt },
            { role: "user", content: userInput,context },
            ],
            max_tokens: 1024,
            temperature: 0.7,
        }),
        });

        if (!response.ok) {
        throw new Error(`Mistral API error: ${response.statusText}`);
        }

        const data = await response.json();

        return (
        data.choices?.[0]?.message?.content?.trim() ||
        data.output_text ||
        "No response from Mistral"
        );
    } catch (err) {
        console.error("MistralAgent error:", err);
        return "Error: Failed to get response from Mistral.";
    }
    }
