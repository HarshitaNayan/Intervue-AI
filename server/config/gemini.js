import { GoogleGenAI } from '@google/genai';

// BYOK (Bring Your Own Key): each visitor supplies their own free Gemini
// API key from the client, sent per-request via the x-gemini-key header.
// We never read a server-side GEMINI_API_KEY for real traffic anymore —
// this avoids sharing one quota across every visitor. A client is built
// fresh per request instead of a single module-level singleton.
export function getAiClient(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    const err = new Error('Missing Gemini API key.');
    err.code = 'MISSING_API_KEY';
    throw err;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

// gemini-1.5-flash (and all Gemini 1.0/1.5 models) were fully shut down —
// requests now 404. gemini-3.5-flash is the current GA model with no
// announced shutdown date as of July 2026.
// https://ai.google.dev/gemini-api/docs/deprecations
export const MODEL_NAME = 'gemini-3.5-flash';
