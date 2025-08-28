    // backend/agents/DeepSeekAgent.ts
    import { IAgent } from "./IAgent";
    import { deepSeekPrompt } from "@/prompts/deepSeekPrompt";

    export class DeepSeekAgent implements IAgent {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generate(userInput: string, context?: string): Promise<string> {
        // Get the customized prompt
        const prompt = deepSeekPrompt(userInput, context);

        // Call DeepSeek via OpenRouter
        const response = await fetch(
        "https://api.openrouter.ai/v1/deepseek-v3-0324/completions",
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

        // Return the model output
        return data.output_text || data.choices?.[0]?.text || "No response from DeepSeek";
    }
    }
