import { randomUUID } from 'crypto';

// In-memory is fine for a single-instance dev/demo server. If this
// ever runs behind multiple server instances or needs to survive
// restarts, swap this for Redis — the interface below is the only
// thing that would need to change.
const sessions = new Map();

export function createSession(config, introTranscript = []) {
  const sessionId = randomUUID();
  const targetQ = config.difficulty === 'advanced' ? 12 : config.difficulty === 'easy' ? 8 : 10;
  sessions.set(sessionId, {
    config,
    phase: 'technical',
    // Seeded with the intro Q&A (name/background + interest-in-role) so
    // Gemini can reference it naturally instead of starting cold — this
    // was previously dropped entirely, which is why the first technical
    // question never reacted to anything the candidate actually said.
    transcript: [...introTranscript],
    qCount: 0,
    targetQ,
    stats: { verdictCounts: {}, topics: new Set(), weakTopics: new Set() },
  });
  return sessionId;
}

export function getSession(sessionId) {
  return sessions.get(sessionId);
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}
