import { getAiClient, MODEL_NAME } from '../config/gemini.js';
import { buildSystemPrompt, buildFirstQuestionPrompt, buildTurnPrompt, buildIntroFollowUpPrompt } from '../prompts/interviewPrompt.js';
import { buildReportPrompt } from '../prompts/reportPrompt.js';

// Gemini is instructed to return JSON only, but strip markdown fences
// defensively in case the model wraps it anyway.
function parseModelJson(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Gemini returned an empty response.');
  }
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini did not return valid JSON: ${err.message}\nRaw: ${rawText.slice(0, 300)}`);
  }
}

function validateTurnShape(parsed) {
  const required = ['verdict', 'action', 'message'];
  const missing = required.filter((k) => !(k in parsed));
  if (missing.length) {
    throw new Error(`Gemini response missing required field(s): ${missing.join(', ')}`);
  }
  return parsed;
}

// Gemini occasionally returns a transient 503 ("currently experiencing
// high demand") or a short-lived 429 rate limit — those are worth a
// couple of quick retries. A 429 caused by exhausting the *daily* quota
// is different: retrying cannot possibly help until the quota resets,
// so retrying it just burns ~12 seconds of "thinking" time before
// failing anyway. Detect that case and fail immediately instead.
function isDailyQuotaExhausted(err) {
  const text = `${JSON.stringify(err?.error || '')} ${err?.message || ''}`;
  return /PerDay/i.test(text);
}

function isInvalidKey(err) {
  const text = `${JSON.stringify(err?.error || '')} ${err?.message || ''}`;
  const status = err?.status || err?.error?.status || '';
  return err?.code === 'MISSING_API_KEY'
    || status === 'INVALID_ARGUMENT' && /API key/i.test(text)
    || /API_KEY_INVALID/i.test(text);
}

// Each call now takes the caller's own apiKey (BYOK) and builds a fresh
// Gemini client from it, instead of one shared server-side client.
async function generateWithRetry(apiKey, params, { retries = 2, baseDelayMs = 1200 } = {}) {
  const ai = getAiClient(apiKey);
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastErr = err;
      const status = err?.status || err?.error?.status || '';
      const code = err?.code || err?.error?.code;
      const transient = (status === 'UNAVAILABLE' || status === 'RESOURCE_EXHAUSTED' || code === 503 || code === 429)
        && !isDailyQuotaExhausted(err) && !isInvalidKey(err);
      if (!transient || attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

// Uses the current @google/genai SDK (the old @google/generative-ai SDK
// is deprecated). System instructions go through config.systemInstruction
// rather than being concatenated into the prompt text — this is the
// correct separation in the new SDK and also gives Gemini a stronger
// signal about which text is the persistent persona/rules vs. the
// per-turn content.
export function friendlyGeminiError(err) {
  if (err?.code === 'MISSING_API_KEY') {
    return 'No Gemini API key was sent with this request. Enter your API key to continue.';
  }
  if (isInvalidKey(err)) {
    return 'That Gemini API key looks invalid or was rejected by Google. Double-check it and try again.';
  }
  if (isDailyQuotaExhausted(err)) {
    return "You've hit today's free Gemini API quota for this key (the free tier is capped per day). "
      + 'This is a Google account limit, not a bug — retrying now will not help. '
      + 'Wait for the quota to reset, or use a key with billing enabled.';
  }
  return `Gemini request failed: ${err.message}`;
}

async function callGemini(apiKey, systemPrompt, turnPrompt, { retryOnParseFailure = true } = {}) {
  const response = await generateWithRetry(apiKey, {
    model: MODEL_NAME,
    contents: turnPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  // response.text is a property in the new SDK, not a method call like
  // the old result.response.text() — this was the other silent breakage
  // left over from the deprecated SDK.
  try {
    return validateTurnShape(parseModelJson(response.text));
  } catch (err) {
    if (!retryOnParseFailure) throw err;
    // one retry with an explicit nudge — real conversations shouldn't
    // die on an occasional malformed response
    const retryResponse = await generateWithRetry(apiKey, {
      model: MODEL_NAME,
      contents: `${turnPrompt}\n\nYour previous response was not valid JSON matching the required shape. Respond again with ONLY the JSON object, no other text.`,
      config: { systemInstruction: systemPrompt, responseMimeType: 'application/json', temperature: 0.5 },
    });
    return validateTurnShape(parseModelJson(retryResponse.text));
  }
}

// Replaces the old hardcoded "Good. What made you interested in this
// role?" line — that never changed no matter what the candidate said,
// which is exactly the "not adaptive" feeling it caused. This asks
// Gemini for a short reaction to their actual intro answer first.
export async function generateIntroFollowUp(apiKey, name, firstAnswer) {
  const response = await generateWithRetry(apiKey, {
    model: MODEL_NAME,
    contents: buildIntroFollowUpPrompt(name, firstAnswer),
    config: { responseMimeType: 'application/json', temperature: 0.7 },
  });
  const parsed = parseModelJson(response.text);
  if (!parsed.message) throw new Error('Gemini did not return a message.');
  return parsed.message;
}

export async function generateFirstQuestion(apiKey, session) {
  const systemPrompt = buildSystemPrompt(session.config);
  const parsed = await callGemini(apiKey, systemPrompt, buildFirstQuestionPrompt());
  session.transcript.push({ role: 'ai', text: parsed.message, topic: parsed.topic });
  session.qCount += 1;
  return { message: parsed.message, done: false };
}

export async function processAnswer(apiKey, session, answerText) {
  session.transcript.push({ role: 'user', text: answerText });

  const systemPrompt = buildSystemPrompt(session.config);
  const turnPrompt = buildTurnPrompt({
    transcript: session.transcript,
    latestAnswer: answerText,
    qCount: session.qCount,
    targetQ: session.targetQ,
  });
  const parsed = await callGemini(apiKey, systemPrompt, turnPrompt);

  const v = parsed.verdict || 'n/a';
  session.stats.verdictCounts[v] = (session.stats.verdictCounts[v] || 0) + 1;
  if (parsed.topic) session.stats.topics.add(parsed.topic);
  if (['incorrect', 'confident_incorrect', 'unsure', 'idk'].includes(v) && parsed.topic) {
    session.stats.weakTopics.add(parsed.topic);
  }

  if (parsed.action === 'wrapup') {
    session.phase = 'done';
    session.transcript.push({ role: 'ai', text: parsed.message });
    return { message: parsed.message, teaching: '', done: true };
  }

  session.qCount += 1;
  const spoken = parsed.teaching ? `${parsed.teaching} ${parsed.message}` : parsed.message;
  session.transcript.push({ role: 'ai', text: spoken, topic: parsed.topic });

  return {
    message: parsed.message,
    teaching: parsed.teaching || '',
    teachingConcept: parsed.teachingConcept || '',
    verdict: v,
    done: false,
  };
}

export function getSessionStats(session) {
  return {
    verdictCounts: session.stats.verdictCounts,
    topics: [...session.stats.topics],
    weakTopics: [...session.stats.weakTopics],
    qCount: session.qCount,
  };
}

// Derives 0-100 scores purely from tracked verdict counts — used only
// as a fallback if the Gemini scoring call itself fails, so a report
// can still be produced.
function algorithmicFallbackReport(session) {
  const counts = session.stats.verdictCounts;
  const entries = Object.entries(counts).filter(([k]) => k !== 'n/a');
  const total = entries.reduce((sum, [, n]) => sum + n, 0) || 1;

  // Weighted average against a given rubric, 0-100.
  function scoreFrom(weights, defaultWeight = 50) {
    const avg = entries.reduce((sum, [k, n]) => sum + (weights[k] ?? defaultWeight) * n, 0) / total;
    return Math.round(Math.max(0, Math.min(100, avg)));
  }

  const teachMoments = session.stats.weakTopics.size;
  const confidentWrong = counts.confident_incorrect || 0;
  const unsureCount = (counts.unsure || 0) + (counts.idk || 0);

  // Four different rubrics on the same verdict data — not the same
  // number copy-pasted into every field. Each genuinely emphasizes a
  // different thing a verdict can tell you, since that's the only
  // signal available without the transcript-reading Gemini call:
  // - technical: raw correctness
  const technicalScore = scoreFrom({ excellent: 100, correct: 82, partial: 55, unsure: 35, incorrect: 22, confident_incorrect: 12, idk: 18 });
  // - problem solving: rewards actually getting to a working answer,
  //   including partial credit for a reasonable-but-incomplete approach
  const problemSolvingScore = scoreFrom({ excellent: 96, correct: 78, partial: 62, unsure: 40, incorrect: 28, confident_incorrect: 20, idk: 25 });
  // - critical thinking: punished more by needing to be taught the
  //   concept outright than by an honest "I don't know" or a near-miss
  const criticalThinkingBase = scoreFrom({ excellent: 94, correct: 76, partial: 58, unsure: 42, incorrect: 30, confident_incorrect: 15, idk: 32 });
  const criticalThinkingScore = Math.max(0, criticalThinkingBase - teachMoments * 4);
  // - confidence: an "I don't know" costs little here (that's honest
  //   calibration); confidently stating something wrong costs a lot
  const confidenceBase = scoreFrom({ excellent: 92, correct: 80, partial: 65, unsure: 55, incorrect: 45, confident_incorrect: 15, idk: 50 });
  const confidenceScore = Math.max(0, confidenceBase - confidentWrong * 8 - unsureCount * 3);
  // - communication: no transcript-reading signal available at all
  //   algorithmically, so this one is deliberately the vaguest — average
  //   of the others rather than its own invented rubric pretending to
  //   measure something the fallback can't actually see
  const communicationScore = Math.round((technicalScore + problemSolvingScore + confidenceScore) / 3);

  return {
    technicalScore,
    communicationScore,
    confidenceScore,
    problemSolvingScore,
    criticalThinkingScore,
    strengths: session.stats.topics.size ? [`Engaged with: ${[...session.stats.topics].slice(0, 3).join(', ')}`] : [],
    weaknesses: session.stats.weakTopics.size ? [`Needs review: ${[...session.stats.weakTopics].join(', ')}`] : [],
    topicsToImprove: [...session.stats.weakTopics],
    overallSummary: 'This summary is an automatic estimate from your answer verdicts, not an AI-written review — '
      + 'the Gemini call that writes the full summary failed for this session (commonly the daily free-tier quota or an invalid key). '
      + 'The scores above are approximate for the same reason.',
    fallback: true,
  };
}

export async function generateReport(apiKey, session) {
  const stats = getSessionStats(session);
  try {
    const prompt = buildReportPrompt({ config: session.config, transcript: session.transcript, stats });
    const response = await generateWithRetry(apiKey, {
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.6 },
    });
    const parsed = parseModelJson(response.text);
    return { ...parsed, fallback: false, stats };
  } catch (err) {
    console.error('generateReport (Gemini) failed, using algorithmic fallback:', err.message);
    return { ...algorithmicFallbackReport(session), stats };
  }
}
