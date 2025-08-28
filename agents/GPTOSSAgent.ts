    // backend/agents/GPTOSSAgent.ts
    import { IAgent } from "./IAgent";
    import { gptOSSPrompt } from "../prompts/gptOSSPrompts";

    export class GPTOSSAgent implements IAgent {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generate(userInput: string, context?: string): Promise<string> {
        // Build the model prompt
        const prompt = gptOSSPrompt(userInput, context);

        // Call GPT-OSS 20B via OpenRouter
        const response = await fetch(
        "https://api.openrouter.ai/v1/openai/gpt-oss-20b/completions",
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

        return data.output_text || data.choices?.[0]?.text || "No response from GPT-OSS";
    }
    }
