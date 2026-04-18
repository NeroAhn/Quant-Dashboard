import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[gemini] GEMINI_API_KEY not set -- executive summary disabled");
}

export const genai = apiKey ? new GoogleGenAI({ apiKey }) : null;
