    // backend/agents/GPTOSSAgent.ts
    import { gptOSSPrompt } from "@/prompts/gptOSSPrompts";

    const GPT_OSS_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const API_KEY = process.env.GPT_API_KEY || "";

    export async function GPTOSSAgent(
    userInput: string,
    context: string = ""
    ): Promise<string> {
    try {
        // Build the model prompt with context
        const prompt = gptOSSPrompt();


        const payload = {
        model: "qwen/qwen3-235b-a22b:free", 
        messages: [
            {
            role: "system",
            content: prompt,
            },
            {
                role:'user',
                content:userInput,context
            }
        ],
        max_tokens: 1024,
        temperature: 0.7,
        };

        const response = await fetch(GPT_OSS_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          
        },
        body: JSON.stringify(payload),
        });
// console.log(response)
        if (!response.ok) {
        const text = await response.text(); // log raw response for debugging
        console.error("GPT-OSS API error response:", text);
        throw new Error(`GPT-OSS API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract message content
        const messageContent =
        data.choices?.[0]?.message?.content || "No response from GPT-OSS";

        return messageContent;
    } catch (err) {
        console.error("GPTOSSAgent error:", err);
        return "Error: Failed to get response from GPT-OSS.";
    }
    }
