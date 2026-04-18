import { genai } from "./client";
import { aggregateAllData } from "./data-aggregator";
import { SYSTEM_INSTRUCTION, buildUserPrompt } from "./prompt";

export interface ExecutiveSummaryResult {
  lines: string[];
  generatedAt: string;
  cached: boolean;
}

let cache: { data: ExecutiveSummaryResult; expiry: number } | null = null;
const TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get executive summary from cache or generate fresh via Gemini API.
 * D-03: 30-min TTL server-side cache.
 * D-04: Falls back to last successful response on API failure.
 */
export async function getOrRefreshSummary(): Promise<ExecutiveSummaryResult> {
  // Return cached if still valid
  if (cache && Date.now() < cache.expiry) {
    return { ...cache.data, cached: true };
  }

  try {
    if (!genai) {
      throw new Error("Gemini API not configured");
    }

    const data = await aggregateAllData();
    const userPrompt = buildUserPrompt(data);

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const text = response.text ?? "";
    const lines = text
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .slice(0, 3);

    const result: ExecutiveSummaryResult = {
      lines,
      generatedAt: new Date().toISOString(),
      cached: false,
    };

    // Store in cache
    cache = { data: result, expiry: Date.now() + TTL };

    return result;
  } catch (error) {
    // D-04: Fall back to last successful response if available
    if (cache) {
      console.warn("[gemini] API call failed, returning cached summary:", error);
      return { ...cache.data, cached: true };
    }
    // No cache available -- propagate error
    throw error;
  }
}
