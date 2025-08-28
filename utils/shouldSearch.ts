    // utils/shouldSearch.ts
    import fetch from "node-fetch";

    export async function shouldSearch(query: string, apiKey: string): Promise<boolean> {
    const prompt = `
    Do you need to perform a real-time web search to answer this query accurately? Respond with "yes" or "no" only.  
    Query: "${query}"
    `;

    const res = await fetch(
        "https://api.openrouter.ai/v1/reka/flash-3:free/completions",
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            input: prompt,
            max_tokens: 3,
            temperature: 0.0,
        }),
        }
    );

    const data = await res.json();
    const answer = (data.output_text || data.choices?.[0]?.text || "").trim().toLowerCase();
    return answer.startsWith("y");
    }
