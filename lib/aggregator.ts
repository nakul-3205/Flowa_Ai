    // /backend/lib/aggregator.ts

    import { shouldSearch } from "@/utils/shouldSearch";
    import { webSearch } from "./webSearch";
    import { findMostRelevantOutput } from "@/utils/semanticsSimilarity";

    // Import all agents (make sure each one follows the same function signature!)
    import { deepSeekAgent } from "@/agents/DeepSeekAgent";
    import { streamGeminiResponse } from "@/agents/geminiAgent";
    import { GPTOSSAgent } from "@/agents/GPTOSSAgent";
    import { llamaAgent } from "@/agents/LlamaAgent";
    import { MistralAgent } from "@/agents/MistralAgent";

    
    type AgentResponse = {
    model: string;
    output: string;
    };


    export async function aggregateResponse(
    userQuery: string,
    context: string = ""
    ): Promise<{
    finalAnswer: string;
    chosenModel: string;
    candidates: AgentResponse[];
    }> {
    let enrichedQuery = userQuery;

    try {
        // Step 1: Decide if web search is needed
        const needsSearch = await shouldSearch(userQuery);

        if (needsSearch) {
        // Step 2: Perform web search
        const searchResults = await webSearch(userQuery);

        // Append results to query for LLMs
        enrichedQuery = `
    User Query: ${userQuery}

    Web Search Results:
    ${JSON.stringify(searchResults, null, 2)}
    `;
        }

        // Step 3: Call all LLM agents in parallel (safe handling)
        const [deepSeek, gptOSS, mistral, llama, gemini] = await Promise.allSettled([
        deepSeekAgent(enrichedQuery, context),
        GPTOSSAgent(enrichedQuery, context),
        MistralAgent(enrichedQuery, context),
        llamaAgent(enrichedQuery, context),
        streamGeminiResponse(enrichedQuery, context),
        ]);

        // Normalize results
        const allOutputs: AgentResponse[] = [
        { model: "DeepSeek", output: deepSeek.status === "fulfilled" ? deepSeek.value : "" },
        { model: "GPT-OSS", output: gptOSS.status === "fulfilled" ? gptOSS.value : "" },
        { model: "Mistral", output: mistral.status === "fulfilled" ? mistral.value : "" },
        { model: "LLaMA", output: llama.status === "fulfilled" ? llama.value : "" },
        { model: "Gemini", output: gemini.status === "fulfilled" ? gemini.value : "" },
        ].filter(item => item.output && item.output.trim() !== ""); // remove empty ones
        // console.log(allOutputs)
        if (allOutputs.length === 0) {
        throw new Error("All agents failed to return a response.");
        }

        // Step 4: Use semantic similarity to pick best
        const bestOutput = await findMostRelevantOutput(userQuery, allOutputs);

        // Step 5: Return final structured result
        return {
        finalAnswer: bestOutput.output,
        chosenModel: bestOutput.model,
        candidates: allOutputs,
        };
    } catch (err) {
        console.error("Aggregator error:", err);

        return {
        finalAnswer: "Sorry, something went wrong while processing your query.",
        chosenModel: "None",
        candidates: [],
        };
    }
    }
