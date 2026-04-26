/**
 * AI Client with Gemini primary + Groq fallback.
 * Server-side only — used in API routes.
 */

import { GoogleGenAI } from "@google/genai";

// --- Gemini Setup ---
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// --- Groq Setup (REST-based, no extra SDK needed) ---
const groqApiKey = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface AIResponse {
  text: string;
  provider: "gemini" | "groq";
}

/**
 * Try Gemini first. If it fails (rate limit, timeout, error), fall back to Groq.
 */
export async function generateAIResponse(prompt: string): Promise<AIResponse> {
  // --- Attempt 1: Gemini ---
  if (ai && geminiApiKey) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const text = response.text || "";
      if (text.trim()) {
        return { text, provider: "gemini" };
      }
    } catch (error: any) {
      console.warn("[AI Client] Gemini failed, falling back to Groq:", error.message || error);
    }
  }

  // --- Attempt 2: Groq ---
  if (groqApiKey) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      if (text.trim()) {
        return { text, provider: "groq" };
      }
    } catch (error: any) {
      console.error("[AI Client] Groq also failed:", error.message || error);
    }
  }

  // --- Both failed ---
  throw new Error(
    "All AI providers failed. Please check your API keys and try again."
  );
}

/**
 * Extract structured traits from a user message.
 * Uses Gemini first, Groq as fallback.
 */
export async function extractTraitsFromMessage(message: string): Promise<Record<string, any>> {
  const extractionPrompt = `Extract any of the following parameters about the user from the text (if possible) into a clean JSON object ONLY (no markdown formatting, just {"key": "value"}!). \nKeys: "age" (number), "sex" ("Male" or "Female"), "weight" (number in kg), "height" (number in meters), "goal" ("Weight Gain", "Weight Loss", "Weight Maintenance", "Muscle Gain"). If not found, ignore the key.\n---\nText: ${message}`;

  try {
    const response = await generateAIResponse(extractionPrompt);
    const jsonStr = response.text
      .trim()
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}
