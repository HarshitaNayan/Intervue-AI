const API_KEY_STORAGE_KEY = 'gemini_api_key';

export function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

async function request(path, body) {
  const res = await fetch(`/api/interview${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gemini-key': getStoredApiKey(),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request to ${path} failed`);
  return data;
}

export const interviewApi = {
  start: (config) => request('/start', config),
  introFollowUp: (name, firstAnswer) => request('/intro-followup', { name, firstAnswer }),
  answer: (sessionId, answerText) => request('/answer', { sessionId, answerText }),
  end: (sessionId) => request('/end', { sessionId }),
  report: (sessionId) => request('/report', { sessionId }),
  uploadResume: async (file) => {
    // Resume parsing never calls Gemini (see server/services/resumeService.js),
    // so no API key header is needed here.
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch('/api/interview/resume', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Resume upload failed');
    return data; // { resumeSummary }
  },
};
