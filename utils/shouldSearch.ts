// utils/shouldSearch.ts

const apiKey = process.env.DEEPSEEK_V_API_KEY; // use your DeepSeek API key env variable

export async function shouldSearch(query: string): Promise<boolean> {
  if (!apiKey) {
    console.warn("DEEPSEEK_V_API_KEY is missing. Defaulting shouldSearch to false.");
    return false;
  }

  const prompt = `
Do you need to perform a real-time web search to answer this query accurately? Respond with "yes" or "no" only.  
Query: "${query}"
You are an AI assistant that must decide whether a real-time web search is required to accurately answer a user's question.  
Respond with **"yes"** if any of the following are true:

- The question involves current events, trending topics, or recent data.
- The question asks for exact numbers, statistics, or up-to-date information.
- The question requires verifying facts that may have changed recently.
- The question requests you to perfrom websearch.
- The question is asking to find soemthing over the internet

Respond with **"no"** if the answer can be given accurately from general knowledge without searching.

Do NOT give explanations—only answer "yes" or "no".

Query: "{user_query}"

`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 3,
        temperature: 0.0,
      }),
    });

    console.log(res);

    if (!res.ok) {
      const text = await res.text();
      console.error("shouldSearch fetch failed response:", text);
      console.error("shouldSearch fetch failed with status:", res.status);
      return false;
    }

    const data = await res.json();
    const answer = (data.choices?.[0]?.message?.content || "")
      .trim()
      .toLowerCase();

    return answer.startsWith("y");
  } catch (err) {
    console.error("shouldSearch error:", err);
    return false;
  }
}
