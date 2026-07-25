export function buildReportPrompt({ config, transcript, stats }) {
  const history = transcript
    .map((m) => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
    .join('\n');

  return `You are scoring a completed technical interview for "${config.role}" (${config.experience}, ${config.difficulty} difficulty).

Full transcript:
${history}

Verdict counts observed during the interview: ${JSON.stringify(stats.verdictCounts)}
Topics covered: ${stats.topics.join(', ') || 'none recorded'}
Topics the candidate struggled with: ${stats.weakTopics.join(', ') || 'none'}

Score the candidate honestly, based on substance, not politeness. Respond with ONLY this JSON shape, no markdown:
{
  "technicalScore": 0-100 integer — correctness and depth of technical answers,
  "communicationScore": 0-100 integer — clarity, structure, how well they explained their thinking,
  "confidenceScore": 0-100 integer — decisiveness vs hedging, recovery after mistakes,
  "problemSolvingScore": 0-100 integer — how they approached unfamiliar or harder questions,
  "criticalThinkingScore": 0-100 integer — how well they reasoned through tradeoffs, edge cases, and "why", not just "what",
  "strengths": ["2-4 short bullet points, specific to what they actually said"],
  "weaknesses": ["2-4 short bullet points, specific and constructive, not generic"],
  "topicsToImprove": ["short topic labels drawn from what they struggled with"],
  "overallSummary": "3-5 sentence honest summary a hiring manager could read, plain text"
}`;
}
