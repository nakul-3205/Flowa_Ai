    // backend/agents/MistralAgent.ts
    import { IAgent } from "./IAgent";
    import { mistralPrompt } from "../prompts/mistralPrompts";

    export class MistralAgent implements IAgent {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generate(userInput: string, context?: string): Promise<string> {
        const prompt = mistralPrompt(userInput, context);

        const response = await fetch(
        "https://api.openrouter.ai/v1/mistralai/mistral-7b-instruct/completions",
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
            input: prompt,
            max_tokens: 1024,
            temperature: 0.7,
            }),
        }
        );

        const data = await response.json();

        return data.output_text || data.choices?.[0]?.text || "No response from Mistral";
    }
    }
