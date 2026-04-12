import type { FearGreedData } from "@/types/dashboard";

const FEAR_GREED_API_URL = "https://feargreedchart.com/api/?action=all";

interface FearGreedAPIResponse {
  score?: number;
  rating?: string;
}

function getLabel(score: number): string {
  if (score <= 24) return "Extreme Fear";
  if (score <= 44) return "Fear";
  if (score <= 55) return "Neutral";
  if (score <= 74) return "Greed";
  return "Extreme Greed";
}

export async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  try {
    const response = await fetch(FEAR_GREED_API_URL, {
      signal: AbortSignal.timeout(10000), // 10s timeout (T-03-01)
      headers: { "User-Agent": "AlphaEngine/1.0" },
    });

    if (!response.ok) {
      console.error(`Fear & Greed API returned ${response.status}`);
      return null;
    }

    const data: FearGreedAPIResponse = await response.json();

    if (data.score === undefined || data.score === null) {
      console.error("Fear & Greed API: score field missing");
      return null;
    }

    // T-03-02: score range validation (0-100)
    const rawScore = Number(data.score);
    if (Number.isNaN(rawScore) || rawScore < 0 || rawScore > 100) {
      console.error(`Fear & Greed API: invalid score value: ${data.score}`);
      return null;
    }

    const score = Math.round(rawScore);
    const label = data.rating || getLabel(score);

    return {
      score,
      label,
      display: `${score} (${label})`, // D-07: "42 (Fear)" format
    };
  } catch (error) {
    // Pitfall 6: third-party API down -> return null gracefully
    console.error("Fear & Greed fetch failed:", error);
    return null;
  }
}
