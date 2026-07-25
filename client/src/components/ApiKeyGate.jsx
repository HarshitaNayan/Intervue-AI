import { useState } from 'react';
import { getStoredApiKey, saveApiKey } from '../services/api.js';

// Gatekeeper shown before anything else in the app. InterVue AI is BYOK
// (Bring Your Own Key): every visitor uses their own free Gemini API key
// so no one shares — or drains — anyone else's daily quota. The key never
// touches our server's filesystem/env; it's kept in the visitor's own
// browser (localStorage) and sent per-request as a header.
export default function ApiKeyGate({ children }) {
  const [key, setKey] = useState(getStoredApiKey());
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(!!getStoredApiKey());

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = key.trim();
    if (trimmed.length < 15) {
      setError("That doesn't look like a valid Gemini API key.");
      return;
    }
    saveApiKey(trimmed);
    setError('');
    setUnlocked(true);
  }

  if (unlocked) return children;

  return (
    <div className="min-h-screen bg-bg0 text-text0 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-bg1 p-8 space-y-4"
      >
        <h1 className="text-xl font-semibold">Enter your Gemini API key</h1>
        <p className="text-sm text-text2 leading-relaxed">
          InterVue AI runs on your own free Gemini API key so every visitor
          gets their own daily quota instead of sharing one. It's stored
          only in your browser and sent directly to your interview session
          — never saved on our server.
        </p>
        <a
          href="https://ai.google.dev/gemini-api/docs/api-key"
          target="_blank"
          rel="noreferrer"
          className="text-sm underline text-accent block"
        >
          Get a free Gemini API key →
        </a>
        <input
          type="password"
          placeholder="Paste your Gemini API key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-bg0 px-3 py-2 text-sm font-mono outline-none focus:border-accent"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-accent text-bg0 font-medium py-2 hover:opacity-90 transition"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
