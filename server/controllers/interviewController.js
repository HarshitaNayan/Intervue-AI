import { createSession, getSession, deleteSession } from '../services/sessionStore.js';
import { generateFirstQuestion, generateIntroFollowUp, processAnswer, getSessionStats, generateReport, friendlyGeminiError } from '../services/geminiService.js';
import { extractResumeText } from '../services/resumeService.js';

// BYOK: every request that talks to Gemini must carry the caller's own
// key in this header. The client reads it from localStorage and attaches
// it — see client/src/services/api.js. Nothing Gemini-related ever reads
// a server-side env key anymore.
function getApiKey(req) {
  return req.headers['x-gemini-key'];
}

export async function introFollowUp(req, res) {
  try {
    const apiKey = getApiKey(req);
    const { name, firstAnswer } = req.body;
    if (!firstAnswer) return res.status(400).json({ error: 'firstAnswer is required.' });
    const message = await generateIntroFollowUp(apiKey, name, firstAnswer);
    res.json({ message });
  } catch (err) {
    console.error('introFollowUp error:', err);
    res.status(502).json({ error: friendlyGeminiError(err) });
  }
}

export async function uploadResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const resumeSummary = await extractResumeText(req.file);
    res.json({ resumeSummary });
  } catch (err) {
    console.error('uploadResume error:', err);
    res.status(422).json({ error: err.message });
  }
}

export async function startInterview(req, res) {
  try {
    const apiKey = getApiKey(req);
    const { name, role, experience, difficulty, resumeSummary, introTranscript } = req.body;
    if (!name || !role || !experience || !difficulty) {
      return res.status(400).json({ error: 'name, role, experience, and difficulty are required.' });
    }
    const sessionId = createSession({ name, role, experience, difficulty, resumeSummary }, introTranscript || []);
    const session = getSession(sessionId);
    const { message } = await generateFirstQuestion(apiKey, session);
    res.json({ sessionId, message, done: false });
  } catch (err) {
    console.error('startInterview error:', err);
    res.status(502).json({ error: friendlyGeminiError(err) });
  }
}

export async function submitAnswer(req, res) {
  try {
    const apiKey = getApiKey(req);
    const { sessionId, answerText } = req.body;
    if (!sessionId || !answerText) {
      return res.status(400).json({ error: 'sessionId and answerText are required.' });
    }
    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found or expired.' });

    const result = await processAnswer(apiKey, session, answerText);
    if (result.done) {
      const stats = getSessionStats(session);
      return res.json({ ...result, stats });
    }
    res.json(result);
  } catch (err) {
    console.error('submitAnswer error:', err);
    res.status(502).json({ error: friendlyGeminiError(err) });
  }
}

export function endInterview(req, res) {
  const { sessionId } = req.body;
  if (sessionId) deleteSession(sessionId);
  res.json({ ok: true });
}

export async function getReport(req, res) {
  try {
    const apiKey = getApiKey(req);
    const { sessionId } = req.body;
    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found or expired.' });
    const report = await generateReport(apiKey, session);
    res.json({ report, config: session.config });
  } catch (err) {
    console.error('getReport error:', err);
    res.status(500).json({ error: err.message });
  }
}
