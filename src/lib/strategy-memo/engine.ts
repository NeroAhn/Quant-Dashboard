import { genai } from "@/lib/gemini/client";
import {
  STRATEGY_MEMO_SYSTEM_INSTRUCTION,
  buildStrategyMemoPrompt,
  type TickerContext,
} from "./prompt";

interface GeminiMemoResponse {
  memos: Array<{ symbol: string; memo: string }>;
}

/**
 * Pure Gemini batch-call for strategy memos.
 * Caller supplies the TickerContext[] — this function has no I/O besides
 * the single Gemini request.
 */
export async function generateMemosFromContexts(
  contexts: TickerContext[],
): Promise<Record<string, string>> {
  if (!genai) throw new Error("Gemini API not configured");
  if (contexts.length === 0) return {};

  const userPrompt = buildStrategyMemoPrompt(contexts);

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: STRATEGY_MEMO_SYSTEM_INSTRUCTION,
      temperature: 0.3,
      maxOutputTokens: 6000,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  const parsed = JSON.parse(text) as GeminiMemoResponse;

  const memos: Record<string, string> = {};
  for (const entry of parsed.memos ?? []) {
    if (entry.symbol && entry.memo) {
      memos[entry.symbol] = entry.memo;
    }
  }
  return memos;
}
